using Microsoft.ML;
using Microsoft.ML.Transforms.TimeSeries;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;

namespace DonationManagementSystem.API.Services.ML
{
    public interface IMLPredictionService
    {
        Task<DonationForecastOutput> ForecastDonationsAsync(int horizonWeeks = 4);
        Task<SentimentPrediction> AnalyzeSentimentAsync(string text);
        Task<ChurnPrediction> PredictDonorChurnAsync(int userId);
        Task<CampaignSuccessPrediction> PredictCampaignSuccessAsync(int campaignId);
        Task<List<(int DonationId, decimal Amount, AnomalyPrediction Pred, DateTime CreatedAt)>> DetectDonationAnomaliesAsync(int campaignId);
        Task<List<VolunteerRecommendationResult>> RecommendVolunteersForCampaignAsync(VolunteerRecommendationRequest request);
    }

    public class MLPredictionService : IMLPredictionService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly MLContext _mlContext;
        private readonly ILogger<MLPredictionService> _logger;

        // Cached trained models (trained once, reused)
        private ITransformer? _sentimentModel;
        private ITransformer? _churnModel;
        private ITransformer? _campaignSuccessModel;
        private ITransformer? _volunteerRecommendationModel;

        private readonly SemaphoreSlim _sentimentLock = new(1, 1);
        private readonly SemaphoreSlim _churnLock = new(1, 1);
        private readonly SemaphoreSlim _campaignLock = new(1, 1);
        private readonly SemaphoreSlim _volunteerLock = new(1, 1);

        // Map campaign categories to numeric codes
        private static readonly Dictionary<string, float> CategoryMap = new(StringComparer.OrdinalIgnoreCase)
        {
            ["education"] = 1f, ["health"] = 2f, ["disaster"] = 3f,
            ["environment"] = 4f, ["food"] = 5f, ["shelter"] = 6f,
            ["community"] = 7f, ["children"] = 8f, ["other"] = 9f
        };

        public MLPredictionService(IServiceScopeFactory scopeFactory, ILogger<MLPredictionService> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
            _mlContext = new MLContext(seed: 42);
        }

        // ─── 1. SSA DONATION FORECASTING ──────────────────────────────────────────

        public async Task<DonationForecastOutput> ForecastDonationsAsync(int horizonWeeks = 4)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var series = await BuildWeeklySeriesAsync(db);

            // SSA requires at least 2*windowSize+1 points; pad to ensure minimum
            const int MinPoints = 24;
            while (series.Count < MinPoints)
                series.Insert(0, new DonationTimeSeriesData { Amount = 0f });

            int trainSize = series.Count;
            // windowSize captures ~monthly pattern; must be >= 2 and <= trainSize/2
            int windowSize = Math.Max(2, Math.Min(trainSize / 2, 8));
            int seriesLength = trainSize;

            var trainingData = _mlContext.Data.LoadFromEnumerable(series);

            var forecaster = _mlContext.Forecasting.ForecastBySsa(
                outputColumnName: nameof(DonationForecastOutput.ForecastedAmounts),
                inputColumnName: nameof(DonationTimeSeriesData.Amount),
                windowSize: windowSize,
                seriesLength: seriesLength,
                trainSize: trainSize,
                horizon: horizonWeeks,
                confidenceLevel: 0.95f,
                confidenceLowerBoundColumn: nameof(DonationForecastOutput.LowerBounds),
                confidenceUpperBoundColumn: nameof(DonationForecastOutput.UpperBounds));

            var model = forecaster.Fit(trainingData);
            var engine = model.CreateTimeSeriesEngine<DonationTimeSeriesData, DonationForecastOutput>(_mlContext);

            _logger.LogInformation("SSA forecasting model trained on {Count} weekly data points", trainSize);
            return engine.Predict();
        }

        private static async Task<List<DonationTimeSeriesData>> BuildWeeklySeriesAsync(AppDbContext db)
        {
            var donations = await db.Donations
                .Where(d => d.Status == "completed")
                .Select(d => new { d.Amount, d.CreatedAt })
                .ToListAsync();

            if (donations.Count == 0)
                return [];

            var minDate = donations.Min(d => d.CreatedAt);
            var maxDate = donations.Max(d => d.CreatedAt);
            int totalWeeks = (int)Math.Ceiling((maxDate - minDate).TotalDays / 7) + 1;

            var weeklyAmounts = new Dictionary<int, float>();
            foreach (var d in donations)
            {
                int idx = (int)((d.CreatedAt - minDate).TotalDays / 7);
                weeklyAmounts[idx] = weeklyAmounts.GetValueOrDefault(idx) + (float)d.Amount;
            }

            return Enumerable.Range(0, totalWeeks)
                .Select(i => new DonationTimeSeriesData { Amount = weeklyAmounts.GetValueOrDefault(i, 0f) })
                .ToList();
        }

        // ─── 2. SENTIMENT ANALYSIS ────────────────────────────────────────────────

        public async Task<SentimentPrediction> AnalyzeSentimentAsync(string text)
        {
            await EnsureSentimentModelAsync();
            // PredictionEngine is not thread-safe; create per call (cheap after model is trained)
            var engine = _mlContext.Model.CreatePredictionEngine<SentimentData, SentimentPrediction>(_sentimentModel!);
            return engine.Predict(new SentimentData { Text = text });
        }

        private async Task EnsureSentimentModelAsync()
        {
            if (_sentimentModel is not null) return;
            await _sentimentLock.WaitAsync();
            try
            {
                if (_sentimentModel is not null) return;
                _sentimentModel = await TrainSentimentModelAsync();
            }
            finally { _sentimentLock.Release(); }
        }

        private async Task<ITransformer> TrainSentimentModelAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var data = await BuildSentimentDataAsync(db);

            var dataView = _mlContext.Data.LoadFromEnumerable(data);
            var pipeline = _mlContext.Transforms.Text
                .FeaturizeText("Features", nameof(SentimentData.Text))
                .Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(
                    labelColumnName: "Label", featureColumnName: "Features"));

            _logger.LogInformation("Training sentiment analysis model with {Count} samples", data.Count);
            return pipeline.Fit(dataView);
        }

        private static async Task<List<SentimentData>> BuildSentimentDataAsync(AppDbContext db)
        {
            // Domain-specific seed data (positive/negative donation-related phrases)
            var data = new List<SentimentData>
            {
                // ── Positive: long formal ──────────────────────────────────────────────
                new() { Text = "Amazing initiative, very happy to contribute to this cause", IsPositive = true },
                new() { Text = "Great campaign, the team is doing wonderful work for the community", IsPositive = true },
                new() { Text = "Proud to support this donation drive, keep up the excellent work", IsPositive = true },
                new() { Text = "This is a fantastic platform for helping people in need", IsPositive = true },
                new() { Text = "Truly inspiring work, I will continue donating every month", IsPositive = true },
                new() { Text = "Excellent transparency in how funds are used, highly recommended", IsPositive = true },
                new() { Text = "The team is dedicated and the impact is real, love this platform", IsPositive = true },
                new() { Text = "Happy to be part of this movement, making a real difference", IsPositive = true },
                new() { Text = "Wonderful organization helping those most in need", IsPositive = true },
                new() { Text = "Best donation platform I have used, very transparent and efficient", IsPositive = true },
                new() { Text = "Really impressed with the quick response and fund allocation", IsPositive = true },
                new() { Text = "Love how they update donors on campaign progress", IsPositive = true },
                new() { Text = "This platform has made donating so easy and rewarding", IsPositive = true },
                new() { Text = "I trust this system completely, great work by the whole team", IsPositive = true },
                new() { Text = "Outstanding service and very user-friendly interface", IsPositive = true },
                new() { Text = "The campaigns are well managed and very impactful", IsPositive = true },
                new() { Text = "Highly recommend this to anyone who wants to make a difference", IsPositive = true },
                new() { Text = "Very transparent and the funds are used wisely", IsPositive = true },
                new() { Text = "Great experience overall, will donate again", IsPositive = true },
                new() { Text = "Super easy to use and the impact is visible", IsPositive = true },
                // ── Positive: short colloquial ─────────────────────────────────────────
                new() { Text = "Great site", IsPositive = true },
                new() { Text = "Awesome platform", IsPositive = true },
                new() { Text = "Love it", IsPositive = true },
                new() { Text = "Very good", IsPositive = true },
                new() { Text = "Excellent work", IsPositive = true },
                new() { Text = "Amazing", IsPositive = true },
                new() { Text = "So good", IsPositive = true },
                new() { Text = "Fantastic experience", IsPositive = true },
                new() { Text = "Really helpful", IsPositive = true },
                new() { Text = "This is great", IsPositive = true },
                new() { Text = "Highly recommend", IsPositive = true },
                new() { Text = "Best platform ever", IsPositive = true },
                new() { Text = "This motivates me", IsPositive = true },
                new() { Text = "Awesome site", IsPositive = true },
                new() { Text = "5 stars", IsPositive = true },
                new() { Text = "Totally worth it", IsPositive = true },
                new() { Text = "Love this platform", IsPositive = true },
                new() { Text = "Very impressed", IsPositive = true },
                new() { Text = "Wonderful", IsPositive = true },
                new() { Text = "Really good service", IsPositive = true },
                // ── Negative: long formal ──────────────────────────────────────────────
                new() { Text = "Disappointed with the lack of transparency in fund management", IsPositive = false },
                new() { Text = "Very slow processing, my donation did not go through after hours", IsPositive = false },
                new() { Text = "Poor communication and no updates on the campaign I donated to", IsPositive = false },
                new() { Text = "Frustrated with the system, too many errors and payment failures", IsPositive = false },
                new() { Text = "Not satisfied with how funds were managed, very little accountability", IsPositive = false },
                new() { Text = "Terrible experience, my refund request was ignored for weeks", IsPositive = false },
                new() { Text = "Misleading campaign description, funds not used as promised", IsPositive = false },
                new() { Text = "Very bad customer support, no response to any of my queries", IsPositive = false },
                new() { Text = "The platform is unreliable and the team seems unorganized", IsPositive = false },
                new() { Text = "Unhappy with the outcome, very little impact despite large funds raised", IsPositive = false },
                new() { Text = "Too many fees deducted, very little goes to the actual cause", IsPositive = false },
                new() { Text = "Horrible experience from start to finish, would not recommend", IsPositive = false },
                new() { Text = "The website crashed multiple times and I lost my payment data", IsPositive = false },
                new() { Text = "Very disappointed, the donation never reached the intended cause", IsPositive = false },
                new() { Text = "Worst platform I have ever used for donating", IsPositive = false },
                new() { Text = "Not happy with how this is run, very unprofessional", IsPositive = false },
                new() { Text = "I regret donating here, zero accountability", IsPositive = false },
                new() { Text = "This platform needs serious improvement, too many issues", IsPositive = false },
                new() { Text = "Complete waste of time and money, nothing works properly", IsPositive = false },
                new() { Text = "Absolutely terrible, I will never use this again", IsPositive = false },
                // ── Negative: short colloquial (the key gap we are plugging) ──────────
                new() { Text = "So bad site", IsPositive = false },
                new() { Text = "Bad site", IsPositive = false },
                new() { Text = "Very bad", IsPositive = false },
                new() { Text = "Terrible", IsPositive = false },
                new() { Text = "Horrible", IsPositive = false },
                new() { Text = "Awful", IsPositive = false },
                new() { Text = "Worst site ever", IsPositive = false },
                new() { Text = "Not good", IsPositive = false },
                new() { Text = "Pretty bad", IsPositive = false },
                new() { Text = "Really bad", IsPositive = false },
                new() { Text = "Total waste", IsPositive = false },
                new() { Text = "Disappointed", IsPositive = false },
                new() { Text = "Not satisfied", IsPositive = false },
                new() { Text = "Awful experience", IsPositive = false },
                new() { Text = "So disappointing", IsPositive = false },
                new() { Text = "Hate it", IsPositive = false },
                new() { Text = "Does not work", IsPositive = false },
                new() { Text = "Broken site", IsPositive = false },
                new() { Text = "Very poor", IsPositive = false },
                new() { Text = "Useless", IsPositive = false },
                new() { Text = "Worst experience", IsPositive = false },
                new() { Text = "Bad experience", IsPositive = false },
                new() { Text = "Pathetic", IsPositive = false },
                new() { Text = "Completely useless", IsPositive = false },
                new() { Text = "Such a bad platform", IsPositive = false },
                new() { Text = "Not recommended", IsPositive = false },
                new() { Text = "Avoid this", IsPositive = false },
            };

            // Augment with real approved testimonials
            var testimonials = await db.Testimonials
                .Where(t => t.IsApproved && !string.IsNullOrEmpty(t.Comment))
                .Select(t => new { t.Comment, t.Rating })
                .ToListAsync();

            foreach (var t in testimonials)
                data.Add(new SentimentData { Text = t.Comment!, IsPositive = t.Rating >= 3 });

            // Donation messages are inherently positive intent
            var messages = await db.Donations
                .Where(d => !string.IsNullOrEmpty(d.Message))
                .Select(d => d.Message!)
                .Take(100)
                .ToListAsync();

            foreach (var msg in messages)
                data.Add(new SentimentData { Text = msg, IsPositive = true });

            return data;
        }

        // ─── 3. DONOR CHURN PREDICTION ────────────────────────────────────────────

        public async Task<ChurnPrediction> PredictDonorChurnAsync(int userId)
        {
            await EnsureChurnModelAsync();

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var donations = await db.Donations
                .Where(d => d.UserId == userId && d.Status == "completed")
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            // User with no donation history is highly likely to churn
            if (donations.Count == 0)
                return new ChurnPrediction { WillChurn = true, Probability = 0.9f, Score = -1.8f };

            float daysSinceLast = (float)(DateTime.UtcNow - donations.First().CreatedAt).TotalDays;
            float totalCount = donations.Count;
            float totalAmount = (float)donations.Sum(d => d.Amount);
            float avgAmount = totalAmount / totalCount;
            float durationMonths = Math.Max(1f, (float)(donations.First().CreatedAt - donations.Last().CreatedAt).TotalDays / 30f);
            float freqPerMonth = totalCount / durationMonths;

            var input = new DonorChurnData
            {
                DaysSinceLastDonation = daysSinceLast,
                TotalDonations = totalCount,
                AverageDonationAmount = avgAmount,
                TotalAmountDonated = totalAmount,
                DonationFrequencyPerMonth = freqPerMonth
            };

            var engine = _mlContext.Model.CreatePredictionEngine<DonorChurnData, ChurnPrediction>(_churnModel!);
            return engine.Predict(input);
        }

        private async Task EnsureChurnModelAsync()
        {
            if (_churnModel is not null) return;
            await _churnLock.WaitAsync();
            try
            {
                if (_churnModel is not null) return;
                _churnModel = await TrainChurnModelAsync();
            }
            finally { _churnLock.Release(); }
        }

        private async Task<ITransformer> TrainChurnModelAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var data = await BuildChurnDataAsync(db);

            var dataView = _mlContext.Data.LoadFromEnumerable(data);
            var featureColumns = new[]
            {
                nameof(DonorChurnData.DaysSinceLastDonation),
                nameof(DonorChurnData.TotalDonations),
                nameof(DonorChurnData.AverageDonationAmount),
                nameof(DonorChurnData.TotalAmountDonated),
                nameof(DonorChurnData.DonationFrequencyPerMonth)
            };

            var pipeline = _mlContext.Transforms
                .Concatenate("Features", featureColumns)
                .Append(_mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(
                    labelColumnName: "Label", featureColumnName: "Features"));

            _logger.LogInformation("Training donor churn model with {Count} samples", data.Count);
            return pipeline.Fit(dataView);
        }

        private static async Task<List<DonorChurnData>> BuildChurnDataAsync(AppDbContext db)
        {
            var data = new List<DonorChurnData>
            {
                // Active / retained donors
                new() { DaysSinceLastDonation = 5f,   TotalDonations = 12f, AverageDonationAmount = 500f,  TotalAmountDonated = 6000f,  DonationFrequencyPerMonth = 1.2f,  WillChurn = false },
                new() { DaysSinceLastDonation = 10f,  TotalDonations = 6f,  AverageDonationAmount = 1000f, TotalAmountDonated = 6000f,  DonationFrequencyPerMonth = 0.8f,  WillChurn = false },
                new() { DaysSinceLastDonation = 15f,  TotalDonations = 24f, AverageDonationAmount = 200f,  TotalAmountDonated = 4800f,  DonationFrequencyPerMonth = 2.0f,  WillChurn = false },
                new() { DaysSinceLastDonation = 20f,  TotalDonations = 8f,  AverageDonationAmount = 750f,  TotalAmountDonated = 6000f,  DonationFrequencyPerMonth = 0.5f,  WillChurn = false },
                new() { DaysSinceLastDonation = 7f,   TotalDonations = 36f, AverageDonationAmount = 300f,  TotalAmountDonated = 10800f, DonationFrequencyPerMonth = 3.0f,  WillChurn = false },
                new() { DaysSinceLastDonation = 3f,   TotalDonations = 4f,  AverageDonationAmount = 2000f, TotalAmountDonated = 8000f,  DonationFrequencyPerMonth = 0.4f,  WillChurn = false },
                new() { DaysSinceLastDonation = 25f,  TotalDonations = 18f, AverageDonationAmount = 400f,  TotalAmountDonated = 7200f,  DonationFrequencyPerMonth = 1.5f,  WillChurn = false },
                new() { DaysSinceLastDonation = 12f,  TotalDonations = 10f, AverageDonationAmount = 600f,  TotalAmountDonated = 6000f,  DonationFrequencyPerMonth = 0.9f,  WillChurn = false },
                new() { DaysSinceLastDonation = 8f,   TotalDonations = 15f, AverageDonationAmount = 350f,  TotalAmountDonated = 5250f,  DonationFrequencyPerMonth = 1.1f,  WillChurn = false },
                new() { DaysSinceLastDonation = 30f,  TotalDonations = 5f,  AverageDonationAmount = 1500f, TotalAmountDonated = 7500f,  DonationFrequencyPerMonth = 0.3f,  WillChurn = false },
                // Churned donors (silent for 60+ days, low engagement)
                new() { DaysSinceLastDonation = 180f, TotalDonations = 2f,  AverageDonationAmount = 300f,  TotalAmountDonated = 600f,   DonationFrequencyPerMonth = 0.1f,  WillChurn = true  },
                new() { DaysSinceLastDonation = 120f, TotalDonations = 1f,  AverageDonationAmount = 500f,  TotalAmountDonated = 500f,   DonationFrequencyPerMonth = 0.1f,  WillChurn = true  },
                new() { DaysSinceLastDonation = 200f, TotalDonations = 3f,  AverageDonationAmount = 200f,  TotalAmountDonated = 600f,   DonationFrequencyPerMonth = 0.05f, WillChurn = true  },
                new() { DaysSinceLastDonation = 365f, TotalDonations = 1f,  AverageDonationAmount = 1000f, TotalAmountDonated = 1000f,  DonationFrequencyPerMonth = 0.01f, WillChurn = true  },
                new() { DaysSinceLastDonation = 90f,  TotalDonations = 2f,  AverageDonationAmount = 150f,  TotalAmountDonated = 300f,   DonationFrequencyPerMonth = 0.1f,  WillChurn = true  },
                new() { DaysSinceLastDonation = 150f, TotalDonations = 1f,  AverageDonationAmount = 800f,  TotalAmountDonated = 800f,   DonationFrequencyPerMonth = 0.05f, WillChurn = true  },
                new() { DaysSinceLastDonation = 240f, TotalDonations = 4f,  AverageDonationAmount = 100f,  TotalAmountDonated = 400f,   DonationFrequencyPerMonth = 0.08f, WillChurn = true  },
                new() { DaysSinceLastDonation = 100f, TotalDonations = 1f,  AverageDonationAmount = 600f,  TotalAmountDonated = 600f,   DonationFrequencyPerMonth = 0.1f,  WillChurn = true  },
                new() { DaysSinceLastDonation = 300f, TotalDonations = 2f,  AverageDonationAmount = 500f,  TotalAmountDonated = 1000f,  DonationFrequencyPerMonth = 0.03f, WillChurn = true  },
                new() { DaysSinceLastDonation = 80f,  TotalDonations = 3f,  AverageDonationAmount = 250f,  TotalAmountDonated = 750f,   DonationFrequencyPerMonth = 0.15f, WillChurn = true  },
            };

            // Augment with real donor histories
            var donors = await db.Users
                .Where(u => u.UserType == "donor")
                .Select(u => u.Id)
                .ToListAsync();

            foreach (var uid in donors)
            {
                var userDonations = await db.Donations
                    .Where(d => d.UserId == uid && d.Status == "completed")
                    .OrderByDescending(d => d.CreatedAt)
                    .ToListAsync();

                if (userDonations.Count == 0) continue;

                float daysSince = (float)(DateTime.UtcNow - userDonations.First().CreatedAt).TotalDays;
                float count = userDonations.Count;
                float totalAmt = (float)userDonations.Sum(d => d.Amount);
                float avg = totalAmt / count;
                float durationMonths = Math.Max(1f, (float)(userDonations.First().CreatedAt - userDonations.Last().CreatedAt).TotalDays / 30f);

                data.Add(new DonorChurnData
                {
                    DaysSinceLastDonation = daysSince,
                    TotalDonations = count,
                    AverageDonationAmount = avg,
                    TotalAmountDonated = totalAmt,
                    DonationFrequencyPerMonth = count / durationMonths,
                    WillChurn = daysSince > 60
                });
            }

            return data;
        }

        // ─── 4. CAMPAIGN SUCCESS PREDICTION ──────────────────────────────────────

        public async Task<CampaignSuccessPrediction> PredictCampaignSuccessAsync(int campaignId)
        {
            await EnsureCampaignSuccessModelAsync();

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var campaign = await db.Campaigns.FindAsync(campaignId)
                ?? throw new KeyNotFoundException($"Campaign {campaignId} not found.");

            float duration = (float)(campaign.EndDate - campaign.StartDate).TotalDays;
            float raisedRatio = campaign.TargetAmount > 0
                ? (float)(campaign.RaisedAmount / campaign.TargetAmount)
                : 0f;

            var input = new CampaignSuccessData
            {
                TargetAmount = (float)campaign.TargetAmount,
                DurationDays = duration,
                IsUrgent = campaign.IsUrgent ? 1f : 0f,
                IsFeatured = campaign.IsFeatured ? 1f : 0f,
                CategoryEncoded = CategoryMap.GetValueOrDefault(campaign.Category, 9f),
                CurrentRaisedRatio = raisedRatio
            };

            var engine = _mlContext.Model.CreatePredictionEngine<CampaignSuccessData, CampaignSuccessPrediction>(_campaignSuccessModel!);
            return engine.Predict(input);
        }

        private async Task EnsureCampaignSuccessModelAsync()
        {
            if (_campaignSuccessModel is not null) return;
            await _campaignLock.WaitAsync();
            try
            {
                if (_campaignSuccessModel is not null) return;
                _campaignSuccessModel = await TrainCampaignSuccessModelAsync();
            }
            finally { _campaignLock.Release(); }
        }

        private async Task<ITransformer> TrainCampaignSuccessModelAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var data = await BuildCampaignSuccessDataAsync(db);

            var dataView = _mlContext.Data.LoadFromEnumerable(data);
            var featureColumns = new[]
            {
                nameof(CampaignSuccessData.TargetAmount),
                nameof(CampaignSuccessData.DurationDays),
                nameof(CampaignSuccessData.IsUrgent),
                nameof(CampaignSuccessData.IsFeatured),
                nameof(CampaignSuccessData.CategoryEncoded),
                nameof(CampaignSuccessData.CurrentRaisedRatio)
            };

            var pipeline = _mlContext.Transforms
                .Concatenate("Features", featureColumns)
                .Append(_mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(
                    labelColumnName: "Label", featureColumnName: "Features"));

            _logger.LogInformation("Training campaign success model with {Count} samples", data.Count);
            return pipeline.Fit(dataView);
        }

        private static async Task<List<CampaignSuccessData>> BuildCampaignSuccessDataAsync(AppDbContext db)
        {
            var data = new List<CampaignSuccessData>
            {
                // Successful
                new() { TargetAmount = 50000f,  DurationDays = 60f, IsUrgent = 1f, IsFeatured = 1f, CategoryEncoded = 3f, CurrentRaisedRatio = 0.80f, WillSucceed = true  },
                new() { TargetAmount = 20000f,  DurationDays = 45f, IsUrgent = 0f, IsFeatured = 1f, CategoryEncoded = 1f, CurrentRaisedRatio = 0.70f, WillSucceed = true  },
                new() { TargetAmount = 10000f,  DurationDays = 30f, IsUrgent = 1f, IsFeatured = 0f, CategoryEncoded = 2f, CurrentRaisedRatio = 0.60f, WillSucceed = true  },
                new() { TargetAmount = 5000f,   DurationDays = 20f, IsUrgent = 1f, IsFeatured = 1f, CategoryEncoded = 3f, CurrentRaisedRatio = 0.90f, WillSucceed = true  },
                new() { TargetAmount = 100000f, DurationDays = 90f, IsUrgent = 0f, IsFeatured = 1f, CategoryEncoded = 1f, CurrentRaisedRatio = 0.65f, WillSucceed = true  },
                new() { TargetAmount = 15000f,  DurationDays = 30f, IsUrgent = 1f, IsFeatured = 1f, CategoryEncoded = 2f, CurrentRaisedRatio = 0.85f, WillSucceed = true  },
                new() { TargetAmount = 8000f,   DurationDays = 25f, IsUrgent = 1f, IsFeatured = 0f, CategoryEncoded = 5f, CurrentRaisedRatio = 0.75f, WillSucceed = true  },
                new() { TargetAmount = 30000f,  DurationDays = 60f, IsUrgent = 0f, IsFeatured = 1f, CategoryEncoded = 7f, CurrentRaisedRatio = 0.55f, WillSucceed = true  },
                new() { TargetAmount = 25000f,  DurationDays = 45f, IsUrgent = 1f, IsFeatured = 1f, CategoryEncoded = 8f, CurrentRaisedRatio = 0.70f, WillSucceed = true  },
                new() { TargetAmount = 12000f,  DurationDays = 35f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 4f, CurrentRaisedRatio = 0.60f, WillSucceed = true  },
                // Unsuccessful
                new() { TargetAmount = 500000f, DurationDays = 30f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.05f, WillSucceed = false },
                new() { TargetAmount = 200000f, DurationDays = 20f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.10f, WillSucceed = false },
                new() { TargetAmount = 100000f, DurationDays = 15f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.02f, WillSucceed = false },
                new() { TargetAmount = 80000f,  DurationDays = 25f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 6f, CurrentRaisedRatio = 0.15f, WillSucceed = false },
                new() { TargetAmount = 50000f,  DurationDays = 10f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.08f, WillSucceed = false },
                new() { TargetAmount = 300000f, DurationDays = 45f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.12f, WillSucceed = false },
                new() { TargetAmount = 150000f, DurationDays = 60f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.20f, WillSucceed = false },
                new() { TargetAmount = 75000f,  DurationDays = 20f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.07f, WillSucceed = false },
                new() { TargetAmount = 40000f,  DurationDays = 15f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.10f, WillSucceed = false },
                new() { TargetAmount = 60000f,  DurationDays = 30f, IsUrgent = 0f, IsFeatured = 0f, CategoryEncoded = 9f, CurrentRaisedRatio = 0.18f, WillSucceed = false },
            };

            // Augment with real completed/cancelled campaigns
            var pastCampaigns = await db.Campaigns
                .Where(c => c.Status == "completed" || c.Status == "cancelled")
                .ToListAsync();

            foreach (var c in pastCampaigns)
            {
                data.Add(new CampaignSuccessData
                {
                    TargetAmount = (float)c.TargetAmount,
                    DurationDays = (float)(c.EndDate - c.StartDate).TotalDays,
                    IsUrgent = c.IsUrgent ? 1f : 0f,
                    IsFeatured = c.IsFeatured ? 1f : 0f,
                    CategoryEncoded = CategoryMap.GetValueOrDefault(c.Category, 9f),
                    CurrentRaisedRatio = c.TargetAmount > 0 ? (float)(c.RaisedAmount / c.TargetAmount) : 0f,
                    WillSucceed = c.RaisedAmount >= c.TargetAmount
                });
            }

            return data;
        }

        // ─── 5. DONATION ANOMALY DETECTION (IID SPIKE) ───────────────────────────

        public async Task<List<(int DonationId, decimal Amount, AnomalyPrediction Pred, DateTime CreatedAt)>>
            DetectDonationAnomaliesAsync(int campaignId)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var donations = await db.Donations
                .Where(d => d.CampaignId == campaignId && d.Status == "completed")
                .OrderBy(d => d.CreatedAt)
                .Select(d => new { d.Id, d.Amount, d.CreatedAt })
                .ToListAsync();

            // IID spike detector needs at least 10 observations
            if (donations.Count < 10)
                return [];

            var series = donations.Select(d => new DonationAmountData { Amount = (float)d.Amount }).ToList();
            var dataView = _mlContext.Data.LoadFromEnumerable(series);

            int pvalueHistoryLength = Math.Max(5, series.Count / 4);

            var pipeline = _mlContext.Transforms.DetectIidSpike(
                outputColumnName: nameof(AnomalyPrediction.Prediction),
                inputColumnName: nameof(DonationAmountData.Amount),
                confidence: 95.0,
                pvalueHistoryLength: pvalueHistoryLength);

            var transformed = pipeline.Fit(dataView).Transform(dataView);
            var predictions = _mlContext.Data
                .CreateEnumerable<AnomalyPrediction>(transformed, reuseRowObject: false)
                .ToList();

            _logger.LogInformation("Anomaly detection ran on {Count} donations for campaign {Id}", donations.Count, campaignId);

            return donations
                .Zip(predictions, (d, p) => (d.Id, d.Amount, p, d.CreatedAt))
                .ToList();
        }

        // ─── 5. VOLUNTEER RECOMMENDATION ────────────────────────────────────────

        public async Task<List<VolunteerRecommendationResult>> RecommendVolunteersForCampaignAsync(VolunteerRecommendationRequest request)
        {
            await EnsureVolunteerRecommendationModelAsync();

            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var campaign = await db.Campaigns.FindAsync(request.CampaignId)
                ?? throw new KeyNotFoundException($"Campaign {request.CampaignId} not found.");

            // Get eligible volunteers (active, verified, approved)
            // For recommendations, we're more lenient: include pending/unverified volunteers as candidates
            var eligibleVolunteers = await db.VolunteerProfiles
                .Include(vp => vp.User)
                .Where(vp =>
                    vp.User != null && // Must have a user account
                    (vp.Status == null || vp.Status == "active" || vp.Status == "verified" || vp.Status == "pending")) // Accept various statuses
                .ToListAsync();
            
            // Fallback: if no one matches above, include ALL volunteers with a user account
            if (eligibleVolunteers.Count == 0)
            {
                eligibleVolunteers = await db.VolunteerProfiles
                    .Include(vp => vp.User)
                    .Where(vp => vp.User != null)
                    .ToListAsync();
            }

            // Filter by specific IDs if provided
            if (request.VolunteerIds?.Count > 0)
                eligibleVolunteers = eligibleVolunteers.Where(v => request.VolunteerIds.Contains(v.Id)).ToList();

            var results = new List<VolunteerRecommendationResult>();

            _logger.LogInformation("Generating volunteer recommendations for campaign {CampaignId} from {Count} eligible volunteers",
                request.CampaignId, eligibleVolunteers.Count);

            var engine = _mlContext.Model.CreatePredictionEngine<VolunteerRecommendationInput, VolunteerRecommendationPrediction>(_volunteerRecommendationModel!);

            foreach (var volunteer in eligibleVolunteers)
            {
                var features = await BuildVolunteerFeaturesAsync(db, campaign, volunteer);
                var prediction = engine.Predict(features);

                float mlScore = prediction.Score;
                // Handle NaN or invalid scores - provide fallback scoring based on features
                float suitabilityScore = float.IsNaN(mlScore) || float.IsInfinity(mlScore) 
                    ? CalculateFallbackScore(features) * 100
                    : mlScore * 100; // Convert to 0-100 scale

                // Use actual calculated score without artificial minimum floor
                float finalScore = Math.Clamp(suitabilityScore, 0, 100);

                results.Add(new VolunteerRecommendationResult
                {
                    VolunteerId = volunteer.Id,
                    VolunteerName = $"{volunteer.User?.FirstName} {volunteer.User?.LastName}".Trim() ?? "Unknown",
                    Rank = volunteer.Rank,
                    SuitabilityScore = finalScore,
                    IsRecommended = prediction.IsGoodMatch && suitabilityScore >= 50,
                    Reason = GenerateRecommendationReason(features, prediction),
                    SkillsMatch = features.SkillsMatchScore,
                    InterestsMatch = features.InterestsMatchScore,
                    AvailabilityMatch = features.AvailabilityScore,
                    ExperienceScore = features.ExperienceLevel,
                    LocationScore = features.LocationProximity,
                    RatingScore = features.VolunteerRating
                });
            }

            // Sort by suitability score descending and return top N
            var topRecommendations = results
                .OrderByDescending(r => r.SuitabilityScore)
                .Take(request.TopN)
                .ToList();

            _logger.LogInformation("Generated {Count} recommendations for campaign {CampaignId}", topRecommendations.Count, request.CampaignId);
            return topRecommendations;
        }

        private async Task<VolunteerRecommendationInput> BuildVolunteerFeaturesAsync(AppDbContext db, Campaign campaign, VolunteerProfile volunteer)
        {
            // Parse JSON fields
            var volunteerSkills = JsonSerializer.Deserialize<List<string>>(volunteer.Skills ?? "[]") ?? [];
            var volunteerInterests = JsonSerializer.Deserialize<List<string>>(volunteer.Interests ?? "[]") ?? [];
            
            // NOTE: Campaign doesn't currently have RequiredSkills property
            // For now, we'll assume no required skills matching
            var requiredSkills = new List<string>();

            // 1. SKILLS MATCH: What percentage of required skills does the volunteer have?
            float skillsMatchScore = requiredSkills.Count == 0 ? 0.8f : // Default to high if no requirements
                (float)volunteerSkills.Count(s => requiredSkills.Any(r => r.Equals(s, StringComparison.OrdinalIgnoreCase))) / requiredSkills.Count;

            // 2. INTERESTS MATCH: Does volunteer interest align with campaign category?
            float interestsMatchScore = volunteerInterests.Any(i => i.Equals(campaign.Category, StringComparison.OrdinalIgnoreCase)) ? 1f : 0.3f;

            // 3. AVAILABILITY MATCH: What % of campaign duration is the volunteer available?
            float availabilityScore = await CalculateAvailabilityScoreAsync(volunteer, campaign);

            // 4. EXPERIENCE LEVEL: Convert to numeric (0=beginner, 1=intermediate, 2=advanced, 3=expert)
            float experienceLevel = volunteer.ExperienceLevel?.ToLower() switch
            {
                "beginner" => 0.33f,
                "intermediate" => 0.66f,
                "advanced" => 0.88f,
                "expert" => 1.0f,
                _ => 0.25f
            };

            // 5. TOTAL HOURS NORMALIZED: Max out at 1000 hours for scoring
            float totalHoursNormalized = Math.Min(volunteer.TotalHoursVolunteered / 1000f, 1f);

            // 6. RATING SCORE: 0-5 scale
            float ratingScore = volunteer.TotalRatings > 0 ? (float)volunteer.Rating : 2.5f; // Default to 2.5 if no ratings

            // 7. COMPLETION RATE: % of assignments completed
            var assignments = await db.VolunteerAssignments
                .Where(va => va.VolunteerProfileId == volunteer.Id)
                .ToListAsync();

            float completionRate = assignments.Count == 0 ? 0.5f : // Default neutral if no history
                (float)assignments.Count(a => a.Status == "completed") / assignments.Count;

            // 8. QUALITY RATING: Average rating from completed assignments
            var completedAssignments = assignments.Where(a => a.Status == "completed").ToList();
            float qualityRating = completedAssignments.Count == 0 ? 2.5f :
                (float)completedAssignments.Average(a => a.Rating ?? 2.5m);

            // 9. ACCEPTANCE RATE: % of requests volunteer accepted
            var requests = await db.VolunteerRequests
                .Where(vr => vr.VolunteerProfileId == volunteer.Id)
                .ToListAsync();

            float acceptanceRate = requests.Count == 0 ? 0.7f : // Assume 70% if no history
                (float)requests.Count(r => r.Status == "accepted") / requests.Count;

            // 10. LOCATION PROXIMITY: Distance-based score (closer = higher)
            // NOTE: Campaign model doesn't have Latitude/Longitude, so this uses volunteer location only
            float locationProximity = 0.5f; // Neutral score without location data

            // 11. AVAILABLE HOURS PER WEEK: Normalized (max 100 hours/week for practical purposes)
            float availableHoursNormalized = Math.Min(volunteer.HoursPerWeek / 100f, 1f);

            // 12. CAMPAIGN COMPLEXITY: Estimate based on target, duration, volunteers needed
            float campaignComplexity = CalculateCampaignComplexity(campaign);

            // 13. CATEGORY EXPERIENCE: How many past campaigns in this category?
            var pastCampaigns = await db.VolunteerAssignments
                .Where(va => va.VolunteerProfileId == volunteer.Id && va.Status == "completed")
                .Include(va => va.Campaign)
                .ToListAsync();

            float categoryExperience = pastCampaigns.Count == 0 ? 0.3f :
                (float)pastCampaigns.Count(va => va.Campaign.Category.Equals(campaign.Category, StringComparison.OrdinalIgnoreCase)) /
                pastCampaigns.Count;

            return new VolunteerRecommendationInput
            {
                VolunteerId = volunteer.Id,
                CampaignId = campaign.Id,
                SkillsMatchScore = Math.Clamp(skillsMatchScore, 0, 1),
                InterestsMatchScore = Math.Clamp(interestsMatchScore, 0, 1),
                AvailabilityScore = Math.Clamp(availabilityScore, 0, 1),
                ExperienceLevel = Math.Clamp(experienceLevel, 0, 1),
                TotalHoursNormalized = Math.Clamp(totalHoursNormalized, 0, 1),
                VolunteerRating = Math.Clamp(ratingScore, 0, 5),
                CompletionRate = Math.Clamp(completionRate, 0, 1),
                QualityRating = Math.Clamp(qualityRating, 0, 5),
                AcceptanceRate = Math.Clamp(acceptanceRate, 0, 1),
                LocationProximity = Math.Clamp(locationProximity, 0, 1),
                AvailableHoursPerWeek = Math.Clamp(availableHoursNormalized, 0, 1),
                CampaignComplexity = Math.Clamp(campaignComplexity, 0, 1),
                CategoryExperience = Math.Clamp(categoryExperience, 0, 1)
            };
        }

        private async Task<float> CalculateAvailabilityScoreAsync(VolunteerProfile volunteer, Campaign campaign)
        {
            try
            {
                var availableDays = JsonSerializer.Deserialize<List<string>>(volunteer.AvailableDays ?? "[]") ?? [];
                if (availableDays.Count == 0)
                    return 0.5f; // Neutral if no availability specified

                var requiredDays = GetCampaignDaysOfWeek(campaign);
                int matchingDays = availableDays.Count(d => requiredDays.Contains(d, StringComparer.OrdinalIgnoreCase));

                return (float)matchingDays / Math.Max(requiredDays.Count, 1);
            }
            catch
            {
                return 0.5f; // Neutral on error
            }
        }

        private List<string> GetCampaignDaysOfWeek(Campaign campaign)
        {
            var allDays = new[] { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" };
            int durationDays = (campaign.EndDate - campaign.StartDate).Days;

            // If campaign is short (1-7 days), assume specific day needed
            if (durationDays <= 7)
            {
                string dayName = campaign.StartDate.DayOfWeek.ToString();
                return new List<string> { dayName };
            }

            // For longer campaigns, assume weekdays + some weekends
            return new List<string> { "Monday", "Tuesday", "Wednesday", "Thursday", "Friday" };
        }

        private float CalculateCampaignComplexity(Campaign campaign)
        {
            float complexity = 0.5f; // Base complexity

            // Larger target = more complex
            if (campaign.TargetAmount > 100000)
                complexity += 0.2f;
            else if (campaign.TargetAmount > 50000)
                complexity += 0.1f;

            // Longer duration = more complex (requires commitment)
            int durationDays = (campaign.EndDate - campaign.StartDate).Days;
            if (durationDays > 60)
                complexity += 0.1f;

            // Urgent = more complex
            if (campaign.IsUrgent)
                complexity += 0.15f;

            return Math.Clamp(complexity, 0, 1);
        }

        private float CalculateFallbackScore(VolunteerRecommendationInput features)
        {
            // Weighted fallback scoring when ML model returns invalid scores
            float score = 0.3f; // Base score for any volunteer
            
            if (features.SkillsMatchScore > 0.5f) score += 0.15f;
            if (features.InterestsMatchScore > 0.5f) score += 0.15f;
            if (features.AvailabilityScore > 0.5f) score += 0.1f;
            if (features.ExperienceLevel > 0.3f) score += 0.1f;
            if (features.VolunteerRating > 3.0f) score += 0.1f;
            if (features.AcceptanceRate > 0.5f) score += 0.05f;
            
            return Math.Min(score, 0.95f); // Cap at 0.95
        }

        private string GenerateRecommendationReason(VolunteerRecommendationInput features, VolunteerRecommendationPrediction prediction)
        {
            var strengths = new List<string>();

            if (features.SkillsMatchScore >= 0.8f)
                strengths.Add("strong skills match");
            if (features.InterestsMatchScore >= 0.9f)
                strengths.Add("aligned interests");
            if (features.AvailabilityScore >= 0.8f)
                strengths.Add("good availability");
            if (features.VolunteerRating >= 4.0f)
                strengths.Add("excellent rating");
            if (features.CompletionRate >= 0.9f)
                strengths.Add("high completion rate");
            if (features.LocationProximity >= 0.8f)
                strengths.Add("nearby location");

            if (strengths.Count > 0)
                return $"Recommended: {string.Join(", ", strengths)}";

            return prediction.IsGoodMatch ? "Meets minimum criteria" : "Below recommended threshold";
        }

        private async Task EnsureVolunteerRecommendationModelAsync()
        {
            if (_volunteerRecommendationModel is not null) return;
            await _volunteerLock.WaitAsync();
            try
            {
                if (_volunteerRecommendationModel is not null) return;
                _volunteerRecommendationModel = await TrainVolunteerRecommendationModelAsync();
            }
            finally { _volunteerLock.Release(); }
        }

        private async Task<ITransformer> TrainVolunteerRecommendationModelAsync()
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var trainingData = await BuildVolunteerRecommendationTrainingDataAsync(db);

            _logger.LogInformation("Training volunteer recommendation model with {Count} samples", trainingData.Count);

            if (trainingData.Count == 0)
            {
                // Return a default model if no training data
                _logger.LogWarning("No volunteer assignment history found. Using default recommendation model.");
                return BuildDefaultVolunteerModel();
            }

            var dataView = _mlContext.Data.LoadFromEnumerable(trainingData);
            var featureColumns = new[]
            {
                nameof(VolunteerRecommendationInput.SkillsMatchScore),
                nameof(VolunteerRecommendationInput.InterestsMatchScore),
                nameof(VolunteerRecommendationInput.AvailabilityScore),
                nameof(VolunteerRecommendationInput.ExperienceLevel),
                nameof(VolunteerRecommendationInput.TotalHoursNormalized),
                nameof(VolunteerRecommendationInput.VolunteerRating),
                nameof(VolunteerRecommendationInput.CompletionRate),
                nameof(VolunteerRecommendationInput.QualityRating),
                nameof(VolunteerRecommendationInput.AcceptanceRate),
                nameof(VolunteerRecommendationInput.LocationProximity),
                nameof(VolunteerRecommendationInput.AvailableHoursPerWeek),
                nameof(VolunteerRecommendationInput.CampaignComplexity),
                nameof(VolunteerRecommendationInput.CategoryExperience)
            };

            var pipeline = _mlContext.Transforms
                .Concatenate("Features", featureColumns)
                .Append(_mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(
                    labelColumnName: "Label",
                    featureColumnName: "Features"));

            return pipeline.Fit(dataView);
        }

        private ITransformer BuildDefaultVolunteerModel()
        {
            // Create a minimal default model that accepts good features regardless
            var defaultData = new List<VolunteerRecommendationInput>
            {
                new() 
                { 
                    VolunteerId = 1, CampaignId = 1,
                    SkillsMatchScore = 0.8f, InterestsMatchScore = 0.8f,
                    AvailabilityScore = 0.8f, ExperienceLevel = 0.8f,
                    TotalHoursNormalized = 0.7f, VolunteerRating = 4.5f,
                    CompletionRate = 0.9f, QualityRating = 4.0f,
                    AcceptanceRate = 0.8f, LocationProximity = 0.8f,
                    AvailableHoursPerWeek = 0.7f, CampaignComplexity = 0.5f,
                    CategoryExperience = 0.7f, SuccessfulMatch = true
                },
                new() 
                { 
                    VolunteerId = 2, CampaignId = 2,
                    SkillsMatchScore = 0.3f, InterestsMatchScore = 0.2f,
                    AvailabilityScore = 0.2f, ExperienceLevel = 0.2f,
                    TotalHoursNormalized = 0.1f, VolunteerRating = 1.5f,
                    CompletionRate = 0.2f, QualityRating = 1.5f,
                    AcceptanceRate = 0.3f, LocationProximity = 0.1f,
                    AvailableHoursPerWeek = 0.1f, CampaignComplexity = 0.5f,
                    CategoryExperience = 0.1f, SuccessfulMatch = false
                }
            };

            var dataView = _mlContext.Data.LoadFromEnumerable(defaultData);
            var featureColumns = new[]
            {
                nameof(VolunteerRecommendationInput.SkillsMatchScore),
                nameof(VolunteerRecommendationInput.InterestsMatchScore),
                nameof(VolunteerRecommendationInput.AvailabilityScore),
                nameof(VolunteerRecommendationInput.ExperienceLevel),
                nameof(VolunteerRecommendationInput.TotalHoursNormalized),
                nameof(VolunteerRecommendationInput.VolunteerRating),
                nameof(VolunteerRecommendationInput.CompletionRate),
                nameof(VolunteerRecommendationInput.QualityRating),
                nameof(VolunteerRecommendationInput.AcceptanceRate),
                nameof(VolunteerRecommendationInput.LocationProximity),
                nameof(VolunteerRecommendationInput.AvailableHoursPerWeek),
                nameof(VolunteerRecommendationInput.CampaignComplexity),
                nameof(VolunteerRecommendationInput.CategoryExperience)
            };

            var pipeline = _mlContext.Transforms
                .Concatenate("Features", featureColumns)
                .Append(_mlContext.Transforms.NormalizeMinMax("Features"))
                .Append(_mlContext.BinaryClassification.Trainers.SdcaLogisticRegression(
                    labelColumnName: "Label",
                    featureColumnName: "Features"));

            return pipeline.Fit(dataView);
        }

        private async Task<List<VolunteerRecommendationInput>> BuildVolunteerRecommendationTrainingDataAsync(AppDbContext db)
        {
            var trainingData = new List<VolunteerRecommendationInput>();

            // Get completed volunteer assignments with ratings
            var completedAssignments = await db.VolunteerAssignments
                .Include(va => va.VolunteerProfile)
                .Include(va => va.Campaign)
                .Where(va => va.Status == "completed" && va.Rating.HasValue)
                .ToListAsync();

            foreach (var assignment in completedAssignments)
            {
                if (assignment.VolunteerProfile == null || assignment.Campaign == null)
                    continue;

                var features = await BuildVolunteerFeaturesAsync(db, assignment.Campaign, assignment.VolunteerProfile);
                
                // Label: successful match if rating >= 4.0
                features.SuccessfulMatch = assignment.Rating >= 4.0m && assignment.Status == "completed";
                
                trainingData.Add(features);
            }

            return trainingData;
        }
    }
}

using Microsoft.ML;
using Microsoft.ML.Transforms.TimeSeries;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;

namespace DonationManagementSystem.API.Services.ML
{
    public interface IMLPredictionService
    {
        Task<DonationForecastOutput> ForecastDonationsAsync(int horizonWeeks = 4);
        Task<SentimentPrediction> AnalyzeSentimentAsync(string text);
        Task<ChurnPrediction> PredictDonorChurnAsync(int userId);
        Task<CampaignSuccessPrediction> PredictCampaignSuccessAsync(int campaignId);
        Task<List<(int DonationId, decimal Amount, AnomalyPrediction Pred, DateTime CreatedAt)>> DetectDonationAnomaliesAsync(int campaignId);
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

        private readonly SemaphoreSlim _sentimentLock = new(1, 1);
        private readonly SemaphoreSlim _churnLock = new(1, 1);
        private readonly SemaphoreSlim _campaignLock = new(1, 1);

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
    }
}

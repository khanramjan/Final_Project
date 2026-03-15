using Microsoft.AspNetCore.Mvc;
using DonationManagementSystem.API.DTOs;
using DonationManagementSystem.API.Services.ML;
using DonationManagementSystem.API.Data;
using Microsoft.EntityFrameworkCore;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MLController : ControllerBase
    {
        private readonly IMLPredictionService _ml;
        private readonly ILogger<MLController> _logger;
        private readonly AppDbContext _db;

        public MLController(IMLPredictionService ml, ILogger<MLController> logger, AppDbContext db)
        {
            _ml = ml;
            _logger = logger;
            _db = db;
        }

        /// <summary>
        /// Forecast weekly donation amounts for the next N weeks using SSA time series analysis.
        /// </summary>
        [HttpGet("forecast/donations")]
        public async Task<IActionResult> ForecastDonations([FromQuery] int periods = 4)
        {
            if (periods is < 1 or > 52)
                return BadRequest(new { message = "Periods must be between 1 and 52." });

            try
            {
                var output = await _ml.ForecastDonationsAsync(periods);

                var startDate = DateTime.UtcNow;
                var response = new DonationForecastResponse
                {
                    Forecasts = output.ForecastedAmounts
                        .Select((amount, i) => new PeriodForecast
                        {
                            Period = startDate.AddDays((i + 1) * 7).ToString("MMM dd, yyyy"),
                            ForecastedAmount = Math.Max(0f, amount),
                            LowerBound = Math.Max(0f, output.LowerBounds.ElementAtOrDefault(i)),
                            UpperBound = Math.Max(0f, output.UpperBounds.ElementAtOrDefault(i))
                        }).ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error running donation forecast");
                return StatusCode(500, new { message = "Forecast failed.", error = ex.Message });
            }
        }

        /// <summary>
        /// Get list of campaigns with donation counts for dropdown/selection.
        /// </summary>
        [HttpGet("campaigns/options")]
        public async Task<IActionResult> GetCampaignsForDropdown()
        {
            try
            {
                var campaigns = await _db.Campaigns
                    .Where(c => c.Status == "active" || c.Status == "completed")
                    .Select(c => new CampaignOption
                    {
                        Id = c.Id,
                        Title = c.Title,
                        DonationCount = c.Donations.Count(d => d.Status == "completed")
                    })
                    .OrderByDescending(c => c.DonationCount)
                    .ToListAsync();

                return Ok(campaigns);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching campaigns for dropdown");
                return StatusCode(500, new { message = "Failed to fetch campaigns.", error = ex.Message });
            }
        }

        /// <summary>
        /// Analyze the sentiment of any text (testimonials, donation messages, etc.)
        /// using a binary TF-IDF + SDCA logistic regression classifier.
        /// </summary>
        [HttpPost("sentiment/analyze")]
        public async Task<IActionResult> AnalyzeSentiment([FromBody] SentimentRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Text))
                return BadRequest(new { message = "Text cannot be empty." });

            try
            {
                var prediction = await _ml.AnalyzeSentimentAsync(request.Text);
                
                // For SDCA Logistic Regression, Probability is usually ~0.5 for neutral/unknown texts
                string sentimentResult = "Neutral";
                if (prediction.Probability > 0.65f) sentimentResult = "Positive";
                else if (prediction.Probability < 0.35f) sentimentResult = "Negative";
                // If it's a very short text and probability is middling, keep it Neutral

                return Ok(new SentimentResponse
                {
                    Text = request.Text,
                    Sentiment = sentimentResult,
                    Confidence = prediction.Probability,
                    Score = prediction.Score
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error analyzing sentiment");
                return StatusCode(500, new { message = "Sentiment analysis failed.", error = ex.Message });
            }
        }

        /// <summary>
        /// Predict the churn risk of a specific donor based on their donation history.
        /// Features: days since last donation, frequency, average amount, total donated.
        /// </summary>
        [HttpGet("predict/donor-churn/{userId:int}")]
        public async Task<IActionResult> PredictDonorChurn(int userId)
        {
            try
            {
                var prediction = await _ml.PredictDonorChurnAsync(userId);
                string risk = prediction.Probability switch
                {
                    > 0.7f => "High",
                    > 0.4f => "Medium",
                    _ => "Low"
                };

                return Ok(new ChurnPredictionResponse
                {
                    UserId = userId,
                    WillChurn = prediction.WillChurn,
                    ChurnProbability = prediction.Probability,
                    RiskLevel = risk
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting churn for user {UserId}", userId);
                return StatusCode(500, new { message = "Churn prediction failed.", error = ex.Message });
            }
        }

        /// <summary>
        /// Predict whether a campaign will reach its funding goal using its current
        /// progress, target, duration, category, urgency and featured status.
        /// </summary>
        [HttpGet("predict/campaign-success/{campaignId:int}")]
        public async Task<IActionResult> PredictCampaignSuccess(int campaignId)
        {
            try
            {
                var prediction = await _ml.PredictCampaignSuccessAsync(campaignId);

                string recommendation = (prediction.WillSucceed, prediction.Probability) switch
                {
                    (true,  > 0.85f) => "Campaign is strongly on track. Consider raising the target.",
                    (true,  _      ) => "Campaign is likely to succeed. Maintain current engagement.",
                    (false, < 0.3f ) => "Campaign needs urgent action. Enable featured boost or urgency flag.",
                    _                => "Campaign may fall short. Increase outreach and donor engagement."
                };

                return Ok(new CampaignSuccessPredictionResponse
                {
                    CampaignId = campaignId,
                    WillSucceed = prediction.WillSucceed,
                    SuccessProbability = prediction.Probability,
                    Recommendation = recommendation
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error predicting campaign success for {CampaignId}", campaignId);
                return StatusCode(500, new { message = "Prediction failed.", error = ex.Message });
            }
        }

        /// <summary>
        /// Run IID spike detection on the donation amounts of a campaign to surface
        /// anomalous (potentially fraudulent or erroneous) transactions.
        /// Requires at least 10 completed donations for the campaign.
        /// </summary>
        [HttpGet("anomaly/donations/{campaignId:int}")]
        public async Task<IActionResult> DetectDonationAnomalies(int campaignId)
        {
            try
            {
                var results = await _ml.DetectDonationAnomaliesAsync(campaignId);

                if (results.Count == 0)
                    return Ok(new AnomalyDetectionResponse
                    {
                        TotalDonationsAnalyzed = 0,
                        AnomaliesFound = 0,
                        Anomalies = []
                    });

                // Get donation details with donor info
                var donationIds = results.Select(r => r.DonationId).ToList();
                var donationDetails = await _db.Donations
                    .Where(d => donationIds.Contains(d.Id))
                    .Include(d => d.User)
                    .ToDictionaryAsync(d => d.Id);

                // Prediction vector: [0] alert flag, [1] raw score, [2] p-value
                var anomalies = results
                    .Where(r => r.Pred.Prediction.Length > 0 && r.Pred.Prediction[0] == 1.0)
                    .Select(r =>
                    {
                        donationDetails.TryGetValue(r.DonationId, out var donation);
                        var donorName = donation?.DonorName ?? donation?.User?.FirstName ?? "Unknown";
                        var donorEmail = donation?.DonorEmail ?? donation?.User?.Email ?? "N/A";
                        var donorPhone = donation?.User?.Phone;

                        return new DonationAnomaly
                        {
                            DonationId = r.DonationId,
                            DonorName = donorName,
                            DonorEmail = donorEmail,
                            DonorPhone = donorPhone,
                            Amount = r.Amount,
                            AnomalyScore = r.Pred.Prediction.Length > 1 ? (float)r.Pred.Prediction[1] : 0f,
                            IsAnomaly = true,
                            CreatedAt = r.CreatedAt
                        };
                    })
                    .ToList();

                return Ok(new AnomalyDetectionResponse
                {
                    TotalDonationsAnalyzed = results.Count,
                    AnomaliesFound = anomalies.Count,
                    Anomalies = anomalies
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error detecting anomalies for campaign {CampaignId}", campaignId);
                return StatusCode(500, new { message = "Anomaly detection failed.", error = ex.Message });
            }
        }

        /// <summary>
        /// Get recommended volunteers for a campaign based on ML model suitability scoring.
        /// </summary>
        [HttpPost("recommend/volunteers")]
        public async Task<IActionResult> RecommendVolunteersForCampaign([FromBody] VolunteerRecommendationRequest request)
        {
            // Validate request
            if (request == null)
                return BadRequest(new { message = "Request body is required." });

            if (request.CampaignId <= 0)
                return BadRequest(new { message = "Valid CampaignId is required." });

            if (request.TopN < 1 || request.TopN > 50)
                return BadRequest(new { message = "TopN must be between 1 and 50." });

            if (request.MinimumScore < 0 || request.MinimumScore > 1)
                return BadRequest(new { message = "MinimumScore must be between 0 and 1." });

            try
            {
                var recommendations = await _ml.RecommendVolunteersForCampaignAsync(request);

                return Ok(new
                {
                    campaignId = request.CampaignId,
                    totalRecommendations = recommendations.Count,
                    minimumScoreFilter = request.MinimumScore,
                    recommendations = recommendations
                        .Select(r => new
                        {
                            volunteerId = r.VolunteerId,
                            volunteerName = r.VolunteerName,
                            rank = r.Rank,
                            suitabilityScore = Math.Round(r.SuitabilityScore, 2),
                            isRecommended = r.IsRecommended,
                            reason = r.Reason,
                            scoreBreakdown = new
                            {
                                skillsMatch = Math.Round(r.SkillsMatch * 100, 1),
                                interestsMatch = Math.Round(r.InterestsMatch * 100, 1),
                                availabilityMatch = Math.Round(r.AvailabilityMatch * 100, 1),
                                experienceScore = Math.Round(r.ExperienceScore * 100, 1),
                                locationScore = Math.Round(r.LocationScore * 100, 1),
                                ratingScore = Math.Round(r.RatingScore, 2)
                            }
                        })
                        .ToList()
                });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Campaign {CampaignId} not found", request.CampaignId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating volunteer recommendations for campaign {CampaignId}", request.CampaignId);
                return StatusCode(500, new { message = "Volunteer recommendation failed.", error = ex.Message });
            }
        }

        /// <summary>
        /// Get recommended volunteers for a specific campaign by ID.
        /// </summary>
        [HttpGet("recommend/volunteers/{campaignId:int}")]
        public async Task<IActionResult> GetRecommendedVolunteersForCampaign(int campaignId, [FromQuery] int topN = 10, [FromQuery] float minimumScore = 0.5f)
        {
            if (campaignId <= 0)
                return BadRequest(new { message = "Valid CampaignId is required." });

            try
            {
                var request = new VolunteerRecommendationRequest
                {
                    CampaignId = campaignId,
                    TopN = topN,
                    MinimumScore = minimumScore
                };

                var recommendations = await _ml.RecommendVolunteersForCampaignAsync(request);

                return Ok(new
                {
                    campaignId = campaignId,
                    totalRecommendations = recommendations.Count,
                    topN = topN,
                    minimumScoreFilter = minimumScore,
                    recommendations = recommendations
                        .Select(r => new
                        {
                            volunteerId = r.VolunteerId,
                            volunteerName = r.VolunteerName,
                            rank = r.Rank,
                            suitabilityScore = Math.Round(r.SuitabilityScore, 1),
                            isRecommended = r.IsRecommended,
                            reason = r.Reason,
                            scoreBreakdown = new
                            {
                                skillsMatch = Math.Round(r.SkillsMatch * 100, 1),
                                interestsMatch = Math.Round(r.InterestsMatch * 100, 1),
                                availabilityMatch = Math.Round(r.AvailabilityMatch * 100, 1),
                                experienceScore = Math.Round(r.ExperienceScore * 100, 1),
                                locationScore = Math.Round(r.LocationScore * 100, 1),
                                ratingScore = Math.Round(r.RatingScore, 2)
                            }
                        })
                        .ToList()
                });
            }
            catch (KeyNotFoundException ex)
            {
                _logger.LogWarning(ex, "Campaign {CampaignId} not found", campaignId);
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching volunteer recommendations for campaign {CampaignId}", campaignId);
                return StatusCode(500, new { message = "Failed to retrieve recommendations.", error = ex.Message });
            }
        }
    }
}

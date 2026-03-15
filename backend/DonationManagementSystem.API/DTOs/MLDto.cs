namespace DonationManagementSystem.API.DTOs
{
    // ─── Donation Forecasting ─────────────────────────────────────────────────────
    public class DonationForecastResponse
    {
        public List<PeriodForecast> Forecasts { get; set; } = new();
        public string Model { get; set; } = "SSA Time Series Forecasting";
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public class PeriodForecast
    {
        public string Period { get; set; } = string.Empty;
        public float ForecastedAmount { get; set; }
        public float LowerBound { get; set; }
        public float UpperBound { get; set; }
    }

    // ─── Sentiment Analysis ───────────────────────────────────────────────────────
    public class SentimentRequest
    {
        public string Text { get; set; } = string.Empty;
    }

    public class SentimentResponse
    {
        public string Text { get; set; } = string.Empty;
        public string Sentiment { get; set; } = string.Empty;
        public float Confidence { get; set; }
        public float Score { get; set; }
    }

    // ─── Donor Churn Prediction ───────────────────────────────────────────────────
    public class ChurnPredictionResponse
    {
        public int UserId { get; set; }
        public bool WillChurn { get; set; }
        public float ChurnProbability { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
    }

    // ─── Campaign Success Prediction ──────────────────────────────────────────────
    public class CampaignSuccessPredictionResponse
    {
        public int CampaignId { get; set; }
        public bool WillSucceed { get; set; }
        public float SuccessProbability { get; set; }
        public string Recommendation { get; set; } = string.Empty;
    }

    // ─── Anomaly Detection ────────────────────────────────────────────────────────
    public class AnomalyDetectionResponse
    {
        public int TotalDonationsAnalyzed { get; set; }
        public int AnomaliesFound { get; set; }
        public List<DonationAnomaly> Anomalies { get; set; } = new();
    }

    public class DonationAnomaly
    {
        public int DonationId { get; set; }
        public string DonorName { get; set; } = string.Empty;
        public string DonorEmail { get; set; } = string.Empty;
        public string? DonorPhone { get; set; }
        public decimal Amount { get; set; }
        public float AnomalyScore { get; set; }
        public bool IsAnomaly { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // ─── Campaign List for Dropdowns ──────────────────────────────────────────
    public class CampaignOption
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public int DonationCount { get; set; }
    }
}

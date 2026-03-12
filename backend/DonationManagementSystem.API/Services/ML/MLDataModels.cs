using Microsoft.ML.Data;

namespace DonationManagementSystem.API.Services.ML
{
    // ─── Donation Time Series Forecasting ────────────────────────────────────────
    public class DonationTimeSeriesData
    {
        public float Amount { get; set; }
    }

    public class DonationForecastOutput
    {
        public float[] ForecastedAmounts { get; set; } = [];
        public float[] LowerBounds { get; set; } = [];
        public float[] UpperBounds { get; set; } = [];
    }

    // ─── Sentiment Analysis ───────────────────────────────────────────────────────
    public class SentimentData
    {
        public string Text { get; set; } = string.Empty;

        [ColumnName("Label")]
        public bool IsPositive { get; set; }
    }

    public class SentimentPrediction
    {
        [ColumnName("PredictedLabel")]
        public bool IsPositive { get; set; }

        public float Probability { get; set; }
        public float Score { get; set; }
    }

    // ─── Donor Churn Prediction ───────────────────────────────────────────────────
    public class DonorChurnData
    {
        public float DaysSinceLastDonation { get; set; }
        public float TotalDonations { get; set; }
        public float AverageDonationAmount { get; set; }
        public float TotalAmountDonated { get; set; }
        public float DonationFrequencyPerMonth { get; set; }

        [ColumnName("Label")]
        public bool WillChurn { get; set; }
    }

    public class ChurnPrediction
    {
        [ColumnName("PredictedLabel")]
        public bool WillChurn { get; set; }

        public float Probability { get; set; }
        public float Score { get; set; }
    }

    // ─── Campaign Success Prediction ──────────────────────────────────────────────
    public class CampaignSuccessData
    {
        public float TargetAmount { get; set; }
        public float DurationDays { get; set; }
        public float IsUrgent { get; set; }
        public float IsFeatured { get; set; }
        public float CategoryEncoded { get; set; }
        public float CurrentRaisedRatio { get; set; }

        [ColumnName("Label")]
        public bool WillSucceed { get; set; }
    }

    public class CampaignSuccessPrediction
    {
        [ColumnName("PredictedLabel")]
        public bool WillSucceed { get; set; }

        public float Probability { get; set; }
        public float Score { get; set; }
    }

    // ─── Anomaly Detection ────────────────────────────────────────────────────────
    public class DonationAmountData
    {
        public float Amount { get; set; }
    }

    public class AnomalyPrediction
    {
        [VectorType(3)]
        [ColumnName("Prediction")]
        public double[] Prediction { get; set; } = [];
    }
}

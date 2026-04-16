using DonationManagementSystem.API.Services.ML;
using FluentAssertions;

namespace DonationManagementSystem.Tests.Unit.Services;

/// <summary>
/// Tests for ML data model classes — verifies default property values and basic contracts.
/// </summary>
public class MLDataModelsTests
{
    // ─── DonationTimeSeriesData ───────────────────────────────────────────────────

    [Fact]
    public void DonationTimeSeriesData_DefaultAmount_IsZero()
    {
        var model = new DonationTimeSeriesData();
        model.Amount.Should().Be(0f);
    }

    [Fact]
    public void DonationTimeSeriesData_CanSetAmount()
    {
        var model = new DonationTimeSeriesData { Amount = 1500.50f };
        model.Amount.Should().Be(1500.50f);
    }

    // ─── DonationForecastOutput ───────────────────────────────────────────────────

    [Fact]
    public void DonationForecastOutput_DefaultArraysAreEmpty()
    {
        var output = new DonationForecastOutput();
        output.ForecastedAmounts.Should().BeEmpty();
        output.LowerBounds.Should().BeEmpty();
        output.UpperBounds.Should().BeEmpty();
    }

    [Fact]
    public void DonationForecastOutput_CanAssignArrays()
    {
        var output = new DonationForecastOutput
        {
            ForecastedAmounts = [100f, 200f],
            LowerBounds = [80f, 160f],
            UpperBounds = [120f, 240f]
        };

        output.ForecastedAmounts.Should().HaveCount(2);
        output.LowerBounds.Should().HaveCount(2);
        output.UpperBounds.Should().HaveCount(2);
    }

    // ─── SentimentData ────────────────────────────────────────────────────────────

    [Fact]
    public void SentimentData_DefaultTextIsEmpty()
    {
        var data = new SentimentData();
        data.Text.Should().BeEmpty();
    }

    [Fact]
    public void SentimentData_DefaultIsPositiveIsFalse()
    {
        var data = new SentimentData();
        data.IsPositive.Should().BeFalse();
    }

    // ─── SentimentPrediction ──────────────────────────────────────────────────────

    [Fact]
    public void SentimentPrediction_DefaultIsPositiveIsFalse()
    {
        var pred = new SentimentPrediction();
        pred.IsPositive.Should().BeFalse();
    }

    [Fact]
    public void SentimentPrediction_DefaultProbabilityAndScoreAreZero()
    {
        var pred = new SentimentPrediction();
        pred.Probability.Should().Be(0f);
        pred.Score.Should().Be(0f);
    }

    // ─── DonorChurnData ───────────────────────────────────────────────────────────

    [Fact]
    public void DonorChurnData_DefaultValuesAreZero()
    {
        var data = new DonorChurnData();
        data.DaysSinceLastDonation.Should().Be(0f);
        data.TotalDonations.Should().Be(0f);
        data.AverageDonationAmount.Should().Be(0f);
        data.TotalAmountDonated.Should().Be(0f);
        data.DonationFrequencyPerMonth.Should().Be(0f);
        data.WillChurn.Should().BeFalse();
    }

    // ─── ChurnPrediction ──────────────────────────────────────────────────────────

    [Fact]
    public void ChurnPrediction_DefaultWillChurnIsFalse()
    {
        var pred = new ChurnPrediction();
        pred.WillChurn.Should().BeFalse();
    }

    // ─── CampaignSuccessData ──────────────────────────────────────────────────────

    [Fact]
    public void CampaignSuccessData_DefaultValuesAreZero()
    {
        var data = new CampaignSuccessData();
        data.TargetAmount.Should().Be(0f);
        data.DurationDays.Should().Be(0f);
        data.IsUrgent.Should().Be(0f);
        data.IsFeatured.Should().Be(0f);
        data.CategoryEncoded.Should().Be(0f);
        data.CurrentRaisedRatio.Should().Be(0f);
    }

    // ─── CampaignSuccessPrediction ────────────────────────────────────────────────

    [Fact]
    public void CampaignSuccessPrediction_DefaultWillSucceedIsFalse()
    {
        var pred = new CampaignSuccessPrediction();
        pred.WillSucceed.Should().BeFalse();
        pred.Probability.Should().Be(0f);
        pred.Score.Should().Be(0f);
    }

    // ─── DonationAmountData ───────────────────────────────────────────────────────

    [Fact]
    public void DonationAmountData_DefaultAmountIsZero()
    {
        var data = new DonationAmountData();
        data.Amount.Should().Be(0f);
    }

    // ─── AnomalyPrediction ────────────────────────────────────────────────────────

    [Fact]
    public void AnomalyPrediction_DefaultPredictionIsEmpty()
    {
        var pred = new AnomalyPrediction();
        pred.Prediction.Should().BeEmpty();
    }
}

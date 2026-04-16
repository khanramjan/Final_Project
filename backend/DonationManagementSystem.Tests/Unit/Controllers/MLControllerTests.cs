using DonationManagementSystem.API.Controllers;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.DTOs;
using DonationManagementSystem.API.Services.ML;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;

namespace DonationManagementSystem.Tests.Unit.Controllers;

public class MLControllerTests : IDisposable
{
    private readonly AppDbContext _context;
    private readonly Mock<IMLPredictionService> _mlMock;
    private readonly MLController _sut;

    public MLControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new AppDbContext(options);
        _mlMock = new Mock<IMLPredictionService>();
        var logger = NullLogger<MLController>.Instance;
        _sut = new MLController(_mlMock.Object, logger, _context);
    }

    public void Dispose() => _context.Dispose();

    // ─── ForecastDonations ────────────────────────────────────────────────────────

    [Fact]
    public async Task ForecastDonations_WithValidPeriods_Returns200()
    {
        _mlMock.Setup(m => m.ForecastDonationsAsync(It.IsAny<int>()))
            .ReturnsAsync(new DonationForecastOutput
            {
                ForecastedAmounts = [100f, 200f, 300f, 400f],
                LowerBounds = [80f, 160f, 240f, 320f],
                UpperBounds = [120f, 240f, 360f, 480f]
            });

        var result = await _sut.ForecastDonations(4);

        result.Should().BeOfType<OkObjectResult>();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task ForecastDonations_WithPeriodBelow1_Returns400(int periods)
    {
        var result = await _sut.ForecastDonations(periods);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Theory]
    [InlineData(53)]
    [InlineData(100)]
    public async Task ForecastDonations_WithPeriodAbove52_Returns400(int periods)
    {
        var result = await _sut.ForecastDonations(periods);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task ForecastDonations_WithExactly52Periods_Returns200()
    {
        _mlMock.Setup(m => m.ForecastDonationsAsync(52))
            .ReturnsAsync(new DonationForecastOutput
            {
                ForecastedAmounts = new float[52],
                LowerBounds = new float[52],
                UpperBounds = new float[52]
            });

        var result = await _sut.ForecastDonations(52);

        result.Should().BeOfType<OkObjectResult>();
    }

    // ─── AnalyzeSentiment ─────────────────────────────────────────────────────────

    [Fact]
    public async Task AnalyzeSentiment_WithEmptyText_Returns400()
    {
        var result = await _sut.AnalyzeSentiment(new SentimentRequest { Text = "" });

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task AnalyzeSentiment_WithWhiteSpaceText_Returns400()
    {
        var result = await _sut.AnalyzeSentiment(new SentimentRequest { Text = "   " });

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task AnalyzeSentiment_WithHighProbability_ReturnsPositive()
    {
        _mlMock.Setup(m => m.AnalyzeSentimentAsync("Great platform"))
            .ReturnsAsync(new SentimentPrediction { IsPositive = true, Probability = 0.9f, Score = 1.8f });

        var result = await _sut.AnalyzeSentiment(new SentimentRequest { Text = "Great platform" });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        // Dynamic access to anonymous type
        var value = ok.Value!;
        var sentiment = value.GetType().GetProperty("Sentiment")?.GetValue(value)?.ToString();
        sentiment.Should().Be("Positive");
    }

    [Fact]
    public async Task AnalyzeSentiment_WithLowProbability_ReturnsNegative()
    {
        _mlMock.Setup(m => m.AnalyzeSentimentAsync("Terrible service"))
            .ReturnsAsync(new SentimentPrediction { IsPositive = false, Probability = 0.2f, Score = -1.2f });

        var result = await _sut.AnalyzeSentiment(new SentimentRequest { Text = "Terrible service" });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var sentiment = ok.Value!.GetType().GetProperty("Sentiment")?.GetValue(ok.Value)?.ToString();
        sentiment.Should().Be("Negative");
    }

    [Fact]
    public async Task AnalyzeSentiment_WithMidRangeProbability_ReturnsNeutral()
    {
        _mlMock.Setup(m => m.AnalyzeSentimentAsync("It was okay"))
            .ReturnsAsync(new SentimentPrediction { IsPositive = true, Probability = 0.5f, Score = 0.1f });

        var result = await _sut.AnalyzeSentiment(new SentimentRequest { Text = "It was okay" });

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var sentiment = ok.Value!.GetType().GetProperty("Sentiment")?.GetValue(ok.Value)?.ToString();
        sentiment.Should().Be("Neutral");
    }

    // ─── PredictDonorChurn ────────────────────────────────────────────────────────

    [Fact]
    public async Task PredictDonorChurn_WithHighProbability_ReturnsHighRisk()
    {
        _mlMock.Setup(m => m.PredictDonorChurnAsync(1))
            .ReturnsAsync(new ChurnPrediction { WillChurn = true, Probability = 0.85f });

        var result = await _sut.PredictDonorChurn(1);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var riskLevel = ok.Value!.GetType().GetProperty("RiskLevel")?.GetValue(ok.Value)?.ToString();
        riskLevel.Should().Be("High");
    }

    [Fact]
    public async Task PredictDonorChurn_WithMediumProbability_ReturnsMediumRisk()
    {
        _mlMock.Setup(m => m.PredictDonorChurnAsync(2))
            .ReturnsAsync(new ChurnPrediction { WillChurn = true, Probability = 0.55f });

        var result = await _sut.PredictDonorChurn(2);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var riskLevel = ok.Value!.GetType().GetProperty("RiskLevel")?.GetValue(ok.Value)?.ToString();
        riskLevel.Should().Be("Medium");
    }

    [Fact]
    public async Task PredictDonorChurn_WithLowProbability_ReturnsLowRisk()
    {
        _mlMock.Setup(m => m.PredictDonorChurnAsync(3))
            .ReturnsAsync(new ChurnPrediction { WillChurn = false, Probability = 0.2f });

        var result = await _sut.PredictDonorChurn(3);

        var ok = result.Should().BeOfType<OkObjectResult>().Subject;
        var riskLevel = ok.Value!.GetType().GetProperty("RiskLevel")?.GetValue(ok.Value)?.ToString();
        riskLevel.Should().Be("Low");
    }

    // ─── RecommendVolunteers ──────────────────────────────────────────────────────

    [Fact]
    public async Task RecommendVolunteers_WithNullRequest_Returns400()
    {
        var result = await _sut.RecommendVolunteersForCampaign(null!);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task RecommendVolunteers_WithInvalidCampaignId_Returns400()
    {
        var request = new VolunteerRecommendationRequest { CampaignId = 0, TopN = 10, MinimumScore = 0.5f };

        var result = await _sut.RecommendVolunteersForCampaign(request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task RecommendVolunteers_WithTopNBelow1_Returns400()
    {
        var request = new VolunteerRecommendationRequest { CampaignId = 1, TopN = 0, MinimumScore = 0.5f };

        var result = await _sut.RecommendVolunteersForCampaign(request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task RecommendVolunteers_WithTopNAbove50_Returns400()
    {
        var request = new VolunteerRecommendationRequest { CampaignId = 1, TopN = 51, MinimumScore = 0.5f };

        var result = await _sut.RecommendVolunteersForCampaign(request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task RecommendVolunteers_WithMinimumScoreAbove1_Returns400()
    {
        var request = new VolunteerRecommendationRequest { CampaignId = 1, TopN = 10, MinimumScore = 1.5f };

        var result = await _sut.RecommendVolunteersForCampaign(request);

        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task RecommendVolunteers_WithValidRequest_Returns200()
    {
        var request = new VolunteerRecommendationRequest { CampaignId = 1, TopN = 5, MinimumScore = 0.5f };
        _mlMock.Setup(m => m.RecommendVolunteersForCampaignAsync(request))
            .ReturnsAsync([]);

        var result = await _sut.RecommendVolunteersForCampaign(request);

        result.Should().BeOfType<OkObjectResult>();
    }

    // ─── PredictCampaignSuccess ───────────────────────────────────────────────────

    [Fact]
    public async Task PredictCampaignSuccess_WhenNotFound_Returns404()
    {
        _mlMock.Setup(m => m.PredictCampaignSuccessAsync(999))
            .ThrowsAsync(new KeyNotFoundException("Campaign 999 not found."));

        var result = await _sut.PredictCampaignSuccess(999);

        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task PredictCampaignSuccess_WithValidCampaign_Returns200()
    {
        _mlMock.Setup(m => m.PredictCampaignSuccessAsync(1))
            .ReturnsAsync(new CampaignSuccessPrediction { WillSucceed = true, Probability = 0.88f });

        var result = await _sut.PredictCampaignSuccess(1);

        result.Should().BeOfType<OkObjectResult>();
    }
}

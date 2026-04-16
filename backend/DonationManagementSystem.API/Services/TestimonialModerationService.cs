using System.Text.RegularExpressions;
using DonationManagementSystem.API.Services.ML;
using Microsoft.Extensions.Options;

namespace DonationManagementSystem.API.Services;

public class TestimonialModerationOptions
{
    public bool EnableAbusiveModeration { get; set; } = true;
    public bool RequireManualReviewForScamRisk { get; set; } = false;

    public float PositiveProbabilityThreshold { get; set; } = 0.7f;
    public float NegativeProbabilityThreshold { get; set; } = 0.4f;
    public int PositiveRatingThreshold { get; set; } = 4;
    public int NegativeRatingThreshold { get; set; } = 2;

    public List<string> ScamSignals { get; set; } =
    [
        "scam", "fraud", "fake", "stolen", "theft", "phishing",
        "suspicious", "cheat", "con", "money disappeared", "never received", "misused funds"
    ];

    public List<string> AbusiveSignals { get; set; } =
    [
        "idiot", "stupid", "moron", "shut up", "hate you", "worthless",
        "loser", "garbage", "abusive", "harass", "threat", "kill you"
    ];
}

public sealed record TestimonialModerationResult(
    bool IsAbusive,
    bool IsScamRisk,
    string SentimentLabel,
    string RiskLabel,
    bool RequiresManualApproval,
    string? ReasonCode
);

public interface ITestimonialModerationService
{
    TestimonialModerationResult Evaluate(string comment, int rating, SentimentPrediction sentimentPrediction);
}

public sealed class TestimonialModerationService : ITestimonialModerationService
{
    private static readonly Regex MultiSpaceRegex = new(@"\s+", RegexOptions.Compiled);

    private readonly TestimonialModerationOptions _options;
    private readonly Regex[] _abusivePatterns;
    private readonly Regex[] _scamPatterns;

    public TestimonialModerationService(IOptions<TestimonialModerationOptions> options)
    {
        _options = options.Value;
        _abusivePatterns = BuildPhrasePatterns(_options.AbusiveSignals);
        _scamPatterns = BuildPhrasePatterns(_options.ScamSignals);
    }

    public TestimonialModerationResult Evaluate(string comment, int rating, SentimentPrediction sentimentPrediction)
    {
        var normalized = Normalize(comment);
        var isAbusive = _options.EnableAbusiveModeration && MatchesAny(_abusivePatterns, normalized);
        var isScamRisk = MatchesAny(_scamPatterns, normalized);

        var sentimentLabel = MapSentimentLabel(isAbusive, sentimentPrediction, rating);
        var riskLabel = MapRiskLabel(isAbusive, isScamRisk, sentimentLabel);

        var requiresManualApproval =
            isAbusive || (_options.RequireManualReviewForScamRisk && isScamRisk);

        var reasonCode = requiresManualApproval
            ? isAbusive
                ? "abusive-language-detected"
                : "scam-risk-detected"
            : null;

        return new TestimonialModerationResult(
            IsAbusive: isAbusive,
            IsScamRisk: isScamRisk,
            SentimentLabel: sentimentLabel,
            RiskLabel: riskLabel,
            RequiresManualApproval: requiresManualApproval,
            ReasonCode: reasonCode
        );
    }

    private string MapSentimentLabel(bool isAbusive, SentimentPrediction prediction, int rating)
    {
        if (isAbusive) return "abusive";

        if (!prediction.IsPositive ||
            rating <= _options.NegativeRatingThreshold ||
            prediction.Probability < _options.NegativeProbabilityThreshold)
        {
            return "negative";
        }

        if (prediction.Probability >= _options.PositiveProbabilityThreshold &&
            rating >= _options.PositiveRatingThreshold)
        {
            return "positive";
        }

        return "neutral";
    }

    private static string MapRiskLabel(bool isAbusive, bool isScamRisk, string sentimentLabel)
    {
        if (isAbusive) return "abusive";
        if (isScamRisk) return "scam-risk";
        if (sentimentLabel == "negative") return "complaint";
        return "normal";
    }

    private static Regex[] BuildPhrasePatterns(IEnumerable<string> phrases)
    {
        return phrases
            .Select(p => p?.Trim())
            .Where(p => !string.IsNullOrWhiteSpace(p))
            .Select(p => Regex.Escape(p!).Replace("\\ ", "\\s+"))
            .Select(pattern => new Regex(@$"\b{pattern}\b", RegexOptions.Compiled | RegexOptions.CultureInvariant))
            .ToArray();
    }

    private static bool MatchesAny(IEnumerable<Regex> patterns, string text)
    {
        foreach (var pattern in patterns)
        {
            if (pattern.IsMatch(text))
            {
                return true;
            }
        }

        return false;
    }

    private static string Normalize(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var normalizedChars = input
            .ToLowerInvariant()
            .Select(ch => char.IsLetterOrDigit(ch) || char.IsWhiteSpace(ch) ? ch : ' ')
            .ToArray();

        return MultiSpaceRegex.Replace(new string(normalizedChars), " ").Trim();
    }
}

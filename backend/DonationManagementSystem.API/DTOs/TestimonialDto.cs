namespace DonationManagementSystem.API.DTOs
{
    // For submitting a new testimonial (Name and Email automatically captured from authenticated user)
    public class CreateTestimonialDto
    {
        public string Position { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public int Rating { get; set; } // 1-5
        public string Comment { get; set; } = string.Empty;
        public string? BadgeType { get; set; }
    }

    // For returning testimonial data
    public class TestimonialDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public string Organization { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public int Rating { get; set; }
        public string Comment { get; set; } = string.Empty;
        public string? BadgeType { get; set; }
        public string SentimentLabel { get; set; } = "neutral";
        public float SentimentScore { get; set; }
        public float SentimentConfidence { get; set; }
        public string RiskLabel { get; set; } = "normal";
        public bool IsScamRisk { get; set; }
        public DateTime? AnalyzedAt { get; set; }
        public bool IsApproved { get; set; }
        public bool IsFeatured { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // For admin to approve/manage testimonials
    public class UpdateTestimonialDto
    {
        public bool? IsApproved { get; set; }
        public bool? IsFeatured { get; set; }
        public bool? IsActive { get; set; }
    }

    // For listing testimonials with pagination
    public class TestimonialListDto
    {
        public List<TestimonialDto> Testimonials { get; set; } = new();
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int CurrentPage { get; set; }
    }

    public class TestimonialSentimentStatsDto
    {
        public int Total { get; set; }
        public int Positive { get; set; }
        public int Neutral { get; set; }
        public int Negative { get; set; }
        public int ScamRisk { get; set; }
        public double AverageSentimentScore { get; set; }
    }
}

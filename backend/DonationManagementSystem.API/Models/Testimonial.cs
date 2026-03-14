namespace DonationManagementSystem.API.Models
{
    public class Testimonial
    {
        public int Id { get; set; }
        
        // Author information
        public string Name { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty; // e.g., "Executive Director"
        public string Organization { get; set; } = string.Empty; // e.g., "Community Health Foundation"
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        
        // Review content
        public int Rating { get; set; } // 1-5 stars
        public string Comment { get; set; } = string.Empty;

        // ML/heuristic analysis
        public string SentimentLabel { get; set; } = "neutral"; // positive | neutral | negative
        public float SentimentScore { get; set; } = 0.5f; // 0.0-1.0
        public float SentimentConfidence { get; set; } = 0.5f; // 0.0-1.0
        public string RiskLabel { get; set; } = "normal"; // normal | complaint | scam-risk
        public bool IsScamRisk { get; set; } = false;
        public DateTime? AnalyzedAt { get; set; }
        
        // Badges
        public string? BadgeType { get; set; } // "Beta tester", "Early adopter", "Beta participant"
        
        // Status
        public bool IsApproved { get; set; } = false; // Admin approval required
        public bool IsFeatured { get; set; } = false; // Featured on landing page
        public bool IsActive { get; set; } = true;
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ApprovedAt { get; set; }
        public int? ApprovedByUserId { get; set; }
        public User? ApprovedBy { get; set; }
        
        // Optional: Link to user account if they're registered
        public int? UserId { get; set; }
        public User? User { get; set; }
    }
}

namespace DonationManagementSystem.API.Models
{
    public class Campaign
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImagePath { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal RaisedAmount { get; set; } = 0;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = "pending"; // pending, approved, active, completed, cancelled
        public string Category { get; set; } = string.Empty; // education, health, disaster, etc.
        public string? Location { get; set; }
        public bool IsUrgent { get; set; } = false;
        public bool IsFeatured { get; set; } = false;
        public int CreatedBy { get; set; } // User ID who created the campaign
        public int? ApprovedBy { get; set; } // Admin ID who approved
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ApprovedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string? RejectionReason { get; set; }

        // Navigation properties
        public User Creator { get; set; } = null!;
        public User? Approver { get; set; }
        public List<Donation> Donations { get; set; } = new();
        public List<CampaignUpdate> Updates { get; set; } = new();
    }

    public class Donation
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string? DonorName { get; set; } // For anonymous donations
        public string? DonorEmail { get; set; }
        public string? Message { get; set; }
        public bool IsAnonymous { get; set; } = false;
        public string PaymentMethod { get; set; } = string.Empty; // card, bank, mobile, etc.
        public string PaymentReference { get; set; } = string.Empty;
        public string Status { get; set; } = "pending"; // pending, completed, failed, refunded
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? CompletedAt { get; set; }

        // Foreign keys
        public int CampaignId { get; set; }
        public int? UserId { get; set; } // Null for guest donations

        // Navigation properties
        public Campaign Campaign { get; set; } = null!;
        public User? User { get; set; }
    }

    public class CampaignUpdate
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ImagePath { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign keys
        public int CampaignId { get; set; }
        public int CreatedBy { get; set; }

        // Navigation properties
        public Campaign Campaign { get; set; } = null!;
        public User Creator { get; set; } = null!;
    }

    public class SystemSettings
    {
        public int Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = "General";
        public string DataType { get; set; } = "string"; // string, number, boolean, json
        public bool IsPublic { get; set; } = false;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public int UpdatedBy { get; set; }

        // Navigation property
        public User UpdatedByUser { get; set; } = null!;
    }

    public class AuditLog
    {
        public int Id { get; set; }
        public string Action { get; set; } = string.Empty;
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string? OldValues { get; set; }
        public string? NewValues { get; set; }
        public string? IpAddress { get; set; }
        public string? UserAgent { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        public int? UserId { get; set; }

        // Navigation property
        public User? User { get; set; }
    }
}
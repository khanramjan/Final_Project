namespace DonationManagementSystem.API.DTOs
{
    // ===== VOLUNTEER REPORT DTOs =====

    public class VolunteerReportDto
    {
        public int Id { get; set; }
        
        // Reporter & Reported
        public int ReportedByVolunteerId { get; set; }
        public string? ReportedByVolunteerName { get; set; }
        public int ReportedVolunteerId { get; set; }
        public string? ReportedVolunteerName { get; set; }
        public string? ReportedVolunteerRank { get; set; }
        
        // Report Details
        public string ReportType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string>? ProofUrls { get; set; }
        
        // Related Campaign/Assignment
        public int? CampaignId { get; set; }
        public string? CampaignTitle { get; set; }
        public int? VolunteerAssignmentId { get; set; }
        public string? AssignmentTitle { get; set; }
        
        // Severity & Status
        public string Severity { get; set; } = "medium";
        public string Status { get; set; } = "pending";
        
        // Admin Review
        public int? ReviewedBy { get; set; }
        public string? ReviewedByName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? AdminNotes { get; set; }
        public string? AdminAction { get; set; }
        
        // Downgrade Details
        public string? PreviousRank { get; set; }
        public string? NewRank { get; set; }
        public string? DowngradeReason { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateVolunteerReportDto
    {
        public int ReportedVolunteerId { get; set; } // ID of volunteer being reported
        
        public string ReportType { get; set; } = string.Empty; // "misconduct", "no_show", "poor_performance", etc.
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public List<string>? ProofUrls { get; set; } // URLs of uploaded proof files
        
        public int? CampaignId { get; set; }
        public int? VolunteerAssignmentId { get; set; }
        
        public string Severity { get; set; } = "medium"; // low, medium, high, critical
    }

    public class ReviewVolunteerReportDto
    {
        public string Action { get; set; } = string.Empty; // "warn", "downgrade", "suspend", "no_action", "reject_report"
        public string AdminNotes { get; set; } = string.Empty;
        
        // For Downgrade Action
        public string? NewRank { get; set; } // Required if action is "downgrade"
        public string? DowngradeReason { get; set; }
        
        // For Warning Action
        public string? WarningType { get; set; } // Required if action is "warn"
        public string? WarningDescription { get; set; }
    }

    // ===== VOLUNTEER WARNING DTOs =====

    public class VolunteerWarningDto
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        public string? VolunteerName { get; set; }
        public int? VolunteerReportId { get; set; }
        
        public string WarningType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "medium";
        
        public int IssuedBy { get; set; }
        public string? IssuedByName { get; set; }
        public DateTime IssuedAt { get; set; }
        
        public bool IsAcknowledged { get; set; }
        public DateTime? AcknowledgedAt { get; set; }
        
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateWarningDto
    {
        public int VolunteerProfileId { get; set; }
        public string WarningType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "medium";
        public DateTime? ExpiresAt { get; set; }
    }

    public class AcknowledgeWarningDto
    {
        public int WarningId { get; set; }
    }

    // ===== BADGE DOWNGRADE DTO =====

    public class DowngradeBadgeDto
    {
        public int VolunteerProfileId { get; set; }
        public string NewRank { get; set; } = string.Empty; // "Newbie", "Bronze", "Silver", "Gold", "Platinum"
        public string Reason { get; set; } = string.Empty;
        public int? RelatedReportId { get; set; } // Optional: Link to report if downgrade is from a report
    }
}

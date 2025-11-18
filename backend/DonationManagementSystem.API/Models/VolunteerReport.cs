namespace DonationManagementSystem.API.Models
{
    /// <summary>
    /// Volunteer report submitted by another volunteer to admin
    /// </summary>
    public class VolunteerReport
    {
        public int Id { get; set; }
        
        // Reporter & Reported
        public int ReportedByVolunteerId { get; set; } // Volunteer who submitted the report
        public int ReportedVolunteerId { get; set; } // Volunteer being reported
        
        // Report Details
        public string ReportType { get; set; } = string.Empty; // "misconduct", "no_show", "poor_performance", "inappropriate_behavior", "other"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ProofUrls { get; set; } // JSON array of proof images/documents
        
        // Related Campaign/Assignment (if applicable)
        public int? CampaignId { get; set; }
        public int? VolunteerAssignmentId { get; set; }
        
        // Severity
        public string Severity { get; set; } = "medium"; // low, medium, high, critical
        
        // Admin Action
        public string Status { get; set; } = "pending"; // pending, under_review, resolved, rejected
        public int? ReviewedBy { get; set; } // Admin ID who reviewed
        public DateTime? ReviewedAt { get; set; }
        public string? AdminNotes { get; set; }
        public string? AdminAction { get; set; } // "warned", "downgraded", "suspended", "no_action", "rejected"
        
        // Downgrade Details (if action was downgrade)
        public string? PreviousRank { get; set; }
        public string? NewRank { get; set; }
        public string? DowngradeReason { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public VolunteerProfile ReportedByVolunteer { get; set; } = null!;
        public VolunteerProfile ReportedVolunteer { get; set; } = null!;
        public Campaign? Campaign { get; set; }
        public VolunteerAssignment? VolunteerAssignment { get; set; }
        public User? Reviewer { get; set; }
    }

    /// <summary>
    /// Warning issued to volunteers by admin
    /// </summary>
    public class VolunteerWarning
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        public int? VolunteerReportId { get; set; } // Link to report if warning is from a report
        
        // Warning Details
        public string WarningType { get; set; } = string.Empty; // "behavioral", "performance", "attendance", "policy_violation"
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Severity { get; set; } = "medium"; // low, medium, high
        
        // Issued By
        public int IssuedBy { get; set; } // Admin ID
        public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
        
        // Acknowledgment
        public bool IsAcknowledged { get; set; } = false;
        public DateTime? AcknowledgedAt { get; set; }
        
        // Expiry (warnings may expire after a certain time)
        public DateTime? ExpiresAt { get; set; }
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public VolunteerProfile VolunteerProfile { get; set; } = null!;
        public VolunteerReport? VolunteerReport { get; set; }
        public User IssuedByUser { get; set; } = null!;
    }
}

namespace DonationManagementSystem.API.Models
{
    /// <summary>
    /// Extended volunteer profile with skills, availability, and experience
    /// </summary>
    public class VolunteerProfile
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        
        // Skills & Expertise
        public string? Skills { get; set; } // JSON array: ["First Aid", "Logistics", "Teaching"]
        public string? Interests { get; set; } // JSON array: ["Health", "Education", "Disaster Relief"]
        public string? ExperienceLevel { get; set; } // beginner, intermediate, advanced, expert
        public int YearsOfExperience { get; set; } = 0;
        public string? Certifications { get; set; } // JSON array of certification objects
        
        // Availability
        public string? AvailableDays { get; set; } // JSON array: ["Monday", "Wednesday", "Friday"]
        public string? PreferredTimeSlots { get; set; } // JSON: {"morning": true, "afternoon": false, "evening": true}
        public int HoursPerWeek { get; set; } = 0;
        
        // Location & Contact
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        
        // Statistics
        public int TotalHoursVolunteered { get; set; } = 0;
        public int TotalTasksCompleted { get; set; } = 0;
        public int TotalCampaignsSupported { get; set; } = 0;
        public decimal Rating { get; set; } = 0; // Average rating from admins
        public int TotalRatings { get; set; } = 0;
        
        // Rank System
        public string Rank { get; set; } = "Newbie"; // Newbie, Bronze, Silver, Gold, Platinum
        public int CompletedCampaigns { get; set; } = 0; // Tracks campaigns completed for rank upgrade
        public DateTime? LastRankUpgradeAt { get; set; }
        
        // Status
        public string Status { get; set; } = "pending"; // pending, active, inactive, suspended
        public bool IsVerified { get; set; } = false;
        public DateTime? VerifiedAt { get; set; }
        public int? VerifiedBy { get; set; } // Admin ID
        
        // Admin Approval System
        public bool IsApprovedByAdmin { get; set; } = false;
        public string AdminApprovalStatus { get; set; } = "pending"; // pending, approved, rejected
        public int? ApprovedBy { get; set; } // Admin ID who approved/rejected
        public DateTime? ApprovedAt { get; set; }
        public string? ApprovalNotes { get; set; } // Admin's notes/reason for approval/rejection
        
        // Preferences
        public bool AcceptSmsNotifications { get; set; } = true;
        public bool AcceptEmailNotifications { get; set; } = true;
        public bool IsProfilePublic { get; set; } = false;
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? LastActivityAt { get; set; }
        
        // Navigation properties
        public User User { get; set; } = null!;
        public User? Verifier { get; set; }
        public User? Approver { get; set; } // Admin who approved the volunteer
        public List<VolunteerRequest> Requests { get; set; } = new();
        public List<VolunteerAssignment> Assignments { get; set; } = new();
        public List<VolunteerActivity> Activities { get; set; } = new();
        public List<VolunteerAchievement> Achievements { get; set; } = new();
        public List<VolunteerRankHistory> RankHistory { get; set; } = new();
    }

    /// <summary>
    /// Volunteer request sent by admin to specific volunteer
    /// </summary>
    public class VolunteerRequest
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        public int CampaignId { get; set; }
        public int RequestedBy { get; set; } // Admin ID
        
        // Request Details
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty; // distribution, logistics, event_management, etc.
        public string Priority { get; set; } = "medium"; // low, medium, high, urgent
        
        // Scheduling
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int EstimatedHours { get; set; }
        public string? MeetingPoint { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        // Requirements
        public string? RequiredSkills { get; set; } // JSON array
        public string? RequiredEquipment { get; set; } // JSON array
        public int? TeamSize { get; set; }
        
        // Status & Response
        public string Status { get; set; } = "pending"; // pending, accepted, declined, expired, cancelled
        public DateTime? RespondedAt { get; set; }
        public string? DeclineReason { get; set; }
        public string? AdminNotes { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        
        // Navigation properties
        public VolunteerProfile VolunteerProfile { get; set; } = null!;
        public Campaign Campaign { get; set; } = null!;
        public User RequestedByUser { get; set; } = null!;
        public VolunteerAssignment? Assignment { get; set; } // Created when request is accepted
    }

    /// <summary>
    /// Active volunteer assignment (accepted request)
    /// </summary>
    public class VolunteerAssignment
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        public int CampaignId { get; set; }
        public int? VolunteerRequestId { get; set; } // Reference to original request
        
        // Assignment Details
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public string Status { get; set; } = "assigned"; // assigned, in_progress, completed, cancelled
        
        // Scheduling
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int EstimatedHours { get; set; }
        public int ActualHours { get; set; } = 0;
        
        // Location & Check-in
        public string? MeetingPoint { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public DateTime? CheckInTime { get; set; }
        public string? CheckInLocation { get; set; }
        public double? CheckInLatitude { get; set; }
        public double? CheckInLongitude { get; set; }
        public DateTime? CheckOutTime { get; set; }
        public string? CheckOutLocation { get; set; }
        public double? CheckOutLatitude { get; set; }
        public double? CheckOutLongitude { get; set; }
        
        // Progress
        public int ProgressPercentage { get; set; } = 0;
        public string? ProgressNotes { get; set; }
        
        // Completion & Review
        public DateTime? CompletedAt { get; set; }
        public string? CompletionNotes { get; set; }
        public string? CompletionEvidence { get; set; } // JSON array of photo URLs
        public decimal? Rating { get; set; } // Admin rating (1-5)
        public string? Feedback { get; set; } // Admin feedback
        public int? VerifiedBy { get; set; } // Admin ID who verified
        public DateTime? VerifiedAt { get; set; }
        public int? RatedBy { get; set; } // Admin ID (kept for backward compatibility)
        public DateTime? RatedAt { get; set; }
        
        // Certificate
        public bool CertificateIssued { get; set; } = false;
        public string? CertificatePath { get; set; }
        public DateTime? CertificateIssuedAt { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
        
        // Navigation properties
        public VolunteerProfile VolunteerProfile { get; set; } = null!;
        public Campaign Campaign { get; set; } = null!;
        public VolunteerRequest? VolunteerRequest { get; set; }
        public User? Rater { get; set; }
        public List<VolunteerActivity> Activities { get; set; } = new();
    }

    /// <summary>
    /// Activity log for volunteer actions (audit trail)
    /// </summary>
    public class VolunteerActivity
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        public int? VolunteerAssignmentId { get; set; }
        public int? CampaignId { get; set; }
        
        // Activity Details
        public string ActivityType { get; set; } = string.Empty; // request_received, request_accepted, request_declined, checked_in, checked_out, task_completed, etc.
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? Metadata { get; set; } // JSON for additional data
        
        // Location (if applicable)
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public VolunteerProfile VolunteerProfile { get; set; } = null!;
        public VolunteerAssignment? VolunteerAssignment { get; set; }
        public Campaign? Campaign { get; set; }
    }

    /// <summary>
    /// Volunteer achievements and badges (gamification)
    /// </summary>
    public class VolunteerAchievement
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        
        // Achievement Details
        public string AchievementType { get; set; } = string.Empty; // first_task, 10_hours, 5_campaigns, excellent_rating, etc.
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string BadgeIcon { get; set; } = string.Empty; // Icon name or path
        public string BadgeColor { get; set; } = "#3b82f6"; // Hex color
        
        // Progress (for progressive achievements)
        public int CurrentProgress { get; set; } = 0;
        public int RequiredProgress { get; set; } = 1;
        public bool IsUnlocked { get; set; } = false;
        public DateTime? UnlockedAt { get; set; }
        
        // Reward
        public int? Points { get; set; } // Gamification points
        public string? RewardDescription { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        public VolunteerProfile VolunteerProfile { get; set; } = null!;
    }

    /// <summary>
    /// Tracks volunteer rank history and upgrades
    /// </summary>
    public class VolunteerRankHistory
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        
        // Rank Change
        public string PreviousRank { get; set; } = string.Empty;
        public string NewRank { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty; // "Completed 5 campaigns", "Admin promotion", etc.
        public int CampaignsCompletedAtUpgrade { get; set; }
        
        // Metadata
        public DateTime UpgradedAt { get; set; } = DateTime.UtcNow;
        public int? UpgradedBy { get; set; } // Admin ID if manual upgrade
        
        // Navigation property
        public VolunteerProfile VolunteerProfile { get; set; } = null!;
        public User? UpgradedByUser { get; set; }
    }
}

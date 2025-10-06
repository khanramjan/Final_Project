namespace DonationManagementSystem.API.DTOs
{
    // ===== VOLUNTEER PROFILE DTOs =====

    public class VolunteerProfileDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        
        // Skills & Expertise
        public List<string>? Skills { get; set; }
        public List<string>? Interests { get; set; }
        public string? ExperienceLevel { get; set; }
        public int YearsOfExperience { get; set; }
        public List<CertificationDto>? Certifications { get; set; }
        
        // Availability
        public List<string>? AvailableDays { get; set; }
        public TimeSlotPreferences? PreferredTimeSlots { get; set; }
        public int HoursPerWeek { get; set; }
        
        // Location
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        
        // Statistics
        public int TotalHoursVolunteered { get; set; }
        public int TotalTasksCompleted { get; set; }
        public int TotalCampaignsSupported { get; set; }
        public decimal Rating { get; set; }
        public int TotalRatings { get; set; }
        
        // Rank System
        public string Rank { get; set; } = "Newbie";
        public int CompletedCampaigns { get; set; }
        public DateTime? LastRankUpgradeAt { get; set; }
        
        // Status
        public string Status { get; set; } = "pending";
        public bool IsVerified { get; set; }
        public DateTime? VerifiedAt { get; set; }
        
        // Preferences
        public bool AcceptSmsNotifications { get; set; }
        public bool AcceptEmailNotifications { get; set; }
        public bool IsProfilePublic { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? LastActivityAt { get; set; }
    }

    public class CreateVolunteerProfileDto
    {
        // Skills & Expertise
        public List<string>? Skills { get; set; }
        public List<string>? Interests { get; set; }
        public string? ExperienceLevel { get; set; }
        public int YearsOfExperience { get; set; }
        public List<CertificationDto>? Certifications { get; set; }
        
        // Availability
        public List<string>? AvailableDays { get; set; }
        public TimeSlotPreferences? PreferredTimeSlots { get; set; }
        public int HoursPerWeek { get; set; }
        
        // Location
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        
        // Preferences
        public bool AcceptSmsNotifications { get; set; } = true;
        public bool AcceptEmailNotifications { get; set; } = true;
        public bool IsProfilePublic { get; set; } = false;
    }

    public class UpdateVolunteerProfileDto
    {
        public List<string>? Skills { get; set; }
        public List<string>? Interests { get; set; }
        public string? ExperienceLevel { get; set; }
        public int? YearsOfExperience { get; set; }
        public List<CertificationDto>? Certifications { get; set; }
        public List<string>? AvailableDays { get; set; }
        public TimeSlotPreferences? PreferredTimeSlots { get; set; }
        public int? HoursPerWeek { get; set; }
        public string? Location { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? EmergencyContactName { get; set; }
        public string? EmergencyContactPhone { get; set; }
        public bool? AcceptSmsNotifications { get; set; }
        public bool? AcceptEmailNotifications { get; set; }
        public bool? IsProfilePublic { get; set; }
    }

    // ===== VOLUNTEER REQUEST DTOs =====

    public class VolunteerRequestDto
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        public string? VolunteerName { get; set; }
        public int CampaignId { get; set; }
        public string? CampaignTitle { get; set; }
        public int RequestedBy { get; set; }
        public string? RequestedByName { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public string Priority { get; set; } = "medium";
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int EstimatedHours { get; set; }
        public string? MeetingPoint { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        public List<string>? RequiredSkills { get; set; }
        public List<string>? RequiredEquipment { get; set; }
        public int? TeamSize { get; set; }
        
        public string Status { get; set; } = "pending";
        public DateTime? RespondedAt { get; set; }
        public string? DeclineReason { get; set; }
        public string? AdminNotes { get; set; }
        
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class CreateVolunteerRequestDto
    {
        public int VolunteerProfileId { get; set; }
        public int CampaignId { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public string Priority { get; set; } = "medium";
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int EstimatedHours { get; set; }
        public string? MeetingPoint { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        public List<string>? RequiredSkills { get; set; }
        public List<string>? RequiredEquipment { get; set; }
        public int? TeamSize { get; set; }
        public string? AdminNotes { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }

    public class AcceptRequestDto
    {
        public int RequestId { get; set; }
        public string? AcceptanceMessage { get; set; }
    }

    public class DeclineRequestDto
    {
        public int RequestId { get; set; }
        public string DeclineReason { get; set; } = string.Empty;
    }

    // ===== VOLUNTEER ASSIGNMENT DTOs =====

    public class VolunteerAssignmentDto
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        public string? VolunteerName { get; set; }
        public int CampaignId { get; set; }
        public string? CampaignTitle { get; set; }
        public int? VolunteerRequestId { get; set; }
        
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TaskType { get; set; } = string.Empty;
        public string Status { get; set; } = "assigned";
        
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int EstimatedHours { get; set; }
        public int ActualHours { get; set; }
        
        public string? MeetingPoint { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        public CheckInInfoDto? CheckInInfo { get; set; }
        public CheckOutInfoDto? CheckOutInfo { get; set; }
        
        public int ProgressPercentage { get; set; }
        public string? ProgressNotes { get; set; }
        
        public DateTime? CompletedAt { get; set; }
        public string? CompletionNotes { get; set; }
        public decimal? Rating { get; set; }
        public string? Feedback { get; set; }
        
        public bool CertificateIssued { get; set; }
        public string? CertificatePath { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }

    public class CheckInDto
    {
        public int AssignmentId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Location { get; set; }
        public string? Notes { get; set; }
    }

    public class CheckOutDto
    {
        public int AssignmentId { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Location { get; set; }
        public string? CompletionNotes { get; set; }
    }

    public class UpdateProgressDto
    {
        public int AssignmentId { get; set; }
        public int ProgressPercentage { get; set; }
        public string? ProgressNotes { get; set; }
    }

    public class RateVolunteerDto
    {
        public int AssignmentId { get; set; }
        public decimal Rating { get; set; } // 1-5
        public string? Feedback { get; set; }
    }

    // ===== VOLUNTEER ACTIVITY DTOs =====

    public class VolunteerActivityDto
    {
        public int Id { get; set; }
        public int VolunteerProfileId { get; set; }
        public int? VolunteerAssignmentId { get; set; }
        public int? CampaignId { get; set; }
        public string? CampaignTitle { get; set; }
        
        public string ActivityType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        
        public DateTime CreatedAt { get; set; }
    }

    // ===== VOLUNTEER ACHIEVEMENT DTOs =====

    public class VolunteerAchievementDto
    {
        public int Id { get; set; }
        public string AchievementType { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string BadgeIcon { get; set; } = string.Empty;
        public string BadgeColor { get; set; } = "#3b82f6";
        
        public int CurrentProgress { get; set; }
        public int RequiredProgress { get; set; }
        public bool IsUnlocked { get; set; }
        public DateTime? UnlockedAt { get; set; }
        
        public int? Points { get; set; }
        public string? RewardDescription { get; set; }
    }

    // ===== DASHBOARD & STATISTICS DTOs =====

    public class VolunteerDashboardDto
    {
        public VolunteerProfileDto? Profile { get; set; }
        public VolunteerStatsDto Stats { get; set; } = new();
        public List<VolunteerRequestDto> PendingRequests { get; set; } = new();
        public List<VolunteerAssignmentDto> ActiveAssignments { get; set; } = new();
        public List<VolunteerAssignmentDto> UpcomingTasks { get; set; } = new();
        public List<VolunteerAchievementDto> RecentAchievements { get; set; } = new();
    }

    public class VolunteerStatsDto
    {
        public int TotalHoursVolunteered { get; set; }
        public int TotalTasksCompleted { get; set; }
        public int TotalCampaignsSupported { get; set; }
        public int ActiveAssignments { get; set; }
        public int PendingRequests { get; set; }
        public decimal AverageRating { get; set; }
        public int TotalRatings { get; set; }
        public int AchievementsUnlocked { get; set; }
        public int TotalPoints { get; set; }
        public DateTime? LastActivityAt { get; set; }
    }

    public class VolunteerHistoryDto
    {
        public List<VolunteerAssignmentDto> CompletedAssignments { get; set; } = new();
        public List<VolunteerActivityDto> RecentActivities { get; set; } = new();
        public VolunteerStatsDto Stats { get; set; } = new();
    }

    // ===== HELPER DTOs =====

    public class CertificationDto
    {
        public string Name { get; set; } = string.Empty;
        public string IssuedBy { get; set; } = string.Empty;
        public DateTime? IssuedDate { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? CertificateNumber { get; set; }
    }

    public class TimeSlotPreferences
    {
        public bool Morning { get; set; }
        public bool Afternoon { get; set; }
        public bool Evening { get; set; }
    }

    public class CheckInInfoDto
    {
        public DateTime? CheckInTime { get; set; }
        public string? CheckInLocation { get; set; }
        public double? CheckInLatitude { get; set; }
        public double? CheckInLongitude { get; set; }
    }

    public class CheckOutInfoDto
    {
        public DateTime? CheckOutTime { get; set; }
        public string? CheckOutLocation { get; set; }
        public double? CheckOutLatitude { get; set; }
        public double? CheckOutLongitude { get; set; }
    }

    // ===== ADMIN VOLUNTEER MANAGEMENT DTOs =====

    public class AdminVolunteerListDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string? UserName { get; set; }
        public string? UserEmail { get; set; }
        public string? Phone { get; set; }
        public string Status { get; set; } = "pending";
        public bool IsVerified { get; set; }
        public int TotalHoursVolunteered { get; set; }
        public int TotalTasksCompleted { get; set; }
        public decimal Rating { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? LastActivityAt { get; set; }
    }

    public class VerifyVolunteerDto
    {
        public int VolunteerProfileId { get; set; }
        public bool Approved { get; set; }
        public string? Notes { get; set; }
    }
}

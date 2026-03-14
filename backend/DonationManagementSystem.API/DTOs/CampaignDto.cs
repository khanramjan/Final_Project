namespace DonationManagementSystem.API.DTOs
{
    public class CampaignDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? ImagePath { get; set; }
        public decimal TargetAmount { get; set; }
        public decimal RaisedAmount { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Location { get; set; }
        public bool IsUrgent { get; set; }
        public bool IsFeatured { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public string? ApproverName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; }
        public int DonationCount { get; set; }
        public decimal ProgressPercentage { get; set; }
        public int DaysRemaining { get; set; }
    }

    public class CreateCampaignDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal TargetAmount { get; set; }
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string? Location { get; set; }
        public bool IsUrgent { get; set; } = false;
        public bool IsFeatured { get; set; } = false;
        public IFormFile? Image { get; set; }
        
        // Volunteer request fields
        public bool NeedsVolunteers { get; set; } = false;
        public int PlatinumVolunteersNeeded { get; set; } = 0;
        public int GoldVolunteersNeeded { get; set; } = 0;
        public int SilverVolunteersNeeded { get; set; } = 0;
        public int BronzeVolunteersNeeded { get; set; } = 0;
        public int NewbieVolunteersNeeded { get; set; } = 0;
        public bool AutoSendVolunteerRequests { get; set; } = false;
    }

    public class UpdateCampaignDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public decimal? TargetAmount { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public string? Category { get; set; }
        public string? Location { get; set; }
        public bool? IsUrgent { get; set; }
        public bool? IsFeatured { get; set; }
        public IFormFile? Image { get; set; }
        
        // Volunteer request fields
        public bool? NeedsVolunteers { get; set; }
        public int? PlatinumVolunteersNeeded { get; set; }
        public int? GoldVolunteersNeeded { get; set; }
        public int? SilverVolunteersNeeded { get; set; }
        public int? BronzeVolunteersNeeded { get; set; }
        public int? NewbieVolunteersNeeded { get; set; }
        public bool? AutoSendVolunteerRequests { get; set; }
    }

    public class ApproveCampaignDto
    {
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; }
    }

    public class CampaignApprovalDto
    {
        public bool IsApproved { get; set; }
        public string? RejectionReason { get; set; }
        public bool? IsFeatured { get; set; }
    }

    public class CampaignStatsDto
    {
        public int TotalCampaigns { get; set; }
        public int ActiveCampaigns { get; set; }
        public int PendingCampaigns { get; set; }
        public int CompletedCampaigns { get; set; }
        public decimal TotalTargetAmount { get; set; }
        public decimal TotalRaisedAmount { get; set; }
        public decimal AverageSuccess { get; set; }
        public List<CategoryStatsDto> CategoryStats { get; set; } = new();
    }

    public class CategoryStatsDto
    {
        public string Category { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
    }

    public class DonationDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string DonorName { get; set; } = string.Empty;
        public string? Message { get; set; }
        public bool IsAnonymous { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class CreateDonationDto
    {
        public decimal Amount { get; set; }
        public int CampaignId { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public bool IsAnonymous { get; set; } = false;
        public string? DonorMessage { get; set; }
    }

    public class CampaignsPagedResultDto
    {
        public List<CampaignDto> Campaigns { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class DonationsPagedResultDto
    {
        public List<DonationDto> Donations { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages { get; set; }
    }

    public class CampaignUpdateDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? ImagePath { get; set; }
        public DateTime CreatedAt { get; set; }
        public string CreatorName { get; set; } = string.Empty;
    }

    public class CreateCampaignCommentDto
    {
        public string Comment { get; set; } = string.Empty;
        public string? FeelingTag { get; set; }
    }

    public class CampaignCommentDto
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserType { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public string? FeelingTag { get; set; }
        public string SentimentLabel { get; set; } = string.Empty;
        public float SentimentScore { get; set; }
        public float Confidence { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CampaignCommentSentimentSummaryDto
    {
        public int TotalComments { get; set; }
        public int PositiveCount { get; set; }
        public int NeutralCount { get; set; }
        public int NegativeCount { get; set; }
        public double PositivePercent { get; set; }
        public double NeutralPercent { get; set; }
        public double NegativePercent { get; set; }
        public double SentimentIndex { get; set; }
        public string DominantFeeling { get; set; } = "none";
        public List<string> TopKeywords { get; set; } = new();
        public string Recommendation { get; set; } = string.Empty;
    }

    public class CampaignCommentsResponseDto
    {
        public List<CampaignCommentDto> Comments { get; set; } = new();
        public CampaignCommentSentimentSummaryDto Summary { get; set; } = new();
    }

    public class AdminCampaignSentimentItemDto
    {
        public int CampaignId { get; set; }
        public string CampaignTitle { get; set; } = string.Empty;
        public string CampaignStatus { get; set; } = string.Empty;
        public int RecentComments { get; set; }
        public double PositivePercent { get; set; }
        public double NegativePercent { get; set; }
        public double SentimentIndex { get; set; }
        public string TrendDirection { get; set; } = "mixed";
        public DateTime? LastCommentAt { get; set; }
    }

    public class AdminCampaignSentimentOverviewDto
    {
        public int WindowDays { get; set; }
        public int TotalCampaignsWithComments { get; set; }
        public double AverageSentimentIndex { get; set; }
        public List<AdminCampaignSentimentItemDto> Items { get; set; } = new();
    }
}
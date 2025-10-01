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
}
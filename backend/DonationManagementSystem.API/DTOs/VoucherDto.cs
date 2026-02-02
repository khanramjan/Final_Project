namespace DonationManagementSystem.API.DTOs
{
    /// <summary>
    /// DTO for a voucher line item
    /// </summary>
    public class VoucherItemDto
    {
        public string ItemName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int Quantity { get; set; } = 1;
        public DateTime PurchaseDate { get; set; }
        public string? Notes { get; set; }
    }

    /// <summary>
    /// DTO for submitting a new voucher
    /// </summary>
    public class SubmitVoucherDto
    {
        public int CampaignId { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ExpenseDate { get; set; }
        public string Category { get; set; } = string.Empty;
        public List<VoucherItemDto> Items { get; set; } = new List<VoucherItemDto>();
        // Receipt file will be handled separately via IFormFile
    }

    /// <summary>
    /// DTO for voucher response
    /// </summary>
    public class VoucherResponseDto
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public string CampaignTitle { get; set; } = string.Empty;
        public int VolunteerId { get; set; }
        public string VolunteerName { get; set; } = string.Empty;
        public string VolunteerEmail { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ExpenseDate { get; set; }
        public string Category { get; set; } = string.Empty;
        public string? ReceiptPath { get; set; }
        public string? ReceiptFileName { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? ReviewedBy { get; set; }
        public string? ReviewerName { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? AdminFeedback { get; set; }
        public bool IsRequestedByAdmin { get; set; }
        public string? RequestNote { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public List<VoucherItemDto> Items { get; set; } = new List<VoucherItemDto>();
    }

    /// <summary>
    /// DTO for approving or rejecting a voucher
    /// </summary>
    public class ReviewVoucherDto
    {
        public string Action { get; set; } = string.Empty; // "approve" or "reject"
        public string? AdminFeedback { get; set; }
    }

    /// <summary>
    /// DTO for admin requesting voucher from volunteer
    /// </summary>
    public class RequestVoucherDto
    {
        public int CampaignId { get; set; }
        public int VolunteerId { get; set; }
        public string RequestNote { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for displaying voucher summary on campaign page
    /// </summary>
    public class VoucherSummaryDto
    {
        public int TotalVouchers { get; set; }
        public decimal TotalExpenditure { get; set; }
        public List<VoucherPublicDto> Vouchers { get; set; } = new();
    }

    /// <summary>
    /// DTO for public display of vouchers on campaign page
    /// </summary>
    public class VoucherPublicDto
    {
        public int Id { get; set; }
        public string VolunteerName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime ExpenseDate { get; set; }
        public string Category { get; set; } = string.Empty;
        public DateTime ApprovedAt { get; set; }
    }
}

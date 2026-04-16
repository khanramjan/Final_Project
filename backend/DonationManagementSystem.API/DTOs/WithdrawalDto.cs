using System.ComponentModel.DataAnnotations;

namespace DonationManagementSystem.API.DTOs
{
    public class CreateWithdrawalDto
    {
        [Required]
        [Range(typeof(decimal), "10", "79228162514264337593543950335", ErrorMessage = "Minimum withdrawal amount is 10 BDT")]
        [RegularExpression(@"^\d+(\.\d{1,2})?$", ErrorMessage = "Amount can have at most 2 decimal places")]
        public decimal Amount { get; set; }

        [Required]
        public int CampaignId { get; set; }

        [Required]
        [MaxLength(500)]
        public string Purpose { get; set; } = string.Empty;

        [MaxLength(200)]
        public string? RecipientName { get; set; }

        [MaxLength(20)]
        public string? RecipientPhone { get; set; }

        [MaxLength(500)]
        public string? RecipientAddress { get; set; }

        [MaxLength(1000)]
        public string? Notes { get; set; }
    }

    public class WithdrawalDto
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public int CampaignId { get; set; }
        public string CampaignTitle { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public string? RecipientName { get; set; }
        public string? RecipientPhone { get; set; }
        public string? RecipientAddress { get; set; }
        public string? Notes { get; set; }
        public string? ReceiptPath { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public DateTime WithdrawnAt { get; set; }
        public int WithdrawnBy { get; set; }
        public string WithdrawnByName { get; set; } = string.Empty;
        public int? ApprovedBy { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? RejectionReason { get; set; }
        public int? CancelledBy { get; set; }
        public string? CancelledByName { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class ApproveWithdrawalDto
    {
        [MaxLength(500)]
        public string? Reason { get; set; }
    }

    public class RejectWithdrawalDto
    {
        [Required]
        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;
    }

    public class CancelWithdrawalDto
    {
        [MaxLength(500)]
        public string? Reason { get; set; }
    }
}

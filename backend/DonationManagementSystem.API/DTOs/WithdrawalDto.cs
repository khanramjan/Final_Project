using System.ComponentModel.DataAnnotations;

namespace DonationManagementSystem.API.DTOs
{
    public class CreateWithdrawalDto
    {
        [Required]
        [Range(1, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
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

        public DateTime? WithdrawnAt { get; set; }
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
        public DateTime WithdrawnAt { get; set; }
        public int WithdrawnBy { get; set; }
        public string WithdrawnByName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}

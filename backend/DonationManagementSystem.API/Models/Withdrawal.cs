using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace DonationManagementSystem.API.Models
{
    public class Withdrawal
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public decimal Amount { get; set; }

        [Required]
        public int CampaignId { get; set; }

        [ForeignKey("CampaignId")]
        public Campaign? Campaign { get; set; }

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

        // Receipt/proof attachment path
        [MaxLength(500)]
        public string? ReceiptPath { get; set; }

        public DateTime WithdrawnAt { get; set; } = DateTime.UtcNow;

        [Required]
        public int WithdrawnBy { get; set; } // Admin user ID

        [ForeignKey("WithdrawnBy")]
        public User? WithdrawnByUser { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}

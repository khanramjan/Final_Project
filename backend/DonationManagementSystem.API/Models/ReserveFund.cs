using System.ComponentModel.DataAnnotations;

namespace DonationManagementSystem.API.Models
{
    public class ReserveFund
    {
        [Key]
        public int Id { get; set; }

        public decimal Amount { get; set; }

        public int? DonationId { get; set; }
        public Donation? Donation { get; set; }

        public int? CampaignId { get; set; }
        public Campaign? Campaign { get; set; }

        public string? DonorName { get; set; }

        public string? SourceDescription { get; set; } // e.g., "Overflow from Campaign: Clean Water Project"

        public DateTime CreatedAt { get; set; }

        public string? Notes { get; set; }
    }
}

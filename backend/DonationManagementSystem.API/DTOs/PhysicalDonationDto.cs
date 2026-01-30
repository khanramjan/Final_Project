namespace DonationManagementSystem.API.DTOs
{
    public class CreatePhysicalDonationDto
    {
        public int CampaignId { get; set; }
        public int? VolunteerAssignmentId { get; set; }
        public decimal Amount { get; set; }
        public string DonorName { get; set; } = string.Empty;
        public string DonorPhone { get; set; } = string.Empty;
        public string? Notes { get; set; }
    }

    public class ConfirmPhysicalDonationDto
    {
        public string ReferenceCode { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
    }

    public class PhysicalDonationDto
    {
        public int Id { get; set; }
        public int CampaignId { get; set; }
        public decimal Amount { get; set; }
        public string DonorName { get; set; } = string.Empty;
        public string DonorPhone { get; set; } = string.Empty;
        public string ReferenceCode { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CollectedAt { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public int? DonationId { get; set; }
    }
}

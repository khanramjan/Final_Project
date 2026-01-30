using System;

namespace DonationManagementSystem.API.Models
{
    /// <summary>
    /// Captures cash/physical donations collected by volunteers during on-ground campaigns.
    /// Uses donor SMS OTP confirmation to reduce fraud and create an auditable trail.
    /// </summary>
    public class PhysicalDonation
    {
        public int Id { get; set; }

        public int CampaignId { get; set; }
        public int VolunteerProfileId { get; set; }
        public int? VolunteerAssignmentId { get; set; }

        public decimal Amount { get; set; }
        public string DonorName { get; set; } = string.Empty;
        public string DonorPhone { get; set; } = string.Empty;
        public string? Notes { get; set; }

        public string ReferenceCode { get; set; } = string.Empty;
        public string Status { get; set; } = "submitted"; // submitted, confirmed, disputed, cancelled

        public string? ConfirmationOtpHash { get; set; }
        public DateTime? ConfirmationOtpExpiresAt { get; set; }

        public DateTime CollectedAt { get; set; } = DateTime.UtcNow;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ConfirmedAt { get; set; }

        // Link to the main Donation table once confirmed
        public int? DonationId { get; set; }

        // Navigation
        public Campaign Campaign { get; set; } = null!;
        public VolunteerProfile VolunteerProfile { get; set; } = null!;
        public VolunteerAssignment? VolunteerAssignment { get; set; }
    }
}

namespace DonationManagementSystem.API.Models
{
	public class User
	{
		public int Id { get; set; }
		public string? UserType { get; set; }
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		public string? Email { get; set; }
		public string? PasswordHash { get; set; }
		public string? Phone { get; set; }
		public string? Address { get; set; }
		public string? Organization { get; set; }
		public string? Skills { get; set; }
		public string? Interests { get; set; }
		public string? NidPhotoPath { get; set; }
		public string? VolunteerPhotoPath { get; set; }
		public string? UtilityBillPath { get; set; }
		public bool IsActive { get; set; } = true;
		public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
		public DateTime? LastLoginAt { get; set; }

		// Email verification fields
		public bool IsEmailVerified { get; set; } = false;
		public string? EmailVerificationToken { get; set; }
		public DateTime? EmailVerificationTokenExpiry { get; set; }

		// Navigation properties
		public List<Donation> Donations { get; set; } = new();
		public List<Campaign> CampaignsCreated { get; set; } = new();
		public List<Campaign> CampaignsApproved { get; set; } = new();
	}
}

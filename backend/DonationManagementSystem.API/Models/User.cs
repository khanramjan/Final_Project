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
	}
}

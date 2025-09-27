using Microsoft.AspNetCore.Http;

namespace DonationManagementSystem.API.DTOs
{
	public class RegisterDto
	{
		public string? UserType { get; set; }
		public string? FirstName { get; set; }
		public string? LastName { get; set; }
		public string? Email { get; set; }
		public string? Password { get; set; }
		public string? Phone { get; set; }
		public string? Address { get; set; }
		public string? Organization { get; set; } // volunteer only
		public string? Skills { get; set; } // volunteer only
		public string? Interests { get; set; } // donor only
		public IFormFile? NidPhoto { get; set; } // volunteer only
		public IFormFile? VolunteerPhoto { get; set; } // volunteer only
		public IFormFile? UtilityBill { get; set; } // volunteer only
	}
}

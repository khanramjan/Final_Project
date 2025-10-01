using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace DonationManagementSystem.API.DTOs
{
	public class RegisterDto
	{
		[Required]
		public string UserType { get; set; } = string.Empty; // "donor" or "volunteer"
		
		[Required]
		public string FirstName { get; set; } = string.Empty;
		
		[Required]
		public string LastName { get; set; } = string.Empty;
		
		[Required]
		[EmailAddress]
		public string Email { get; set; } = string.Empty;
		
		[Required]
		[MinLength(8)]
		public string Password { get; set; } = string.Empty;
		
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

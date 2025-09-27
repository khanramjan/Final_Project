using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.DTOs;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using System;

namespace DonationManagementSystem.API.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class AuthController : ControllerBase
	{
		private readonly AppDbContext _context;
		private readonly IConfiguration _config;

		public AuthController(AppDbContext context, IConfiguration config)
		{
			_context = context;
			_config = config;
		}

		[HttpPost("register")]
		public async Task<IActionResult> Register([FromForm] RegisterDto dto)
		{
			if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
				return BadRequest("Email already exists");

			// File save helpers
			string SaveFile(IFormFile file)
			{
				if (file == null) return null;
				var uploads = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
				if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
				var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
				var filePath = Path.Combine(uploads, fileName);
				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					file.CopyTo(stream);
				}
				return fileName;
			}

			var user = new User
			{
				UserType = dto.UserType,
				FirstName = dto.FirstName,
				LastName = dto.LastName,
				Email = dto.Email,
				PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
				Phone = dto.Phone,
				Address = dto.Address,
				Organization = dto.Organization,
				Skills = dto.Skills,
				Interests = dto.Interests,
				NidPhotoPath = SaveFile(dto.NidPhoto),
				VolunteerPhotoPath = SaveFile(dto.VolunteerPhoto),
				UtilityBillPath = SaveFile(dto.UtilityBill)
			};
			_context.Users.Add(user);
			await _context.SaveChangesAsync();
			return Ok();
		}

		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginDto dto)
		{
			var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
			if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
				return Unauthorized();

			// JWT Token generate (replace with real implementation)
			var token = "dummy_jwt_token";
			return Ok(new { token });
		}
	}
}

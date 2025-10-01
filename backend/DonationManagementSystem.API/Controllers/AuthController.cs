using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.DTOs;
using DonationManagementSystem.API.Services;
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
		private readonly IJwtService _jwtService;

		public AuthController(AppDbContext context, IConfiguration config, IJwtService jwtService)
		{
			_context = context;
			_config = config;
			_jwtService = jwtService;
		}

		[HttpPost("register")]
		public async Task<IActionResult> Register([FromForm] RegisterDto dto)
		{
			try
			{
				// Validate email doesn't exist
				if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
					return BadRequest(new { message = "Email already exists" });

				// Security: Only allow donor and volunteer registration through public endpoint
				if (dto.UserType != "donor" && dto.UserType != "volunteer")
					return BadRequest(new { message = "Invalid user type. Only 'donor' and 'volunteer' are allowed for public registration." });

				// File save helpers
				string? SaveFile(IFormFile? file)
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
					UtilityBillPath = SaveFile(dto.UtilityBill),
					CreatedAt = DateTime.UtcNow,
					IsActive = true
				};

				_context.Users.Add(user);
				await _context.SaveChangesAsync();

				// Generate JWT token for the new user
				var token = _jwtService.GenerateToken(user);
				var refreshToken = _jwtService.GenerateRefreshToken();

				// Return user data with token
				return Ok(new
				{
					message = "Registration successful",
					token = token,
					refreshToken = refreshToken,
					user = new
					{
						id = user.Id,
						email = user.Email,
						firstName = user.FirstName,
						lastName = user.LastName,
						userType = user.UserType,
						isActive = user.IsActive
					}
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Registration failed", error = ex.Message });
			}
		}

		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginDto dto)
		{
			try
			{
				var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
				
				if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
					return Unauthorized(new { message = "Invalid email or password" });

				if (!user.IsActive)
					return Unauthorized(new { message = "Account is disabled" });

				// Generate JWT token
				var token = _jwtService.GenerateToken(user);
				var refreshToken = _jwtService.GenerateRefreshToken();

				// Update last login
				user.LastLoginAt = DateTime.UtcNow;
				await _context.SaveChangesAsync();

				return Ok(new
				{
					message = "Login successful",
					token = token,
					refreshToken = refreshToken,
					user = new
					{
						id = user.Id,
						email = user.Email,
						firstName = user.FirstName,
						lastName = user.LastName,
						userType = user.UserType,
						isActive = user.IsActive
					}
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Login failed", error = ex.Message });
			}
		}

		[HttpPost("refresh-token")]
		public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
		{
			try
			{
				if (!_jwtService.ValidateToken(dto.Token))
					return Unauthorized(new { message = "Invalid token" });

				var userId = _jwtService.GetUserIdFromToken(dto.Token);
				if (userId == null)
					return Unauthorized(new { message = "Invalid token" });

				var user = await _context.Users.FindAsync(int.Parse(userId));
				if (user == null || !user.IsActive)
					return Unauthorized(new { message = "User not found or inactive" });

				// Generate new tokens
				var newToken = _jwtService.GenerateToken(user);
				var newRefreshToken = _jwtService.GenerateRefreshToken();

				return Ok(new
				{
					token = newToken,
					refreshToken = newRefreshToken
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Token refresh failed", error = ex.Message });
			}
		}

		[HttpPost("logout")]
		public IActionResult Logout()
		{
			// In a real implementation, you might want to blacklist the token
			// For now, we'll just return success since JWT tokens are stateless
			return Ok(new { message = "Logout successful" });
		}

		// Admin-only endpoint to create new admin users
		[HttpPost("create-admin")]
		[Microsoft.AspNetCore.Authorization.Authorize]
		public async Task<IActionResult> CreateAdmin([FromBody] CreateAdminDto dto)
		{
			try
			{
				// Check if current user is admin
				var currentUserType = User.FindFirst("UserType")?.Value;
				if (currentUserType != "admin")
					return Unauthorized("Only administrators can create admin accounts");

				// Validate email doesn't exist
				if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
					return BadRequest(new { message = "Email already exists" });

				// Create new admin user
				var adminUser = new User
				{
					UserType = "admin",
					FirstName = dto.FirstName,
					LastName = dto.LastName,
					Email = dto.Email,
					PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
					Phone = dto.Phone,
					IsActive = true,
					CreatedAt = DateTime.UtcNow
				};

				_context.Users.Add(adminUser);
				await _context.SaveChangesAsync();

				return Ok(new
				{
					message = "Admin user created successfully",
					user = new
					{
						id = adminUser.Id,
						email = adminUser.Email,
						firstName = adminUser.FirstName,
						lastName = adminUser.LastName,
						userType = adminUser.UserType
					}
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Failed to create admin user", error = ex.Message });
			}
		}
	}
}

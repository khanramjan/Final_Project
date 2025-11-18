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
		private readonly IEmailService _emailService;

		public AuthController(AppDbContext context, IConfiguration config, IJwtService jwtService, IEmailService emailService)
		{
			_context = context;
			_config = config;
			_jwtService = jwtService;
			_emailService = emailService;
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

				// Generate email verification token
				var verificationToken = Guid.NewGuid().ToString();

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
					IsActive = true,
					IsEmailVerified = false,
					EmailVerificationToken = verificationToken,
					EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
				};

				_context.Users.Add(user);
				await _context.SaveChangesAsync();

				// Create VolunteerProfile for volunteers (copy all relevant fields)
				if (user.UserType == "volunteer")
				{
					// Parse skills and interests as JSON arrays
					var skillsList = new List<string>();
					if (!string.IsNullOrEmpty(dto.Skills))
					{
						skillsList = dto.Skills.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList();
					}

					var interestsList = new List<string>();
					if (!string.IsNullOrEmpty(dto.Interests))
					{
						interestsList = dto.Interests.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList();
					}

					var volunteerProfile = new VolunteerProfile
					{
						UserId = user.Id,
						Status = "pending",
						Skills = System.Text.Json.JsonSerializer.Serialize(skillsList),
						Interests = System.Text.Json.JsonSerializer.Serialize(interestsList),
						ExperienceLevel = "beginner", // Default or map from dto if available
						YearsOfExperience = 0,
						Location = dto.Address ?? "",
						EmergencyContactName = user.FirstName + " " + user.LastName,
						EmergencyContactPhone = dto.Phone ?? "",
						AcceptSmsNotifications = true,
						AcceptEmailNotifications = true,
						IsProfilePublic = false,
						IsApprovedByAdmin = false,
						AdminApprovalStatus = "pending",
						CreatedAt = DateTime.UtcNow
					};
					_context.VolunteerProfiles.Add(volunteerProfile);
					await _context.SaveChangesAsync();
				}
				// Send verification email
				try
				{
					var frontendUrl = _config["AppSettings:FrontendUrl"] ?? "http://localhost:5173";
					var verificationUrl = $"{frontendUrl}/verify-email?token={verificationToken}";
					await _emailService.SendVerificationEmailAsync(user.Email!, user.FirstName!, verificationToken, verificationUrl);
				}
				catch (Exception ex)
				{
					// Log error but don't fail registration
					Console.WriteLine($"Failed to send verification email: {ex.Message}");
				}

				// Generate JWT token for the new user (but they still need to verify email)
				var token = _jwtService.GenerateToken(user);
				var refreshToken = _jwtService.GenerateRefreshToken();

				// Return user data with token
				return Ok(new
				{
					message = "Registration successful. Please check your email to verify your account.",
					token = token,
					refreshToken = refreshToken,
					user = new
					{
						id = user.Id,
						email = user.Email,
						firstName = user.FirstName,
						lastName = user.LastName,
						userType = user.UserType,
						isActive = user.IsActive,
						isEmailVerified = user.IsEmailVerified
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

				// Check if volunteer is approved
				if (user.UserType == "volunteer")
				{
					var volunteerProfile = await _context.VolunteerProfiles.FirstOrDefaultAsync(vp => vp.UserId == user.Id);
					if (volunteerProfile == null || !volunteerProfile.IsApprovedByAdmin)
					{
						return Unauthorized(new { message = "Your volunteer account is pending admin approval. Please wait for approval." });
					}
				}

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
						isActive = user.IsActive,
						isEmailVerified = user.IsEmailVerified
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

		// Update user profile (authenticated user only)
		[HttpPut("profile")]
		[Microsoft.AspNetCore.Authorization.Authorize]
		public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
		{
			try
			{
				var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
				if (userId == null)
					return Unauthorized(new { message = "User not found" });

				var user = await _context.Users.FindAsync(int.Parse(userId));
				if (user == null)
					return NotFound(new { message = "User not found" });

				// Update user properties
				if (!string.IsNullOrEmpty(dto.FirstName))
					user.FirstName = dto.FirstName;

				if (!string.IsNullOrEmpty(dto.LastName))
					user.LastName = dto.LastName;

				if (!string.IsNullOrEmpty(dto.Email))
				{
					// Check if email is already taken by another user
					var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != user.Id);
					if (existingUser != null)
						return BadRequest(new { message = "Email already in use" });

					user.Email = dto.Email;
				}

				if (!string.IsNullOrEmpty(dto.Phone))
					user.Phone = dto.Phone;

				if (!string.IsNullOrEmpty(dto.Address))
					user.Address = dto.Address;

				await _context.SaveChangesAsync();

				return Ok(new
				{
					message = "Profile updated successfully",
					user = new
					{
						id = user.Id,
						email = user.Email,
						firstName = user.FirstName,
						lastName = user.LastName,
						phone = user.Phone,
						address = user.Address,
						userType = user.UserType
					}
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Failed to update profile", error = ex.Message });
			}
		}

		// Change password (authenticated user only)
		[HttpPost("change-password")]
		[Microsoft.AspNetCore.Authorization.Authorize]
		public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
		{
			try
			{
				var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
				if (userId == null)
					return Unauthorized(new { message = "User not found" });

				var user = await _context.Users.FindAsync(int.Parse(userId));
				if (user == null)
					return NotFound(new { message = "User not found" });

				// Verify current password
				if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
					return BadRequest(new { message = "Current password is incorrect" });

				// Validate new password
				if (dto.NewPassword.Length < 6)
					return BadRequest(new { message = "New password must be at least 6 characters long" });

				// Update password
				user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
				await _context.SaveChangesAsync();

				return Ok(new { message = "Password changed successfully" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Failed to change password", error = ex.Message });
			}
		}

		[HttpGet("verify-email")]
		public async Task<IActionResult> VerifyEmail([FromQuery] string token)
		{
			try
			{
				if (string.IsNullOrEmpty(token))
					return BadRequest(new { message = "Invalid verification token" });

				var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);

				if (user == null)
					return BadRequest(new { message = "Invalid verification token" });

				if (user.IsEmailVerified)
					return Ok(new { message = "Email already verified", alreadyVerified = true });

				if (user.EmailVerificationTokenExpiry < DateTime.UtcNow)
					return BadRequest(new { message = "Verification token has expired. Please request a new verification email." });

				user.IsEmailVerified = true;
				user.EmailVerificationToken = null;
				user.EmailVerificationTokenExpiry = null;

				await _context.SaveChangesAsync();

				return Ok(new { message = "Email verified successfully! You can now log in." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Email verification failed", error = ex.Message });
			}
		}

		[HttpPost("resend-verification")]
		public async Task<IActionResult> ResendVerificationEmail([FromBody] ResendVerificationDto dto)
		{
			try
			{
				var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

				if (user == null)
					return BadRequest(new { message = "User not found" });

				if (user.IsEmailVerified)
					return BadRequest(new { message = "Email is already verified" });

				// Generate new verification token
				var verificationToken = Guid.NewGuid().ToString();
				user.EmailVerificationToken = verificationToken;
				user.EmailVerificationTokenExpiry = DateTime.UtcNow.AddHours(24);

				await _context.SaveChangesAsync();

				// Send verification email
				var frontendUrl = _config["AppSettings:FrontendUrl"] ?? "http://localhost:5173";
				var verificationUrl = $"{frontendUrl}/verify-email?token={verificationToken}";
				await _emailService.SendVerificationEmailAsync(user.Email!, user.FirstName!, verificationToken, verificationUrl);

				return Ok(new { message = "Verification email sent successfully. Please check your inbox." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { message = "Failed to resend verification email", error = ex.Message });
			}
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

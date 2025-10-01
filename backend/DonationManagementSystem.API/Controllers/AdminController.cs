using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.DTOs;
using System.Security.Claims;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        // Check if current user is admin
        private bool IsAdmin()
        {
            var userType = User.FindFirst("userType")?.Value;
            return userType == "admin";
        }

        // GET: api/admin/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var totalUsers = await _context.Users.CountAsync();
                var activeUsers = await _context.Users.CountAsync(u => u.IsActive);
                var totalDonors = await _context.Users.CountAsync(u => u.UserType == "donor");
                var totalVolunteers = await _context.Users.CountAsync(u => u.UserType == "volunteer");

                // Mock data for now - replace with real donation/campaign tables
                var dashboardStats = new
                {
                    totalUsers = totalUsers,
                    activeUsers = activeUsers,
                    totalDonors = totalDonors,
                    totalVolunteers = totalVolunteers,
                    totalDonations = 856, // Mock data
                    totalCampaigns = 23,  // Mock data
                    totalAmount = 125630.50, // Mock data
                    pendingCampaigns = 5, // Mock data
                    recentDonations = 28, // Mock data
                    conversionRate = 68.5 // Mock data
                };

                return Ok(dashboardStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch dashboard stats", error = ex.Message });
            }
        }

        // GET: api/admin/users
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? userType = null,
            [FromQuery] bool? isActive = null)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var query = _context.Users.AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(u => 
                        (u.FirstName != null && u.FirstName.Contains(search)) || 
                        (u.LastName != null && u.LastName.Contains(search)) || 
                        (u.Email != null && u.Email.Contains(search)));
                }

                if (!string.IsNullOrEmpty(userType))
                {
                    query = query.Where(u => u.UserType == userType);
                }

                if (isActive.HasValue)
                {
                    query = query.Where(u => u.IsActive == isActive.Value);
                }

                var totalCount = await query.CountAsync();
                var users = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(u => new
                    {
                        id = u.Id,
                        firstName = u.FirstName,
                        lastName = u.LastName,
                        email = u.Email,
                        userType = u.UserType,
                        isActive = u.IsActive,
                        createdAt = u.CreatedAt,
                        lastLoginAt = u.LastLoginAt,
                        phone = u.Phone,
                        organization = u.Organization
                    })
                    .ToListAsync();

                return Ok(new
                {
                    users = users,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch users", error = ex.Message });
            }
        }

        // GET: api/admin/users/{id}
        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                var userDetails = new
                {
                    id = user.Id,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    userType = user.UserType,
                    isActive = user.IsActive,
                    createdAt = user.CreatedAt,
                    lastLoginAt = user.LastLoginAt,
                    phone = user.Phone,
                    address = user.Address,
                    organization = user.Organization,
                    skills = user.Skills,
                    interests = user.Interests
                };

                return Ok(userDetails);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch user", error = ex.Message });
            }
        }

        // PUT: api/admin/users/{id}
        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var user = await _context.Users.FindAsync(id);
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
                    var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != id);
                    if (existingUser != null)
                        return BadRequest(new { message = "Email already in use" });
                    
                    user.Email = dto.Email;
                }

                if (!string.IsNullOrEmpty(dto.Phone))
                    user.Phone = dto.Phone;

                if (!string.IsNullOrEmpty(dto.Address))
                    user.Address = dto.Address;

                if (dto.IsActive.HasValue)
                    user.IsActive = dto.IsActive.Value;

                await _context.SaveChangesAsync();

                return Ok(new { message = "User updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update user", error = ex.Message });
            }
        }

        // DELETE: api/admin/users/{id}
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Don't allow deleting the last admin
                if (user.UserType == "admin")
                {
                    var adminCount = await _context.Users.CountAsync(u => u.UserType == "admin");
                    if (adminCount <= 1)
                        return BadRequest(new { message = "Cannot delete the last admin user" });
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "User deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete user", error = ex.Message });
            }
        }

        // POST: api/admin/users/{id}/toggle-status
        [HttpPost("users/{id}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int id)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return NotFound(new { message = "User not found" });

                // Don't allow deactivating the last admin
                if (user.UserType == "admin" && user.IsActive)
                {
                    var activeAdminCount = await _context.Users.CountAsync(u => u.UserType == "admin" && u.IsActive);
                    if (activeAdminCount <= 1)
                        return BadRequest(new { message = "Cannot deactivate the last active admin user" });
                }

                user.IsActive = !user.IsActive;
                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    message = $"User {(user.IsActive ? "activated" : "deactivated")} successfully",
                    isActive = user.IsActive
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to toggle user status", error = ex.Message });
            }
        }

        // POST: api/admin/create-admin
        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdminUser([FromBody] CreateAdminDto dto)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
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
                        userType = adminUser.UserType,
                        isActive = adminUser.IsActive,
                        createdAt = adminUser.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create admin user", error = ex.Message });
            }
        }

        // GET: api/admin/activity
        [HttpGet("activity")]
        public IActionResult GetRecentActivity([FromQuery] int limit = 10)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                // Mock recent activity data - replace with real activity tracking
                var recentActivity = new[]
                {
                    new
                    {
                        id = 1,
                        type = "donation",
                        message = "John Doe donated $500 to Education Campaign",
                        timestamp = DateTime.UtcNow.AddMinutes(-2).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        status = "success"
                    },
                    new
                    {
                        id = 2,
                        type = "registration",
                        message = "New volunteer Sarah Johnson registered",
                        timestamp = DateTime.UtcNow.AddMinutes(-15).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        status = "success"
                    },
                    new
                    {
                        id = 3,
                        type = "campaign",
                        message = "Healthcare Campaign needs approval",
                        timestamp = DateTime.UtcNow.AddHours(-1).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        status = "pending"
                    },
                    new
                    {
                        id = 4,
                        type = "volunteer",
                        message = "Volunteer verification document expired for Mike Chen",
                        timestamp = DateTime.UtcNow.AddHours(-2).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        status = "warning"
                    },
                    new
                    {
                        id = 5,
                        type = "donation",
                        message = "Large donation of $2000 from Anonymous donor",
                        timestamp = DateTime.UtcNow.AddHours(-3).ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        status = "success"
                    }
                }.Take(limit);

                return Ok(recentActivity);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch recent activity", error = ex.Message });
            }
        }
    }
}

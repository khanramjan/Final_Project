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
    [Authorize]
    public class SystemSettingsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SystemSettingsController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdmin()
        {
            var userType = User.FindFirst("UserType")?.Value;
            return userType == "admin";
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        // GET: api/systemsettings
        [HttpGet]
        public async Task<IActionResult> GetAllSettings()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var settings = await _context.SystemSettings
                    .Include(s => s.UpdatedByUser)
                    .OrderBy(s => s.Category)
                    .ThenBy(s => s.Key)
                    .Select(s => new SystemSettingsDto
                    {
                        Id = s.Id,
                        Key = s.Key,
                        Value = s.Value,
                        Description = s.Description,
                        Category = s.Category,
                        DataType = s.DataType,
                        IsPublic = s.IsPublic,
                        UpdatedAt = s.UpdatedAt,
                        UpdatedBy = s.UpdatedByUser != null ? $"{s.UpdatedByUser.FirstName} {s.UpdatedByUser.LastName}" : "System"
                    })
                    .ToListAsync();

                return Ok(settings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch system settings", error = ex.Message });
            }
        }

        // GET: api/systemsettings/category/{category}
        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetSettingsByCategory(string category)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var settings = await _context.SystemSettings
                    .Include(s => s.UpdatedByUser)
                    .Where(s => s.Category.ToLower() == category.ToLower())
                    .OrderBy(s => s.Key)
                    .Select(s => new SystemSettingsDto
                    {
                        Id = s.Id,
                        Key = s.Key,
                        Value = s.Value,
                        Description = s.Description,
                        Category = s.Category,
                        DataType = s.DataType,
                        IsPublic = s.IsPublic,
                        UpdatedAt = s.UpdatedAt,
                        UpdatedBy = s.UpdatedByUser != null ? $"{s.UpdatedByUser.FirstName} {s.UpdatedByUser.LastName}" : "System"
                    })
                    .ToListAsync();

                return Ok(settings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch category settings", error = ex.Message });
            }
        }

        // GET: api/systemsettings/public
        [HttpGet("public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicSettings()
        {
            try
            {
                var publicSettings = await _context.SystemSettings
                    .Where(s => s.IsPublic)
                    .Select(s => new { key = s.Key, value = s.Value, dataType = s.DataType })
                    .ToListAsync();

                return Ok(publicSettings.ToDictionary(s => s.key, s => s.value));
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch public settings", error = ex.Message });
            }
        }

        // GET: api/systemsettings/{key}
        [HttpGet("{key}")]
        public async Task<IActionResult> GetSetting(string key)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var setting = await _context.SystemSettings
                    .Include(s => s.UpdatedByUser)
                    .FirstOrDefaultAsync(s => s.Key == key);

                if (setting == null)
                    return NotFound(new { message = "Setting not found" });

                var settingDto = new SystemSettingsDto
                {
                    Id = setting.Id,
                    Key = setting.Key,
                    Value = setting.Value,
                    Description = setting.Description,
                    Category = setting.Category,
                    DataType = setting.DataType,
                    IsPublic = setting.IsPublic,
                    UpdatedAt = setting.UpdatedAt,
                    UpdatedBy = setting.UpdatedByUser != null ? $"{setting.UpdatedByUser.FirstName} {setting.UpdatedByUser.LastName}" : "System"
                };

                return Ok(settingDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch setting", error = ex.Message });
            }
        }

        // POST: api/systemsettings
        [HttpPost]
        public async Task<IActionResult> CreateSetting([FromBody] CreateSystemSettingDto dto)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                // Check if setting already exists
                var existingSetting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == dto.Key);
                if (existingSetting != null)
                    return BadRequest(new { message = "Setting with this key already exists" });

                var setting = new SystemSettings
                {
                    Key = dto.Key,
                    Value = dto.Value,
                    Description = dto.Description,
                    Category = dto.Category,
                    DataType = dto.DataType,
                    IsPublic = dto.IsPublic,
                    UpdatedBy = GetCurrentUserId(),
                    UpdatedAt = DateTime.UtcNow
                };

                _context.SystemSettings.Add(setting);

                // Create audit log
                var auditLog = new AuditLog
                {
                    UserId = GetCurrentUserId(),
                    Action = "CREATE_SYSTEM_SETTING",
                    EntityType = "SystemSettings",
                    EntityId = setting.Id,
                    NewValues = $"Created setting '{dto.Key}' with value '{dto.Value}'",
                    CreatedAt = DateTime.UtcNow
                };
                _context.AuditLogs.Add(auditLog);

                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSetting), new { key = setting.Key }, 
                    new { message = "Setting created successfully", id = setting.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to create setting", error = ex.Message });
            }
        }

        // PUT: api/systemsettings/{key}
        [HttpPut("{key}")]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSystemSettingDto dto)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
                if (setting == null)
                    return NotFound(new { message = "Setting not found" });

                var oldValue = setting.Value;
                setting.Value = dto.Value;
                setting.UpdatedBy = GetCurrentUserId();
                setting.UpdatedAt = DateTime.UtcNow;

                // Create audit log
                var auditLog = new AuditLog
                {
                    UserId = GetCurrentUserId(),
                    Action = "UPDATE_SYSTEM_SETTING",
                    EntityType = "SystemSettings",
                    EntityId = setting.Id,
                    OldValues = oldValue,
                    NewValues = dto.Value,
                    CreatedAt = DateTime.UtcNow
                };
                _context.AuditLogs.Add(auditLog);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Setting updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update setting", error = ex.Message });
            }
        }

        // DELETE: api/systemsettings/{key}
        [HttpDelete("{key}")]
        public async Task<IActionResult> DeleteSetting(string key)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == key);
                if (setting == null)
                    return NotFound(new { message = "Setting not found" });

                _context.SystemSettings.Remove(setting);

                // Create audit log
                var auditLog = new AuditLog
                {
                    UserId = GetCurrentUserId(),
                    Action = "DELETE_SYSTEM_SETTING",
                    EntityType = "SystemSettings",
                    EntityId = setting.Id,
                    OldValues = $"Deleted setting '{key}' with value '{setting.Value}'",
                    CreatedAt = DateTime.UtcNow
                };
                _context.AuditLogs.Add(auditLog);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Setting deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete setting", error = ex.Message });
            }
        }

        // POST: api/systemsettings/bulk-update
        [HttpPost("bulk-update")]
        public async Task<IActionResult> BulkUpdateSettings([FromBody] List<BulkUpdateSettingDto> settings)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var updatedCount = 0;
                var currentUserId = GetCurrentUserId();

                foreach (var settingDto in settings)
                {
                    var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == settingDto.Key);
                    if (setting != null)
                    {
                        var oldValue = setting.Value;
                        setting.Value = settingDto.Value;
                        setting.UpdatedBy = currentUserId;
                        setting.UpdatedAt = DateTime.UtcNow;

                        // Create audit log
                        var auditLog = new AuditLog
                        {
                            UserId = currentUserId,
                            Action = "BULK_UPDATE_SYSTEM_SETTING",
                            EntityType = "SystemSettings",
                            EntityId = setting.Id,
                            OldValues = oldValue,
                            NewValues = settingDto.Value,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.AuditLogs.Add(auditLog);

                        updatedCount++;
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = $"Successfully updated {updatedCount} settings" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to bulk update settings", error = ex.Message });
            }
        }

        // GET: api/systemsettings/categories
        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var categories = await _context.SystemSettings
                    .GroupBy(s => s.Category)
                    .Select(g => new
                    {
                        category = g.Key,
                        count = g.Count(),
                        lastUpdated = g.Max(s => s.UpdatedAt)
                    })
                    .OrderBy(c => c.category)
                    .ToListAsync();

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch categories", error = ex.Message });
            }
        }

        // POST: api/systemsettings/initialize-defaults
        [HttpPost("initialize-defaults")]
        public async Task<IActionResult> InitializeDefaultSettings()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var currentUserId = GetCurrentUserId();
                var defaultSettings = new List<SystemSettings>
                {
                    // General Settings
                    new SystemSettings { Key = "SITE_NAME", Value = "Donation Management System", Description = "Name of the website", Category = "General", DataType = "string", IsPublic = true, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "SITE_DESCRIPTION", Value = "A platform for managing charitable donations and campaigns", Description = "Site description for SEO", Category = "General", DataType = "string", IsPublic = true, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "CONTACT_EMAIL", Value = "admin@donationms.com", Description = "Main contact email", Category = "General", DataType = "email", IsPublic = true, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "SUPPORT_PHONE", Value = "+1-234-567-8900", Description = "Support phone number", Category = "General", DataType = "string", IsPublic = true, UpdatedBy = currentUserId },

                    // Email Settings
                    new SystemSettings { Key = "SMTP_HOST", Value = "smtp.gmail.com", Description = "SMTP server host", Category = "Email", DataType = "string", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "SMTP_PORT", Value = "587", Description = "SMTP server port", Category = "Email", DataType = "number", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "SMTP_USERNAME", Value = "", Description = "SMTP username", Category = "Email", DataType = "string", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "SMTP_PASSWORD", Value = "", Description = "SMTP password", Category = "Email", DataType = "password", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "EMAIL_FROM_NAME", Value = "Donation Management System", Description = "Default sender name for emails", Category = "Email", DataType = "string", IsPublic = false, UpdatedBy = currentUserId },

                    // Payment Settings
                    new SystemSettings { Key = "STRIPE_PUBLIC_KEY", Value = "", Description = "Stripe publishable key", Category = "Payment", DataType = "string", IsPublic = true, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "STRIPE_SECRET_KEY", Value = "", Description = "Stripe secret key", Category = "Payment", DataType = "password", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "PAYPAL_CLIENT_ID", Value = "", Description = "PayPal client ID", Category = "Payment", DataType = "string", IsPublic = true, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "PAYPAL_CLIENT_SECRET", Value = "", Description = "PayPal client secret", Category = "Payment", DataType = "password", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "MIN_DONATION_AMOUNT", Value = "1", Description = "Minimum donation amount", Category = "Payment", DataType = "number", IsPublic = true, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "MAX_DONATION_AMOUNT", Value = "10000", Description = "Maximum donation amount", Category = "Payment", DataType = "number", IsPublic = true, UpdatedBy = currentUserId },

                    // Security Settings
                    new SystemSettings { Key = "JWT_SECRET", Value = Guid.NewGuid().ToString(), Description = "JWT secret key", Category = "Security", DataType = "password", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "JWT_EXPIRY_HOURS", Value = "24", Description = "JWT token expiry in hours", Category = "Security", DataType = "number", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "PASSWORD_MIN_LENGTH", Value = "8", Description = "Minimum password length", Category = "Security", DataType = "number", IsPublic = true, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "ENABLE_TWO_FACTOR", Value = "false", Description = "Enable two-factor authentication", Category = "Security", DataType = "boolean", IsPublic = false, UpdatedBy = currentUserId },

                    // Campaign Settings
                    new SystemSettings { Key = "AUTO_APPROVE_CAMPAIGNS", Value = "false", Description = "Automatically approve campaigns", Category = "Campaign", DataType = "boolean", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "MAX_CAMPAIGN_DURATION_DAYS", Value = "365", Description = "Maximum campaign duration in days", Category = "Campaign", DataType = "number", IsPublic = true, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "FEATURED_CAMPAIGNS_LIMIT", Value = "5", Description = "Maximum number of featured campaigns", Category = "Campaign", DataType = "number", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "CAMPAIGN_IMAGE_MAX_SIZE_MB", Value = "5", Description = "Maximum campaign image size in MB", Category = "Campaign", DataType = "number", IsPublic = true, UpdatedBy = currentUserId },

                    // Notification Settings
                    new SystemSettings { Key = "NOTIFY_ADMIN_NEW_CAMPAIGN", Value = "true", Description = "Notify admin when new campaign is created", Category = "Notification", DataType = "boolean", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "NOTIFY_ADMIN_NEW_DONATION", Value = "true", Description = "Notify admin when new donation is made", Category = "Notification", DataType = "boolean", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "NOTIFY_CREATOR_DONATION", Value = "true", Description = "Notify campaign creator when donation is made", Category = "Notification", DataType = "boolean", IsPublic = false, UpdatedBy = currentUserId },
                    new SystemSettings { Key = "SEND_DONATION_RECEIPTS", Value = "true", Description = "Send email receipts for donations", Category = "Notification", DataType = "boolean", IsPublic = false, UpdatedBy = currentUserId }
                };

                foreach (var setting in defaultSettings)
                {
                    var existingSetting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == setting.Key);
                    if (existingSetting == null)
                    {
                        setting.UpdatedAt = DateTime.UtcNow;
                        _context.SystemSettings.Add(setting);
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Default settings initialized successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to initialize default settings", error = ex.Message });
            }
        }

        // GET: api/systemsettings/backup
        [HttpGet("backup")]
        public async Task<IActionResult> BackupSettings()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var settings = await _context.SystemSettings
                    .Select(s => new
                    {
                        key = s.Key,
                        value = s.Value,
                        description = s.Description,
                        category = s.Category,
                        dataType = s.DataType,
                        isPublic = s.IsPublic
                    })
                    .ToListAsync();

                var backup = new
                {
                    exportDate = DateTime.UtcNow,
                    settings = settings
                };

                return File(
                    System.Text.Encoding.UTF8.GetBytes(System.Text.Json.JsonSerializer.Serialize(backup, new System.Text.Json.JsonSerializerOptions { WriteIndented = true })),
                    "application/json",
                    $"settings_backup_{DateTime.Now:yyyyMMdd_HHmmss}.json"
                );
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to backup settings", error = ex.Message });
            }
        }
    }

    // DTOs for System Settings
    public class SystemSettingsDto
    {
        public int Id { get; set; }
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string DataType { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string UpdatedBy { get; set; } = string.Empty;
    }

    public class CreateSystemSettingDto
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string Category { get; set; } = string.Empty;
        public string DataType { get; set; } = "string";
        public bool IsPublic { get; set; } = false;
    }

    public class UpdateSystemSettingDto
    {
        public string Value { get; set; } = string.Empty;
    }

    public class BulkUpdateSettingDto
    {
        public string Key { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
    }
}

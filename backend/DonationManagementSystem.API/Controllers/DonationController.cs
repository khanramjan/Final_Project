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
    public class DonationController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DonationController(AppDbContext context)
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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        // GET: api/donation/admin/all
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllDonations(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] string? status = null,
            [FromQuery] string? paymentMethod = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] int? campaignId = null)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                Console.WriteLine($"\n🔍 [DONATIONS API] Fetching donations - Page: {page}, PageSize: {pageSize}");
                
                // First, check database
                var totalInDb = await _context.Donations.CountAsync();
                Console.WriteLine($"📊 Total donations in database: {totalInDb}");

                var query = _context.Donations
                    .Include(d => d.Campaign)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(d => 
                        (d.DonorName != null && d.DonorName.Contains(search)) ||
                        (d.DonorEmail != null && d.DonorEmail.Contains(search)) ||
                        (d.Campaign != null && d.Campaign.Title.Contains(search)) ||
                        (d.PaymentReference != null && d.PaymentReference.Contains(search)));
                    Console.WriteLine($"🔎 Applied search filter: {search}");
                }

                // Only apply status filter if it's NOT "all"
                if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
                {
                    query = query.Where(d => d.Status == status);
                    Console.WriteLine($"🔎 Applied status filter: {status}");
                }
                else if (string.IsNullOrEmpty(status))
                {
                    Console.WriteLine($"ℹ️  No status filter applied (showing all statuses)");
                }

                if (!string.IsNullOrEmpty(paymentMethod))
                {
                    query = query.Where(d => d.PaymentMethod == paymentMethod);
                }

                if (startDate.HasValue)
                {
                    query = query.Where(d => d.CreatedAt >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(d => d.CreatedAt <= endDate.Value);
                }

                if (campaignId.HasValue)
                {
                    query = query.Where(d => d.CampaignId == campaignId.Value);
                }

                var totalCount = await query.CountAsync();
                Console.WriteLine($"✅ After filters: {totalCount} donations");
                
                var donations = await query
                    .OrderByDescending(d => d.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(d => new DonationDto
                    {
                        Id = d.Id,
                        Amount = d.Amount,
                        DonorName = d.IsAnonymous ? "Anonymous" : (d.DonorName ?? "Unknown"),
                        Message = d.Message,
                        IsAnonymous = d.IsAnonymous,
                        Status = d.Status,
                        CreatedAt = d.CreatedAt,
                        CompletedAt = d.CompletedAt
                    })
                    .ToListAsync();

                Console.WriteLine($"📤 Returning {donations.Count} donations to frontend\n");

                return Ok(new
                {
                    donations = donations,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERROR in GetAllDonations: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Failed to fetch donations", error = ex.Message });
            }
        }

        // GET: api/donation/admin/stats
        [HttpGet("admin/stats")]
        public async Task<IActionResult> GetDonationStats()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1);
                var startOfToday = now.Date;

                var totalDonations = await _context.Donations.CountAsync();
                var completedDonations = await _context.Donations.CountAsync(d => d.Status == "completed");
                var pendingDonations = await _context.Donations.CountAsync(d => d.Status == "pending");
                var failedDonations = await _context.Donations.CountAsync(d => d.Status == "failed");

                var totalAmount = await _context.Donations
                    .Where(d => d.Status == "completed")
                    .SumAsync(d => d.Amount);

                var todayAmount = await _context.Donations
                    .Where(d => d.Status == "completed" && d.CreatedAt >= startOfToday)
                    .SumAsync(d => d.Amount);

                var todayCount = await _context.Donations
                    .Where(d => d.Status == "completed" && d.CreatedAt >= startOfToday)
                    .CountAsync();

                var monthlyAmount = await _context.Donations
                    .Where(d => d.Status == "completed" && d.CreatedAt >= startOfMonth)
                    .SumAsync(d => d.Amount);

                var monthlyCount = await _context.Donations
                    .Where(d => d.Status == "completed" && d.CreatedAt >= startOfMonth)
                    .CountAsync();

                var averageAmount = completedDonations > 0 ? totalAmount / completedDonations : 0;

                // Monthly trend for the last 12 months
                var monthlyTrend = new List<object>();
                for (int i = 11; i >= 0; i--)
                {
                    var monthStart = startOfMonth.AddMonths(-i);
                    var monthEnd = monthStart.AddMonths(1);
                    
                    var monthAmount = await _context.Donations
                        .Where(d => d.Status == "completed" && d.CreatedAt >= monthStart && d.CreatedAt < monthEnd)
                        .SumAsync(d => d.Amount);
                    
                    var monthCount = await _context.Donations
                        .Where(d => d.Status == "completed" && d.CreatedAt >= monthStart && d.CreatedAt < monthEnd)
                        .CountAsync();

                    monthlyTrend.Add(new
                    {
                        month = monthStart.ToString("MMM yyyy"),
                        amount = monthAmount,
                        count = monthCount
                    });
                }

                // Payment method stats
                var paymentMethods = await _context.Donations
                    .Where(d => d.Status == "completed")
                    .GroupBy(d => d.PaymentMethod)
                    .Select(g => new
                    {
                        method = g.Key,
                        amount = g.Sum(d => d.Amount),
                        count = g.Count(),
                        percentage = totalAmount > 0 ? (g.Sum(d => d.Amount) / totalAmount) * 100 : 0
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalAmount = totalAmount,
                    totalDonations = totalDonations,
                    averageAmount = averageAmount,
                    todayAmount = todayAmount,
                    todayCount = todayCount,
                    monthlyAmount = monthlyAmount,
                    monthlyCount = monthlyCount,
                    completedDonations = completedDonations,
                    pendingDonations = pendingDonations,
                    failedDonations = failedDonations,
                    successRate = totalDonations > 0 ? (double)completedDonations / totalDonations * 100 : 0,
                    monthlyTrend = monthlyTrend,
                    paymentMethods = paymentMethods
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch donation stats", error = ex.Message });
            }
        }

        // GET: api/donation/admin/recent
        [HttpGet("admin/recent")]
        public async Task<IActionResult> GetRecentDonations([FromQuery] int limit = 10)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var recentDonations = await _context.Donations
                    .Include(d => d.Campaign)
                    .OrderByDescending(d => d.CreatedAt)
                    .Take(limit)
                    .Select(d => new
                    {
                        id = d.Id,
                        amount = d.Amount,
                        donorName = d.IsAnonymous ? "Anonymous" : (d.DonorName ?? "Unknown"),
                        campaignTitle = d.Campaign.Title,
                        status = d.Status,
                        createdAt = d.CreatedAt,
                        paymentMethod = d.PaymentMethod
                    })
                    .ToListAsync();

                return Ok(recentDonations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch recent donations", error = ex.Message });
            }
        }

        // GET: api/donation/my-donations
        [HttpGet("my-donations")]
        public async Task<IActionResult> GetMyDonations(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] string? sortBy = "latest")
        {
            try
            {
                var userId = GetCurrentUserId();
                if (userId == 0)
                    return Unauthorized("User not authenticated");

                var query = _context.Donations
                    .Include(d => d.Campaign)
                    .Where(d => d.UserId == userId)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                {
                    query = query.Where(d => d.Status == status);
                }

                var totalCount = await query.CountAsync();

                // Apply sorting
                if (sortBy == "oldest")
                {
                    query = query.OrderBy(d => d.CreatedAt);
                }
                else
                {
                    query = query.OrderByDescending(d => d.CreatedAt);
                }

                var donations = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(d => new
                    {
                        id = d.Id,
                        amount = d.Amount,
                        campaignTitle = d.Campaign.Title,
                        campaignId = d.Campaign.Id,
                        campaignCategory = d.Campaign.Category,
                        date = d.CreatedAt,
                        status = d.Status,
                        paymentMethod = d.PaymentMethod,
                        transactionId = d.PaymentReference
                    })
                    .ToListAsync();

                return Ok(new
                {
                    success = true,
                    donations = donations,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch donations", error = ex.Message });
            }
        }

        // POST: api/donation/admin/{id}/refund
        [HttpPost("admin/{id}/refund")]
        public async Task<IActionResult> RefundDonation(int id, [FromBody] RefundDonationDto dto)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var donation = await _context.Donations
                    .Include(d => d.Campaign)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (donation == null)
                    return NotFound(new { message = "Donation not found" });

                if (donation.Status != "completed")
                    return BadRequest(new { message = "Only completed donations can be refunded" });

                // Update donation status
                donation.Status = "refunded";
                // Note: Consider adding RefundedAt and RefundReason properties to Donation model in future

                // Update campaign raised amount
                donation.Campaign.RaisedAmount -= donation.Amount;

                // Create audit log
                var auditLog = new AuditLog
                {
                    UserId = GetCurrentUserId(),
                    Action = "REFUND_DONATION",
                    EntityType = "Donation",
                    EntityId = donation.Id,
                    NewValues = $"Refunded donation of ${donation.Amount} for campaign '{donation.Campaign.Title}'. Reason: {dto.Reason}",
                    CreatedAt = DateTime.UtcNow
                };
                _context.AuditLogs.Add(auditLog);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Donation refunded successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to refund donation", error = ex.Message });
            }
        }

        // PUT: api/donation/admin/{id}/status
        [HttpPut("admin/{id}/status")]
        public async Task<IActionResult> UpdateDonationStatus(int id, [FromBody] UpdateDonationStatusDto dto)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var donation = await _context.Donations
                    .Include(d => d.Campaign)
                    .FirstOrDefaultAsync(d => d.Id == id);

                if (donation == null)
                    return NotFound(new { message = "Donation not found" });

                var oldStatus = donation.Status;
                donation.Status = dto.Status;

                // Update campaign amount if status changed to/from completed
                if (oldStatus != "completed" && dto.Status == "completed")
                {
                    donation.Campaign.RaisedAmount += donation.Amount;
                    donation.CompletedAt = DateTime.UtcNow;
                }
                else if (oldStatus == "completed" && dto.Status != "completed")
                {
                    donation.Campaign.RaisedAmount -= donation.Amount;
                    donation.CompletedAt = null;
                }

                // Create audit log
                var auditLog = new AuditLog
                {
                    UserId = GetCurrentUserId(),
                    Action = "UPDATE_DONATION_STATUS",
                    EntityType = "Donation",
                    EntityId = donation.Id,
                    NewValues = $"Changed donation status from '{oldStatus}' to '{dto.Status}' for campaign '{donation.Campaign.Title}'",
                    CreatedAt = DateTime.UtcNow
                };
                _context.AuditLogs.Add(auditLog);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Donation status updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update donation status", error = ex.Message });
            }
        }

        // GET: api/donation/admin/export
        [HttpGet("admin/export")]
        public async Task<IActionResult> ExportDonations(
            [FromQuery] string format = "csv",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? status = null,
            [FromQuery] int? campaignId = null)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var query = _context.Donations
                    .Include(d => d.Campaign)
                    .AsQueryable();

                if (startDate.HasValue)
                    query = query.Where(d => d.CreatedAt >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(d => d.CreatedAt <= endDate.Value);

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(d => d.Status == status);

                if (campaignId.HasValue)
                    query = query.Where(d => d.CampaignId == campaignId.Value);

                var donations = await query
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(d => new
                    {
                        Id = d.Id,
                        Amount = d.Amount,
                        DonorName = d.IsAnonymous ? "Anonymous" : (d.DonorName ?? "Unknown"),
                        DonorEmail = d.IsAnonymous ? "Anonymous" : (d.DonorEmail ?? ""),
                        CampaignTitle = d.Campaign.Title,
                        PaymentMethod = d.PaymentMethod,
                        Status = d.Status,
                        PaymentReference = d.PaymentReference,
                        CreatedAt = d.CreatedAt,
                        CompletedAt = d.CompletedAt,
                        Message = d.Message
                    })
                    .ToListAsync();

                if (format.ToLower() == "csv")
                {
                    var csv = "Id,Amount,DonorName,DonorEmail,CampaignTitle,PaymentMethod,Status,PaymentReference,CreatedAt,CompletedAt,Message\n";
                    csv += string.Join("\n", donations.Select(d => 
                        $"{d.Id},{d.Amount},\"{d.DonorName}\",\"{d.DonorEmail}\",\"{d.CampaignTitle}\",{d.PaymentMethod},{d.Status},{d.PaymentReference},{d.CreatedAt:yyyy-MM-dd HH:mm:ss},{d.CompletedAt:yyyy-MM-dd HH:mm:ss},\"{d.Message}\""));

                    return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", $"donations_{DateTime.Now:yyyyMMdd}.csv");
                }

                return Ok(donations);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to export donations", error = ex.Message });
            }
        }
    }

    public class RefundDonationDto
    {
        public string? Reason { get; set; }
    }

    public class UpdateDonationStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}

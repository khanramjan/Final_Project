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
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdmin()
        {
            var userType = User.FindFirst("userType")?.Value;
            return userType == "admin";
        }

        // GET: api/analytics/dashboard
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardAnalytics()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1);
                var startOfWeek = now.Date.AddDays(-(int)now.DayOfWeek);
                var startOfToday = now.Date;

                // Overall stats
                var totalUsers = await _context.Users.CountAsync();
                var totalCampaigns = await _context.Campaigns.CountAsync();
                var activeCampaigns = await _context.Campaigns.CountAsync(c => c.Status == "approved" && c.EndDate > now);
                var totalDonations = await _context.Donations.CountAsync(d => d.Status == "completed");
                var totalAmount = await _context.Donations.Where(d => d.Status == "completed").SumAsync(d => d.Amount);

                // Today's stats
                var todayDonations = await _context.Donations.CountAsync(d => d.Status == "completed" && d.CreatedAt >= startOfToday);
                var todayAmount = await _context.Donations.Where(d => d.Status == "completed" && d.CreatedAt >= startOfToday).SumAsync(d => d.Amount);
                var todayNewUsers = await _context.Users.CountAsync(u => u.CreatedAt >= startOfToday);

                // Weekly stats
                var weeklyDonations = await _context.Donations.CountAsync(d => d.Status == "completed" && d.CreatedAt >= startOfWeek);
                var weeklyAmount = await _context.Donations.Where(d => d.Status == "completed" && d.CreatedAt >= startOfWeek).SumAsync(d => d.Amount);

                // Monthly stats
                var monthlyDonations = await _context.Donations.CountAsync(d => d.Status == "completed" && d.CreatedAt >= startOfMonth);
                var monthlyAmount = await _context.Donations.Where(d => d.Status == "completed" && d.CreatedAt >= startOfMonth).SumAsync(d => d.Amount);

                // Growth rates (comparing to previous periods)
                var lastMonth = startOfMonth.AddMonths(-1);
                var lastMonthEnd = startOfMonth.AddDays(-1);
                var lastMonthAmount = await _context.Donations
                    .Where(d => d.Status == "completed" && d.CreatedAt >= lastMonth && d.CreatedAt <= lastMonthEnd)
                    .SumAsync(d => d.Amount);

                var monthlyGrowth = lastMonthAmount > 0 ? ((monthlyAmount - lastMonthAmount) / lastMonthAmount) * 100 : 0;

                // Average donation amount
                var averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

                // Success rate (completed vs total donations)
                var totalDonationAttempts = await _context.Donations.CountAsync();
                var successRate = totalDonationAttempts > 0 ? (double)totalDonations / totalDonationAttempts * 100 : 0;

                return Ok(new
                {
                    overview = new
                    {
                        totalUsers = totalUsers,
                        totalCampaigns = totalCampaigns,
                        activeCampaigns = activeCampaigns,
                        totalDonations = totalDonations,
                        totalAmount = totalAmount,
                        averageDonation = averageDonation,
                        successRate = successRate
                    },
                    today = new
                    {
                        donations = todayDonations,
                        amount = todayAmount,
                        newUsers = todayNewUsers
                    },
                    weekly = new
                    {
                        donations = weeklyDonations,
                        amount = weeklyAmount
                    },
                    monthly = new
                    {
                        donations = monthlyDonations,
                        amount = monthlyAmount,
                        growth = monthlyGrowth
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch dashboard analytics", error = ex.Message });
            }
        }

        // GET: api/analytics/donation-trends
        [HttpGet("donation-trends")]
        public async Task<IActionResult> GetDonationTrends([FromQuery] int months = 12)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var now = DateTime.UtcNow;
                var startDate = now.AddMonths(-months);

                var monthlyTrends = new List<object>();

                for (int i = months - 1; i >= 0; i--)
                {
                    var monthStart = new DateTime(now.Year, now.Month, 1).AddMonths(-i);
                    var monthEnd = monthStart.AddMonths(1);

                    var monthAmount = await _context.Donations
                        .Where(d => d.Status == "completed" && d.CreatedAt >= monthStart && d.CreatedAt < monthEnd)
                        .SumAsync(d => d.Amount);

                    var monthCount = await _context.Donations
                        .Where(d => d.Status == "completed" && d.CreatedAt >= monthStart && d.CreatedAt < monthEnd)
                        .CountAsync();

                    monthlyTrends.Add(new
                    {
                        month = monthStart.ToString("MMM yyyy"),
                        amount = monthAmount,
                        count = monthCount,
                        average = monthCount > 0 ? monthAmount / monthCount : 0
                    });
                }

                return Ok(monthlyTrends);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch donation trends", error = ex.Message });
            }
        }

        // GET: api/analytics/campaign-performance
        [HttpGet("campaign-performance")]
        public async Task<IActionResult> GetCampaignPerformance([FromQuery] int limit = 10)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var topCampaigns = await _context.Campaigns
                    .Include(c => c.Donations)
                    .Where(c => c.Status == "approved")
                    .Select(c => new
                    {
                        id = c.Id,
                        title = c.Title,
                        targetAmount = c.TargetAmount,
                        raisedAmount = c.RaisedAmount,
                        donationCount = c.Donations.Count(d => d.Status == "completed"),
                        progressPercentage = c.TargetAmount > 0 ? (c.RaisedAmount / c.TargetAmount) * 100 : 0,
                        averageDonation = c.Donations.Where(d => d.Status == "completed").Any() 
                            ? c.Donations.Where(d => d.Status == "completed").Average(d => d.Amount) 
                            : 0,
                        category = c.Category,
                        daysActive = (DateTime.UtcNow - c.CreatedAt).TotalDays,
                        isUrgent = c.IsUrgent,
                        isFeatured = c.IsFeatured
                    })
                    .OrderByDescending(c => c.raisedAmount)
                    .Take(limit)
                    .ToListAsync();

                return Ok(topCampaigns);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch campaign performance", error = ex.Message });
            }
        }

        // GET: api/analytics/category-breakdown
        [HttpGet("category-breakdown")]
        public async Task<IActionResult> GetCategoryBreakdown()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var totalAmount = await _context.Donations
                    .Where(d => d.Status == "completed")
                    .SumAsync(d => d.Amount);

                var categoryStats = await _context.Campaigns
                    .GroupBy(c => c.Category)
                    .Select(g => new
                    {
                        category = g.Key,
                        campaignCount = g.Count(),
                        totalRaised = g.Sum(c => c.RaisedAmount),
                        averageRaised = g.Average(c => c.RaisedAmount),
                        donationCount = g.SelectMany(c => c.Donations).Count(d => d.Status == "completed"),
                        percentage = totalAmount > 0 ? (g.Sum(c => c.RaisedAmount) / totalAmount) * 100 : 0
                    })
                    .OrderByDescending(x => x.totalRaised)
                    .ToListAsync();

                return Ok(categoryStats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch category breakdown", error = ex.Message });
            }
        }

        // GET: api/analytics/user-insights
        [HttpGet("user-insights")]
        public async Task<IActionResult> GetUserInsights()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var now = DateTime.UtcNow;
                var startOfMonth = new DateTime(now.Year, now.Month, 1);

                // User type breakdown
                var userTypes = await _context.Users
                    .GroupBy(u => u.UserType)
                    .Select(g => new
                    {
                        userType = g.Key,
                        count = g.Count(),
                        percentage = (double)g.Count() / _context.Users.Count() * 100
                    })
                    .ToListAsync();

                // New user registrations this month
                var newUsersThisMonth = await _context.Users
                    .Where(u => u.CreatedAt >= startOfMonth)
                    .CountAsync();

                // Monthly registration trends
                var registrationTrends = new List<object>();
                for (int i = 11; i >= 0; i--)
                {
                    var monthStart = startOfMonth.AddMonths(-i);
                    var monthEnd = monthStart.AddMonths(1);

                    var monthlyRegistrations = await _context.Users
                        .Where(u => u.CreatedAt >= monthStart && u.CreatedAt < monthEnd)
                        .GroupBy(u => u.UserType)
                        .Select(g => new { userType = g.Key, count = g.Count() })
                        .ToListAsync();

                    registrationTrends.Add(new
                    {
                        month = monthStart.ToString("MMM yyyy"),
                        registrations = monthlyRegistrations
                    });
                }

                // Most active donors (users with most donations)
                var topDonors = await _context.Users
                    .Where(u => u.UserType == "donor")
                    .Select(u => new
                    {
                        id = u.Id,
                        name = $"{u.FirstName} {u.LastName}",
                        email = u.Email,
                        donationCount = u.Donations.Count(d => d.Status == "completed"),
                        totalDonated = u.Donations.Where(d => d.Status == "completed").Sum(d => d.Amount),
                        lastDonation = u.Donations.Where(d => d.Status == "completed").Max(d => (DateTime?)d.CreatedAt)
                    })
                    .Where(u => u.donationCount > 0)
                    .OrderByDescending(u => u.totalDonated)
                    .Take(10)
                    .ToListAsync();

                return Ok(new
                {
                    userTypes = userTypes,
                    newUsersThisMonth = newUsersThisMonth,
                    registrationTrends = registrationTrends,
                    topDonors = topDonors
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch user insights", error = ex.Message });
            }
        }

        // GET: api/analytics/payment-insights
        [HttpGet("payment-insights")]
        public async Task<IActionResult> GetPaymentInsights()
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var totalAmount = await _context.Donations
                    .Where(d => d.Status == "completed")
                    .SumAsync(d => d.Amount);

                var paymentMethodStats = await _context.Donations
                    .Where(d => d.Status == "completed")
                    .GroupBy(d => d.PaymentMethod)
                    .Select(g => new
                    {
                        paymentMethod = g.Key,
                        count = g.Count(),
                        totalAmount = g.Sum(d => d.Amount),
                        averageAmount = g.Average(d => d.Amount),
                        percentage = totalAmount > 0 ? (g.Sum(d => d.Amount) / totalAmount) * 100 : 0
                    })
                    .OrderByDescending(x => x.totalAmount)
                    .ToListAsync();

                // Donation amount ranges
                var amountRanges = new[]
                {
                    new { range = "$1-$50", min = 1m, max = 50m },
                    new { range = "$51-$100", min = 51m, max = 100m },
                    new { range = "$101-$500", min = 101m, max = 500m },
                    new { range = "$501-$1000", min = 501m, max = 1000m },
                    new { range = "$1000+", min = 1001m, max = decimal.MaxValue }
                };

                var donationRanges = new List<object>();
                foreach (var range in amountRanges)
                {
                    var count = await _context.Donations
                        .Where(d => d.Status == "completed" && d.Amount >= range.min && d.Amount <= range.max)
                        .CountAsync();

                    var amount = await _context.Donations
                        .Where(d => d.Status == "completed" && d.Amount >= range.min && d.Amount <= range.max)
                        .SumAsync(d => d.Amount);

                    donationRanges.Add(new
                    {
                        range = range.range,
                        count = count,
                        amount = amount,
                        percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0
                    });
                }

                return Ok(new
                {
                    paymentMethods = paymentMethodStats,
                    donationRanges = donationRanges
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch payment insights", error = ex.Message });
            }
        }

        // GET: api/analytics/recent-activities
        [HttpGet("recent-activities")]
        public async Task<IActionResult> GetRecentActivities([FromQuery] int limit = 20)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                var recentActivities = new List<object>();

                // Recent donations
                var recentDonations = await _context.Donations
                    .Include(d => d.Campaign)
                    .Include(d => d.User)
                    .Where(d => d.Status == "completed")
                    .OrderByDescending(d => d.CreatedAt)
                    .Take(limit / 2)
                    .Select(d => new
                    {
                        id = d.Id,
                        type = "donation",
                        message = $"${d.Amount} donated to '{d.Campaign.Title}'",
                        timestamp = d.CreatedAt,
                        status = "completed",
                        userName = d.IsAnonymous ? "Anonymous" : (d.User != null ? $"{d.User.FirstName} {d.User.LastName}" : d.DonorName),
                        relatedEntity = "Campaign",
                        relatedEntityId = d.CampaignId
                    })
                    .ToListAsync();

                // Recent campaigns
                var recentCampaigns = await _context.Campaigns
                    .Include(c => c.Creator)
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(limit / 2)
                    .Select(c => new
                    {
                        id = c.Id,
                        type = "campaign",
                        message = $"Campaign '{c.Title}' created",
                        timestamp = c.CreatedAt,
                        status = c.Status,
                        userName = $"{c.Creator.FirstName} {c.Creator.LastName}",
                        relatedEntity = "Campaign",
                        relatedEntityId = c.Id
                    })
                    .ToListAsync();

                recentActivities.AddRange(recentDonations);
                recentActivities.AddRange(recentCampaigns);

                // Sort all activities by timestamp
                var sortedActivities = recentActivities
                    .OrderByDescending(a => a.GetType().GetProperty("timestamp")?.GetValue(a))
                    .Take(limit)
                    .ToList();

                return Ok(sortedActivities);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch recent activities", error = ex.Message });
            }
        }

        // GET: api/analytics/export
        [HttpGet("export")]
        public async Task<IActionResult> ExportAnalytics(
            [FromQuery] string type = "overview",
            [FromQuery] string format = "csv",
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            if (!IsAdmin())
                return Unauthorized("Admin access required");

            try
            {
                switch (type.ToLower())
                {
                    case "donations":
                        return await ExportDonationAnalytics(format, startDate, endDate);
                    case "campaigns":
                        return await ExportCampaignAnalytics(format, startDate, endDate);
                    case "users":
                        return await ExportUserAnalytics(format, startDate, endDate);
                    default:
                        return BadRequest(new { message = "Invalid export type" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to export analytics", error = ex.Message });
            }
        }

        private async Task<IActionResult> ExportDonationAnalytics(string format, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Donations
                .Include(d => d.Campaign)
                .Where(d => d.Status == "completed");

            if (startDate.HasValue)
                query = query.Where(d => d.CreatedAt >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(d => d.CreatedAt <= endDate.Value);

            var donations = await query
                .Select(d => new
                {
                    Date = d.CreatedAt.ToString("yyyy-MM-dd"),
                    Amount = d.Amount,
                    Campaign = d.Campaign.Title,
                    Category = d.Campaign.Category,
                    PaymentMethod = d.PaymentMethod,
                    IsAnonymous = d.IsAnonymous
                })
                .ToListAsync();

            if (format.ToLower() == "csv")
            {
                var csv = "Date,Amount,Campaign,Category,PaymentMethod,IsAnonymous\n";
                csv += string.Join("\n", donations.Select(d =>
                    $"{d.Date},{d.Amount},\"{d.Campaign}\",{d.Category},{d.PaymentMethod},{d.IsAnonymous}"));

                return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", 
                    $"donation_analytics_{DateTime.Now:yyyyMMdd}.csv");
            }

            return Ok(donations);
        }

        private async Task<IActionResult> ExportCampaignAnalytics(string format, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Campaigns.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(c => c.CreatedAt >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(c => c.CreatedAt <= endDate.Value);

            var campaigns = await query
                .Select(c => new
                {
                    Title = c.Title,
                    Category = c.Category,
                    TargetAmount = c.TargetAmount,
                    RaisedAmount = c.RaisedAmount,
                    ProgressPercentage = c.TargetAmount > 0 ? (c.RaisedAmount / c.TargetAmount) * 100 : 0,
                    Status = c.Status,
                    CreatedDate = c.CreatedAt.ToString("yyyy-MM-dd"),
                    DonationCount = c.Donations.Count(d => d.Status == "completed")
                })
                .ToListAsync();

            if (format.ToLower() == "csv")
            {
                var csv = "Title,Category,TargetAmount,RaisedAmount,ProgressPercentage,Status,CreatedDate,DonationCount\n";
                csv += string.Join("\n", campaigns.Select(c =>
                    $"\"{c.Title}\",{c.Category},{c.TargetAmount},{c.RaisedAmount},{c.ProgressPercentage:F2},{c.Status},{c.CreatedDate},{c.DonationCount}"));

                return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", 
                    $"campaign_analytics_{DateTime.Now:yyyyMMdd}.csv");
            }

            return Ok(campaigns);
        }

        private async Task<IActionResult> ExportUserAnalytics(string format, DateTime? startDate, DateTime? endDate)
        {
            var query = _context.Users.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(u => u.CreatedAt >= startDate.Value);
            if (endDate.HasValue)
                query = query.Where(u => u.CreatedAt <= endDate.Value);

            var users = await query
                .Select(u => new
                {
                    UserType = u.UserType,
                    RegistrationDate = u.CreatedAt.ToString("yyyy-MM-dd"),
                    TotalDonations = u.Donations.Count(d => d.Status == "completed"),
                    TotalDonated = u.Donations.Where(d => d.Status == "completed").Sum(d => d.Amount)
                })
                .ToListAsync();

            if (format.ToLower() == "csv")
            {
                var csv = "UserType,RegistrationDate,TotalDonations,TotalDonated\n";
                csv += string.Join("\n", users.Select(u =>
                    $"{u.UserType},{u.RegistrationDate},{u.TotalDonations},{u.TotalDonated}"));

                return File(System.Text.Encoding.UTF8.GetBytes(csv), "text/csv", 
                    $"user_analytics_{DateTime.Now:yyyyMMdd}.csv");
            }

            return Ok(users);
        }
    }
}

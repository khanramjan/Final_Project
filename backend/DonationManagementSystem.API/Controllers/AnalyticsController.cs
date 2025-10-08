using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AnalyticsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardAnalytics()
        {
            try
            {
                // Get real data from database
                var totalUsers = await _context.Users.CountAsync();
                var totalCampaigns = await _context.Campaigns.CountAsync();
                var activeCampaigns = await _context.Campaigns.CountAsync(c => c.Status == "active");
                var totalDonations = await _context.Donations.CountAsync();
                var totalAmount = await _context.Donations.SumAsync(d => (decimal?)d.Amount) ?? 0;

                // Calculate today's data (last 24 hours)
                var today = DateTime.UtcNow.Date;
                var todayDonations = await _context.Donations.CountAsync(d => d.CreatedAt >= today);
                var todayAmount = await _context.Donations.Where(d => d.CreatedAt >= today).SumAsync(d => (decimal?)d.Amount) ?? 0;
                var todayNewUsers = await _context.Users.CountAsync(u => u.CreatedAt >= today);

                // Calculate weekly data (last 7 days)
                var weekAgo = DateTime.UtcNow.AddDays(-7);
                var weeklyDonations = await _context.Donations.CountAsync(d => d.CreatedAt >= weekAgo);
                var weeklyAmount = await _context.Donations.Where(d => d.CreatedAt >= weekAgo).SumAsync(d => (decimal?)d.Amount) ?? 0;

                // Calculate monthly data (last 30 days)
                var monthAgo = DateTime.UtcNow.AddDays(-30);
                var monthlyDonations = await _context.Donations.CountAsync(d => d.CreatedAt >= monthAgo);
                var monthlyAmount = await _context.Donations.Where(d => d.CreatedAt >= monthAgo).SumAsync(d => (decimal?)d.Amount) ?? 0;

                // Calculate growth (compare with previous month)
                var prevMonthStart = DateTime.UtcNow.AddDays(-60);
                var prevMonthEnd = DateTime.UtcNow.AddDays(-30);
                var prevMonthAmount = await _context.Donations.Where(d => d.CreatedAt >= prevMonthStart && d.CreatedAt < prevMonthEnd)
                    .SumAsync(d => (decimal?)d.Amount) ?? 0;

                var growth = prevMonthAmount > 0 ? ((monthlyAmount - prevMonthAmount) / prevMonthAmount) * 100 : 0;

                // Calculate average donation
                var averageDonation = totalDonations > 0 ? totalAmount / totalDonations : 0;

                // Calculate success rate (assuming all donations are successful for now)
                var successRate = totalDonations > 0 ? 100.0 : 100.0;

                return Ok(new
                {
                    overview = new
                    {
                        totalUsers,
                        totalCampaigns,
                        activeCampaigns,
                        totalDonations,
                        totalAmount,
                        averageDonation,
                        successRate
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
                        growth
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Analytics failed", error = ex.Message });
            }
        }

        [HttpGet("campaign-metrics")]
        public async Task<IActionResult> GetCampaignMetrics()
        {
            try
            {
                var campaigns = await _context.Campaigns
                    .Select(c => new
                    {
                        c.Id,
                        c.Title,
                        c.Category,
                        c.TargetAmount,
                        c.Status,
                        c.CreatedAt,
                        c.ImagePath,
                        c.IsUrgent,
                        c.IsFeatured,
                        // Calculate raised amount from donations
                        RaisedAmount = _context.Donations
                            .Where(d => d.CampaignId == c.Id)
                            .Sum(d => (decimal?)d.Amount) ?? 0,
                        // Count donations for this campaign
                        DonationCount = _context.Donations
                            .Count(d => d.CampaignId == c.Id),
                        // Get recent donation time
                        LastDonationDate = _context.Donations
                            .Where(d => d.CampaignId == c.Id)
                            .OrderByDescending(d => d.CreatedAt)
                            .Select(d => (DateTime?)d.CreatedAt)
                            .FirstOrDefault()
                    })
                    .ToListAsync();

                var campaignMetrics = campaigns.Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.Category,
                    c.TargetAmount,
                    c.RaisedAmount,
                    c.DonationCount,
                    c.Status,
                    c.IsUrgent,
                    c.IsFeatured,
                    ProgressPercentage = c.TargetAmount > 0 ? (c.RaisedAmount / c.TargetAmount) * 100 : 0,
                    AverageDonation = c.DonationCount > 0 ? c.RaisedAmount / c.DonationCount : 0,
                    DaysActive = (DateTime.UtcNow - c.CreatedAt).Days,
                    c.LastDonationDate,
                    c.ImagePath
                }).OrderByDescending(c => c.RaisedAmount).ToList();

                return Ok(campaignMetrics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch campaign metrics", error = ex.Message });
            }
        }
    }
}
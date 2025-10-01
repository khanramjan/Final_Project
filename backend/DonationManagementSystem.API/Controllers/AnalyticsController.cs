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
    }
}
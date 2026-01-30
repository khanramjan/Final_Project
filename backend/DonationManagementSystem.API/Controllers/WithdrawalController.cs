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
    public class FinancialController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FinancialController(AppDbContext context)
        {
            _context = context;
        }

        private bool IsAdmin()
        {
            return User.FindFirst("UserType")?.Value == "admin";
        }

        /// <summary>
        /// Public: Get reserve fund summary for transparency
        /// GET: api/financial/reserve-fund/public
        /// </summary>
        [HttpGet("reserve-fund/public")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicReserveFund()
        {
            try
            {
                var totalAmount = await _context.ReserveFunds.SumAsync(r => r.Amount);
                var entryCount = await _context.ReserveFunds.CountAsync();

                var recentEntries = await _context.ReserveFunds
                    .Include(r => r.Campaign)
                    .OrderByDescending(r => r.CreatedAt)
                    .Take(10)
                    .Select(r => new
                    {
                        amount = r.Amount,
                        campaignTitle = r.Campaign != null ? r.Campaign.Title : "N/A",
                        donorName = r.DonorName ?? "Anonymous",
                        sourceDescription = r.SourceDescription,
                        createdAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalAmount = totalAmount,
                    entryCount = entryCount,
                    description = "Reserve fund contains overflow donations from completed campaigns. This money is used for future campaigns and emergency relief.",
                    recentEntries = recentEntries
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Get complete financial dashboard
        /// GET: api/financial/dashboard
        /// Shows all money in the system and which campaign it belongs to
        /// </summary>
        [HttpGet("dashboard")]
        public async Task<IActionResult> GetFinancialDashboard()
        {
            if (!IsAdmin())
            {
                return Forbid();
            }

            try
            {
                // Get all campaigns with their financial data
                var campaignsList = await _context.Campaigns
                    .Where(c => c.Status == "active" || c.Status == "completed")
                    .Select(c => new
                    {
                        id = c.Id,
                        title = c.Title,
                        status = c.Status,
                        targetAmount = c.TargetAmount,
                        raisedAmount = c.RaisedAmount,
                        donationCount = _context.Donations.Count(d => d.CampaignId == c.Id && d.Status == "completed"),
                        createdAt = c.CreatedAt
                    })
                    .OrderByDescending(c => c.raisedAmount)
                    .ToListAsync();

                // Try to get withdrawal data (table might not exist yet)
                Dictionary<int, decimal> withdrawalsByCampaign = new Dictionary<int, decimal>();
                try
                {
                    withdrawalsByCampaign = await _context.Withdrawals
                        .GroupBy(w => w.CampaignId)
                        .Select(g => new { CampaignId = g.Key, Total = g.Sum(w => w.Amount) })
                        .ToDictionaryAsync(x => x.CampaignId, x => x.Total);
                }
                catch
                {
                    // Withdrawals table doesn't exist yet, that's okay
                }

                // Combine data
                var campaigns = campaignsList.Select(c => new
                {
                    c.id,
                    c.title,
                    c.status,
                    c.targetAmount,
                    c.raisedAmount,
                    c.donationCount,
                    withdrawn = withdrawalsByCampaign.GetValueOrDefault(c.id, 0),
                    available = c.raisedAmount - withdrawalsByCampaign.GetValueOrDefault(c.id, 0),
                    c.createdAt
                }).ToList();

                // Get reserve fund total
                var reserveFund = await _context.ReserveFunds
                    .SumAsync(r => r.Amount);

                // Calculate totals
                var totalInCampaigns = campaigns.Sum(c => c.raisedAmount);
                var totalInSystem = totalInCampaigns + reserveFund;

                // Get recent reserve fund entries
                var recentReserveEntries = await _context.ReserveFunds
                    .Include(r => r.Campaign)
                    .OrderByDescending(r => r.CreatedAt)
                    .Take(10)
                    .Select(r => new
                    {
                        id = r.Id,
                        amount = r.Amount,
                        campaignTitle = r.Campaign != null ? r.Campaign.Title : "N/A",
                        donorName = r.DonorName,
                        sourceDescription = r.SourceDescription,
                        createdAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    summary = new
                    {
                        totalInSystem = totalInSystem,
                        totalInCampaigns = totalInCampaigns,
                        reserveFund = reserveFund,
                        activeCampaigns = campaigns.Count(c => c.status == "active"),
                        completedCampaigns = campaigns.Count(c => c.status == "completed")
                    },
                    campaigns = campaigns,
                    reserveFund = new
                    {
                        total = reserveFund,
                        recentEntries = recentReserveEntries
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Get detailed breakdown for a specific campaign
        /// GET: api/financial/campaign/{id}
        /// </summary>
        [HttpGet("campaign/{id}")]
        public async Task<IActionResult> GetCampaignFinancials(int id)
        {
            if (!IsAdmin())
            {
                return Forbid();
            }

            try
            {
                var campaign = await _context.Campaigns
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (campaign == null)
                {
                    return NotFound(new { message = "Campaign not found" });
                }

                // Get all donations for this campaign
                var donations = await _context.Donations
                    .Where(d => d.CampaignId == id && d.Status == "completed")
                    .OrderByDescending(d => d.CreatedAt)
                    .Select(d => new
                    {
                        id = d.Id,
                        amount = d.Amount,
                        donorName = d.DonorName,
                        isAnonymous = d.IsAnonymous,
                        createdAt = d.CreatedAt,
                        completedAt = d.CompletedAt
                    })
                    .ToListAsync();

                // Get any overflow that went to reserve fund from this campaign
                var overflowAmount = await _context.ReserveFunds
                    .Where(r => r.CampaignId == id)
                    .SumAsync(r => r.Amount);

                var overflowEntries = await _context.ReserveFunds
                    .Where(r => r.CampaignId == id)
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new
                    {
                        id = r.Id,
                        amount = r.Amount,
                        donorName = r.DonorName,
                        sourceDescription = r.SourceDescription,
                        createdAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    campaign = new
                    {
                        id = campaign.Id,
                        title = campaign.Title,
                        status = campaign.Status,
                        targetAmount = campaign.TargetAmount,
                        raisedAmount = campaign.RaisedAmount,
                        overflowAmount = overflowAmount,
                        totalReceived = campaign.RaisedAmount + overflowAmount
                    },
                    donations = donations,
                    overflow = new
                    {
                        total = overflowAmount,
                        entries = overflowEntries
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Get reserve fund details
        /// GET: api/financial/reserve-fund
        /// </summary>
        [HttpGet("reserve-fund")]
        public async Task<IActionResult> GetReserveFund([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (!IsAdmin())
            {
                return Forbid();
            }

            try
            {
                var totalAmount = await _context.ReserveFunds.SumAsync(r => r.Amount);
                var totalEntries = await _context.ReserveFunds.CountAsync();

                var entries = await _context.ReserveFunds
                    .Include(r => r.Campaign)
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(r => new
                    {
                        id = r.Id,
                        amount = r.Amount,
                        campaignId = r.CampaignId,
                        campaignTitle = r.Campaign != null ? r.Campaign.Title : "N/A",
                        donorName = r.DonorName,
                        sourceDescription = r.SourceDescription,
                        notes = r.Notes,
                        createdAt = r.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    totalAmount = totalAmount,
                    totalEntries = totalEntries,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalEntries / pageSize),
                    entries = entries
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // ==================== WITHDRAWAL TRACKING ====================

        /// <summary>
        /// Admin: Record a withdrawal from bank account
        /// POST: api/financial/withdrawals
        /// </summary>
        [HttpPost("withdrawals")]
        public async Task<IActionResult> CreateWithdrawal([FromBody] CreateWithdrawalDto dto)
        {
            if (!IsAdmin())
                return Forbid();

            try
            {
                // Get admin user ID
                var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(adminIdClaim) || !int.TryParse(adminIdClaim, out int adminId))
                    return Unauthorized(new { message = "Invalid user" });

                // Validate campaign exists
                var campaign = await _context.Campaigns.FindAsync(dto.CampaignId);
                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                // Calculate available balance (raised - already withdrawn)
                var totalWithdrawn = await _context.Withdrawals
                    .Where(w => w.CampaignId == dto.CampaignId)
                    .SumAsync(w => w.Amount);

                var availableBalance = campaign.RaisedAmount - totalWithdrawn;

                if (dto.Amount > availableBalance)
                {
                    return BadRequest(new 
                    { 
                        message = $"Insufficient funds. Available: ৳{availableBalance:N2}, Requested: ৳{dto.Amount:N2}" 
                    });
                }

                var withdrawal = new Withdrawal
                {
                    Amount = dto.Amount,
                    CampaignId = dto.CampaignId,
                    Purpose = dto.Purpose,
                    RecipientName = dto.RecipientName,
                    RecipientPhone = dto.RecipientPhone,
                    RecipientAddress = dto.RecipientAddress,
                    Notes = dto.Notes,
                    WithdrawnAt = dto.WithdrawnAt ?? DateTime.UtcNow,
                    WithdrawnBy = adminId,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Withdrawals.Add(withdrawal);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Withdrawal recorded successfully", withdrawalId = withdrawal.Id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Get all withdrawals with filtering
        /// GET: api/financial/withdrawals
        /// </summary>
        [HttpGet("withdrawals")]
        public async Task<IActionResult> GetWithdrawals([FromQuery] int? campaignId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            if (!IsAdmin())
                return Forbid();

            try
            {
                var query = _context.Withdrawals
                    .Include(w => w.Campaign)
                    .Include(w => w.WithdrawnByUser)
                    .AsQueryable();

                if (campaignId.HasValue)
                    query = query.Where(w => w.CampaignId == campaignId.Value);

                var total = await query.CountAsync();
                
                var withdrawals = await query
                    .OrderByDescending(w => w.WithdrawnAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(w => new WithdrawalDto
                    {
                        Id = w.Id,
                        Amount = w.Amount,
                        CampaignId = w.CampaignId,
                        CampaignTitle = w.Campaign != null ? w.Campaign.Title : "N/A",
                        Purpose = w.Purpose,
                        RecipientName = w.RecipientName,
                        RecipientPhone = w.RecipientPhone,
                        RecipientAddress = w.RecipientAddress,
                        Notes = w.Notes,
                        ReceiptPath = w.ReceiptPath,
                        WithdrawnAt = w.WithdrawnAt,
                        WithdrawnBy = w.WithdrawnBy,
                        WithdrawnByName = w.WithdrawnByUser != null ? $"{w.WithdrawnByUser.FirstName} {w.WithdrawnByUser.LastName}" : "Admin",
                        CreatedAt = w.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    withdrawals = withdrawals,
                    totalWithdrawn = await query.SumAsync(w => w.Amount),
                    page = page,
                    pageSize = pageSize,
                    totalCount = total,
                    totalPages = (int)Math.Ceiling((double)total / pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Get withdrawal summary for a campaign
        /// GET: api/financial/campaign/{id}/withdrawals/summary
        /// </summary>
        [HttpGet("campaign/{id}/withdrawals/summary")]
        public async Task<IActionResult> GetCampaignWithdrawalSummary(int id)
        {
            if (!IsAdmin())
                return Forbid();

            try
            {
                var campaign = await _context.Campaigns.FindAsync(id);
                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                var totalWithdrawn = await _context.Withdrawals
                    .Where(w => w.CampaignId == id)
                    .SumAsync(w => w.Amount);

                var withdrawalCount = await _context.Withdrawals
                    .Where(w => w.CampaignId == id)
                    .CountAsync();

                var availableBalance = campaign.RaisedAmount - totalWithdrawn;

                var recentWithdrawals = await _context.Withdrawals
                    .Where(w => w.CampaignId == id)
                    .Include(w => w.WithdrawnByUser)
                    .OrderByDescending(w => w.WithdrawnAt)
                    .Take(5)
                    .Select(w => new
                    {
                        id = w.Id,
                        amount = w.Amount,
                        purpose = w.Purpose,
                        recipientName = w.RecipientName,
                        withdrawnAt = w.WithdrawnAt,
                        withdrawnBy = w.WithdrawnByUser != null ? $"{w.WithdrawnByUser.FirstName} {w.WithdrawnByUser.LastName}" : "Admin"
                    })
                    .ToListAsync();

                return Ok(new
                {
                    campaignTitle = campaign.Title,
                    raised = campaign.RaisedAmount,
                    withdrawn = totalWithdrawn,
                    available = availableBalance,
                    withdrawalCount = withdrawalCount,
                    recentWithdrawals = recentWithdrawals
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}

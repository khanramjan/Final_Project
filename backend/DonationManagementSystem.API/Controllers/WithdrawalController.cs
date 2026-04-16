using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.DTOs;
using System.Data;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FinancialController : ControllerBase
    {
        private readonly AppDbContext _context;

        private const string PendingStatus = "pending";
        private const string ApprovedStatus = "approved";
        private const string CompletedStatus = "completed";
        private const string RejectedStatus = "rejected";
        private const string CancelledStatus = "cancelled";
        private const decimal MinimumWithdrawalAmount = 10m;
        private const decimal SingleWithdrawalLimit = 500000m;
        private const decimal DailyWithdrawalLimit = 2000000m;

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
        /// Public: Get all reserve fund entries with pagination
        /// GET: api/financial/reserve-fund/all?page=1&pageSize=20
        /// </summary>
        [HttpGet("reserve-fund/all")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPublicReserveFundPaginated([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
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
                        campaignTitle = r.Campaign != null ? r.Campaign.Title : "N/A",
                        donorName = r.DonorName ?? "Anonymous",
                        sourceDescription = r.SourceDescription,
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

                // Completed withdrawals reduce available balance. Pending/approved remain visible but do not reduce cards.
                Dictionary<int, decimal> completedWithdrawalsByCampaign = new Dictionary<int, decimal>();
                Dictionary<int, decimal> pendingWithdrawalsByCampaign = new Dictionary<int, decimal>();
                Dictionary<int, decimal> approvedWithdrawalsByCampaign = new Dictionary<int, decimal>();
                try
                {
                    completedWithdrawalsByCampaign = await _context.Withdrawals
                        .Where(w => w.Status == CompletedStatus)
                        .GroupBy(w => w.CampaignId)
                        .Select(g => new { CampaignId = g.Key, Total = g.Sum(w => w.Amount) })
                        .ToDictionaryAsync(x => x.CampaignId, x => x.Total);

                    pendingWithdrawalsByCampaign = await _context.Withdrawals
                        .Where(w => w.Status == PendingStatus)
                        .GroupBy(w => w.CampaignId)
                        .Select(g => new { CampaignId = g.Key, Total = g.Sum(w => w.Amount) })
                        .ToDictionaryAsync(x => x.CampaignId, x => x.Total);

                    approvedWithdrawalsByCampaign = await _context.Withdrawals
                        .Where(w => w.Status == ApprovedStatus)
                        .GroupBy(w => w.CampaignId)
                        .Select(g => new { CampaignId = g.Key, Total = g.Sum(w => w.Amount) })
                        .ToDictionaryAsync(x => x.CampaignId, x => x.Total);
                }
                catch
                {
                    // Withdrawals table might not exist in early environments.
                }

                var campaigns = campaignsList.Select(c =>
                {
                    var completed = completedWithdrawalsByCampaign.GetValueOrDefault(c.id, 0);
                    var pending = pendingWithdrawalsByCampaign.GetValueOrDefault(c.id, 0);
                    var approved = approvedWithdrawalsByCampaign.GetValueOrDefault(c.id, 0);

                    return new
                    {
                        c.id,
                        c.title,
                        c.status,
                        c.targetAmount,
                        c.raisedAmount,
                        c.donationCount,
                        withdrawn = completed,
                        pending,
                        approved,
                        available = c.raisedAmount - completed,
                        c.createdAt
                    };
                }).ToList();

                // Reserve fund data is optional in early/partially-migrated environments.
                decimal reserveFund = 0m;
                List<object> recentReserveEntries = new List<object>();

                try
                {
                    reserveFund = await _context.ReserveFunds
                        .SumAsync(r => (decimal?)r.Amount) ?? 0m;

                    recentReserveEntries = await _context.ReserveFunds
                        .Include(r => r.Campaign)
                        .OrderByDescending(r => r.CreatedAt)
                        .Take(10)
                        .Select(r => (object)new
                        {
                            id = r.Id,
                            amount = r.Amount,
                            campaignTitle = r.Campaign != null ? r.Campaign.Title : "N/A",
                            donorName = r.DonorName,
                            sourceDescription = r.SourceDescription,
                            createdAt = r.CreatedAt
                        })
                        .ToListAsync();
                }
                catch
                {
                    // Ignore reserve-fund query failures and continue with campaign balances.
                }

                // Calculate totals
                var totalInCampaigns = campaigns.Sum(c => c.raisedAmount);
                var totalInSystem = totalInCampaigns + reserveFund;

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
        /// Admin: Create a withdrawal request in pending state
        /// POST: api/financial/withdrawals
        /// </summary>
        [HttpPost("withdrawals")]
        public async Task<IActionResult> CreateWithdrawal([FromBody] CreateWithdrawalDto dto)
        {
            if (!IsAdmin())
                return Forbid();

            if (!TryGetAdminUserId(out int adminId))
                return Unauthorized(new { message = "Invalid user" });

            if (!HasMaxTwoDecimalPlaces(dto.Amount))
                return BadRequest(new { message = "Amount can have at most 2 decimal places" });

            if (dto.Amount < MinimumWithdrawalAmount)
                return BadRequest(new { message = $"Minimum withdrawal amount is ৳{MinimumWithdrawalAmount:N2}" });

            if (dto.Amount > SingleWithdrawalLimit)
                return BadRequest(new { message = $"Single withdrawal limit is ৳{SingleWithdrawalLimit:N2}" });

            try
            {
                await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

                var campaign = await _context.Campaigns
                    .FirstOrDefaultAsync(c => c.Id == dto.CampaignId);

                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                var totalCompletedWithdrawn = await _context.Withdrawals
                    .Where(w => w.CampaignId == dto.CampaignId && w.Status == CompletedStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var availableBalance = campaign.RaisedAmount - totalCompletedWithdrawn;

                if (dto.Amount > availableBalance)
                {
                    return BadRequest(new 
                    { 
                        message = $"Insufficient funds. Available: ৳{availableBalance:N2}, Requested: ৳{dto.Amount:N2}" 
                    });
                }

                var dayStart = DateTime.UtcNow.Date;
                var dayEnd = dayStart.AddDays(1);
                var currentDayRequested = await _context.Withdrawals
                    .Where(w => w.CreatedAt >= dayStart
                                && w.CreatedAt < dayEnd
                                && w.Status != RejectedStatus
                                && w.Status != CancelledStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                if (currentDayRequested + dto.Amount > DailyWithdrawalLimit)
                {
                    return BadRequest(new
                    {
                        message = $"Daily withdrawal limit exceeded. Limit: ৳{DailyWithdrawalLimit:N2}, Current Requested: ৳{currentDayRequested:N2}"
                    });
                }

                var now = DateTime.UtcNow;
                var sourceIp = HttpContext.Connection.RemoteIpAddress?.ToString();

                var withdrawal = new Withdrawal
                {
                    Amount = dto.Amount,
                    CampaignId = dto.CampaignId,
                    Purpose = dto.Purpose,
                    RecipientName = dto.RecipientName,
                    RecipientPhone = dto.RecipientPhone,
                    RecipientAddress = dto.RecipientAddress,
                    Notes = dto.Notes,
                    Status = PendingStatus,
                    ReferenceNumber = await GenerateUniqueReferenceNumberAsync(),
                    IpAddress = sourceIp,
                    WithdrawnAt = now,
                    WithdrawnBy = adminId,
                    CreatedAt = now,
                    UpdatedAt = now
                };

                _context.Withdrawals.Add(withdrawal);
                await _context.SaveChangesAsync();

                AddAuditLog(
                    action: "withdrawal.create.pending",
                    entityId: withdrawal.Id,
                    userId: adminId,
                    ipAddress: sourceIp,
                    newValues: new
                    {
                        withdrawal.ReferenceNumber,
                        withdrawal.Status,
                        withdrawal.Amount,
                        withdrawal.CampaignId,
                        availableBalance,
                        currentDayRequested
                    });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Withdrawal request submitted for approval",
                    withdrawalId = withdrawal.Id,
                    status = withdrawal.Status,
                    referenceNumber = withdrawal.ReferenceNumber
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Approve a pending withdrawal. Calling approve again moves approved to completed.
        /// POST: api/financial/withdrawals/{id}/approve
        /// </summary>
        [HttpPost("withdrawals/{id}/approve")]
        public async Task<IActionResult> ApproveWithdrawal(int id, [FromBody] ApproveWithdrawalDto? dto)
        {
            if (!IsAdmin())
                return Forbid();

            if (!TryGetAdminUserId(out int adminId))
                return Unauthorized(new { message = "Invalid user" });

            try
            {
                await using var transaction = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);

                var withdrawal = await _context.Withdrawals
                    .Include(w => w.Campaign)
                    .FirstOrDefaultAsync(w => w.Id == id);

                if (withdrawal == null)
                    return NotFound(new { message = "Withdrawal not found" });

                if (withdrawal.WithdrawnBy == adminId)
                    return BadRequest(new { message = "Maker-checker policy violation: you cannot approve your own withdrawal request." });

                if (withdrawal.Status == RejectedStatus || withdrawal.Status == CancelledStatus || withdrawal.Status == CompletedStatus)
                    return BadRequest(new { message = $"Cannot approve withdrawal in '{withdrawal.Status}' state" });

                var oldValues = new
                {
                    withdrawal.Status,
                    withdrawal.ApprovedBy,
                    withdrawal.ApprovedAt,
                    withdrawal.WithdrawnAt
                };

                var sourceIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                var now = DateTime.UtcNow;

                if (withdrawal.Status == PendingStatus)
                {
                    var reservedAmount = await _context.Withdrawals
                        .Where(w => w.CampaignId == withdrawal.CampaignId
                                    && w.Id != withdrawal.Id
                                    && (w.Status == ApprovedStatus || w.Status == CompletedStatus))
                        .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                    var availableForApproval = (withdrawal.Campaign?.RaisedAmount ?? 0m) - reservedAmount;
                    if (withdrawal.Amount > availableForApproval)
                    {
                        return BadRequest(new
                        {
                            message = $"Insufficient funds at approval time. Available: ৳{availableForApproval:N2}, Requested: ৳{withdrawal.Amount:N2}"
                        });
                    }

                    withdrawal.Status = ApprovedStatus;
                    withdrawal.ApprovedBy = adminId;
                    withdrawal.ApprovedAt = now;
                    withdrawal.UpdatedAt = now;

                    AddAuditLog(
                        action: "withdrawal.approved",
                        entityId: withdrawal.Id,
                        userId: adminId,
                        ipAddress: sourceIp,
                        oldValues: oldValues,
                        newValues: new
                        {
                            withdrawal.Status,
                            withdrawal.ApprovedBy,
                            withdrawal.ApprovedAt,
                            reason = dto?.Reason
                        });

                    await _context.SaveChangesAsync();
                    await transaction.CommitAsync();

                    return Ok(new
                    {
                        message = "Withdrawal approved. Approve once more to mark it completed.",
                        status = withdrawal.Status,
                        referenceNumber = withdrawal.ReferenceNumber
                    });
                }

                var completedAmount = await _context.Withdrawals
                    .Where(w => w.CampaignId == withdrawal.CampaignId
                                && w.Id != withdrawal.Id
                                && w.Status == CompletedStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var availableForCompletion = (withdrawal.Campaign?.RaisedAmount ?? 0m) - completedAmount;
                if (withdrawal.Amount > availableForCompletion)
                {
                    return BadRequest(new
                    {
                        message = $"Insufficient funds at completion time. Available: ৳{availableForCompletion:N2}, Requested: ৳{withdrawal.Amount:N2}"
                    });
                }

                withdrawal.Status = CompletedStatus;
                withdrawal.WithdrawnAt = now;
                withdrawal.UpdatedAt = now;

                AddAuditLog(
                    action: "withdrawal.completed",
                    entityId: withdrawal.Id,
                    userId: adminId,
                    ipAddress: sourceIp,
                    oldValues: oldValues,
                    newValues: new
                    {
                        withdrawal.Status,
                        withdrawal.WithdrawnAt,
                        reason = dto?.Reason
                    });

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    message = "Withdrawal marked as completed",
                    status = withdrawal.Status,
                    referenceNumber = withdrawal.ReferenceNumber
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Reject a withdrawal request.
        /// POST: api/financial/withdrawals/{id}/reject
        /// </summary>
        [HttpPost("withdrawals/{id}/reject")]
        public async Task<IActionResult> RejectWithdrawal(int id, [FromBody] RejectWithdrawalDto dto)
        {
            if (!IsAdmin())
                return Forbid();

            if (!TryGetAdminUserId(out int adminId))
                return Unauthorized(new { message = "Invalid user" });

            if (string.IsNullOrWhiteSpace(dto.Reason))
                return BadRequest(new { message = "Rejection reason is required" });

            try
            {
                var withdrawal = await _context.Withdrawals.FirstOrDefaultAsync(w => w.Id == id);
                if (withdrawal == null)
                    return NotFound(new { message = "Withdrawal not found" });

                if (withdrawal.WithdrawnBy == adminId)
                    return BadRequest(new { message = "Maker-checker policy violation: you cannot reject your own withdrawal request." });

                if (withdrawal.Status == CompletedStatus || withdrawal.Status == CancelledStatus || withdrawal.Status == RejectedStatus)
                    return BadRequest(new { message = $"Cannot reject withdrawal in '{withdrawal.Status}' state" });

                var sourceIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                var oldValues = new { withdrawal.Status, withdrawal.RejectionReason };

                withdrawal.Status = RejectedStatus;
                withdrawal.RejectionReason = dto.Reason.Trim();
                withdrawal.UpdatedAt = DateTime.UtcNow;

                AddAuditLog(
                    action: "withdrawal.rejected",
                    entityId: withdrawal.Id,
                    userId: adminId,
                    ipAddress: sourceIp,
                    oldValues: oldValues,
                    newValues: new { withdrawal.Status, withdrawal.RejectionReason });

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Withdrawal rejected",
                    status = withdrawal.Status,
                    referenceNumber = withdrawal.ReferenceNumber
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Cancel a pending withdrawal request.
        /// POST: api/financial/withdrawals/{id}/cancel
        /// </summary>
        [HttpPost("withdrawals/{id}/cancel")]
        public async Task<IActionResult> CancelWithdrawal(int id, [FromBody] CancelWithdrawalDto? dto)
        {
            if (!IsAdmin())
                return Forbid();

            if (!TryGetAdminUserId(out int adminId))
                return Unauthorized(new { message = "Invalid user" });

            try
            {
                var withdrawal = await _context.Withdrawals.FirstOrDefaultAsync(w => w.Id == id);
                if (withdrawal == null)
                    return NotFound(new { message = "Withdrawal not found" });

                if (withdrawal.Status != PendingStatus)
                    return BadRequest(new { message = "Only pending withdrawals can be cancelled" });

                var sourceIp = HttpContext.Connection.RemoteIpAddress?.ToString();
                var oldValues = new { withdrawal.Status, withdrawal.CancelledBy, withdrawal.CancelledAt };

                withdrawal.Status = CancelledStatus;
                withdrawal.CancelledBy = adminId;
                withdrawal.CancelledAt = DateTime.UtcNow;
                withdrawal.UpdatedAt = DateTime.UtcNow;

                if (!string.IsNullOrWhiteSpace(dto?.Reason))
                {
                    withdrawal.RejectionReason = dto.Reason.Trim();
                }

                AddAuditLog(
                    action: "withdrawal.cancelled",
                    entityId: withdrawal.Id,
                    userId: adminId,
                    ipAddress: sourceIp,
                    oldValues: oldValues,
                    newValues: new
                    {
                        withdrawal.Status,
                        withdrawal.CancelledBy,
                        withdrawal.CancelledAt,
                        reason = dto?.Reason
                    });

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Withdrawal cancelled",
                    status = withdrawal.Status,
                    referenceNumber = withdrawal.ReferenceNumber
                });
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
        public async Task<IActionResult> GetWithdrawals(
            [FromQuery] int? campaignId,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            if (!IsAdmin())
                return Forbid();

            try
            {
                var normalizedStatus = NormalizeStatus(status);
                if (!string.IsNullOrWhiteSpace(status) && !string.Equals(status, "all", StringComparison.OrdinalIgnoreCase) && normalizedStatus == null)
                {
                    return BadRequest(new { message = "Invalid status filter" });
                }

                var scopedQuery = _context.Withdrawals.AsQueryable();
                if (campaignId.HasValue)
                {
                    scopedQuery = scopedQuery.Where(w => w.CampaignId == campaignId.Value);
                }

                var query = scopedQuery
                    .Include(w => w.Campaign)
                    .Include(w => w.WithdrawnByUser)
                    .Include(w => w.ApprovedByUser)
                    .Include(w => w.CancelledByUser)
                    .AsQueryable();

                if (normalizedStatus != null)
                {
                    query = query.Where(w => w.Status == normalizedStatus);
                }

                var total = await query.CountAsync();
                
                var withdrawals = await query
                    .OrderByDescending(w => w.CreatedAt)
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
                        Status = w.Status,
                        ReferenceNumber = w.ReferenceNumber,
                        WithdrawnAt = w.WithdrawnAt,
                        WithdrawnBy = w.WithdrawnBy,
                        WithdrawnByName = w.WithdrawnByUser != null ? $"{w.WithdrawnByUser.FirstName} {w.WithdrawnByUser.LastName}" : "Admin",
                        ApprovedBy = w.ApprovedBy,
                        ApprovedByName = w.ApprovedByUser != null ? $"{w.ApprovedByUser.FirstName} {w.ApprovedByUser.LastName}" : null,
                        ApprovedAt = w.ApprovedAt,
                        RejectionReason = w.RejectionReason,
                        CancelledBy = w.CancelledBy,
                        CancelledByName = w.CancelledByUser != null ? $"{w.CancelledByUser.FirstName} {w.CancelledByUser.LastName}" : null,
                        CancelledAt = w.CancelledAt,
                        IpAddress = w.IpAddress,
                        CreatedAt = w.CreatedAt,
                        UpdatedAt = w.UpdatedAt
                    })
                    .ToListAsync();

                var completedWithdrawn = await scopedQuery
                    .Where(w => w.Status == CompletedStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var pendingAmount = await scopedQuery
                    .Where(w => w.Status == PendingStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var approvedAmount = await scopedQuery
                    .Where(w => w.Status == ApprovedStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var rejectedAmount = await scopedQuery
                    .Where(w => w.Status == RejectedStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var cancelledAmount = await scopedQuery
                    .Where(w => w.Status == CancelledStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                return Ok(new
                {
                    withdrawals = withdrawals,
                    totals = new
                    {
                        completedWithdrawn,
                        pendingAmount,
                        approvedAmount,
                        rejectedAmount,
                        cancelledAmount
                    },
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

                var completedWithdrawn = await _context.Withdrawals
                    .Where(w => w.CampaignId == id && w.Status == CompletedStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var pendingAmount = await _context.Withdrawals
                    .Where(w => w.CampaignId == id && w.Status == PendingStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var approvedAmount = await _context.Withdrawals
                    .Where(w => w.CampaignId == id && w.Status == ApprovedStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var rejectedAmount = await _context.Withdrawals
                    .Where(w => w.CampaignId == id && w.Status == RejectedStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var cancelledAmount = await _context.Withdrawals
                    .Where(w => w.CampaignId == id && w.Status == CancelledStatus)
                    .SumAsync(w => (decimal?)w.Amount) ?? 0m;

                var withdrawalCount = await _context.Withdrawals
                    .Where(w => w.CampaignId == id)
                    .CountAsync();

                var availableBalance = campaign.RaisedAmount - completedWithdrawn;

                var recentWithdrawals = await _context.Withdrawals
                    .Where(w => w.CampaignId == id)
                    .Include(w => w.WithdrawnByUser)
                    .Include(w => w.ApprovedByUser)
                    .Include(w => w.CancelledByUser)
                    .OrderByDescending(w => w.CreatedAt)
                    .Take(5)
                    .Select(w => new
                    {
                        id = w.Id,
                        referenceNumber = w.ReferenceNumber,
                        status = w.Status,
                        amount = w.Amount,
                        purpose = w.Purpose,
                        recipientName = w.RecipientName,
                        withdrawnAt = w.WithdrawnAt,
                        withdrawnBy = w.WithdrawnByUser != null ? $"{w.WithdrawnByUser.FirstName} {w.WithdrawnByUser.LastName}" : "Admin",
                        approvedBy = w.ApprovedByUser != null ? $"{w.ApprovedByUser.FirstName} {w.ApprovedByUser.LastName}" : null,
                        approvedAt = w.ApprovedAt,
                        cancelledBy = w.CancelledByUser != null ? $"{w.CancelledByUser.FirstName} {w.CancelledByUser.LastName}" : null,
                        cancelledAt = w.CancelledAt
                    })
                    .ToListAsync();

                return Ok(new
                {
                    campaignTitle = campaign.Title,
                    raised = campaign.RaisedAmount,
                    withdrawn = completedWithdrawn,
                    available = availableBalance,
                    pendingAmount,
                    approvedAmount,
                    rejectedAmount,
                    cancelledAmount,
                    withdrawalCount = withdrawalCount,
                    recentWithdrawals = recentWithdrawals
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private bool TryGetAdminUserId(out int adminId)
        {
            var adminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(adminIdClaim, out adminId);
        }

        private static bool HasMaxTwoDecimalPlaces(decimal amount)
        {
            return decimal.Round(amount, 2) == amount;
        }

        private async Task<string> GenerateUniqueReferenceNumberAsync()
        {
            for (var i = 0; i < 10; i++)
            {
                var randomBytes = RandomNumberGenerator.GetBytes(3);
                var candidate = $"WD-{DateTime.UtcNow:yyyyMMdd}-{Convert.ToHexString(randomBytes)}";
                var exists = await _context.Withdrawals.AnyAsync(w => w.ReferenceNumber == candidate);
                if (!exists)
                {
                    return candidate;
                }
            }

            throw new InvalidOperationException("Failed to generate unique withdrawal reference number");
        }

        private static string? NormalizeStatus(string? status)
        {
            if (string.IsNullOrWhiteSpace(status) || string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
                return null;

            var normalized = status.Trim().ToLowerInvariant();
            return normalized switch
            {
                PendingStatus => PendingStatus,
                ApprovedStatus => ApprovedStatus,
                CompletedStatus => CompletedStatus,
                RejectedStatus => RejectedStatus,
                CancelledStatus => CancelledStatus,
                _ => null
            };
        }

        private void AddAuditLog(string action, int entityId, int userId, string? ipAddress, object? oldValues = null, object? newValues = null)
        {
            _context.AuditLogs.Add(new AuditLog
            {
                Action = action,
                EntityType = "Withdrawal",
                EntityId = entityId,
                OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                IpAddress = ipAddress,
                UserAgent = Request.Headers.UserAgent.ToString(),
                CreatedAt = DateTime.UtcNow,
                UserId = userId
            });
        }
    }
}

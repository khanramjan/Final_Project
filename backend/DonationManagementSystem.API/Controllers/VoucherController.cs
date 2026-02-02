using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public class VoucherController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<VoucherController> _logger;
        private readonly IWebHostEnvironment _env;

        public VoucherController(AppDbContext context, ILogger<VoucherController> logger, IWebHostEnvironment env)
        {
            _context = context;
            _logger = logger;
            _env = env;
        }

        // ===== HELPER METHODS =====

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
            {
                return userId;
            }
            return null;
        }

        private bool IsAdmin()
        {
            return User.HasClaim(c => c.Type == ClaimTypes.Role && c.Value == "admin");
        }

        private VoucherResponseDto MapToVoucherResponseDto(Voucher voucher)
        {
            return new VoucherResponseDto
            {
                Id = voucher.Id,
                CampaignId = voucher.CampaignId,
                CampaignTitle = voucher.Campaign?.Title ?? "N/A",
                VolunteerId = voucher.VolunteerId,
                VolunteerName = $"{voucher.Volunteer?.FirstName} {voucher.Volunteer?.LastName}",
                VolunteerEmail = voucher.Volunteer?.Email ?? "N/A",
                Amount = voucher.Amount,
                Description = voucher.Description,
                ExpenseDate = voucher.ExpenseDate,
                Category = voucher.Category,
                ReceiptPath = voucher.ReceiptPath,
                ReceiptFileName = voucher.ReceiptFileName,
                Status = voucher.Status,
                ReviewedBy = voucher.ReviewedBy,
                ReviewerName = voucher.Reviewer != null ? $"{voucher.Reviewer.FirstName} {voucher.Reviewer.LastName}" : null,
                ReviewedAt = voucher.ReviewedAt,
                AdminFeedback = voucher.AdminFeedback,
                IsRequestedByAdmin = voucher.IsRequestedByAdmin,
                RequestNote = voucher.RequestNote,
                CreatedAt = voucher.CreatedAt,
                UpdatedAt = voucher.UpdatedAt,
                Items = voucher.Items?.Select(i => new VoucherItemDto
                {
                    ItemName = i.ItemName,
                    Price = i.Price,
                    Quantity = i.Quantity,
                    PurchaseDate = i.PurchaseDate,
                    Notes = i.Notes
                }).ToList() ?? new List<VoucherItemDto>()
            };
        }

        // ===== VOLUNTEER ENDPOINTS =====

        /// <summary>
        /// Volunteer submits a voucher for expense reimbursement
        /// </summary>
        [HttpPost("submit")]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<VoucherResponseDto>> SubmitVoucher([FromForm] SubmitVoucherDto dto, [FromForm] string? items, IFormFile? receipt)
        {
            try
            {
                _logger.LogInformation("=== VOUCHER SUBMIT CALLED ===");
                _logger.LogInformation("Campaign ID: {CampaignId}", dto.CampaignId);
                _logger.LogInformation("Amount: {Amount}", dto.Amount);
                _logger.LogInformation("Receipt: {Receipt}", receipt?.FileName ?? "No receipt");
                _logger.LogInformation("Items JSON: {Items}", items ?? "NULL");
                _logger.LogInformation("Items Length: {Length}", items?.Length ?? 0);

                var userId = GetCurrentUserId();
                _logger.LogInformation("User ID: {UserId}", userId);
                if (userId == null) return Unauthorized();

                // Verify campaign exists and is completed
                var campaign = await _context.Campaigns.FindAsync(dto.CampaignId);
                if (campaign == null)
                {
                    _logger.LogWarning("Campaign {CampaignId} not found", dto.CampaignId);
                    return NotFound(new { message = "Campaign not found" });
                }

                if (campaign.Status != "completed")
                {
                    _logger.LogWarning("Campaign {CampaignId} is not completed (status: {Status})", dto.CampaignId, campaign.Status);
                    return BadRequest(new { message = "Can only report vouchers for completed campaigns" });
                }

                // Verify user is a volunteer assigned to this campaign
                var assignment = await _context.VolunteerAssignments
                    .Include(va => va.VolunteerProfile)
                    .FirstOrDefaultAsync(va => va.CampaignId == dto.CampaignId && va.VolunteerProfile.UserId == userId);
                
                _logger.LogInformation("Assignment found: {Found}", assignment != null);
                if (assignment == null)
                    return BadRequest(new { message = "You are not assigned to this campaign" });

                // Handle receipt upload
                string? receiptPath = null;
                string? receiptFileName = null;

                if (receipt != null && receipt.Length > 0)
                {
                    var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "vouchers");
                    Directory.CreateDirectory(uploadsFolder);

                    receiptFileName = $"{Guid.NewGuid()}_{receipt.FileName}";
                    receiptPath = Path.Combine(uploadsFolder, receiptFileName);

                    using (var stream = new FileStream(receiptPath, FileMode.Create))
                    {
                        await receipt.CopyToAsync(stream);
                    }

                    receiptPath = $"/uploads/vouchers/{receiptFileName}";
                }

                var voucher = new Voucher
                {
                    CampaignId = dto.CampaignId,
                    VolunteerId = userId.Value,
                    Amount = dto.Amount,
                    Description = dto.Description,
                    ExpenseDate = dto.ExpenseDate,
                    Category = dto.Category,
                    ReceiptPath = receiptPath,
                    ReceiptFileName = receiptFileName,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Vouchers.Add(voucher);
                await _context.SaveChangesAsync();

                // Add voucher items if provided
                if (!string.IsNullOrEmpty(items))
                {
                    try
                    {
                        _logger.LogInformation("Parsing items JSON...");
                        var itemList = System.Text.Json.JsonSerializer.Deserialize<List<VoucherItemDto>>(items);
                        _logger.LogInformation("Parsed {Count} items", itemList?.Count ?? 0);
                        if (itemList != null && itemList.Any())
                        {
                            foreach (var itemDto in itemList)
                            {
                                _logger.LogInformation("Adding item: {Name}, Price: {Price}, Qty: {Qty}, Date: {Date}", 
                                    itemDto.ItemName, itemDto.Price, itemDto.Quantity, itemDto.PurchaseDate);
                                var item = new VoucherItem
                                {
                                    VoucherId = voucher.Id,
                                    ItemName = itemDto.ItemName,
                                    Price = itemDto.Price,
                                    Quantity = itemDto.Quantity,
                                    PurchaseDate = itemDto.PurchaseDate,
                                    Notes = itemDto.Notes
                                };
                                _context.VoucherItems.Add(item);
                            }
                            await _context.SaveChangesAsync();
                            _logger.LogInformation("Voucher items saved successfully");
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error parsing voucher items");
                    }
                }
                else
                {
                    _logger.LogWarning("Items is null or empty!");
                }

                // Reload with navigation properties
                voucher = await _context.Vouchers
                    .Include(v => v.Campaign)
                    .Include(v => v.Volunteer)
                    .Include(v => v.Items)
                    .FirstOrDefaultAsync(v => v.Id == voucher.Id);

                _logger.LogInformation("Volunteer {VolunteerId} submitted voucher {VoucherId} for campaign {CampaignId}", 
                    userId, voucher!.Id, dto.CampaignId);

                return Ok(MapToVoucherResponseDto(voucher));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error submitting voucher");
                return StatusCode(500, new { message = "An error occurred while submitting the voucher", error = ex.Message });
            }
        }

        /// <summary>
        /// Get all vouchers submitted by current volunteer
        /// </summary>
        [HttpGet("my-vouchers")]
        public async Task<ActionResult<List<VoucherResponseDto>>> GetMyVouchers()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var vouchers = await _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .Include(v => v.Reviewer)
                .Include(v => v.Items)
                .Where(v => v.VolunteerId == userId)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();

            return Ok(vouchers.Select(MapToVoucherResponseDto).ToList());
        }

        /// <summary>
        /// Get voucher requests sent to current volunteer by admin
        /// </summary>
        [HttpGet("my-requests")]
        public async Task<ActionResult<List<VoucherResponseDto>>> GetMyVoucherRequests()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var requests = await _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .Include(v => v.Requester)
                .Include(v => v.Items)
                .Where(v => v.VolunteerId == userId && v.IsRequestedByAdmin && v.Status == "requested")
                .OrderByDescending(v => v.RequestedAt)
                .ToListAsync();

            return Ok(requests.Select(MapToVoucherResponseDto).ToList());
        }

        // ===== ADMIN ENDPOINTS =====

        /// <summary>
        /// Admin gets all pending vouchers for review
        /// </summary>
        [HttpGet("pending")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<List<VoucherResponseDto>>> GetPendingVouchers()
        {
            var vouchers = await _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .Include(v => v.Items)
                .Where(v => v.Status == "pending")
                .OrderBy(v => v.CreatedAt)
                .ToListAsync();

            return Ok(vouchers.Select(MapToVoucherResponseDto).ToList());
        }

        /// <summary>
        /// Admin gets all vouchers (with optional filters)
        /// </summary>
        [HttpGet("all")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<List<VoucherResponseDto>>> GetAllVouchers(
            [FromQuery] string? status = null,
            [FromQuery] int? campaignId = null,
            [FromQuery] int? volunteerId = null)
        {
            var query = _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .Include(v => v.Reviewer)
                .Include(v => v.Items)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(v => v.Status == status);

            if (campaignId.HasValue)
                query = query.Where(v => v.CampaignId == campaignId);

            if (volunteerId.HasValue)
                query = query.Where(v => v.VolunteerId == volunteerId);

            var vouchers = await query
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();

            return Ok(vouchers.Select(MapToVoucherResponseDto).ToList());
        }

        /// <summary>
        /// Admin approves or rejects a voucher
        /// </summary>
        [HttpPut("{id}/review")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<VoucherResponseDto>> ReviewVoucher(int id, [FromBody] ReviewVoucherDto dto)
        {
            var adminId = GetCurrentUserId();
            if (adminId == null) return Unauthorized();

            var voucher = await _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (voucher == null)
                return NotFound(new { message = "Voucher not found" });

            if (voucher.Status != "pending")
                return BadRequest(new { message = "Only pending vouchers can be reviewed" });

            if (dto.Action.ToLower() != "approve" && dto.Action.ToLower() != "reject")
                return BadRequest(new { message = "Action must be 'approve' or 'reject'" });

            voucher.Status = dto.Action.ToLower() == "approve" ? "approved" : "rejected";
            voucher.ReviewedBy = adminId;
            voucher.ReviewedAt = DateTime.UtcNow;
            voucher.AdminFeedback = dto.AdminFeedback;
            voucher.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Reload with reviewer
            voucher = await _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .Include(v => v.Reviewer)                .Include(v => v.Items)                .FirstOrDefaultAsync(v => v.Id == id);

            _logger.LogInformation("Admin {AdminId} {Action} voucher {VoucherId}", 
                adminId, dto.Action, id);

            return Ok(MapToVoucherResponseDto(voucher!));
        }

        /// <summary>
        /// Admin requests a voucher from a volunteer
        /// </summary>
        [HttpPost("request")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<VoucherResponseDto>> RequestVoucher([FromBody] RequestVoucherDto dto)
        {
            var adminId = GetCurrentUserId();
            if (adminId == null) return Unauthorized();

            // Verify campaign exists
            var campaign = await _context.Campaigns.FindAsync(dto.CampaignId);
            if (campaign == null)
                return NotFound(new { message = "Campaign not found" });

            // Verify volunteer exists and is assigned to campaign
            var assignment = await _context.VolunteerAssignments
                .Include(va => va.VolunteerProfile)
                .FirstOrDefaultAsync(va => va.CampaignId == dto.CampaignId && va.VolunteerProfile.UserId == dto.VolunteerId);
            
            if (assignment == null)
                return BadRequest(new { message = "Volunteer is not assigned to this campaign" });

            var voucher = new Voucher
            {
                CampaignId = dto.CampaignId,
                VolunteerId = dto.VolunteerId,
                Amount = 0, // Will be filled by volunteer
                Description = "Requested by admin",
                ExpenseDate = DateTime.UtcNow,
                Category = "Pending",
                Status = "requested",
                IsRequestedByAdmin = true,
                RequestedBy = adminId,
                RequestedAt = DateTime.UtcNow,
                RequestNote = dto.RequestNote,
                CreatedAt = DateTime.UtcNow
            };

            _context.Vouchers.Add(voucher);
            await _context.SaveChangesAsync();

            // Reload with navigation properties
            voucher = await _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .Include(v => v.Requester)
                .FirstOrDefaultAsync(v => v.Id == voucher.Id);

            _logger.LogInformation("Admin {AdminId} requested voucher from volunteer {VolunteerId} for campaign {CampaignId}", 
                adminId, dto.VolunteerId, dto.CampaignId);

            return Ok(MapToVoucherResponseDto(voucher!));
        }

        /// <summary>
        /// Volunteer updates a requested voucher
        /// </summary>
        [HttpPut("{id}/update-request")]
        public async Task<ActionResult<VoucherResponseDto>> UpdateRequestedVoucher(
            int id, 
            [FromForm] SubmitVoucherDto dto, 
            IFormFile? receipt)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var voucher = await _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (voucher == null)
                return NotFound(new { message = "Voucher not found" });

            if (voucher.VolunteerId != userId)
                return Forbid();

            if (voucher.Status != "requested")
                return BadRequest(new { message = "Only requested vouchers can be updated" });

            // Handle receipt upload
            if (receipt != null && receipt.Length > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? "wwwroot", "uploads", "vouchers");
                Directory.CreateDirectory(uploadsFolder);

                var receiptFileName = $"{Guid.NewGuid()}_{receipt.FileName}";
                var receiptPath = Path.Combine(uploadsFolder, receiptFileName);

                using (var stream = new FileStream(receiptPath, FileMode.Create))
                {
                    await receipt.CopyToAsync(stream);
                }

                voucher.ReceiptPath = $"/uploads/vouchers/{receiptFileName}";
                voucher.ReceiptFileName = receiptFileName;
            }

            // Update voucher details
            voucher.Amount = dto.Amount;
            voucher.Description = dto.Description;
            voucher.ExpenseDate = dto.ExpenseDate;
            voucher.Category = dto.Category;
            voucher.Status = "pending"; // Change to pending for admin review
            voucher.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Volunteer {VolunteerId} updated requested voucher {VoucherId}", 
                userId, id);

            return Ok(MapToVoucherResponseDto(voucher));
        }

        // ===== PUBLIC ENDPOINTS =====

        /// <summary>
        /// Get approved vouchers for a campaign (public)
        /// </summary>
        [HttpGet("campaign/{campaignId}")]
        [AllowAnonymous]
        public async Task<ActionResult<VoucherSummaryDto>> GetCampaignVouchers(int campaignId)
        {
            var vouchers = await _context.Vouchers
                .Include(v => v.Volunteer)
                .Where(v => v.CampaignId == campaignId && v.Status == "approved")
                .OrderByDescending(v => v.ReviewedAt)
                .ToListAsync();

            var summary = new VoucherSummaryDto
            {
                TotalVouchers = vouchers.Count,
                TotalExpenditure = vouchers.Sum(v => v.Amount),
                Vouchers = vouchers.Select(v => new VoucherPublicDto
                {
                    Id = v.Id,
                    VolunteerName = $"{v.Volunteer.FirstName} {v.Volunteer.LastName}",
                    Amount = v.Amount,
                    Description = v.Description,
                    ExpenseDate = v.ExpenseDate,
                    Category = v.Category,
                    ApprovedAt = v.ReviewedAt ?? DateTime.UtcNow
                }).ToList()
            };

            return Ok(summary);
        }

        /// <summary>
        /// Get voucher details by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<VoucherResponseDto>> GetVoucherById(int id)
        {
            var userId = GetCurrentUserId();
            var isAdmin = IsAdmin();

            var voucher = await _context.Vouchers
                .Include(v => v.Campaign)
                .Include(v => v.Volunteer)
                .Include(v => v.Reviewer)
                .Include(v => v.Requester)
                .FirstOrDefaultAsync(v => v.Id == id);

            if (voucher == null)
                return NotFound(new { message = "Voucher not found" });

            // Only admin or the volunteer who created it can view details
            if (!isAdmin && voucher.VolunteerId != userId)
                return Forbid();

            return Ok(MapToVoucherResponseDto(voucher));
        }

        /// <summary>
        /// Delete a voucher (only if pending and created by current user, or if admin)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var isAdmin = IsAdmin();

            var voucher = await _context.Vouchers.FindAsync(id);
            if (voucher == null)
                return NotFound(new { message = "Voucher not found" });

            // Only allow deletion if:
            // 1. Admin, OR
            // 2. Volunteer who created it AND status is pending or requested
            if (!isAdmin && (voucher.VolunteerId != userId || 
                (voucher.Status != "pending" && voucher.Status != "requested")))
            {
                return Forbid();
            }

            // Delete receipt file if exists
            if (!string.IsNullOrEmpty(voucher.ReceiptPath))
            {
                var fullPath = Path.Combine(_env.WebRootPath ?? "wwwroot", voucher.ReceiptPath.TrimStart('/'));
                if (System.IO.File.Exists(fullPath))
                {
                    System.IO.File.Delete(fullPath);
                }
            }

            _context.Vouchers.Remove(voucher);
            await _context.SaveChangesAsync();

            _logger.LogInformation("User {UserId} deleted voucher {VoucherId}", userId, id);

            return NoContent();
        }
    }
}

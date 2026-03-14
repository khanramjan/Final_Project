using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.DTOs;
using DonationManagementSystem.API.Services;
using DonationManagementSystem.API.Services.ML;
using System.Security.Claims;
using System.Text.RegularExpressions;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CampaignController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;
        private readonly IMLPredictionService _mlPredictionService;

        private static readonly HashSet<string> StopWords = new(StringComparer.OrdinalIgnoreCase)
        {
            "the", "and", "for", "that", "this", "with", "from", "have", "has", "was", "were", "been", "about", "your", "their",
            "very", "really", "just", "into", "when", "what", "where", "will", "would", "could", "should", "can", "cannot", "cant",
            "campaign", "donation", "donor", "volunteer", "they", "them", "our", "you", "are", "not", "but", "too", "all", "more"
        };

        public CampaignController(
            AppDbContext context,
            IEmailService emailService,
            IConfiguration config,
            IMLPredictionService mlPredictionService)
        {
            _context = context;
            _emailService = emailService;
            _config = config;
            _mlPredictionService = mlPredictionService;
        }

        private bool IsAdmin()
        {
            var userType = User.FindFirst("UserType")?.Value;
            Console.WriteLine($"Checking admin status: UserType claim = {userType}");
            return userType == "admin";
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            Console.WriteLine($"Getting user ID: NameIdentifier claim = {userIdClaim}");
            return int.Parse(userIdClaim ?? "0");
        }

        private string GetCurrentUserType() => User.FindFirst("UserType")?.Value?.ToLowerInvariant() ?? string.Empty;

        private bool IsDonorOrVolunteer()
        {
            var userType = GetCurrentUserType();
            return userType is "donor" or "volunteer";
        }

        // POST: api/campaign/admin/create
        [HttpPost("admin/create")]
        [Authorize]
        public async Task<IActionResult> CreateCampaign([FromForm] CreateCampaignDto dto)
        {
            Console.WriteLine($"=== Campaign Creation Request ===");
            Console.WriteLine($"Title: {dto.Title}");
            Console.WriteLine($"Description: {dto.Description}");
            Console.WriteLine($"TargetAmount: {dto.TargetAmount}");
            Console.WriteLine($"Category: {dto.Category}");
            Console.WriteLine($"HasImage: {dto.Image != null}");
            Console.WriteLine($"User Claims: {string.Join(", ", User.Claims.Select(c => $"{c.Type}={c.Value}"))}");
            
            if (!IsAdmin())
            {
                Console.WriteLine("Access denied - not admin");
                return Unauthorized(new { message = "Admin access required" });
            }

            try
            {
                var currentUserId = GetCurrentUserId();
                Console.WriteLine($"Current User ID: {currentUserId}");
                
                // Handle image upload
                string? imagePath = null;
                if (dto.Image != null)
                {
                    Console.WriteLine($"Processing image upload: {dto.Image.FileName}");
                    var uploads = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Campaigns");
                    if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
                    
                    var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
                    var filePath = Path.Combine(uploads, fileName);
                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Image.CopyToAsync(stream);
                    }
                    
                    imagePath = fileName;
                    Console.WriteLine($"Image saved as: {fileName}");
                }

                var campaign = new Campaign
                {
                    Title = dto.Title,
                    Description = dto.Description,
                    TargetAmount = dto.TargetAmount,
                    StartDate = string.IsNullOrEmpty(dto.StartDate) ? DateTime.UtcNow : DateTime.Parse(dto.StartDate),
                    EndDate = string.IsNullOrEmpty(dto.EndDate) ? DateTime.UtcNow.AddDays(30) : DateTime.Parse(dto.EndDate),
                    Category = dto.Category,
                    Location = dto.Location,
                    IsUrgent = dto.IsUrgent,
                    IsFeatured = dto.IsFeatured,
                    ImagePath = imagePath,
                    CreatedBy = currentUserId,
                    Status = "active", // Admin created campaigns are active by default
                    ApprovedBy = currentUserId,
                    ApprovedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    // Volunteer fields
                    NeedsVolunteers = dto.NeedsVolunteers,
                    PlatinumVolunteersNeeded = dto.PlatinumVolunteersNeeded,
                    GoldVolunteersNeeded = dto.GoldVolunteersNeeded,
                    SilverVolunteersNeeded = dto.SilverVolunteersNeeded,
                    BronzeVolunteersNeeded = dto.BronzeVolunteersNeeded,
                    NewbieVolunteersNeeded = dto.NewbieVolunteersNeeded,
                    AutoSendVolunteerRequests = dto.AutoSendVolunteerRequests
                };

                Console.WriteLine($"Campaign object created, saving to database...");
                Console.WriteLine($"NeedsVolunteers: {dto.NeedsVolunteers}");
                Console.WriteLine($"AutoSendVolunteerRequests: {dto.AutoSendVolunteerRequests}");
                Console.WriteLine($"PlatinumNeeded: {dto.PlatinumVolunteersNeeded}, GoldNeeded: {dto.GoldVolunteersNeeded}");
                
                _context.Campaigns.Add(campaign);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Campaign saved with ID: {campaign.Id}");

                // Send volunteer requests if auto-send is enabled
                Console.WriteLine($"Checking volunteer request conditions...");
                Console.WriteLine($"  AutoSendVolunteerRequests = {dto.AutoSendVolunteerRequests}");
                Console.WriteLine($"  NeedsVolunteers = {dto.NeedsVolunteers}");
                
                if (dto.AutoSendVolunteerRequests && dto.NeedsVolunteers)
                {
                    Console.WriteLine($"✅ CONDITIONS MET - Auto-sending volunteer requests for campaign {campaign.Id}");
                    await SendVolunteerRequests(campaign);
                }
                else
                {
                    Console.WriteLine($"❌ CONDITIONS NOT MET - Skipping volunteer requests");
                }

                return Ok(new
                {
                    message = "Campaign created successfully",
                    campaignId = campaign.Id
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating campaign: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Failed to create campaign", error = ex.Message });
            }
        }

        // GET: api/campaign/test
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Campaign controller is working", timestamp = DateTime.UtcNow });
        }

        // GET: api/campaign/public
        [HttpGet("public")]
        public async Task<IActionResult> GetPublicCampaigns(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? status = null,
            [FromQuery] string? category = null,
            [FromQuery] string? search = null)
        {
            try
            {
                Console.WriteLine($"=== GetPublicCampaigns called ===");
                Console.WriteLine($"Page: {page}, PageSize: {pageSize}");
                Console.WriteLine($"Status: {status}, Category: {category}, Search: {search}");
                
                // Fetch real campaigns from database
                var query = _context.Campaigns
                    .Include(c => c.Creator)
                    .Where(c => c.Status == "approved" || c.Status == "active" || c.Status == "completed"); // Show approved, active, and completed campaigns

                Console.WriteLine("Database query created");

                // Apply filters
                if (!string.IsNullOrEmpty(status) && status != "all")
                {
                    // Map frontend status to backend status
                    var mappedStatus = status switch
                    {
                        "active" => "approved",
                        "completed" => "completed",
                        "paused" => "paused",
                        _ => status
                    };
                    query = query.Where(c => c.Status == mappedStatus);
                }

                if (!string.IsNullOrEmpty(category) && category != "all")
                {
                    query = query.Where(c => c.Category.ToLower() == category.ToLower());
                }

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(c => c.Title.Contains(search) || c.Description.Contains(search));
                }

                var totalCount = await query.CountAsync();
                Console.WriteLine($"Total approved campaigns found: {totalCount}");
                
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                // Fetch campaigns with proper mapping - completed campaigns at the end
                var campaigns = await query
                    .OrderBy(c => c.Status == "completed" ? 1 : 0) // Completed campaigns last
                    .ThenByDescending(c => c.CreatedAt) // Then by creation date
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new
                    {
                        id = c.Id,
                        title = c.Title,
                        description = c.Description,
                        goalAmount = c.TargetAmount,
                        currentAmount = c.RaisedAmount,
                        startDate = c.StartDate.ToString("yyyy-MM-dd"),
                        endDate = c.EndDate.ToString("yyyy-MM-dd"),
                        status = c.Status == "approved" ? "active" : c.Status,
                        category = c.Category,
                        imageUrl = !string.IsNullOrEmpty(c.ImagePath) ? $"http://localhost:5000/api/campaign/image/{c.ImagePath}" : null,
                        donorCount = _context.Donations.Count(d => d.CampaignId == c.Id && d.Status == "completed"),
                        createdBy = c.Creator != null ? $"{c.Creator.FirstName} {c.Creator.LastName}" : "Unknown",
                        createdDate = c.CreatedAt.ToString("yyyy-MM-dd")
                    })
                    .ToListAsync();

                Console.WriteLine($"Retrieved {campaigns.Count} campaigns from database");

                var result = new
                {
                    campaigns,
                    totalCount,
                    page,
                    pageSize,
                    totalPages
                };

                Console.WriteLine("=== Returning real database data ===");
                return Ok(result);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching public campaigns: {ex.Message}");
                return StatusCode(500, new { message = "Failed to fetch campaigns", error = ex.Message });
            }
        }

        // GET: api/campaign/image/{fileName}
        [HttpGet("image/{fileName}")]
        public IActionResult GetCampaignImage(string fileName)
        {
            try
            {
                var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Campaigns");
                var filePath = Path.Combine(uploadsPath, fileName);

                if (!System.IO.File.Exists(filePath))
                {
                    return NotFound(new { message = "Image not found" });
                }

                var fileExtension = Path.GetExtension(fileName).ToLowerInvariant();
                var mimeType = fileExtension switch
                {
                    ".jpg" or ".jpeg" => "image/jpeg",
                    ".png" => "image/png",
                    ".gif" => "image/gif",
                    ".webp" => "image/webp",
                    _ => "application/octet-stream"
                };

                var fileBytes = System.IO.File.ReadAllBytes(filePath);
                return File(fileBytes, mimeType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error serving image: {ex.Message}");
                return NotFound(new { message = "Image not found" });
            }
        }

        // GET: api/campaign/admin/all
        [HttpGet("admin/all")]
        [Authorize]
        public async Task<IActionResult> GetAllCampaignsForAdmin(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? status = null,
            [FromQuery] string? category = null,
            [FromQuery] string? search = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            try
            {
                var query = _context.Campaigns
                    .Include(c => c.Creator)
                    .Include(c => c.Approver)
                    .Include(c => c.Donations)
                    .AsQueryable();

                // Apply filters
                if (!string.IsNullOrEmpty(status))
                    query = query.Where(c => c.Status == status);

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(c => c.Category == category);

                if (!string.IsNullOrEmpty(search))
                    query = query.Where(c => c.Title.Contains(search) || c.Description.Contains(search));

                if (startDate.HasValue)
                    query = query.Where(c => c.CreatedAt >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(c => c.CreatedAt <= endDate.Value);

                var totalCount = await query.CountAsync();
                var campaigns = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(c => new CampaignDto
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        ImagePath = c.ImagePath,
                        TargetAmount = c.TargetAmount,
                        RaisedAmount = c.RaisedAmount,
                        StartDate = c.StartDate,
                        EndDate = c.EndDate,
                        Status = c.Status,
                        Category = c.Category,
                        Location = c.Location,
                        IsUrgent = c.IsUrgent,
                        IsFeatured = c.IsFeatured,
                        CreatedAt = c.CreatedAt,
                        ApprovedAt = c.ApprovedAt,
                        CreatorName = $"{c.Creator.FirstName} {c.Creator.LastName}",
                        ApproverName = c.Approver != null ? $"{c.Approver.FirstName} {c.Approver.LastName}" : null,
                        ProgressPercentage = c.TargetAmount > 0 ? (c.RaisedAmount / c.TargetAmount) * 100 : 0,
                        DonationCount = c.Donations.Count,
                        DaysRemaining = (int)(c.EndDate - DateTime.UtcNow).TotalDays
                    })
                    .ToListAsync();

                return Ok(new
                {
                    campaigns = campaigns,
                    totalCount = totalCount,
                    page = page,
                    pageSize = pageSize,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch campaigns", error = ex.Message });
            }
        }

        // POST: api/campaign/admin/approve/{id}
        [HttpPost("admin/approve/{id}")]
        [Authorize]
        public async Task<IActionResult> ApproveCampaign(int id, [FromBody] CampaignApprovalDto dto)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            try
            {
                var campaign = await _context.Campaigns.FindAsync(id);
                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                if (campaign.Status != "pending")
                    return BadRequest(new { message = "Only pending campaigns can be approved/rejected" });

                var currentUserId = GetCurrentUserId();

                if (dto.IsApproved)
                {
                    campaign.Status = "approved";
                    campaign.ApprovedBy = currentUserId;
                    campaign.ApprovedAt = DateTime.UtcNow;
                    campaign.IsFeatured = dto.IsFeatured ?? false;
                    campaign.RejectionReason = null;
                }
                else
                {
                    campaign.Status = "rejected";
                    campaign.RejectionReason = dto.RejectionReason ?? "Campaign rejected by admin";
                }

                campaign.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = dto.IsApproved ? "Campaign approved successfully" : "Campaign rejected",
                    campaign = new
                    {
                        id = campaign.Id,
                        status = campaign.Status,
                        approvedAt = campaign.ApprovedAt,
                        isFeatured = campaign.IsFeatured,
                        rejectionReason = campaign.RejectionReason
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update campaign status", error = ex.Message });
            }
        }

        // PUT: api/campaign/admin/{id}
        [HttpPut("admin/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateCampaign(int id, [FromForm] UpdateCampaignDto dto)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            try
            {
                var campaign = await _context.Campaigns.FindAsync(id);
                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                // Update fields if provided
                if (!string.IsNullOrEmpty(dto.Title))
                    campaign.Title = dto.Title;

                if (!string.IsNullOrEmpty(dto.Description))
                    campaign.Description = dto.Description;

                if (dto.TargetAmount.HasValue)
                    campaign.TargetAmount = dto.TargetAmount.Value;

                if (dto.StartDate.HasValue)
                    campaign.StartDate = dto.StartDate.Value;

                if (dto.EndDate.HasValue)
                    campaign.EndDate = dto.EndDate.Value;

                if (!string.IsNullOrEmpty(dto.Category))
                    campaign.Category = dto.Category;

                if (dto.Location != null)
                    campaign.Location = dto.Location;

                if (dto.IsUrgent.HasValue)
                    campaign.IsUrgent = dto.IsUrgent.Value;

                if (dto.IsFeatured.HasValue)
                    campaign.IsFeatured = dto.IsFeatured.Value;

                // Update volunteer fields
                if (dto.NeedsVolunteers.HasValue)
                    campaign.NeedsVolunteers = dto.NeedsVolunteers.Value;

                if (dto.PlatinumVolunteersNeeded.HasValue)
                    campaign.PlatinumVolunteersNeeded = dto.PlatinumVolunteersNeeded.Value;

                if (dto.GoldVolunteersNeeded.HasValue)
                    campaign.GoldVolunteersNeeded = dto.GoldVolunteersNeeded.Value;

                if (dto.SilverVolunteersNeeded.HasValue)
                    campaign.SilverVolunteersNeeded = dto.SilverVolunteersNeeded.Value;

                if (dto.BronzeVolunteersNeeded.HasValue)
                    campaign.BronzeVolunteersNeeded = dto.BronzeVolunteersNeeded.Value;

                if (dto.NewbieVolunteersNeeded.HasValue)
                    campaign.NewbieVolunteersNeeded = dto.NewbieVolunteersNeeded.Value;

                bool sendRequests = false;
                if (dto.AutoSendVolunteerRequests.HasValue)
                {
                    // Check if auto-send was just enabled
                    if (dto.AutoSendVolunteerRequests.Value && !campaign.AutoSendVolunteerRequests && campaign.VolunteerRequestsSentAt == null)
                    {
                        sendRequests = true;
                    }
                    campaign.AutoSendVolunteerRequests = dto.AutoSendVolunteerRequests.Value;
                }

                // Handle image upload
                if (dto.Image != null)
                {
                    var uploads = Path.Combine(Directory.GetCurrentDirectory(), "Uploads", "Campaigns");
                    if (!Directory.Exists(uploads)) Directory.CreateDirectory(uploads);
                    
                    var fileName = Guid.NewGuid() + Path.GetExtension(dto.Image.FileName);
                    var filePath = Path.Combine(uploads, fileName);
                    
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await dto.Image.CopyToAsync(stream);
                    }
                    
                    campaign.ImagePath = fileName;
                }

                campaign.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                // Send volunteer requests if auto-send was just enabled
                if (sendRequests && campaign.NeedsVolunteers)
                {
                    Console.WriteLine($"Auto-sending volunteer requests for updated campaign {campaign.Id}");
                    await SendVolunteerRequests(campaign);
                }

                return Ok(new { message = "Campaign updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update campaign", error = ex.Message });
            }
        }

        // DELETE: api/campaign/admin/{id}
        [HttpDelete("admin/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCampaign(int id)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            try
            {
                var campaign = await _context.Campaigns
                    .Include(c => c.Donations)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                // Check if campaign has donations
                if (campaign.Donations.Any())
                    return BadRequest(new { message = "Cannot delete campaign with existing donations" });

                _context.Campaigns.Remove(campaign);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Campaign deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete campaign", error = ex.Message });
            }
        }

        // GET: api/campaign/admin/stats
        [HttpGet("admin/stats")]
        public async Task<IActionResult> GetCampaignStats()
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            try
            {
                var totalCampaigns = await _context.Campaigns.CountAsync();
                var activeCampaigns = await _context.Campaigns.CountAsync(c => c.Status == "approved" && c.EndDate > DateTime.UtcNow);
                var pendingCampaigns = await _context.Campaigns.CountAsync(c => c.Status == "pending");
                var completedCampaigns = await _context.Campaigns.CountAsync(c => c.Status == "approved" && c.EndDate <= DateTime.UtcNow);

                var totalTargetAmount = await _context.Campaigns.SumAsync(c => c.TargetAmount);
                var totalRaisedAmount = await _context.Campaigns.SumAsync(c => c.RaisedAmount);

                var categoryStats = await _context.Campaigns
                    .GroupBy(c => c.Category)
                    .Select(g => new CategoryStatsDto
                    {
                        Category = g.Key,
                        Count = g.Count(),
                        Amount = g.Sum(c => c.RaisedAmount),
                        Percentage = totalRaisedAmount > 0 ? (g.Sum(c => c.RaisedAmount) / totalRaisedAmount) * 100 : 0
                    })
                    .ToListAsync();

                var averageSuccess = totalTargetAmount > 0 ? (totalRaisedAmount / totalTargetAmount) * 100 : 0;

                return Ok(new CampaignStatsDto
                {
                    TotalCampaigns = totalCampaigns,
                    ActiveCampaigns = activeCampaigns,
                    PendingCampaigns = pendingCampaigns,
                    CompletedCampaigns = completedCampaigns,
                    TotalTargetAmount = totalTargetAmount,
                    TotalRaisedAmount = totalRaisedAmount,
                    AverageSuccess = averageSuccess,
                    CategoryStats = categoryStats
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch campaign statistics", error = ex.Message });
            }
        }

        // GET: api/campaign/admin/sentiment-overview
        [HttpGet("admin/sentiment-overview")]
        [Authorize]
        public async Task<IActionResult> GetAdminCampaignSentimentOverview([FromQuery] int days = 14, [FromQuery] int limit = 6)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            var windowDays = Math.Clamp(days, 1, 90);
            var itemLimit = Math.Clamp(limit, 1, 20);
            var windowStart = DateTime.UtcNow.AddDays(-windowDays);

            try
            {
                var campaigns = await _context.Campaigns
                    .Select(c => new
                    {
                        c.Id,
                        c.Title,
                        c.Status,
                        RecentComments = c.Comments
                            .Where(cm => cm.CreatedAt >= windowStart)
                            .Select(cm => new { cm.SentimentLabel, cm.CreatedAt })
                            .ToList()
                    })
                    .ToListAsync();

                var items = campaigns
                    .Where(c => c.RecentComments.Count > 0)
                    .Select(c =>
                    {
                        var total = c.RecentComments.Count;
                        var positive = c.RecentComments.Count(x => x.SentimentLabel == "positive");
                        var negative = c.RecentComments.Count(x => x.SentimentLabel == "negative");
                        var neutral = c.RecentComments.Count(x => x.SentimentLabel == "neutral");
                        var sentimentIndex = total == 0 ? 0 : Math.Round((((double)positive - negative) / total) * 100, 2);

                        var trendDirection = sentimentIndex switch
                        {
                            >= 20 => "up",
                            <= -20 => "down",
                            _ => "mixed"
                        };

                        return new AdminCampaignSentimentItemDto
                        {
                            CampaignId = c.Id,
                            CampaignTitle = c.Title,
                            CampaignStatus = c.Status,
                            RecentComments = total,
                            PositivePercent = Math.Round((double)positive / total * 100, 2),
                            NegativePercent = Math.Round((double)negative / total * 100, 2),
                            SentimentIndex = sentimentIndex,
                            TrendDirection = trendDirection,
                            LastCommentAt = c.RecentComments.Max(x => x.CreatedAt)
                        };
                    })
                    .OrderByDescending(x => x.RecentComments)
                    .ThenByDescending(x => x.LastCommentAt)
                    .Take(itemLimit)
                    .ToList();

                var overview = new AdminCampaignSentimentOverviewDto
                {
                    WindowDays = windowDays,
                    TotalCampaignsWithComments = campaigns.Count(c => c.RecentComments.Count > 0),
                    AverageSentimentIndex = items.Count == 0 ? 0 : Math.Round(items.Average(x => x.SentimentIndex), 2),
                    Items = items
                };

                return Ok(overview);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch sentiment overview", error = ex.Message });
            }
        }

        // POST: api/campaign/admin/feature/{id}
        [HttpPost("admin/feature/{id}")]
        public async Task<IActionResult> ToggleFeaturedStatus(int id)
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            try
            {
                var campaign = await _context.Campaigns.FindAsync(id);
                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                if (campaign.Status != "approved")
                    return BadRequest(new { message = "Only approved campaigns can be featured" });

                campaign.IsFeatured = !campaign.IsFeatured;
                campaign.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = campaign.IsFeatured ? "Campaign featured successfully" : "Campaign unfeatured",
                    isFeatured = campaign.IsFeatured
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update featured status", error = ex.Message });
            }
        }

        // GET: api/campaign/admin/pending
        [HttpGet("admin/pending")]
        public async Task<IActionResult> GetPendingCampaigns()
        {
            if (!IsAdmin())
                return Unauthorized(new { message = "Admin access required" });

            try
            {
                var pendingCampaigns = await _context.Campaigns
                    .Include(c => c.Creator)
                    .Where(c => c.Status == "pending")
                    .OrderBy(c => c.CreatedAt)
                    .Select(c => new CampaignDto
                    {
                        Id = c.Id,
                        Title = c.Title,
                        Description = c.Description,
                        ImagePath = c.ImagePath,
                        TargetAmount = c.TargetAmount,
                        StartDate = c.StartDate,
                        EndDate = c.EndDate,
                        Category = c.Category,
                        Location = c.Location,
                        IsUrgent = c.IsUrgent,
                        CreatedAt = c.CreatedAt,
                        CreatorName = $"{c.Creator.FirstName} {c.Creator.LastName}",
                        DaysRemaining = (int)(c.EndDate - DateTime.UtcNow).TotalDays
                    })
                    .ToListAsync();

                return Ok(pendingCampaigns);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch pending campaigns", error = ex.Message });
            }
        }

        // GET: api/campaign/{id}/details
        [HttpGet("{id}/details")]
        public async Task<IActionResult> GetCampaignDetails(int id)
        {
            try
            {
                var campaign = await _context.Campaigns
                    .Include(c => c.Creator)
                    .Include(c => c.Approver)
                    .Include(c => c.Donations.Where(d => d.Status == "completed"))
                    .Include(c => c.Updates)
                        .ThenInclude(u => u.Creator)
                    .FirstOrDefaultAsync(c => c.Id == id);

                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                // Only admins can see all campaigns, others can only see approved ones
                if (!IsAdmin() && campaign.Status != "approved")
                    return NotFound(new { message = "Campaign not found" });

                var donationStats = campaign.Donations
                    .GroupBy(d => d.CreatedAt.Date)
                    .Select(g => new { Date = g.Key, Amount = g.Sum(d => d.Amount), Count = g.Count() })
                    .OrderBy(x => x.Date)
                    .ToList();

                return Ok(new
                {
                    campaign = new CampaignDto
                    {
                        Id = campaign.Id,
                        Title = campaign.Title,
                        Description = campaign.Description,
                        ImagePath = campaign.ImagePath,
                        TargetAmount = campaign.TargetAmount,
                        RaisedAmount = campaign.RaisedAmount,
                        StartDate = campaign.StartDate,
                        EndDate = campaign.EndDate,
                        Status = campaign.Status,
                        Category = campaign.Category,
                        Location = campaign.Location,
                        IsUrgent = campaign.IsUrgent,
                        IsFeatured = campaign.IsFeatured,
                        CreatedAt = campaign.CreatedAt,
                        ApprovedAt = campaign.ApprovedAt,
                        CreatorName = $"{campaign.Creator.FirstName} {campaign.Creator.LastName}",
                        ApproverName = campaign.Approver != null ? $"{campaign.Approver.FirstName} {campaign.Approver.LastName}" : null,
                        ProgressPercentage = campaign.TargetAmount > 0 ? (campaign.RaisedAmount / campaign.TargetAmount) * 100 : 0,
                        DonationCount = campaign.Donations.Count,
                        DaysRemaining = (int)(campaign.EndDate - DateTime.UtcNow).TotalDays
                    },
                    donations = campaign.Donations.Select(d => new DonationDto
                    {
                        Id = d.Id,
                        Amount = d.Amount,
                        DonorName = d.IsAnonymous ? "Anonymous" : (d.DonorName ?? "Unknown"),
                        Message = d.Message,
                        IsAnonymous = d.IsAnonymous,
                        CreatedAt = d.CreatedAt,
                        CompletedAt = d.CompletedAt
                    }).OrderByDescending(d => d.CreatedAt).ToList(),
                    updates = campaign.Updates.Select(u => new CampaignUpdateDto
                    {
                        Id = u.Id,
                        Title = u.Title,
                        Content = u.Content,
                        ImagePath = u.ImagePath,
                        CreatedAt = u.CreatedAt,
                        CreatorName = $"{u.Creator.FirstName} {u.Creator.LastName}"
                    }).OrderByDescending(u => u.CreatedAt).ToList(),
                    donationStats = donationStats
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch campaign details", error = ex.Message });
            }
        }

        // POST: api/campaign/{id}/comments
        [HttpPost("{id}/comments")]
        [Authorize]
        public async Task<IActionResult> AddCampaignComment(int id, [FromBody] CreateCampaignCommentDto dto)
        {
            if (!IsDonorOrVolunteer())
                return Unauthorized(new { message = "Only donors and volunteers can comment on campaigns." });

            if (string.IsNullOrWhiteSpace(dto.Comment))
                return BadRequest(new { message = "Comment cannot be empty." });

            var trimmedComment = dto.Comment.Trim();
            if (trimmedComment.Length < 10)
                return BadRequest(new { message = "Comment should be at least 10 characters for meaningful analysis." });

            if (trimmedComment.Length > 1000)
                return BadRequest(new { message = "Comment must be 1000 characters or less." });

            try
            {
                var campaign = await _context.Campaigns.FindAsync(id);
                if (campaign == null)
                    return NotFound(new { message = "Campaign not found" });

                var prediction = await _mlPredictionService.AnalyzeSentimentAsync(trimmedComment);
                var sentimentLabel = prediction.Probability switch
                {
                    >= 0.65f => "positive",
                    <= 0.35f => "negative",
                    _ => "neutral"
                };

                var feelingTag = string.IsNullOrWhiteSpace(dto.FeelingTag)
                    ? null
                    : dto.FeelingTag.Trim().ToLowerInvariant();

                var campaignComment = new CampaignComment
                {
                    CampaignId = id,
                    UserId = GetCurrentUserId(),
                    Comment = trimmedComment,
                    FeelingTag = feelingTag,
                    SentimentLabel = sentimentLabel,
                    SentimentScore = prediction.Probability,
                    Confidence = prediction.Probability,
                    CreatedAt = DateTime.UtcNow
                };

                _context.CampaignComments.Add(campaignComment);
                await _context.SaveChangesAsync();

                var commenter = await _context.Users
                    .Where(u => u.Id == campaignComment.UserId)
                    .Select(u => new { u.FirstName, u.LastName, u.UserType })
                    .FirstOrDefaultAsync();

                return Ok(new CampaignCommentDto
                {
                    Id = campaignComment.Id,
                    CampaignId = campaignComment.CampaignId,
                    UserId = campaignComment.UserId,
                    UserName = commenter == null ? "Unknown" : $"{commenter.FirstName} {commenter.LastName}".Trim(),
                    UserType = commenter?.UserType ?? "unknown",
                    Comment = campaignComment.Comment,
                    FeelingTag = campaignComment.FeelingTag,
                    SentimentLabel = campaignComment.SentimentLabel,
                    SentimentScore = campaignComment.SentimentScore,
                    Confidence = campaignComment.Confidence,
                    CreatedAt = campaignComment.CreatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to add campaign comment", error = ex.Message });
            }
        }

        // GET: api/campaign/{id}/comments
        [HttpGet("{id}/comments")]
        public async Task<IActionResult> GetCampaignComments(int id)
        {
            try
            {
                var campaignExists = await _context.Campaigns.AnyAsync(c => c.Id == id);
                if (!campaignExists)
                    return NotFound(new { message = "Campaign not found" });

                var comments = await _context.CampaignComments
                    .Include(c => c.User)
                    .Where(c => c.CampaignId == id)
                    .OrderByDescending(c => c.CreatedAt)
                    .Take(200)
                    .Select(c => new CampaignCommentDto
                    {
                        Id = c.Id,
                        CampaignId = c.CampaignId,
                        UserId = c.UserId,
                        UserName = $"{c.User.FirstName} {c.User.LastName}".Trim(),
                        UserType = c.User.UserType ?? "unknown",
                        Comment = c.Comment,
                        FeelingTag = c.FeelingTag,
                        SentimentLabel = c.SentimentLabel,
                        SentimentScore = c.SentimentScore,
                        Confidence = c.Confidence,
                        CreatedAt = c.CreatedAt
                    })
                    .ToListAsync();

                var positiveCount = comments.Count(c => c.SentimentLabel == "positive");
                var neutralCount = comments.Count(c => c.SentimentLabel == "neutral");
                var negativeCount = comments.Count(c => c.SentimentLabel == "negative");
                var total = comments.Count;

                var positivePercent = total == 0 ? 0 : Math.Round((double)positiveCount / total * 100, 2);
                var neutralPercent = total == 0 ? 0 : Math.Round((double)neutralCount / total * 100, 2);
                var negativePercent = total == 0 ? 0 : Math.Round((double)negativeCount / total * 100, 2);
                var sentimentIndex = total == 0
                    ? 0
                    : Math.Round((((double)positiveCount - negativeCount) / total) * 100, 2);

                var dominantFeeling = comments
                    .Where(c => !string.IsNullOrWhiteSpace(c.FeelingTag))
                    .GroupBy(c => c.FeelingTag!)
                    .OrderByDescending(g => g.Count())
                    .Select(g => g.Key)
                    .FirstOrDefault() ?? "none";

                var topKeywords = comments
                    .SelectMany(c => Regex.Split(c.Comment.ToLowerInvariant(), @"[^a-z0-9]+"))
                    .Where(w => !string.IsNullOrWhiteSpace(w) && w.Length >= 4 && !StopWords.Contains(w))
                    .GroupBy(w => w)
                    .OrderByDescending(g => g.Count())
                    .Take(6)
                    .Select(g => g.Key)
                    .ToList();

                string recommendation = sentimentIndex switch
                {
                    >= 35 => "Community response is strongly positive. Keep sharing impact updates to sustain momentum.",
                    >= 5 => "Sentiment is moderately positive. Highlight volunteer stories and campaign milestones to strengthen engagement.",
                    > -15 => "Sentiment is mixed. Review top concerns and respond publicly to improve trust.",
                    _ => "Sentiment is trending negative. Investigate recurring issues immediately and communicate corrective actions."
                };

                return Ok(new CampaignCommentsResponseDto
                {
                    Comments = comments,
                    Summary = new CampaignCommentSentimentSummaryDto
                    {
                        TotalComments = total,
                        PositiveCount = positiveCount,
                        NeutralCount = neutralCount,
                        NegativeCount = negativeCount,
                        PositivePercent = positivePercent,
                        NeutralPercent = neutralPercent,
                        NegativePercent = negativePercent,
                        SentimentIndex = sentimentIndex,
                        DominantFeeling = dominantFeeling,
                        TopKeywords = topKeywords,
                        Recommendation = recommendation
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch campaign comments", error = ex.Message });
            }
        }

        // Helper method to send volunteer requests automatically
        private async Task SendVolunteerRequests(Campaign campaign)
        {
            try
            {
                Console.WriteLine($"\n========================================");
                Console.WriteLine($"=== SENDING VOLUNTEER REQUESTS ===");
                Console.WriteLine($"Campaign ID: {campaign.Id}");
                Console.WriteLine($"Campaign Title: {campaign.Title}");
                Console.WriteLine($"========================================\n");
                
                // Define rank requirements with counts
                var rankRequirements = new Dictionary<string, int>
                {
                    { "platinum", campaign.PlatinumVolunteersNeeded },
                    { "gold", campaign.GoldVolunteersNeeded },
                    { "silver", campaign.SilverVolunteersNeeded },
                    { "bronze", campaign.BronzeVolunteersNeeded },
                    { "newbie", campaign.NewbieVolunteersNeeded }
                };

                Console.WriteLine("Rank Requirements:");
                foreach (var (rank, count) in rankRequirements)
                {
                    Console.WriteLine($"  {rank}: {count} volunteers needed");
                }
                Console.WriteLine();

                int totalRequestsSent = 0;

                // First, check how many volunteer profiles exist
                var totalProfiles = await _context.VolunteerProfiles.CountAsync();
                var verifiedProfiles = await _context.VolunteerProfiles.CountAsync(vp => vp.Status == "verified");
                Console.WriteLine($"📊 Total volunteer profiles in database: {totalProfiles}");
                Console.WriteLine($"✅ Verified volunteer profiles: {verifiedProfiles}");
                Console.WriteLine();

                foreach (var (rank, count) in rankRequirements)
                {
                    if (count <= 0)
                    {
                        Console.WriteLine($"⏭️  Skipping {rank} - no volunteers needed (count = 0)");
                        continue;
                    }

                    Console.WriteLine($"\n--- Processing {rank.ToUpper()} volunteers ---");
                    Console.WriteLine($"Looking for {count} volunteers with rank '{rank}'...");

                    // Debug: Check all profiles with this rank
                    var allRankProfiles = await _context.VolunteerProfiles
                        .Where(vp => vp.Rank.ToLower() == rank)
                        .ToListAsync();
                    Console.WriteLine($"  Total profiles with rank '{rank}': {allRankProfiles.Count}");
                    
                    if (allRankProfiles.Any())
                    {
                        foreach (var p in allRankProfiles)
                        {
                            Console.WriteLine($"    - Profile ID {p.Id}: Status={p.Status}, IsVerified={p.IsVerified}, AcceptEmail={p.AcceptEmailNotifications}");
                        }
                    }

                    // Find active and verified volunteers with the specified rank
                    // Status should be "active", IsVerified should be true, and IsApprovedByAdmin should be true
                    var volunteers = await _context.VolunteerProfiles
                        .Include(vp => vp.User)
                        .Where(vp => 
                            (vp.Status == "active" || vp.Status == "verified") && // Accept both active and verified status
                            vp.IsVerified == true && // Must be verified
                            vp.IsApprovedByAdmin == true && // 🆕 Must be approved by admin
                            vp.AdminApprovalStatus == "approved" && // 🆕 Approval status must be "approved"
                            vp.Rank.ToLower() == rank &&
                            vp.AcceptEmailNotifications) // Only send to those who accept notifications
                        .OrderByDescending(vp => vp.TotalHoursVolunteered) // Prioritize by experience
                        .Take(count)
                        .ToListAsync();

                    Console.WriteLine($"✅ Found {volunteers.Count} qualified volunteers with rank '{rank}'");

                    // Create volunteer requests
                    if (volunteers.Count == 0)
                    {
                        Console.WriteLine($"⚠️  No qualified volunteers found for rank '{rank}'");
                        Console.WriteLine($"   Possible reasons:");
                        Console.WriteLine($"   - No volunteers with this rank exist");
                        Console.WriteLine($"   - Volunteers not verified (status != 'verified')");
                        Console.WriteLine($"   - Volunteers have disabled email notifications");
                    }
                    else
                    {
                        foreach (var volunteer in volunteers)
                        {
                            Console.WriteLine($"\n  Creating request for volunteer:");
                            Console.WriteLine($"    Email: {volunteer.User.Email}");
                            Console.WriteLine($"    Name: {volunteer.User.FirstName} {volunteer.User.LastName}");
                            Console.WriteLine($"    Rank: {rank}");
                            Console.WriteLine($"    Status: {volunteer.Status}");
                            
                            var request = new VolunteerRequest
                            {
                                CampaignId = campaign.Id,
                                VolunteerProfileId = volunteer.Id,
                                Title = $"Volunteer Request for {campaign.Title}",
                                Description = $"We need your help! The campaign '{campaign.Title}' is looking for {rank} rank volunteers with your expertise.",
                                TaskType = campaign.Category.ToLower(), // Use campaign category as task type
                                Status = "pending",
                                Priority = campaign.IsUrgent ? "high" : "medium",
                                RequestedBy = campaign.CreatedBy,
                                StartDate = campaign.StartDate,
                                EndDate = campaign.EndDate,
                                EstimatedHours = 10, // Default estimated hours
                                CreatedAt = DateTime.UtcNow,
                                ExpiresAt = DateTime.UtcNow.AddDays(7) // Request expires in 7 days
                            };

                            _context.VolunteerRequests.Add(request);
                            totalRequestsSent++;

                            Console.WriteLine($"    ✅ Request created successfully");
                        }
                    }
                }

                // Update campaign to mark that requests were sent
                campaign.VolunteerRequestsSentAt = DateTime.UtcNow;
                
                await _context.SaveChangesAsync();
                
                Console.WriteLine($"\n========================================");
                Console.WriteLine($"✅ SUCCESS: Sent {totalRequestsSent} volunteer requests");
                Console.WriteLine($"Campaign {campaign.Id} marked as requests sent");
                Console.WriteLine($"========================================\n");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n========================================");
                Console.WriteLine($"❌ ERROR sending volunteer requests");
                Console.WriteLine($"Error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                Console.WriteLine($"========================================\n");
                // Don't throw - campaign creation should still succeed even if request sending fails
            }
        }
    }
}

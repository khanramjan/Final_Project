using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.DTOs;
using DonationManagementSystem.API.Services;
using System.Security.Claims;
using System.Text.Json;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class VolunteerReportController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<VolunteerReportController> _logger;
        private readonly IVolunteerRankService _rankService;

        public VolunteerReportController(
            AppDbContext context, 
            ILogger<VolunteerReportController> logger,
            IVolunteerRankService rankService)
        {
            _context = context;
            _logger = logger;
            _rankService = rankService;
        }

        // ===== VOLUNTEER REPORTING =====

        // GET: api/volunteerreport/volunteers
        [HttpGet("volunteers")]
        public async Task<ActionResult<IEnumerable<object>>> GetVolunteers()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            // Get current user's volunteer profile
            var currentVolunteer = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (currentVolunteer == null)
                return BadRequest(new { message = "You must be a volunteer to access this resource" });

            // Get all approved volunteers except the current user
            var volunteers = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .Where(vp => vp.IsApprovedByAdmin && 
                             vp.AdminApprovalStatus == "approved" && 
                             vp.Id != currentVolunteer.Id)
                .Select(vp => new
                {
                    id = vp.Id,
                    userName = vp.User != null ? (vp.User.FirstName + " " + vp.User.LastName) : "Unknown",
                    email = vp.User != null ? vp.User.Email : "",
                    rank = vp.Rank,
                    isVerified = vp.IsVerified
                })
                .OrderBy(v => v.userName)
                .ToListAsync();

            return Ok(volunteers);
        }

        // POST: api/volunteerreport/create
        [HttpPost("create")]
        public async Task<ActionResult<VolunteerReportDto>> CreateReport([FromBody] CreateVolunteerReportDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            // Get reporter's volunteer profile
            var reporterProfile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (reporterProfile == null)
                return BadRequest(new { message = "You must be a volunteer to submit a report" });

            // Check if reporter is approved
            if (!reporterProfile.IsApprovedByAdmin || reporterProfile.AdminApprovalStatus != "approved")
                return BadRequest(new { message = "Your volunteer profile must be approved to submit reports" });

            // Get reported volunteer profile
            var reportedProfile = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .FirstOrDefaultAsync(vp => vp.Id == dto.ReportedVolunteerId);

            if (reportedProfile == null)
                return NotFound(new { message = "Reported volunteer not found" });

            // Cannot report yourself
            if (reporterProfile.Id == reportedProfile.Id)
                return BadRequest(new { message = "You cannot report yourself" });

            // Create the report
            var report = new VolunteerReport
            {
                ReportedByVolunteerId = reporterProfile.Id,
                ReportedVolunteerId = reportedProfile.Id,
                ReportType = dto.ReportType,
                Title = dto.Title,
                Description = dto.Description,
                ProofUrls = dto.ProofUrls != null ? JsonSerializer.Serialize(dto.ProofUrls) : null,
                CampaignId = dto.CampaignId,
                VolunteerAssignmentId = dto.VolunteerAssignmentId,
                Severity = dto.Severity,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.VolunteerReports.Add(report);
            await _context.SaveChangesAsync();

            _logger.LogInformation($"Volunteer {reporterProfile.Id} reported volunteer {reportedProfile.Id}");

            // Load navigation properties for response
            report.ReportedByVolunteer = reporterProfile;
            report.ReportedVolunteer = reportedProfile;

            if (dto.CampaignId.HasValue)
            {
                report.Campaign = await _context.Campaigns.FindAsync(dto.CampaignId.Value);
            }

            return CreatedAtAction(nameof(GetReport), new { id = report.Id }, MapToReportDto(report));
        }

        // GET: api/volunteerreport/my-reports
        [HttpGet("my-reports")]
        public async Task<ActionResult<List<VolunteerReportDto>>> GetMyReports([FromQuery] string? status = null)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var query = _context.VolunteerReports
                .Include(vr => vr.ReportedByVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.ReportedVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.Campaign)
                .Include(vr => vr.VolunteerAssignment)
                .Include(vr => vr.Reviewer)
                .Where(vr => vr.ReportedByVolunteerId == profile.Id);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(vr => vr.Status == status);

            var reports = await query
                .OrderByDescending(vr => vr.CreatedAt)
                .ToListAsync();

            return Ok(reports.Select(MapToReportDto));
        }

        // GET: api/volunteerreport/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<VolunteerReportDto>> GetReport(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var report = await _context.VolunteerReports
                .Include(vr => vr.ReportedByVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.ReportedVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.Campaign)
                .Include(vr => vr.VolunteerAssignment)
                .Include(vr => vr.Reviewer)
                .FirstOrDefaultAsync(vr => vr.Id == id);

            if (report == null)
                return NotFound(new { message = "Report not found" });

            // Check if user has permission to view (reporter, reported volunteer, or admin)
            var profile = await _context.VolunteerProfiles.FirstOrDefaultAsync(vp => vp.UserId == userId);
            var userType = User.FindFirst("UserType")?.Value;

            if (userType != "admin" && 
                profile?.Id != report.ReportedByVolunteerId && 
                profile?.Id != report.ReportedVolunteerId)
            {
                return Forbid();
            }

            return Ok(MapToReportDto(report));
        }

        // ===== ADMIN ENDPOINTS =====

        // GET: api/volunteerreport/admin/pending
        [HttpGet("admin/pending")]
        [Authorize]
        public async Task<ActionResult<List<VolunteerReportDto>>> GetPendingReports()
        {
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var reports = await _context.VolunteerReports
                .Include(vr => vr.ReportedByVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.ReportedVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.Campaign)
                .Include(vr => vr.VolunteerAssignment)
                .Include(vr => vr.Reviewer)
                .Where(vr => vr.Status == "pending")
                .OrderByDescending(vr => vr.Severity == "critical")
                .ThenByDescending(vr => vr.Severity == "high")
                .ThenByDescending(vr => vr.CreatedAt)
                .ToListAsync();

            return Ok(reports.Select(MapToReportDto));
        }

        // GET: api/volunteerreport/admin/all
        [HttpGet("admin/all")]
        [Authorize]
        public async Task<ActionResult<List<VolunteerReportDto>>> GetAllReports([FromQuery] string? status = null)
        {
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var query = _context.VolunteerReports
                .Include(vr => vr.ReportedByVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.ReportedVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.Campaign)
                .Include(vr => vr.VolunteerAssignment)
                .Include(vr => vr.Reviewer)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
                query = query.Where(vr => vr.Status == status);

            var reports = await query
                .OrderByDescending(vr => vr.CreatedAt)
                .ToListAsync();

            return Ok(reports.Select(MapToReportDto));
        }

        // GET: api/volunteerreport/admin/volunteer/{volunteerId}
        [HttpGet("admin/volunteer/{volunteerId}")]
        [Authorize]
        public async Task<ActionResult<object>> GetVolunteerReports(int volunteerId)
        {
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var profile = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .FirstOrDefaultAsync(vp => vp.Id == volunteerId);

            if (profile == null)
                return NotFound(new { message = "Volunteer not found" });

            var reports = await _context.VolunteerReports
                .Include(vr => vr.ReportedByVolunteer).ThenInclude(vp => vp.User)
                .Include(vr => vr.Campaign)
                .Include(vr => vr.VolunteerAssignment)
                .Where(vr => vr.ReportedVolunteerId == volunteerId)
                .OrderByDescending(vr => vr.CreatedAt)
                .ToListAsync();

            var warnings = await _context.VolunteerWarnings
                .Include(vw => vw.IssuedByUser)
                .Where(vw => vw.VolunteerProfileId == volunteerId)
                .OrderByDescending(vw => vw.IssuedAt)
                .ToListAsync();

            return Ok(new
            {
                volunteer = new
                {
                    id = profile.Id,
                    name = $"{profile.User.FirstName} {profile.User.LastName}",
                    email = profile.User.Email,
                    rank = profile.Rank,
                    rating = profile.Rating,
                    status = profile.Status,
                    totalHours = profile.TotalHoursVolunteered,
                    totalTasks = profile.TotalTasksCompleted
                },
                reports = reports.Select(MapToReportDto).ToList(),
                warnings = warnings.Select(MapToWarningDto).ToList(),
                totalReports = reports.Count,
                pendingReports = reports.Count(r => r.Status == "pending"),
                activeWarnings = warnings.Count(w => w.IsActive && !w.IsAcknowledged)
            });
        }

        // POST: api/volunteerreport/admin/review/{id}
        [HttpPost("admin/review/{id}")]
        [Authorize]
        public async Task<ActionResult> ReviewReport(int id, [FromBody] ReviewVolunteerReportDto dto)
        {
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var adminId = GetCurrentUserId();
            if (adminId == null) return Unauthorized();

            var report = await _context.VolunteerReports
                .Include(vr => vr.ReportedVolunteer).ThenInclude(vp => vp.User)
                .FirstOrDefaultAsync(vr => vr.Id == id);

            if (report == null)
                return NotFound(new { message = "Report not found" });

            if (report.Status != "pending")
                return BadRequest(new { message = "Report has already been reviewed" });

            report.Status = "under_review";
            report.ReviewedBy = adminId.Value;
            report.ReviewedAt = DateTime.UtcNow;
            report.AdminNotes = dto.AdminNotes;
            report.AdminAction = dto.Action;
            report.UpdatedAt = DateTime.UtcNow;

            var volunteer = report.ReportedVolunteer;

            switch (dto.Action.ToLower())
            {
                case "warn":
                    // Issue warning to volunteer
                    var warning = new VolunteerWarning
                    {
                        VolunteerProfileId = volunteer.Id,
                        VolunteerReportId = report.Id,
                        WarningType = dto.WarningType ?? "behavioral",
                        Title = $"Warning: {report.Title}",
                        Description = dto.WarningDescription ?? dto.AdminNotes,
                        Severity = report.Severity,
                        IssuedBy = adminId.Value,
                        IssuedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddMonths(3), // Warning expires in 3 months
                        IsActive = true
                    };
                    _context.VolunteerWarnings.Add(warning);
                    report.Status = "resolved";
                    _logger.LogInformation($"Admin {adminId} issued warning to volunteer {volunteer.Id}");
                    break;

                case "downgrade":
                    // Downgrade volunteer badge
                    if (string.IsNullOrEmpty(dto.NewRank))
                        return BadRequest(new { message = "NewRank is required for downgrade action" });

                    await DowngradeVolunteer(volunteer, dto.NewRank, dto.DowngradeReason ?? dto.AdminNotes, adminId.Value, report.Id);
                    
                    report.PreviousRank = volunteer.Rank;
                    report.NewRank = dto.NewRank;
                    report.DowngradeReason = dto.DowngradeReason ?? dto.AdminNotes;
                    report.Status = "resolved";
                    _logger.LogInformation($"Admin {adminId} downgraded volunteer {volunteer.Id} from {volunteer.Rank} to {dto.NewRank}");
                    break;

                case "suspend":
                    // Suspend volunteer
                    volunteer.Status = "suspended";
                    volunteer.UpdatedAt = DateTime.UtcNow;
                    report.Status = "resolved";
                    _logger.LogInformation($"Admin {adminId} suspended volunteer {volunteer.Id}");
                    break;

                case "no_action":
                    // No action needed
                    report.Status = "resolved";
                    _logger.LogInformation($"Admin {adminId} reviewed report {id} - no action taken");
                    break;

                case "reject_report":
                    // Reject the report as invalid
                    report.Status = "rejected";
                    _logger.LogInformation($"Admin {adminId} rejected report {id}");
                    break;

                default:
                    return BadRequest(new { message = "Invalid action" });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Report reviewed successfully - Action: {dto.Action}",
                report = MapToReportDto(report)
            });
        }

        // POST: api/volunteerreport/admin/downgrade
        [HttpPost("admin/downgrade")]
        [Authorize]
        public async Task<ActionResult> DowngradeBadge([FromBody] DowngradeBadgeDto dto)
        {
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var adminId = GetCurrentUserId();
            if (adminId == null) return Unauthorized();

            var volunteer = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .FirstOrDefaultAsync(vp => vp.Id == dto.VolunteerProfileId);

            if (volunteer == null)
                return NotFound(new { message = "Volunteer not found" });

            await DowngradeVolunteer(volunteer, dto.NewRank, dto.Reason, adminId.Value, dto.RelatedReportId);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                message = $"Volunteer badge downgraded successfully to {dto.NewRank}",
                volunteer = new
                {
                    id = volunteer.Id,
                    name = $"{volunteer.User.FirstName} {volunteer.User.LastName}",
                    previousRank = volunteer.Rank,
                    newRank = dto.NewRank
                }
            });
        }

        // ===== WARNING MANAGEMENT =====

        // GET: api/volunteerreport/warnings/my-warnings
        [HttpGet("warnings/my-warnings")]
        public async Task<ActionResult<List<VolunteerWarningDto>>> GetMyWarnings()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var warnings = await _context.VolunteerWarnings
                .Include(vw => vw.IssuedByUser)
                .Where(vw => vw.VolunteerProfileId == profile.Id)
                .OrderByDescending(vw => vw.IssuedAt)
                .ToListAsync();

            return Ok(warnings.Select(MapToWarningDto));
        }

        // POST: api/volunteerreport/warnings/acknowledge/{id}
        [HttpPost("warnings/acknowledge/{id}")]
        public async Task<ActionResult> AcknowledgeWarning(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var warning = await _context.VolunteerWarnings
                .FirstOrDefaultAsync(vw => vw.Id == id && vw.VolunteerProfileId == profile.Id);

            if (warning == null)
                return NotFound(new { message = "Warning not found" });

            if (warning.IsAcknowledged)
                return BadRequest(new { message = "Warning already acknowledged" });

            warning.IsAcknowledged = true;
            warning.AcknowledgedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Warning acknowledged" });
        }

        // ===== HELPER METHODS =====

        private async Task DowngradeVolunteer(VolunteerProfile volunteer, string newRank, string reason, int adminId, int? reportId = null)
        {
            var previousRank = volunteer.Rank;

            // Validate rank
            var validRanks = new[] { "Newbie", "Bronze", "Silver", "Gold", "Platinum" };
            if (!validRanks.Contains(newRank))
                throw new ArgumentException("Invalid rank");

            // Update rank
            volunteer.Rank = newRank;
            volunteer.LastRankUpgradeAt = DateTime.UtcNow;
            volunteer.UpdatedAt = DateTime.UtcNow;

            // Create rank history entry
            var rankHistory = new VolunteerRankHistory
            {
                VolunteerProfileId = volunteer.Id,
                PreviousRank = previousRank,
                NewRank = newRank,
                Reason = reason,
                CampaignsCompletedAtUpgrade = volunteer.CompletedCampaigns,
                UpgradedAt = DateTime.UtcNow,
                UpgradedBy = adminId
            };
            _context.VolunteerRankHistories.Add(rankHistory);

            // Log activity
            var activity = new VolunteerActivity
            {
                VolunteerProfileId = volunteer.Id,
                ActivityType = "rank_downgraded",
                Title = "Badge Downgraded",
                Description = $"Rank downgraded from {previousRank} to {newRank}. Reason: {reason}",
                CreatedAt = DateTime.UtcNow
            };
            _context.VolunteerActivities.Add(activity);
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        private VolunteerReportDto MapToReportDto(VolunteerReport report)
        {
            return new VolunteerReportDto
            {
                Id = report.Id,
                ReportedByVolunteerId = report.ReportedByVolunteerId,
                ReportedByVolunteerName = report.ReportedByVolunteer?.User != null
                    ? $"{report.ReportedByVolunteer.User.FirstName} {report.ReportedByVolunteer.User.LastName}"
                    : null,
                ReportedVolunteerId = report.ReportedVolunteerId,
                ReportedVolunteerName = report.ReportedVolunteer?.User != null
                    ? $"{report.ReportedVolunteer.User.FirstName} {report.ReportedVolunteer.User.LastName}"
                    : null,
                ReportedVolunteerRank = report.ReportedVolunteer?.Rank,
                ReportType = report.ReportType,
                Title = report.Title,
                Description = report.Description,
                ProofUrls = string.IsNullOrEmpty(report.ProofUrls)
                    ? null
                    : JsonSerializer.Deserialize<List<string>>(report.ProofUrls),
                CampaignId = report.CampaignId,
                CampaignTitle = report.Campaign?.Title,
                VolunteerAssignmentId = report.VolunteerAssignmentId,
                AssignmentTitle = report.VolunteerAssignment?.Title,
                Severity = report.Severity,
                Status = report.Status,
                ReviewedBy = report.ReviewedBy,
                ReviewedByName = report.Reviewer != null
                    ? $"{report.Reviewer.FirstName} {report.Reviewer.LastName}"
                    : null,
                ReviewedAt = report.ReviewedAt,
                AdminNotes = report.AdminNotes,
                AdminAction = report.AdminAction,
                PreviousRank = report.PreviousRank,
                NewRank = report.NewRank,
                DowngradeReason = report.DowngradeReason,
                CreatedAt = report.CreatedAt,
                UpdatedAt = report.UpdatedAt
            };
        }

        private VolunteerWarningDto MapToWarningDto(VolunteerWarning warning)
        {
            return new VolunteerWarningDto
            {
                Id = warning.Id,
                VolunteerProfileId = warning.VolunteerProfileId,
                VolunteerName = warning.VolunteerProfile?.User != null
                    ? $"{warning.VolunteerProfile.User.FirstName} {warning.VolunteerProfile.User.LastName}"
                    : null,
                VolunteerReportId = warning.VolunteerReportId,
                WarningType = warning.WarningType,
                Title = warning.Title,
                Description = warning.Description,
                Severity = warning.Severity,
                IssuedBy = warning.IssuedBy,
                IssuedByName = warning.IssuedByUser != null
                    ? $"{warning.IssuedByUser.FirstName} {warning.IssuedByUser.LastName}"
                    : null,
                IssuedAt = warning.IssuedAt,
                IsAcknowledged = warning.IsAcknowledged,
                AcknowledgedAt = warning.AcknowledgedAt,
                ExpiresAt = warning.ExpiresAt,
                IsActive = warning.IsActive
            };
        }
    }
}

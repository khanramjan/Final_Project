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
    public class VolunteerController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<VolunteerController> _logger;
        private readonly IVolunteerRankService _rankService;

        public VolunteerController(AppDbContext context, ILogger<VolunteerController> logger, IVolunteerRankService rankService)
        {
            _context = context;
            _logger = logger;
            _rankService = rankService;
        }

        // ===== PROFILE MANAGEMENT =====

        // GET: api/volunteer/profile
        [HttpGet("profile")]
        public async Task<ActionResult<VolunteerProfileDto>> GetMyProfile()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .Include(vp => vp.Verifier)
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            return Ok(MapToProfileDto(profile));
        }

        // POST: api/volunteer/profile
        [HttpPost("profile")]
        public async Task<ActionResult<VolunteerProfileDto>> CreateProfile([FromBody] CreateVolunteerProfileDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            // Check if profile already exists
            var existing = await _context.VolunteerProfiles
                .AnyAsync(vp => vp.UserId == userId);

            if (existing)
                return BadRequest(new { message = "Volunteer profile already exists" });

            var profile = new VolunteerProfile
            {
                UserId = userId.Value,
                Skills = JsonSerializer.Serialize(dto.Skills ?? new List<string>()),
                Interests = JsonSerializer.Serialize(dto.Interests ?? new List<string>()),
                ExperienceLevel = dto.ExperienceLevel,
                YearsOfExperience = dto.YearsOfExperience,
                Certifications = JsonSerializer.Serialize(dto.Certifications ?? new List<CertificationDto>()),
                AvailableDays = JsonSerializer.Serialize(dto.AvailableDays ?? new List<string>()),
                PreferredTimeSlots = JsonSerializer.Serialize(dto.PreferredTimeSlots),
                HoursPerWeek = dto.HoursPerWeek,
                Location = dto.Location,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                EmergencyContactName = dto.EmergencyContactName,
                EmergencyContactPhone = dto.EmergencyContactPhone,
                AcceptSmsNotifications = dto.AcceptSmsNotifications,
                AcceptEmailNotifications = dto.AcceptEmailNotifications,
                IsProfilePublic = dto.IsProfilePublic,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.VolunteerProfiles.Add(profile);
            await _context.SaveChangesAsync();

            // Log activity
            await LogActivity(profile.Id, "profile_created", "Volunteer Profile Created", "Created new volunteer profile");

            var user = await _context.Users.FindAsync(userId.Value);
            profile.User = user!;

            return CreatedAtAction(nameof(GetMyProfile), MapToProfileDto(profile));
        }

        // PUT: api/volunteer/profile
        [HttpPut("profile")]
        public async Task<ActionResult<VolunteerProfileDto>> UpdateProfile([FromBody] UpdateVolunteerProfileDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            // Update fields
            if (dto.Skills != null) profile.Skills = JsonSerializer.Serialize(dto.Skills);
            if (dto.Interests != null) profile.Interests = JsonSerializer.Serialize(dto.Interests);
            if (dto.ExperienceLevel != null) profile.ExperienceLevel = dto.ExperienceLevel;
            if (dto.YearsOfExperience.HasValue) profile.YearsOfExperience = dto.YearsOfExperience.Value;
            if (dto.Certifications != null) profile.Certifications = JsonSerializer.Serialize(dto.Certifications);
            if (dto.AvailableDays != null) profile.AvailableDays = JsonSerializer.Serialize(dto.AvailableDays);
            if (dto.PreferredTimeSlots != null) profile.PreferredTimeSlots = JsonSerializer.Serialize(dto.PreferredTimeSlots);
            if (dto.HoursPerWeek.HasValue) profile.HoursPerWeek = dto.HoursPerWeek.Value;
            if (dto.Location != null) profile.Location = dto.Location;
            if (dto.Latitude.HasValue) profile.Latitude = dto.Latitude;
            if (dto.Longitude.HasValue) profile.Longitude = dto.Longitude;
            if (dto.EmergencyContactName != null) profile.EmergencyContactName = dto.EmergencyContactName;
            if (dto.EmergencyContactPhone != null) profile.EmergencyContactPhone = dto.EmergencyContactPhone;
            if (dto.AcceptSmsNotifications.HasValue) profile.AcceptSmsNotifications = dto.AcceptSmsNotifications.Value;
            if (dto.AcceptEmailNotifications.HasValue) profile.AcceptEmailNotifications = dto.AcceptEmailNotifications.Value;
            if (dto.IsProfilePublic.HasValue) profile.IsProfilePublic = dto.IsProfilePublic.Value;

            profile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            await LogActivity(profile.Id, "profile_updated", "Profile Updated", "Updated volunteer profile information");

            return Ok(MapToProfileDto(profile));
        }

        // ===== REQUESTS MANAGEMENT =====

        // GET: api/volunteer/requests
        [HttpGet("requests")]
        public async Task<ActionResult<List<VolunteerRequestDto>>> GetMyRequests([FromQuery] string? status = null)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var query = _context.VolunteerRequests
                .Include(vr => vr.Campaign)
                .Include(vr => vr.RequestedByUser)
                .Where(vr => vr.VolunteerProfileId == profile.Id);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(vr => vr.Status == status);

            var requests = await query
                .OrderByDescending(vr => vr.CreatedAt)
                .ToListAsync();

            return Ok(requests.Select(MapToRequestDto));
        }

        // GET: api/volunteer/requests/pending
        [HttpGet("requests/pending")]
        public async Task<ActionResult<List<VolunteerRequestDto>>> GetPendingRequests()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var requests = await _context.VolunteerRequests
                .Include(vr => vr.Campaign)
                .Include(vr => vr.RequestedByUser)
                .Where(vr => vr.VolunteerProfileId == profile.Id && vr.Status == "pending")
                .OrderByDescending(vr => vr.Priority == "urgent")
                .ThenByDescending(vr => vr.Priority == "high")
                .ThenByDescending(vr => vr.CreatedAt)
                .ToListAsync();

            return Ok(requests.Select(MapToRequestDto));
        }

        // POST: api/volunteer/requests/accept
        [HttpPost("requests/accept")]
        public async Task<ActionResult<VolunteerAssignmentDto>> AcceptRequest([FromBody] AcceptRequestDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var request = await _context.VolunteerRequests
                .Include(vr => vr.Campaign)
                .FirstOrDefaultAsync(vr => vr.Id == dto.RequestId && vr.VolunteerProfileId == profile.Id);

            if (request == null)
                return NotFound(new { message = "Request not found" });

            if (request.Status != "pending")
                return BadRequest(new { message = "Request has already been responded to" });

            // Update request status
            request.Status = "accepted";
            request.RespondedAt = DateTime.UtcNow;

            // Create assignment
            var assignment = new VolunteerAssignment
            {
                VolunteerProfileId = profile.Id,
                CampaignId = request.CampaignId,
                VolunteerRequestId = request.Id,
                Title = request.Title,
                Description = request.Description,
                TaskType = request.TaskType,
                Status = "assigned",
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                EstimatedHours = request.EstimatedHours,
                MeetingPoint = request.MeetingPoint,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                CreatedAt = DateTime.UtcNow
            };

            _context.VolunteerAssignments.Add(assignment);
            await _context.SaveChangesAsync();

            // Log activity
            await LogActivity(profile.Id, "request_accepted", "Request Accepted", 
                $"Accepted volunteer request: {request.Title}", request.CampaignId, assignment.Id);

            assignment.Campaign = request.Campaign;
            assignment.VolunteerProfile = profile;

            return Ok(MapToAssignmentDto(assignment));
        }

        // POST: api/volunteer/requests/decline
        [HttpPost("requests/decline")]
        public async Task<IActionResult> DeclineRequest([FromBody] DeclineRequestDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var request = await _context.VolunteerRequests
                .FirstOrDefaultAsync(vr => vr.Id == dto.RequestId && vr.VolunteerProfileId == profile.Id);

            if (request == null)
                return NotFound(new { message = "Request not found" });

            if (request.Status != "pending")
                return BadRequest(new { message = "Request has already been responded to" });

            request.Status = "declined";
            request.RespondedAt = DateTime.UtcNow;
            request.DeclineReason = dto.DeclineReason;

            await _context.SaveChangesAsync();

            // Log activity
            await LogActivity(profile.Id, "request_declined", "Request Declined", 
                $"Declined volunteer request: {request.Title}", request.CampaignId);

            return Ok(new { message = "Request declined successfully" });
        }

        // ===== ASSIGNMENTS MANAGEMENT =====

        // GET: api/volunteer/assignments
        [HttpGet("assignments")]
        public async Task<ActionResult<List<VolunteerAssignmentDto>>> GetMyAssignments([FromQuery] string? status = null)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var query = _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Include(va => va.VolunteerProfile)
                    .ThenInclude(vp => vp.User)
                .Where(va => va.VolunteerProfileId == profile.Id);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(va => va.Status == status);

            var assignments = await query
                .OrderByDescending(va => va.StartDate)
                .ToListAsync();

            return Ok(assignments.Select(MapToAssignmentDto));
        }

        // GET: api/volunteer/assignments/active
        [HttpGet("assignments/active")]
        public async Task<ActionResult<List<VolunteerAssignmentDto>>> GetActiveAssignments()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var assignments = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Include(va => va.VolunteerProfile)
                    .ThenInclude(vp => vp.User)
                .Where(va => va.VolunteerProfileId == profile.Id && 
                       (va.Status == "assigned" || va.Status == "in_progress"))
                .OrderBy(va => va.StartDate)
                .ToListAsync();

            return Ok(assignments.Select(MapToAssignmentDto));
        }

        // GET: api/volunteer/assignments/{id}
        [HttpGet("assignments/{id}")]
        public async Task<ActionResult<VolunteerAssignmentDto>> GetAssignment(int id)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var assignment = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Include(va => va.VolunteerProfile)
                    .ThenInclude(vp => vp.User)
                .FirstOrDefaultAsync(va => va.Id == id && va.VolunteerProfileId == profile.Id);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found" });

            return Ok(MapToAssignmentDto(assignment));
        }

        // POST: api/volunteer/assignments/checkin
        [HttpPost("assignments/checkin")]
        public async Task<ActionResult<VolunteerAssignmentDto>> CheckIn([FromBody] CheckInDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var assignment = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .FirstOrDefaultAsync(va => va.Id == dto.AssignmentId && va.VolunteerProfileId == profile.Id);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found" });

            if (assignment.CheckInTime != null)
                return BadRequest(new { message = "Already checked in" });

            assignment.CheckInTime = DateTime.UtcNow;
            assignment.CheckInLocation = dto.Location;
            assignment.CheckInLatitude = dto.Latitude;
            assignment.CheckInLongitude = dto.Longitude;
            assignment.Status = "in_progress";

            await _context.SaveChangesAsync();

            // Log activity
            await LogActivity(profile.Id, "checked_in", "Checked In", 
                $"Checked in for: {assignment.Title}", assignment.CampaignId, assignment.Id);

            return Ok(MapToAssignmentDto(assignment));
        }

        // POST: api/volunteer/assignments/checkout
        [HttpPost("assignments/checkout")]
        public async Task<ActionResult<VolunteerAssignmentDto>> CheckOut([FromBody] CheckOutDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var assignment = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .FirstOrDefaultAsync(va => va.Id == dto.AssignmentId && va.VolunteerProfileId == profile.Id);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found" });

            if (assignment.CheckInTime == null)
                return BadRequest(new { message = "Must check in first" });

            if (assignment.CheckOutTime != null)
                return BadRequest(new { message = "Already checked out" });

            assignment.CheckOutTime = DateTime.UtcNow;
            assignment.CheckOutLocation = dto.Location;
            assignment.CheckOutLatitude = dto.Latitude;
            assignment.CheckOutLongitude = dto.Longitude;
            assignment.CompletionNotes = dto.CompletionNotes;
            assignment.Status = "completed";
            assignment.CompletedAt = DateTime.UtcNow;

            // Calculate actual hours
            if (assignment.CheckInTime.HasValue && assignment.CheckOutTime.HasValue)
            {
                var duration = assignment.CheckOutTime.Value - assignment.CheckInTime.Value;
                assignment.ActualHours = (int)Math.Ceiling(duration.TotalHours);
            }

            // Update profile statistics
            profile.TotalTasksCompleted++;
            profile.TotalHoursVolunteered += assignment.ActualHours;
            profile.LastActivityAt = DateTime.UtcNow;

            // Track campaign completion for rank progression
            var campaignAlreadyCounted = await _context.VolunteerAssignments
                .AnyAsync(va => va.VolunteerProfileId == profile.Id && 
                               va.CampaignId == assignment.CampaignId && 
                               va.Status == "completed" && 
                               va.Id != assignment.Id);

            // Only increment if this is first completed task for this campaign
            if (!campaignAlreadyCounted)
            {
                profile.CompletedCampaigns++;
                profile.TotalCampaignsSupported++;
            }

            await _context.SaveChangesAsync();

            // Log activity
            await LogActivity(profile.Id, "checked_out", "Checked Out", 
                $"Completed task: {assignment.Title}", assignment.CampaignId, assignment.Id);

            // Check for achievements
            await CheckAndAwardAchievements(profile.Id);

            // Check and upgrade rank if eligible
            await _rankService.CheckAndUpgradeRank(profile.Id);

            return Ok(MapToAssignmentDto(assignment));
        }

        // PUT: api/volunteer/assignments/progress
        [HttpPut("assignments/progress")]
        public async Task<ActionResult<VolunteerAssignmentDto>> UpdateProgress([FromBody] UpdateProgressDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var assignment = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .FirstOrDefaultAsync(va => va.Id == dto.AssignmentId && va.VolunteerProfileId == profile.Id);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found" });

            assignment.ProgressPercentage = Math.Clamp(dto.ProgressPercentage, 0, 100);
            assignment.ProgressNotes = dto.ProgressNotes;
            assignment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapToAssignmentDto(assignment));
        }

        // ===== DASHBOARD & STATISTICS =====

        // GET: api/volunteer/dashboard
        [HttpGet("dashboard")]
        public async Task<ActionResult<VolunteerDashboardDto>> GetDashboard()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var pendingRequests = await _context.VolunteerRequests
                .Include(vr => vr.Campaign)
                .Include(vr => vr.RequestedByUser)
                .Where(vr => vr.VolunteerProfileId == profile.Id && vr.Status == "pending")
                .OrderByDescending(vr => vr.CreatedAt)
                .Take(5)
                .ToListAsync();

            var activeAssignments = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Where(va => va.VolunteerProfileId == profile.Id && 
                       (va.Status == "assigned" || va.Status == "in_progress"))
                .OrderBy(va => va.StartDate)
                .ToListAsync();

            var upcomingTasks = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Where(va => va.VolunteerProfileId == profile.Id && 
                       va.Status == "assigned" && 
                       va.StartDate > DateTime.UtcNow)
                .OrderBy(va => va.StartDate)
                .Take(5)
                .ToListAsync();

            var achievements = await _context.VolunteerAchievements
                .Where(va => va.VolunteerProfileId == profile.Id && va.IsUnlocked)
                .OrderByDescending(va => va.UnlockedAt)
                .Take(6)
                .ToListAsync();

            var completedCount = await _context.VolunteerAssignments
                .CountAsync(va => va.VolunteerProfileId == profile.Id && va.Status == "completed");

            var campaignsSupported = await _context.VolunteerAssignments
                .Where(va => va.VolunteerProfileId == profile.Id)
                .Select(va => va.CampaignId)
                .Distinct()
                .CountAsync();

            var achievementsUnlocked = await _context.VolunteerAchievements
                .CountAsync(va => va.VolunteerProfileId == profile.Id && va.IsUnlocked);

            var totalPoints = await _context.VolunteerAchievements
                .Where(va => va.VolunteerProfileId == profile.Id && va.IsUnlocked)
                .SumAsync(va => va.Points ?? 0);

            var dashboard = new VolunteerDashboardDto
            {
                Profile = MapToProfileDto(profile),
                Stats = new VolunteerStatsDto
                {
                    TotalHoursVolunteered = profile.TotalHoursVolunteered,
                    TotalTasksCompleted = completedCount,
                    TotalCampaignsSupported = campaignsSupported,
                    ActiveAssignments = activeAssignments.Count,
                    PendingRequests = pendingRequests.Count,
                    AverageRating = profile.Rating,
                    TotalRatings = profile.TotalRatings,
                    AchievementsUnlocked = achievementsUnlocked,
                    TotalPoints = totalPoints,
                    LastActivityAt = profile.LastActivityAt
                },
                PendingRequests = pendingRequests.Select(MapToRequestDto).ToList(),
                ActiveAssignments = activeAssignments.Select(MapToAssignmentDto).ToList(),
                UpcomingTasks = upcomingTasks.Select(MapToAssignmentDto).ToList(),
                RecentAchievements = achievements.Select(MapToAchievementDto).ToList()
            };

            return Ok(dashboard);
        }

        // GET: api/volunteer/history
        [HttpGet("history")]
        public async Task<ActionResult<VolunteerHistoryDto>> GetHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var completedAssignments = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Where(va => va.VolunteerProfileId == profile.Id && va.Status == "completed")
                .OrderByDescending(va => va.CompletedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var activities = await _context.VolunteerActivities
                .Include(va => va.Campaign)
                .Where(va => va.VolunteerProfileId == profile.Id)
                .OrderByDescending(va => va.CreatedAt)
                .Take(50)
                .ToListAsync();

            var completedCount = await _context.VolunteerAssignments
                .CountAsync(va => va.VolunteerProfileId == profile.Id && va.Status == "completed");

            var campaignsSupported = await _context.VolunteerAssignments
                .Where(va => va.VolunteerProfileId == profile.Id)
                .Select(va => va.CampaignId)
                .Distinct()
                .CountAsync();

            var history = new VolunteerHistoryDto
            {
                CompletedAssignments = completedAssignments.Select(MapToAssignmentDto).ToList(),
                RecentActivities = activities.Select(MapToActivityDto).ToList(),
                Stats = new VolunteerStatsDto
                {
                    TotalHoursVolunteered = profile.TotalHoursVolunteered,
                    TotalTasksCompleted = completedCount,
                    TotalCampaignsSupported = campaignsSupported,
                    AverageRating = profile.Rating,
                    TotalRatings = profile.TotalRatings,
                    LastActivityAt = profile.LastActivityAt
                }
            };

            return Ok(history);
        }

        // GET: api/volunteer/achievements
        [HttpGet("achievements")]
        public async Task<ActionResult<List<VolunteerAchievementDto>>> GetAchievements()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var achievements = await _context.VolunteerAchievements
                .Where(va => va.VolunteerProfileId == profile.Id)
                .OrderByDescending(va => va.IsUnlocked)
                .ThenByDescending(va => va.UnlockedAt)
                .ToListAsync();

            return Ok(achievements.Select(MapToAchievementDto));
        }

        // ===== HELPER METHODS =====

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        private async Task LogActivity(int profileId, string activityType, string title, string? description, 
            int? campaignId = null, int? assignmentId = null)
        {
            var activity = new VolunteerActivity
            {
                VolunteerProfileId = profileId,
                VolunteerAssignmentId = assignmentId,
                CampaignId = campaignId,
                ActivityType = activityType,
                Title = title,
                Description = description,
                CreatedAt = DateTime.UtcNow
            };

            _context.VolunteerActivities.Add(activity);
            await _context.SaveChangesAsync();
        }

        private async Task CheckAndAwardAchievements(int profileId)
        {
            var profile = await _context.VolunteerProfiles.FindAsync(profileId);
            if (profile == null) return;

            var newAchievements = new List<VolunteerAchievement>();

            // First Task Achievement
            if (profile.TotalTasksCompleted >= 1 && 
                !await _context.VolunteerAchievements.AnyAsync(va => va.VolunteerProfileId == profileId && va.AchievementType == "first_task"))
            {
                newAchievements.Add(new VolunteerAchievement
                {
                    VolunteerProfileId = profileId,
                    AchievementType = "first_task",
                    Title = "First Step",
                    Description = "Completed your first volunteer task",
                    BadgeIcon = "star",
                    BadgeColor = "#3b82f6",
                    RequiredProgress = 1,
                    CurrentProgress = 1,
                    IsUnlocked = true,
                    UnlockedAt = DateTime.UtcNow,
                    Points = 10
                });
            }

            // 10 Hours Achievement
            if (profile.TotalHoursVolunteered >= 10 && 
                !await _context.VolunteerAchievements.AnyAsync(va => va.VolunteerProfileId == profileId && va.AchievementType == "10_hours"))
            {
                newAchievements.Add(new VolunteerAchievement
                {
                    VolunteerProfileId = profileId,
                    AchievementType = "10_hours",
                    Title = "Dedicated Volunteer",
                    Description = "Volunteered for 10 hours",
                    BadgeIcon = "clock",
                    BadgeColor = "#10b981",
                    RequiredProgress = 10,
                    CurrentProgress = profile.TotalHoursVolunteered,
                    IsUnlocked = true,
                    UnlockedAt = DateTime.UtcNow,
                    Points = 25
                });
            }

            // 5 Campaigns Achievement
            var campaignsCount = await _context.VolunteerAssignments
                .Where(va => va.VolunteerProfileId == profileId)
                .Select(va => va.CampaignId)
                .Distinct()
                .CountAsync();

            if (campaignsCount >= 5 && 
                !await _context.VolunteerAchievements.AnyAsync(va => va.VolunteerProfileId == profileId && va.AchievementType == "5_campaigns"))
            {
                newAchievements.Add(new VolunteerAchievement
                {
                    VolunteerProfileId = profileId,
                    AchievementType = "5_campaigns",
                    Title = "Campaign Champion",
                    Description = "Supported 5 different campaigns",
                    BadgeIcon = "trophy",
                    BadgeColor = "#f59e0b",
                    RequiredProgress = 5,
                    CurrentProgress = campaignsCount,
                    IsUnlocked = true,
                    UnlockedAt = DateTime.UtcNow,
                    Points = 50
                });
            }

            if (newAchievements.Any())
            {
                _context.VolunteerAchievements.AddRange(newAchievements);
                await _context.SaveChangesAsync();
            }
        }

        private VolunteerProfileDto MapToProfileDto(VolunteerProfile profile)
        {
            return new VolunteerProfileDto
            {
                Id = profile.Id,
                UserId = profile.UserId,
                UserName = profile.User != null ? $"{profile.User.FirstName} {profile.User.LastName}" : null,
                UserEmail = profile.User?.Email,
                Skills = string.IsNullOrEmpty(profile.Skills) ? null : JsonSerializer.Deserialize<List<string>>(profile.Skills),
                Interests = string.IsNullOrEmpty(profile.Interests) ? null : JsonSerializer.Deserialize<List<string>>(profile.Interests),
                ExperienceLevel = profile.ExperienceLevel,
                YearsOfExperience = profile.YearsOfExperience,
                Certifications = string.IsNullOrEmpty(profile.Certifications) ? null : JsonSerializer.Deserialize<List<CertificationDto>>(profile.Certifications),
                AvailableDays = string.IsNullOrEmpty(profile.AvailableDays) ? null : JsonSerializer.Deserialize<List<string>>(profile.AvailableDays),
                PreferredTimeSlots = string.IsNullOrEmpty(profile.PreferredTimeSlots) ? null : JsonSerializer.Deserialize<TimeSlotPreferences>(profile.PreferredTimeSlots),
                HoursPerWeek = profile.HoursPerWeek,
                Location = profile.Location,
                Latitude = profile.Latitude,
                Longitude = profile.Longitude,
                EmergencyContactName = profile.EmergencyContactName,
                EmergencyContactPhone = profile.EmergencyContactPhone,
                TotalHoursVolunteered = profile.TotalHoursVolunteered,
                TotalTasksCompleted = profile.TotalTasksCompleted,
                TotalCampaignsSupported = profile.TotalCampaignsSupported,
                Rating = profile.Rating,
                TotalRatings = profile.TotalRatings,
                Rank = profile.Rank ?? "Newbie",
                CompletedCampaigns = profile.CompletedCampaigns,
                LastRankUpgradeAt = profile.LastRankUpgradeAt,
                Status = profile.Status,
                IsVerified = profile.IsVerified,
                VerifiedAt = profile.VerifiedAt,
                AcceptSmsNotifications = profile.AcceptSmsNotifications,
                AcceptEmailNotifications = profile.AcceptEmailNotifications,
                IsProfilePublic = profile.IsProfilePublic,
                CreatedAt = profile.CreatedAt,
                LastActivityAt = profile.LastActivityAt
            };
        }

        private VolunteerRequestDto MapToRequestDto(VolunteerRequest request)
        {
            return new VolunteerRequestDto
            {
                Id = request.Id,
                VolunteerProfileId = request.VolunteerProfileId,
                VolunteerName = request.VolunteerProfile?.User != null ? 
                    $"{request.VolunteerProfile.User.FirstName} {request.VolunteerProfile.User.LastName}" : null,
                CampaignId = request.CampaignId,
                CampaignTitle = request.Campaign?.Title,
                RequestedBy = request.RequestedBy,
                RequestedByName = request.RequestedByUser != null ? 
                    $"{request.RequestedByUser.FirstName} {request.RequestedByUser.LastName}" : null,
                Title = request.Title,
                Description = request.Description,
                TaskType = request.TaskType,
                Priority = request.Priority,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                EstimatedHours = request.EstimatedHours,
                MeetingPoint = request.MeetingPoint,
                Latitude = request.Latitude,
                Longitude = request.Longitude,
                RequiredSkills = string.IsNullOrEmpty(request.RequiredSkills) ? null : 
                    JsonSerializer.Deserialize<List<string>>(request.RequiredSkills),
                RequiredEquipment = string.IsNullOrEmpty(request.RequiredEquipment) ? null : 
                    JsonSerializer.Deserialize<List<string>>(request.RequiredEquipment),
                TeamSize = request.TeamSize,
                Status = request.Status,
                RespondedAt = request.RespondedAt,
                DeclineReason = request.DeclineReason,
                AdminNotes = request.AdminNotes,
                CreatedAt = request.CreatedAt,
                ExpiresAt = request.ExpiresAt
            };
        }

        private VolunteerAssignmentDto MapToAssignmentDto(VolunteerAssignment assignment)
        {
            return new VolunteerAssignmentDto
            {
                Id = assignment.Id,
                VolunteerProfileId = assignment.VolunteerProfileId,
                VolunteerName = assignment.VolunteerProfile?.User != null ? 
                    $"{assignment.VolunteerProfile.User.FirstName} {assignment.VolunteerProfile.User.LastName}" : null,
                CampaignId = assignment.CampaignId,
                CampaignTitle = assignment.Campaign?.Title,
                VolunteerRequestId = assignment.VolunteerRequestId,
                Title = assignment.Title,
                Description = assignment.Description,
                TaskType = assignment.TaskType,
                Status = assignment.Status,
                StartDate = assignment.StartDate,
                EndDate = assignment.EndDate,
                EstimatedHours = assignment.EstimatedHours,
                ActualHours = assignment.ActualHours,
                MeetingPoint = assignment.MeetingPoint,
                Latitude = assignment.Latitude,
                Longitude = assignment.Longitude,
                CheckInInfo = assignment.CheckInTime != null ? new CheckInInfoDto
                {
                    CheckInTime = assignment.CheckInTime,
                    CheckInLocation = assignment.CheckInLocation,
                    CheckInLatitude = assignment.CheckInLatitude,
                    CheckInLongitude = assignment.CheckInLongitude
                } : null,
                CheckOutInfo = assignment.CheckOutTime != null ? new CheckOutInfoDto
                {
                    CheckOutTime = assignment.CheckOutTime,
                    CheckOutLocation = assignment.CheckOutLocation,
                    CheckOutLatitude = assignment.CheckOutLatitude,
                    CheckOutLongitude = assignment.CheckOutLongitude
                } : null,
                ProgressPercentage = assignment.ProgressPercentage,
                ProgressNotes = assignment.ProgressNotes,
                CompletedAt = assignment.CompletedAt,
                CompletionNotes = assignment.CompletionNotes,
                Rating = assignment.Rating,
                Feedback = assignment.Feedback,
                CertificateIssued = assignment.CertificateIssued,
                CertificatePath = assignment.CertificatePath,
                CreatedAt = assignment.CreatedAt
            };
        }

        private VolunteerActivityDto MapToActivityDto(VolunteerActivity activity)
        {
            return new VolunteerActivityDto
            {
                Id = activity.Id,
                VolunteerProfileId = activity.VolunteerProfileId,
                VolunteerAssignmentId = activity.VolunteerAssignmentId,
                CampaignId = activity.CampaignId,
                CampaignTitle = activity.Campaign?.Title,
                ActivityType = activity.ActivityType,
                Title = activity.Title,
                Description = activity.Description,
                Latitude = activity.Latitude,
                Longitude = activity.Longitude,
                CreatedAt = activity.CreatedAt
            };
        }

        private VolunteerAchievementDto MapToAchievementDto(VolunteerAchievement achievement)
        {
            return new VolunteerAchievementDto
            {
                Id = achievement.Id,
                AchievementType = achievement.AchievementType,
                Title = achievement.Title,
                Description = achievement.Description,
                BadgeIcon = achievement.BadgeIcon,
                BadgeColor = achievement.BadgeColor,
                CurrentProgress = achievement.CurrentProgress,
                RequiredProgress = achievement.RequiredProgress,
                IsUnlocked = achievement.IsUnlocked,
                UnlockedAt = achievement.UnlockedAt,
                Points = achievement.Points,
                RewardDescription = achievement.RewardDescription
            };
        }
    }
}

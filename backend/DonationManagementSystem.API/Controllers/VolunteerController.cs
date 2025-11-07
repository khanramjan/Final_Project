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

            Console.WriteLine($"\n=== GET PENDING REQUESTS ===");
            Console.WriteLine($"Volunteer Profile ID: {profile.Id}");
            Console.WriteLine($"User ID: {userId}");

            var requests = await _context.VolunteerRequests
                .Include(vr => vr.Campaign)
                .Include(vr => vr.RequestedByUser)
                .Where(vr => vr.VolunteerProfileId == profile.Id && vr.Status == "pending")
                .OrderByDescending(vr => vr.Priority == "urgent")
                .ThenByDescending(vr => vr.Priority == "high")
                .ThenByDescending(vr => vr.CreatedAt)
                .ToListAsync();

            Console.WriteLine($"Found {requests.Count} pending requests");
            foreach (var req in requests)
            {
                Console.WriteLine($"  - Request ID: {req.Id}, Campaign: {req.Campaign?.Title}, Status: {req.Status}, Created: {req.CreatedAt}");
            }

            return Ok(requests.Select(MapToRequestDto));
        }

        // GET: api/volunteer/requests/new-count
        [HttpGet("requests/new-count")]
        public async Task<ActionResult<object>> GetNewRequestsCount()
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            // Get requests created in the last 5 minutes (extended for testing)
            var fiveMinutesAgo = DateTime.UtcNow.AddMinutes(-5);
            var newRequests = await _context.VolunteerRequests
                .Include(vr => vr.Campaign)
                .Where(vr => vr.VolunteerProfileId == profile.Id && 
                            vr.Status == "pending" && 
                            vr.CreatedAt >= fiveMinutesAgo)
                .ToListAsync();

            Console.WriteLine($"\n=== NEW REQUESTS CHECK ===");
            Console.WriteLine($"Volunteer Profile ID: {profile.Id}");
            Console.WriteLine($"User ID: {userId}");
            Console.WriteLine($"Checking requests from: {fiveMinutesAgo}");
            Console.WriteLine($"Found {newRequests.Count} new requests");
            
            foreach (var req in newRequests)
            {
                Console.WriteLine($"  - Request ID: {req.Id}, Campaign: {req.Campaign?.Title}, Created: {req.CreatedAt}");
            }

            return Ok(new { 
                count = newRequests.Count,
                hasNew = newRequests.Count > 0,
                requests = newRequests.Select(vr => new {
                    id = vr.Id,
                    title = vr.Title,
                    campaignTitle = vr.Campaign?.Title,
                    priority = vr.Priority,
                    createdAt = vr.CreatedAt
                })
            });
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

            // ✅ CHECK IF VOLUNTEER IS APPROVED BY ADMIN
            if (!profile.IsApprovedByAdmin || profile.AdminApprovalStatus != "approved")
                return BadRequest(new { 
                    message = "Your volunteer profile is pending admin approval. You cannot accept requests until approved.",
                    approvalStatus = profile.AdminApprovalStatus
                });

            var request = await _context.VolunteerRequests
                .Include(vr => vr.Campaign)
                .FirstOrDefaultAsync(vr => vr.Id == dto.RequestId && vr.VolunteerProfileId == profile.Id);

            if (request == null)
                return NotFound(new { message = "Request not found" });

            if (request.Status != "pending")
                return BadRequest(new { message = "Request has already been responded to" });

            // ✅ CHECK IF POSITIONS ARE STILL AVAILABLE (First-Come-First-Serve)
            var campaign = request.Campaign;
            var volunteerRank = profile.Rank.ToLower();
            
            // Count currently assigned volunteers for this rank
            var assignedCount = await _context.VolunteerAssignments
                .Join(_context.VolunteerProfiles,
                    va => va.VolunteerProfileId,
                    vp => vp.Id,
                    (va, vp) => new { va, vp })
                .Where(x => x.va.CampaignId == campaign.Id && 
                           x.vp.Rank.ToLower() == volunteerRank &&
                           (x.va.Status == "assigned" || x.va.Status == "in_progress" || x.va.Status == "completed"))
                .CountAsync();

            // Get positions needed for this rank
            int positionsNeeded = volunteerRank switch
            {
                "platinum" => campaign.PlatinumVolunteersNeeded,
                "gold" => campaign.GoldVolunteersNeeded,
                "silver" => campaign.SilverVolunteersNeeded,
                "bronze" => campaign.BronzeVolunteersNeeded,
                "newbie" => campaign.NewbieVolunteersNeeded,
                _ => 0
            };

            // Check if all positions are filled
            if (assignedCount >= positionsNeeded)
            {
                return BadRequest(new { 
                    message = "Sorry, all volunteer positions for your rank have been filled",
                    positionsNeeded = positionsNeeded,
                    positionsFilled = assignedCount
                });
            }

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
                .OrderByDescending(va => va.CreatedAt)
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

            Console.WriteLine($"\n=== CHECK OUT ===");
            Console.WriteLine($"Assignment ID: {assignment.Id}");
            Console.WriteLine($"Current Progress: {assignment.ProgressPercentage}%");

            assignment.CheckOutTime = DateTime.UtcNow;
            assignment.CheckOutLocation = dto.Location;
            assignment.CheckOutLatitude = dto.Latitude;
            assignment.CheckOutLongitude = dto.Longitude;
            
            // Calculate actual hours
            if (assignment.CheckInTime.HasValue && assignment.CheckOutTime.HasValue)
            {
                var duration = assignment.CheckOutTime.Value - assignment.CheckInTime.Value;
                assignment.ActualHours = (int)Math.Ceiling(duration.TotalHours);
            }

            // ✅ Auto-complete if progress is already 100% when checking out
            if (assignment.ProgressPercentage >= 100)
            {
                Console.WriteLine($"🎉 Auto-completing assignment (progress already 100%)");
                
                assignment.Status = "completed";
                assignment.CompletedAt = DateTime.UtcNow;
                
                // Update volunteer profile stats
                profile.TotalTasksCompleted++;
                profile.CompletedCampaigns++; // ✅ Increment completed campaigns for rank upgrade
                if (assignment.ActualHours > 0)
                {
                    profile.TotalHoursVolunteered += assignment.ActualHours;
                }
                
                Console.WriteLine($"✅ Assignment {assignment.Id} marked as COMPLETED on checkout");
                Console.WriteLine($"   Total Tasks: {profile.TotalTasksCompleted}");
                Console.WriteLine($"   Total Hours: {profile.TotalHoursVolunteered}");
                Console.WriteLine($"   Completed Campaigns: {profile.CompletedCampaigns}");
                
                // Log completion activity
                await LogActivity(profile.Id, "task_completed", "Task Completed", 
                    $"Completed: {assignment.Title}", assignment.CampaignId, assignment.Id);
            }

            profile.LastActivityAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Check and upgrade rank if assignment was completed
            if (assignment.Status == "completed")
            {
                await _rankService.CheckAndUpgradeRank(profile.Id);
                Console.WriteLine($"🏆 Checked rank upgrade eligibility for volunteer {profile.Id}");
            }

            // Log checkout activity
            await LogActivity(profile.Id, "checked_out", "Checked Out", 
                $"Checked out from: {assignment.Title}", assignment.CampaignId, assignment.Id);

            return Ok(MapToAssignmentDto(assignment));
        }

        // POST: api/volunteer/assignments/{id}/complete
        [HttpPost("assignments/{id}/complete")]
        public async Task<ActionResult<VolunteerAssignmentDto>> MarkComplete(int id, [FromBody] CompleteAssignmentDto dto)
        {
            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId);

            if (profile == null)
                return NotFound(new { message = "Volunteer profile not found" });

            var assignment = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .FirstOrDefaultAsync(va => va.Id == id && va.VolunteerProfileId == profile.Id);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found" });

            if (assignment.Status != "in_progress")
                return BadRequest(new { message = "Assignment must be in progress to mark as complete" });

            // Mark as pending review - awaiting admin verification
            assignment.Status = "pending_review";
            assignment.CompletionNotes = dto.CompletionNotes;
            assignment.CompletionEvidence = dto.CompletionEvidence;
            assignment.CompletedAt = DateTime.UtcNow;
            
            await _context.SaveChangesAsync();

            // Log activity
            await LogActivity(profile.Id, "marked_complete", "Marked Complete", 
                $"Marked as complete: {assignment.Title} - Awaiting admin verification", assignment.CampaignId, assignment.Id);

            return Ok(new
            {
                message = "Assignment marked as complete. Awaiting admin verification.",
                assignment = MapToAssignmentDto(assignment)
            });
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

            Console.WriteLine($"\n=== UPDATE PROGRESS ===");
            Console.WriteLine($"Assignment ID: {assignment.Id}");
            Console.WriteLine($"Current Status: {assignment.Status}");
            Console.WriteLine($"Current Progress: {assignment.ProgressPercentage}%");
            Console.WriteLine($"New Progress: {dto.ProgressPercentage}%");
            Console.WriteLine($"Checked Out: {assignment.CheckOutTime.HasValue}");

            assignment.ProgressPercentage = Math.Clamp(dto.ProgressPercentage, 0, 100);
            assignment.ProgressNotes = dto.ProgressNotes;
            assignment.UpdatedAt = DateTime.UtcNow;

            // ✅ Auto-complete when progress reaches 100% and volunteer has checked out
            if (assignment.ProgressPercentage >= 100 && assignment.CheckOutTime.HasValue)
            {
                Console.WriteLine($"🎉 Auto-completing assignment (100% + checked out)");
                
                assignment.Status = "completed";
                assignment.CompletedAt = DateTime.UtcNow;
                
                // Update volunteer profile stats
                profile.TotalTasksCompleted++;
                profile.CompletedCampaigns++; // ✅ Increment completed campaigns for rank upgrade
                if (assignment.ActualHours > 0)
                {
                    profile.TotalHoursVolunteered += assignment.ActualHours;
                }
                profile.LastActivityAt = DateTime.UtcNow;

                // Log completion activity
                await LogActivity(profile.Id, "task_completed", "Task Completed", 
                    $"Completed: {assignment.Title}", assignment.CampaignId, assignment.Id);
                
                Console.WriteLine($"✅ Assignment {assignment.Id} marked as COMPLETED");
                Console.WriteLine($"   Total Tasks: {profile.TotalTasksCompleted}");
                Console.WriteLine($"   Total Hours: {profile.TotalHoursVolunteered}");
                Console.WriteLine($"   Completed Campaigns: {profile.CompletedCampaigns}");
            }
            else if (assignment.ProgressPercentage >= 100)
            {
                Console.WriteLine($"⚠️ Progress is 100% but volunteer hasn't checked out yet");
            }

            await _context.SaveChangesAsync();
            
            // Check and upgrade rank if assignment was completed
            if (assignment.Status == "completed")
            {
                await _rankService.CheckAndUpgradeRank(profile.Id);
                Console.WriteLine($"🏆 Checked rank upgrade eligibility for volunteer {profile.Id}");
            }
            
            Console.WriteLine($"Final Status: {assignment.Status}");

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

        // ===== ADMIN ENDPOINTS =====

        // GET: api/volunteer/admin/assignments/pending-review
        [HttpGet("admin/assignments/pending-review")]
        [Authorize]
        public async Task<ActionResult<List<VolunteerAssignmentDto>>> GetPendingReviews()
        {
            // Check if user is admin
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var assignments = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Include(va => va.VolunteerProfile)
                    .ThenInclude(vp => vp.User)
                .Where(va => va.Status == "pending_review")
                .OrderBy(va => va.CompletedAt)
                .ToListAsync();

            return Ok(assignments.Select(MapToAssignmentDto));
        }

        // GET: api/volunteer/admin/campaigns/{campaignId}/assignments
        [HttpGet("admin/campaigns/{campaignId}/assignments")]
        [Authorize]
        public async Task<ActionResult<List<VolunteerAssignmentDto>>> GetCampaignAssignments(int campaignId)
        {
            // Check if user is admin
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var assignments = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Include(va => va.VolunteerProfile)
                    .ThenInclude(vp => vp.User)
                .Where(va => va.CampaignId == campaignId)
                .OrderBy(va => va.CreatedAt)
                .ToListAsync();

            return Ok(assignments.Select(MapToAssignmentDto));
        }

        // POST: api/volunteer/admin/assignments/{id}/verify
        [HttpPost("admin/assignments/{id}/verify")]
        [Authorize]
        public async Task<ActionResult> VerifyAssignment(int id, [FromBody] VerifyAssignmentDto dto)
        {
            // Check if user is admin
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var adminId = GetCurrentUserId();
            if (adminId == null) return Unauthorized();

            var assignment = await _context.VolunteerAssignments
                .Include(va => va.Campaign)
                .Include(va => va.VolunteerProfile)
                .FirstOrDefaultAsync(va => va.Id == id);

            if (assignment == null)
                return NotFound(new { message = "Assignment not found" });

            if (assignment.Status != "pending_review")
                return BadRequest(new { message = "Assignment is not pending review" });

            var profile = assignment.VolunteerProfile;

            if (dto.Approve)
            {
                // APPROVE & RATE
                assignment.Status = "verified";
                assignment.Rating = dto.Rating;
                assignment.Feedback = dto.Feedback;
                assignment.VerifiedAt = DateTime.UtcNow;
                assignment.VerifiedBy = adminId.Value;

                // ✅ NOW UPDATE VOLUNTEER STATS (after admin verification)
                profile.TotalTasksCompleted++;
                profile.TotalHoursVolunteered += assignment.ActualHours;
                
                // Track campaign completion for rank progression
                var campaignAlreadyCounted = await _context.VolunteerAssignments
                    .AnyAsync(va => va.VolunteerProfileId == profile.Id && 
                                   va.CampaignId == assignment.CampaignId && 
                                   va.Status == "verified" && 
                                   va.Id != assignment.Id);

                if (!campaignAlreadyCounted)
                {
                    profile.CompletedCampaigns++;
                    profile.TotalCampaignsSupported++;
                }

                // Update average rating
                if (profile.TotalRatings == 0)
                {
                    profile.Rating = dto.Rating;
                    profile.TotalRatings = 1;
                }
                else
                {
                    profile.Rating = ((profile.Rating * profile.TotalRatings) + dto.Rating) / (profile.TotalRatings + 1);
                    profile.TotalRatings++;
                }

                profile.LastActivityAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Check for achievements
                await CheckAndAwardAchievements(profile.Id);

                // Check and upgrade rank if eligible
                await _rankService.CheckAndUpgradeRank(profile.Id);

                // Log activity
                await LogActivity(profile.Id, "work_verified", "Work Verified", 
                    $"Admin verified and rated work: {assignment.Title} - Rating: {dto.Rating}/5", assignment.CampaignId, assignment.Id);

                return Ok(new
                {
                    message = "Assignment verified successfully",
                    profile = new
                    {
                        totalHoursVolunteered = profile.TotalHoursVolunteered,
                        totalTasksCompleted = profile.TotalTasksCompleted,
                        completedCampaigns = profile.CompletedCampaigns,
                        rating = Math.Round(profile.Rating, 2),
                        rank = profile.Rank
                    }
                });
            }
            else
            {
                // REJECT - Request revisions
                assignment.Status = "in_progress";
                assignment.Feedback = dto.Feedback;
                assignment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Log activity
                await LogActivity(profile.Id, "work_rejected", "Work Rejected", 
                    $"Admin requested revisions for: {assignment.Title}", assignment.CampaignId, assignment.Id);

                return Ok(new
                {
                    message = "Assignment sent back for revisions",
                    feedback = dto.Feedback
                });
            }
        }

        // POST: api/volunteer/admin/fix-completed-campaigns
        [HttpPost("admin/fix-completed-campaigns")]
        public async Task<IActionResult> FixCompletedCampaignsCount()
        {
            // Check if user is admin
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            Console.WriteLine("\n=== FIXING COMPLETED CAMPAIGNS COUNT ===");

            // Get all volunteer profiles
            var allProfiles = await _context.VolunteerProfiles.ToListAsync();
            int updatedCount = 0;

            foreach (var profile in allProfiles)
            {
                // Count actual completed assignments
                var actualCompleted = await _context.VolunteerAssignments
                    .Where(va => va.VolunteerProfileId == profile.Id && va.Status == "completed")
                    .CountAsync();

                if (profile.CompletedCampaigns != actualCompleted)
                {
                    Console.WriteLine($"Volunteer {profile.Id}: {profile.CompletedCampaigns} -> {actualCompleted}");
                    profile.CompletedCampaigns = actualCompleted;
                    updatedCount++;
                }
            }

            await _context.SaveChangesAsync();

            // Now check and upgrade ranks for all volunteers with updated counts
            foreach (var profile in allProfiles.Where(p => p.CompletedCampaigns > 0))
            {
                await _rankService.CheckAndUpgradeRank(profile.Id);
            }

            Console.WriteLine($"✅ Updated {updatedCount} volunteer profiles");

            return Ok(new
            {
                message = $"Fixed CompletedCampaigns count for {updatedCount} volunteers and checked rank upgrades",
                updatedCount,
                totalProfiles = allProfiles.Count
            });
        }

        // ===== ADMIN VOLUNTEER APPROVAL ENDPOINTS =====

        // Helper method to safely parse Skills/Interests (handles both JSON arrays and plain strings)
        private List<string> SafeParseStringList(string? value)
        {
            if (string.IsNullOrEmpty(value))
                return new List<string>();

            try
            {
                // Try to deserialize as JSON array first
                var list = JsonSerializer.Deserialize<List<string>>(value);
                return list ?? new List<string>();
            }
            catch (JsonException)
            {
                // If it's not valid JSON, treat it as a comma-separated plain string
                return value.Split(',')
                    .Select(s => s.Trim())
                    .Where(s => !string.IsNullOrEmpty(s))
                    .ToList();
            }
        }

        // GET: api/volunteer/admin/pending-approvals
        [HttpGet("admin/pending-approvals")]
        [Authorize]
        public async Task<ActionResult<List<PendingVolunteerDto>>> GetPendingApprovals()
        {
            // Check if user is admin
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var pendingVolunteers = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .Where(vp => vp.AdminApprovalStatus == "pending")
                .OrderBy(vp => vp.CreatedAt)
                .ToListAsync();

            var result = pendingVolunteers.Select(vp => new PendingVolunteerDto
            {
                Id = vp.Id,
                UserId = vp.UserId,
                UserName = $"{vp.User.FirstName} {vp.User.LastName}",
                UserEmail = vp.User.Email ?? "",
                Skills = SafeParseStringList(vp.Skills),
                Interests = SafeParseStringList(vp.Interests),
                ExperienceLevel = vp.ExperienceLevel,
                YearsOfExperience = vp.YearsOfExperience,
                Location = vp.Location,
                NidPhotoPath = !string.IsNullOrEmpty(vp.User.NidPhotoPath) ? $"/Uploads/{vp.User.NidPhotoPath}" : null,
                VolunteerPhotoPath = !string.IsNullOrEmpty(vp.User.VolunteerPhotoPath) ? $"/Uploads/{vp.User.VolunteerPhotoPath}" : null,
                UtilityBillPath = !string.IsNullOrEmpty(vp.User.UtilityBillPath) ? $"/Uploads/{vp.User.UtilityBillPath}" : null,
                AdminApprovalStatus = vp.AdminApprovalStatus,
                CreatedAt = vp.CreatedAt
            }).ToList();

            return Ok(result);
        }

        // GET: api/volunteer/admin/all-volunteers
        [HttpGet("admin/all-volunteers")]
        [Authorize]
        public async Task<ActionResult<List<PendingVolunteerDto>>> GetAllVolunteers([FromQuery] string? status = null)
        {
            // Check if user is admin
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var query = _context.VolunteerProfiles
                .Include(vp => vp.User)
                .AsQueryable();

            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(vp => vp.AdminApprovalStatus == status);
            }

            var volunteers = await query
                .OrderByDescending(vp => vp.CreatedAt)
                .ToListAsync();

            var result = volunteers.Select(vp => new PendingVolunteerDto
            {
                Id = vp.Id,
                UserId = vp.UserId,
                UserName = $"{vp.User.FirstName} {vp.User.LastName}",
                UserEmail = vp.User.Email ?? "",
                Skills = SafeParseStringList(vp.Skills),
                Interests = SafeParseStringList(vp.Interests),
                ExperienceLevel = vp.ExperienceLevel,
                YearsOfExperience = vp.YearsOfExperience,
                Location = vp.Location,
                NidPhotoPath = !string.IsNullOrEmpty(vp.User.NidPhotoPath) ? $"/Uploads/{vp.User.NidPhotoPath}" : null,
                VolunteerPhotoPath = !string.IsNullOrEmpty(vp.User.VolunteerPhotoPath) ? $"/Uploads/{vp.User.VolunteerPhotoPath}" : null,
                UtilityBillPath = !string.IsNullOrEmpty(vp.User.UtilityBillPath) ? $"/Uploads/{vp.User.UtilityBillPath}" : null,
                AdminApprovalStatus = vp.AdminApprovalStatus,
                CreatedAt = vp.CreatedAt
            }).ToList();

            return Ok(result);
        }

        // POST: api/volunteer/admin/approve/{volunteerId}
        [HttpPost("admin/approve/{volunteerId}")]
        [Authorize]
        public async Task<ActionResult> ApproveVolunteer(int volunteerId, [FromBody] ApproveVolunteerDto dto)
        {
            // Check if user is admin
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "admin")
                return Unauthorized(new { message = "Admin access required" });

            var adminId = GetCurrentUserId();
            if (adminId == null) return Unauthorized();

            var volunteer = await _context.VolunteerProfiles
                .Include(vp => vp.User)
                .FirstOrDefaultAsync(vp => vp.Id == volunteerId);

            if (volunteer == null)
                return NotFound(new { message = "Volunteer not found" });

            if (volunteer.AdminApprovalStatus != "pending")
                return BadRequest(new { message = $"Volunteer is already {volunteer.AdminApprovalStatus}" });

            if (dto.Approve)
            {
                // APPROVE VOLUNTEER
                volunteer.IsApprovedByAdmin = true;
                volunteer.AdminApprovalStatus = "approved";
                volunteer.Status = "active";
                volunteer.ApprovedBy = adminId.Value;
                volunteer.ApprovedAt = DateTime.UtcNow;
                volunteer.ApprovalNotes = dto.ApprovalNotes;

                // Log activity
                await LogActivity(volunteer.Id, "profile_approved", "Profile Approved", 
                    "Your volunteer profile has been approved by admin. You can now receive volunteer requests.", null, null);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Volunteer approved successfully",
                    volunteer = new
                    {
                        id = volunteer.Id,
                        userName = $"{volunteer.User.FirstName} {volunteer.User.LastName}",
                        email = volunteer.User.Email,
                        status = volunteer.AdminApprovalStatus,
                        approvedAt = volunteer.ApprovedAt
                    }
                });
            }
            else
            {
                // REJECT VOLUNTEER
                volunteer.IsApprovedByAdmin = false;
                volunteer.AdminApprovalStatus = "rejected";
                volunteer.Status = "inactive";
                volunteer.ApprovedBy = adminId.Value;
                volunteer.ApprovedAt = DateTime.UtcNow;
                volunteer.ApprovalNotes = dto.ApprovalNotes;

                // Log activity
                await LogActivity(volunteer.Id, "profile_rejected", "Profile Rejected", 
                    dto.ApprovalNotes ?? "Your volunteer profile was rejected by admin.", null, null);

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Volunteer rejected",
                    volunteer = new
                    {
                        id = volunteer.Id,
                        userName = $"{volunteer.User.FirstName} {volunteer.User.LastName}",
                        email = volunteer.User.Email,
                        status = volunteer.AdminApprovalStatus,
                        rejectedAt = volunteer.ApprovedAt,
                        reason = volunteer.ApprovalNotes
                    }
                });
            }
        }

        // ===== HELPER METHODS =====

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

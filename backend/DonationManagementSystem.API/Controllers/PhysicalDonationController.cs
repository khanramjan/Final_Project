using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.DTOs;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.Services;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/physical-donations")]
    public class PhysicalDonationController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ISmsService _smsService;

        public PhysicalDonationController(AppDbContext context, ISmsService smsService)
        {
            _context = context;
            _smsService = smsService;
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim)) return null;
            return int.TryParse(userIdClaim, out var id) ? id : null;
        }

        private static string NormalizePhone(string phone)
        {
            var cleaned = new string(phone.Where(char.IsDigit).ToArray());

            // Accept 01XXXXXXXXX, 8801XXXXXXXXX
            if (cleaned.StartsWith("8801") && cleaned.Length == 13)
            {
                return "+" + cleaned;
            }

            if (cleaned.StartsWith("01") && cleaned.Length == 11)
            {
                return "+88" + cleaned;
            }

            // Fallback: return original numeric-only
            return cleaned;
        }

        private static string GenerateOtp()
        {
            // 6-digit OTP
            var n = RandomNumberGenerator.GetInt32(0, 1000000);
            return n.ToString("D6");
        }

        private static string GenerateReferenceCode()
        {
            // Example: PC260118-AB12CD
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            Span<char> buffer = stackalloc char[6];
            for (var i = 0; i < buffer.Length; i++)
            {
                buffer[i] = chars[RandomNumberGenerator.GetInt32(0, chars.Length)];
            }

            return $"PC{DateTime.UtcNow:yyMMdd}-{new string(buffer)}";
        }

        // Volunteer submits a cash/physical donation collection
        [HttpPost("submit")]
        [Authorize]
        public async Task<IActionResult> Submit([FromBody] CreatePhysicalDonationDto dto)
        {
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "volunteer")
                return Unauthorized(new { message = "Volunteer access required" });

            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            if (dto.Amount <= 0)
                return BadRequest(new { message = "Amount must be greater than 0" });

            if (string.IsNullOrWhiteSpace(dto.DonorPhone))
                return BadRequest(new { message = "Donor phone is required for SMS confirmation" });

            var volunteerProfile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId.Value);

            if (volunteerProfile == null)
                return BadRequest(new { message = "Volunteer profile not found" });

            if (!volunteerProfile.IsApprovedByAdmin || volunteerProfile.AdminApprovalStatus != "approved")
                return BadRequest(new { message = "Your volunteer profile must be approved to submit physical collections" });

            var campaign = await _context.Campaigns.FindAsync(dto.CampaignId);
            if (campaign == null)
                return NotFound(new { message = "Campaign not found" });

            // Check if campaign is still active
            if (campaign.Status != "approved" && campaign.Status != "active")
                return BadRequest(new { message = "This campaign is not active" });

            VolunteerAssignment? assignment = null;
            if (dto.VolunteerAssignmentId.HasValue)
            {
                assignment = await _context.VolunteerAssignments
                    .FirstOrDefaultAsync(a => a.Id == dto.VolunteerAssignmentId.Value);

                if (assignment == null)
                    return BadRequest(new { message = "Volunteer assignment not found" });

                if (assignment.VolunteerProfileId != volunteerProfile.Id)
                    return Unauthorized(new { message = "This assignment does not belong to you" });

                if (assignment.CampaignId != dto.CampaignId)
                    return BadRequest(new { message = "Assignment campaign mismatch" });
            }

            // Generate unique reference code (retry a few times to avoid collisions)
            var referenceCode = GenerateReferenceCode();
            for (var attempt = 0; attempt < 10; attempt++)
            {
                var exists = await _context.PhysicalDonations.AnyAsync(p => p.ReferenceCode == referenceCode);
                if (!exists) break;
                referenceCode = GenerateReferenceCode();
            }

            if (await _context.PhysicalDonations.AnyAsync(p => p.ReferenceCode == referenceCode))
                return StatusCode(500, new { message = "Failed to generate unique reference code" });

            var normalizedPhone = NormalizePhone(dto.DonorPhone);

            // Calculate how much goes to campaign vs reserve fund
            var remainingAmount = campaign.TargetAmount - campaign.RaisedAmount;
            var amountToCampaign = Math.Min(dto.Amount, Math.Max(0, remainingAmount));
            var amountToReserve = dto.Amount - amountToCampaign;

            // Create the Donation record
            var donation = new Donation
            {
                CampaignId = dto.CampaignId,
                UserId = null,
                Amount = dto.Amount,
                PaymentMethod = "cash",
                DonorName = dto.DonorName?.Trim() ?? string.Empty,
                DonorEmail = null,
                IsAnonymous = false,
                Message = dto.Notes ?? "Physical collection by volunteer",
                PaymentReference = referenceCode,
                Status = "completed",
                CreatedAt = DateTime.UtcNow,
                CompletedAt = DateTime.UtcNow
            };

            _context.Donations.Add(donation);

            // Update campaign raised amount (only what goes to campaign)
            campaign.RaisedAmount += amountToCampaign;

            // Check if campaign reached target and mark as completed
            if (campaign.RaisedAmount >= campaign.TargetAmount && campaign.Status == "approved")
            {
                campaign.Status = "completed";
            }

            // Save donation and campaign update first
            await _context.SaveChangesAsync();

            // If there's overflow, add to reserve fund
            if (amountToReserve > 0)
            {
                var reserveEntry = new ReserveFund
                {
                    Amount = amountToReserve,
                    DonationId = donation.Id,
                    CampaignId = campaign.Id,
                    DonorName = dto.DonorName?.Trim() ?? "Anonymous",
                    SourceDescription = $"Overflow from '{campaign.Title}' (Campaign already reached ৳{campaign.TargetAmount})",
                    CreatedAt = DateTime.UtcNow,
                    Notes = $"Original donation: ৳{dto.Amount}, To campaign: ৳{amountToCampaign}, To reserve: ৳{amountToReserve}"
                };

                _context.ReserveFunds.Add(reserveEntry);
            }

            // Create physical donation record for tracking
            var physical = new PhysicalDonation
            {
                CampaignId = dto.CampaignId,
                VolunteerProfileId = volunteerProfile.Id,
                VolunteerAssignmentId = dto.VolunteerAssignmentId,
                Amount = dto.Amount,
                DonorName = dto.DonorName?.Trim() ?? string.Empty,
                DonorPhone = normalizedPhone,
                Notes = dto.Notes,
                ReferenceCode = referenceCode,
                Status = "confirmed",
                ConfirmationOtpHash = null,
                ConfirmationOtpExpiresAt = null,
                CollectedAt = DateTime.UtcNow,
                ConfirmedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                DonationId = donation.Id
            };

            _context.PhysicalDonations.Add(physical);
            await _context.SaveChangesAsync();

            // Send SMS receipt
            var volunteerName = await _context.Users
                .Where(u => u.Id == userId.Value)
                .Select(u => $"{u.FirstName} {u.LastName}")
                .FirstOrDefaultAsync() ?? "Volunteer";

            var smsMessage = $"Thank you for your donation of ৳{dto.Amount} to '{campaign.Title}'. Receipt: {referenceCode}. Collected by: {volunteerName}.";
            
            if (amountToReserve > 0)
            {
                smsMessage += $" Note: ৳{amountToCampaign} to campaign (now completed!), ৳{amountToReserve} to reserve fund for future projects.";
            }
            
            smsMessage += " -Donation Management System";
            await _smsService.SendSmsAsync(normalizedPhone, smsMessage);

            return Ok(new
            {
                message = amountToReserve > 0 
                    ? $"Donation recorded! Campaign reached target. ৳{amountToCampaign} to campaign, ৳{amountToReserve} to reserve fund."
                    : "Physical donation recorded successfully. Donor SMS receipt sent.",
                id = physical.Id,
                donationId = donation.Id,
                referenceCode = referenceCode,
                amount = dto.Amount,
                amountToCampaign = amountToCampaign,
                amountToReserve = amountToReserve,
                campaignCompleted = campaign.Status == "completed"
            });
        }

        // Donor confirms via SMS OTP
        [HttpPost("confirm")]
        [AllowAnonymous]
        public async Task<IActionResult> Confirm([FromBody] ConfirmPhysicalDonationDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ReferenceCode) || string.IsNullOrWhiteSpace(dto.Otp))
                return BadRequest(new { message = "ReferenceCode and Otp are required" });

            var physical = await _context.PhysicalDonations
                .FirstOrDefaultAsync(p => p.ReferenceCode == dto.ReferenceCode);

            if (physical == null)
                return NotFound(new { message = "Reference code not found" });

            if (physical.Status == "confirmed")
                return Ok(new { message = "Already confirmed", donationId = physical.DonationId });

            if (physical.ConfirmationOtpExpiresAt == null || physical.ConfirmationOtpExpiresAt < DateTime.UtcNow)
                return BadRequest(new { message = "OTP expired. Please request a new confirmation." });

            if (string.IsNullOrEmpty(physical.ConfirmationOtpHash) || !BCrypt.Net.BCrypt.Verify(dto.Otp, physical.ConfirmationOtpHash))
                return BadRequest(new { message = "Invalid OTP" });

            var campaign = await _context.Campaigns.FindAsync(physical.CampaignId);
            if (campaign == null)
                return StatusCode(500, new { message = "Campaign missing for this record" });

            if (physical.DonationId == null)
            {
                var donation = new Donation
                {
                    CampaignId = physical.CampaignId,
                    UserId = null,
                    Amount = physical.Amount,
                    PaymentMethod = "cash",
                    DonorName = physical.DonorName,
                    DonorEmail = null,
                    IsAnonymous = false,
                    Message = "Physical collection (confirmed by SMS)",
                    PaymentReference = physical.ReferenceCode,
                    Status = "completed",
                    CreatedAt = physical.CreatedAt,
                    CompletedAt = DateTime.UtcNow
                };

                _context.Donations.Add(donation);

                // Update campaign totals
                campaign.RaisedAmount += physical.Amount;
                
                // Check if campaign goal is reached
                if (campaign.RaisedAmount >= campaign.TargetAmount && campaign.Status == "approved")
                {
                    campaign.Status = "completed";
                }

                await _context.SaveChangesAsync();

                physical.DonationId = donation.Id;
            }

            physical.Status = "confirmed";
            physical.ConfirmedAt = DateTime.UtcNow;
            physical.ConfirmationOtpHash = null;
            physical.ConfirmationOtpExpiresAt = null;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Thank you! Your donation has been confirmed.",
                donationId = physical.DonationId
            });
        }

        // Volunteer view: list my submitted/confirmed physical collections
        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> My([FromQuery] string? status = null)
        {
            var userType = User.FindFirst("UserType")?.Value;
            if (userType != "volunteer")
                return Unauthorized(new { message = "Volunteer access required" });

            var userId = GetCurrentUserId();
            if (userId == null) return Unauthorized();

            var profile = await _context.VolunteerProfiles
                .FirstOrDefaultAsync(vp => vp.UserId == userId.Value);

            if (profile == null)
                return BadRequest(new { message = "Volunteer profile not found" });

            var query = _context.PhysicalDonations
                .Where(p => p.VolunteerProfileId == profile.Id)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
                query = query.Where(p => p.Status == status);

            var items = await query
                .OrderByDescending(p => p.CreatedAt)
                .Take(200)
                .Select(p => new PhysicalDonationDto
                {
                    Id = p.Id,
                    CampaignId = p.CampaignId,
                    Amount = p.Amount,
                    DonorName = p.DonorName,
                    DonorPhone = p.DonorPhone,
                    ReferenceCode = p.ReferenceCode,
                    Status = p.Status,
                    CollectedAt = p.CollectedAt,
                    ConfirmedAt = p.ConfirmedAt,
                    DonationId = p.DonationId
                })
                .ToListAsync();

            return Ok(items);
        }
    }
}

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.Services;
using System.Security.Claims;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IPaymentGatewayService _paymentService;
        private readonly IConfiguration _configuration;

        public PaymentController(
            AppDbContext context,
            IPaymentGatewayService paymentService,
            IConfiguration configuration)
        {
            _context = context;
            _paymentService = paymentService;
            _configuration = configuration;
        }

        /// <summary>
        /// Get available payment methods
        /// </summary>
        [HttpGet("methods")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPaymentMethods()
        {
            try
            {
                var methods = await _paymentService.GetAvailablePaymentMethodsAsync();
                return Ok(new
                {
                    success = true,
                    methods = methods,
                    message = "Available payment methods for Bangladesh"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Initiate a payment transaction
        /// </summary>
        [HttpPost("initiate")]
        [AllowAnonymous]
        public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequest request)
        {
            try
            {
                // Validate campaign exists
                var campaign = await _context.Campaigns.FindAsync(request.CampaignId);
                if (campaign == null)
                    return NotFound(new { success = false, message = "Campaign not found" });

                // Create donation record
                var donation = new Donation
                {
                    Amount = request.Amount,
                    DonorName = request.DonorName ?? "Anonymous",
                    DonorEmail = request.DonorEmail,
                    Message = request.Message,
                    IsAnonymous = request.IsAnonymous,
                    PaymentMethod = request.PaymentMethod,
                    Status = "pending",
                    CampaignId = request.CampaignId,
                    UserId = GetCurrentUserId(),
                    PaymentReference = Guid.NewGuid().ToString()
                };

                _context.Donations.Add(donation);
                await _context.SaveChangesAsync();

                // Prepare payment request
                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                var paymentRequest = new PaymentRequest
                {
                    Amount = request.Amount,
                    DonorName = request.DonorName,
                    DonorEmail = request.DonorEmail,
                    DonorPhone = request.DonorPhone,
                    CampaignTitle = campaign.Title,
                    CampaignId = request.CampaignId,
                    UserId = GetCurrentUserId(),
                    TransactionId = donation.PaymentReference,
                    SuccessUrl = $"{baseUrl}/api/payment/success?ref={donation.PaymentReference}",
                    FailUrl = $"{baseUrl}/api/payment/fail?ref={donation.PaymentReference}",
                    CancelUrl = $"{baseUrl}/api/payment/cancel?ref={donation.PaymentReference}",
                    IpnUrl = $"{baseUrl}/api/payment/ipn"
                };

                var paymentResponse = await _paymentService.InitiatePaymentAsync(paymentRequest);

                if (paymentResponse.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        gatewayUrl = paymentResponse.GatewayUrl,
                        transactionId = paymentResponse.TransactionId,
                        donationId = donation.Id,
                        message = "Payment gateway initiated"
                    });
                }
                else
                {
                    return StatusCode(400, new
                    {
                        success = false,
                        message = paymentResponse.Message,
                        error = paymentResponse.Error
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Handle successful payment callback
        /// </summary>
        [HttpPost("success")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymentSuccess([FromQuery] string? ref_id)
        {
            try
            {
                if (string.IsNullOrEmpty(ref_id))
                    return BadRequest("Invalid reference");

                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.PaymentReference == ref_id);

                if (donation == null)
                    return NotFound("Donation not found");

                // Update donation status
                donation.Status = "completed";
                donation.CompletedAt = DateTime.UtcNow;

                // Update campaign raised amount
                var campaign = await _context.Campaigns.FindAsync(donation.CampaignId);
                if (campaign != null)
                {
                    campaign.RaisedAmount += donation.Amount;
                }

                await _context.SaveChangesAsync();

                // Return success page or redirect to frontend
                return Redirect($"http://localhost:5173/payment/success?donation={donation.Id}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Handle failed payment callback
        /// </summary>
        [HttpPost("fail")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymentFail([FromQuery] string? ref_id)
        {
            try
            {
                if (string.IsNullOrEmpty(ref_id))
                    return BadRequest("Invalid reference");

                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.PaymentReference == ref_id);

                if (donation != null)
                {
                    donation.Status = "failed";
                }

                await _context.SaveChangesAsync();

                return Redirect($"http://localhost:5173/payment/failed?donation={donation?.Id}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Handle payment cancellation
        /// </summary>
        [HttpPost("cancel")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymentCancel([FromQuery] string? ref_id)
        {
            try
            {
                if (string.IsNullOrEmpty(ref_id))
                    return BadRequest("Invalid reference");

                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.PaymentReference == ref_id);

                if (donation != null)
                {
                    donation.Status = "cancelled";
                }

                await _context.SaveChangesAsync();

                return Redirect($"http://localhost:5173/payment/cancelled?donation={donation?.Id}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// IPN callback for instant payment notifications
        /// </summary>
        [HttpPost("ipn")]
        [AllowAnonymous]
        public async Task<IActionResult> PaymentIPN([FromForm] PaymentCallback callback)
        {
            try
            {
                if (callback == null || string.IsNullOrEmpty(callback.TransactionId))
                    return BadRequest("Invalid callback");

                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.PaymentReference == callback.TransactionId);

                if (donation == null)
                    return NotFound();

                // Update donation based on callback status
                if (callback.Status?.ToLower() == "valid")
                {
                    donation.Status = "completed";
                    donation.CompletedAt = DateTime.UtcNow;

                    var campaign = await _context.Campaigns.FindAsync(donation.CampaignId);
                    if (campaign != null)
                    {
                        campaign.RaisedAmount += donation.Amount;
                    }
                }
                else
                {
                    donation.Status = "failed";
                }

                await _context.SaveChangesAsync();

                return Ok(new { status = "success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        /// <summary>
        /// Get payment status
        /// </summary>
        [HttpGet("status/{donationId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPaymentStatus(int donationId)
        {
            try
            {
                var donation = await _context.Donations
                    .Include(d => d.Campaign)
                    .FirstOrDefaultAsync(d => d.Id == donationId);

                if (donation == null)
                    return NotFound(new { success = false, message = "Donation not found" });

                return Ok(new
                {
                    success = true,
                    donationId = donation.Id,
                    amount = donation.Amount,
                    status = donation.Status,
                    campaignTitle = donation.Campaign?.Title,
                    donorName = donation.IsAnonymous ? "Anonymous" : donation.DonorName,
                    createdAt = donation.CreatedAt,
                    completedAt = donation.CompletedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            return string.IsNullOrEmpty(userIdClaim) ? null : int.Parse(userIdClaim);
        }
    }

    // ============ DTOs ============

    public class InitiatePaymentRequest
    {
        public decimal Amount { get; set; }
        public string? DonorName { get; set; }
        public string? DonorEmail { get; set; }
        public string? DonorPhone { get; set; }
        public string? Message { get; set; }
        public bool IsAnonymous { get; set; } = false;
        public string PaymentMethod { get; set; } = "bkash"; // Default to bKash
        public int CampaignId { get; set; }
    }
}

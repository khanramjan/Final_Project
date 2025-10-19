using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.Services;

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
        /// Get all available payment methods
        /// </summary>
        [HttpGet("methods")]
        public async Task<IActionResult> GetPaymentMethods()
        {
            try
            {
                var methods = await _paymentService.GetAvailablePaymentMethodsAsync();
                return Ok(new { success = true, methods });
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
        public async Task<IActionResult> InitiatePayment([FromBody] InitiatePaymentRequest request)
        {
            try
            {
                // Validate campaign exists
                var campaign = await _context.Campaigns.FindAsync(request.CampaignId);
                if (campaign == null)
                {
                    return NotFound(new { success = false, message = "Campaign not found" });
                }

                // Validate amount
                if (request.Amount < 10)
                {
                    return BadRequest(new { success = false, message = "Minimum donation amount is 10 BDT" });
                }

                // Create donation record with pending status
                var donation = new Donation
                {
                    CampaignId = request.CampaignId,
                    UserId = request.UserId,
                    Amount = request.Amount,
                    PaymentMethod = request.PaymentMethod,
                    DonorName = request.IsAnonymous ? "Anonymous" : request.DonorName,
                    DonorEmail = request.DonorEmail,
                    IsAnonymous = request.IsAnonymous,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow
                };

                _context.Donations.Add(donation);
                await _context.SaveChangesAsync();

                // Generate unique transaction ID
                var transactionId = $"TXN{donation.Id}_{DateTime.UtcNow.Ticks}";

                // Get frontend URL from configuration
                var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5174";

                // Prepare payment request
                var paymentRequest = new PaymentRequest
                {
                    TransactionId = transactionId,
                    CampaignId = campaign.Id,
                    DonationId = donation.Id,
                    Amount = request.Amount,
                    CustomerName = request.IsAnonymous ? "Anonymous Donor" : request.DonorName,
                    CustomerEmail = request.DonorEmail ?? "noreply@donation.com",
                    CustomerPhone = request.DonorPhone ?? "01700000000",
                    ProductName = $"Donation to {campaign.Title}",
                    SuccessUrl = $"{frontendUrl}/payment/success",
                    FailUrl = $"{frontendUrl}/payment/failed",
                    CancelUrl = $"{frontendUrl}/payment/cancelled",
                    IpnUrl = $"{Request.Scheme}://{Request.Host}/api/payment/ipn",
                    IsAnonymous = request.IsAnonymous
                };

                // Initiate payment with SSLCommerz
                var paymentResponse = await _paymentService.InitiatePaymentAsync(paymentRequest);

                if (!paymentResponse.Success || string.IsNullOrEmpty(paymentResponse.GatewayPageURL))
                {
                    donation.Status = "failed";
                    await _context.SaveChangesAsync();

                    return BadRequest(new
                    {
                        success = false,
                        message = paymentResponse.Message
                    });
                }

                // Update donation with transaction ID
                donation.PaymentReference = transactionId;
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Payment initiated successfully",
                    gatewayUrl = paymentResponse.GatewayPageURL,
                    donationId = donation.Id,
                    transactionId = transactionId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"Error initiating payment: {ex.Message}"
                });
            }
        }

        /// <summary>
        /// Payment success callback from SSLCommerz
        /// </summary>
        [HttpPost("success")]
        public async Task<IActionResult> PaymentSuccess([FromForm] PaymentCallback callback)
        {
            try
            {
                // Validate payment with SSLCommerz
                var validation = await _paymentService.ValidatePaymentAsync(callback.ValidationId ?? callback.TransactionId ?? "");

                if (!validation.IsValid)
                {
                    return BadRequest(new { success = false, message = "Payment validation failed" });
                }

                // Find donation by transaction ID
                var donation = await _context.Donations
                    .Include(d => d.Campaign)
                    .FirstOrDefaultAsync(d => d.PaymentReference == callback.TransactionId);

                if (donation == null)
                {
                    return NotFound(new { success = false, message = "Donation not found" });
                }

                // Update donation status
                donation.Status = "completed";
                donation.CompletedAt = DateTime.UtcNow;

                // Update campaign raised amount
                if (donation.Campaign != null)
                {
                    donation.Campaign.RaisedAmount += donation.Amount;
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Payment completed successfully",
                    donationId = donation.Id,
                    amount = donation.Amount
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Payment failure callback from SSLCommerz
        /// </summary>
        [HttpPost("fail")]
        public async Task<IActionResult> PaymentFail([FromForm] PaymentCallback callback)
        {
            try
            {
                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.PaymentReference == callback.TransactionId);

                if (donation != null)
                {
                    donation.Status = "failed";
                    await _context.SaveChangesAsync();
                }

                return Ok(new { success = false, message = "Payment failed" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Payment cancellation callback from SSLCommerz
        /// </summary>
        [HttpPost("cancel")]
        public async Task<IActionResult> PaymentCancel([FromForm] PaymentCallback callback)
        {
            try
            {
                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.PaymentReference == callback.TransactionId);

                if (donation != null)
                {
                    donation.Status = "cancelled";
                    await _context.SaveChangesAsync();
                }

                return Ok(new { success = false, message = "Payment cancelled by user" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// IPN (Instant Payment Notification) from SSLCommerz
        /// </summary>
        [HttpPost("ipn")]
        public async Task<IActionResult> PaymentIPN([FromForm] PaymentCallback callback)
        {
            try
            {
                // Validate the payment
                var validation = await _paymentService.ValidatePaymentAsync(callback.ValidationId ?? callback.TransactionId ?? "");

                if (!validation.IsValid)
                {
                    return BadRequest(new { success = false, message = "IPN validation failed" });
                }

                var donation = await _context.Donations
                    .Include(d => d.Campaign)
                    .FirstOrDefaultAsync(d => d.PaymentReference == callback.TransactionId);

                if (donation != null && donation.Status == "pending")
                {
                    donation.Status = "completed";
                    donation.CompletedAt = DateTime.UtcNow;

                    if (donation.Campaign != null)
                    {
                        donation.Campaign.RaisedAmount += donation.Amount;
                    }

                    await _context.SaveChangesAsync();
                }

                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Get payment status by donation ID
        /// </summary>
        [HttpGet("status/{donationId}")]
        public async Task<IActionResult> GetPaymentStatus(int donationId)
        {
            try
            {
                var donation = await _context.Donations
                    .Include(d => d.Campaign)
                    .FirstOrDefaultAsync(d => d.Id == donationId);

                if (donation == null)
                {
                    return NotFound(new { success = false, message = "Donation not found" });
                }

                return Ok(new
                {
                    success = true,
                    donationId = donation.Id,
                    status = donation.Status,
                    amount = donation.Amount,
                    paymentMethod = donation.PaymentMethod,
                    transactionId = donation.PaymentReference,
                    campaignTitle = donation.Campaign?.Title,
                    createdAt = donation.CreatedAt,
                    completedAt = donation.CompletedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    // Request DTOs
    public class InitiatePaymentRequest
    {
        public int CampaignId { get; set; }
        public int? UserId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string DonorName { get; set; } = string.Empty;
        public string? DonorEmail { get; set; }
        public string? DonorPhone { get; set; }
        public bool IsAnonymous { get; set; }
    }
}

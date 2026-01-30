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
                // Validate model state
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(new { success = false, message = "Validation failed", errors });
                }

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
                var backendUrl = $"{Request.Scheme}://{Request.Host}";

                // Prepare payment request - SSLCommerz will POST to backend, backend will redirect to frontend
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
                    SuccessUrl = $"{backendUrl}/api/payment/success",
                    FailUrl = $"{backendUrl}/api/payment/fail",
                    CancelUrl = $"{backendUrl}/api/payment/cancel",
                    IpnUrl = $"{backendUrl}/api/payment/ipn",
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
        [HttpGet("success")]  // Also handle GET requests for testing
        public async Task<IActionResult> PaymentSuccess([FromForm] PaymentCallback callback, [FromQuery] PaymentCallback queryCallback)
        {
            // Merge form data and query string data
            var cb = callback;
            if (string.IsNullOrEmpty(cb.TransactionId) && !string.IsNullOrEmpty(queryCallback.TransactionId))
            {
                cb = queryCallback;
            }
            
            var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5173";
            
            try
            {
                var isSandbox = _configuration.GetValue<bool>("Payment:SSLCommerz:IsSandbox", true);
                
                // Log everything for debugging
                Console.WriteLine($"\n=== Payment Success Callback ===");
                Console.WriteLine($"Transaction ID: {cb.TransactionId ?? "NULL"}");
                Console.WriteLine($"Validation ID: {cb.ValidationId ?? "NULL"}");
                Console.WriteLine($"Donation ID (value_b): {cb.DonationId ?? "NULL"}");
                Console.WriteLine($"Campaign ID (value_a): {cb.CampaignId ?? "NULL"}");
                Console.WriteLine($"Amount: {cb.Amount}");
                Console.WriteLine($"Status: {cb.Status ?? "NULL"}");
                Console.WriteLine($"Is Sandbox: {isSandbox}");
                
                // In sandbox mode, ALWAYS skip validation
                if (isSandbox)
                {
                    Console.WriteLine("✓ Sandbox mode - skipping SSLCommerz validation");
                }

                // Find donation - try multiple methods
                Donation? donation = null;
                
                // Method 1: By donation ID from value_b
                if (!string.IsNullOrEmpty(cb.DonationId) && int.TryParse(cb.DonationId, out int donationId))
                {
                    Console.WriteLine($"Method 1: Looking for donation by ID: {donationId}");
                    donation = await _context.Donations
                        .Include(d => d.Campaign)
                        .FirstOrDefaultAsync(d => d.Id == donationId);
                    
                    if (donation != null)
                    {
                        Console.WriteLine($"✓ Found donation by ID: {donation.Id}");
                    }
                }
                
                // Method 2: By transaction ID
                if (donation == null && !string.IsNullOrEmpty(cb.TransactionId))
                {
                    Console.WriteLine($"Method 2: Looking for donation by Transaction ID: {cb.TransactionId}");
                    donation = await _context.Donations
                        .Include(d => d.Campaign)
                        .FirstOrDefaultAsync(d => d.PaymentReference == cb.TransactionId);
                    
                    if (donation != null)
                    {
                        Console.WriteLine($"✓ Found donation by TransactionID: {donation.Id}");
                    }
                }
                
                // Method 3: Get most recent pending donation as fallback (sandbox mode only)
                if (donation == null && isSandbox)
                {
                    Console.WriteLine($"Method 3: Looking for most recent pending donation...");
                    donation = await _context.Donations
                        .Include(d => d.Campaign)
                        .Where(d => d.Status == "pending")
                        .OrderByDescending(d => d.Id)
                        .FirstOrDefaultAsync();
                    
                    if (donation != null)
                    {
                        Console.WriteLine($"✓ Found most recent pending donation: {donation.Id}");
                    }
                }

                if (donation == null)
                {
                    Console.WriteLine("✗ ERROR: Donation not found by any method!");
                    Console.WriteLine("Checking database...");
                    var recentDonations = await _context.Donations
                        .OrderByDescending(d => d.Id)
                        .Take(5)
                        .Select(d => new { d.Id, d.Status, d.PaymentReference, d.Amount })
                        .ToListAsync();
                    
                    Console.WriteLine($"Recent donations in database:");
                    foreach (var d in recentDonations)
                    {
                        Console.WriteLine($"  ID: {d.Id}, Status: {d.Status}, PaymentRef: {d.PaymentReference}, Amount: {d.Amount}");
                    }
                    
                    return Redirect($"{frontendUrl}/payment/failed?message=Donation not found in database");
                }

                Console.WriteLine($"\n✓ Processing donation: ID={donation.Id}, Status={donation.Status}, Amount=৳{donation.Amount}");

                // Update donation status
                if (donation.Status == "pending" || donation.Status == "failed")
                {
                    Console.WriteLine("Updating donation status to 'completed'...");
                    donation.Status = "completed";
                    donation.CompletedAt = DateTime.UtcNow;

                    // Update campaign raised amount with overflow handling
                    if (donation.Campaign != null)
                    {
                        var oldAmount = donation.Campaign.RaisedAmount;
                        var remainingNeeded = donation.Campaign.TargetAmount - donation.Campaign.RaisedAmount;
                        var amountToCampaign = Math.Min(donation.Amount, Math.Max(0, remainingNeeded));
                        var amountToReserve = donation.Amount - amountToCampaign;
                        
                        donation.Campaign.RaisedAmount += amountToCampaign;
                        Console.WriteLine($"Campaign ID: {donation.Campaign.Id}");
                        Console.WriteLine($"Campaign raised amount: ৳{oldAmount} → ৳{donation.Campaign.RaisedAmount} (+৳{amountToCampaign})");
                        
                        if (amountToReserve > 0)
                        {
                            Console.WriteLine($"⚠️ Overflow detected: ৳{amountToReserve} will go to reserve fund");
                        }
                        
                        // Check if campaign goal is reached and mark as completed
                        if (donation.Campaign.RaisedAmount >= donation.Campaign.TargetAmount && donation.Campaign.Status == "active")
                        {
                            donation.Campaign.Status = "completed";
                            Console.WriteLine($"✓ Campaign goal reached! Marking campaign as COMPLETED (Goal: ৳{donation.Campaign.TargetAmount})");
                        }
                        
                        await _context.SaveChangesAsync();
                        
                        // Add overflow to reserve fund
                        if (amountToReserve > 0)
                        {
                            var reserveEntry = new ReserveFund
                            {
                                Amount = amountToReserve,
                                DonationId = donation.Id,
                                CampaignId = donation.Campaign.Id,
                                DonorName = donation.DonorName ?? "Anonymous",
                                SourceDescription = $"Overflow from '{donation.Campaign.Title}' (Campaign already reached ৳{donation.Campaign.TargetAmount})",
                                CreatedAt = DateTime.UtcNow,
                                Notes = $"Original donation: ৳{donation.Amount}, To campaign: ৳{amountToCampaign}, To reserve: ৳{amountToReserve}"
                            };
                            
                            _context.ReserveFunds.Add(reserveEntry);
                            await _context.SaveChangesAsync();
                            Console.WriteLine($"✓ Added ৳{amountToReserve} to reserve fund");
                        }
                    }
                    else
                    {
                        Console.WriteLine("✗ WARNING: donation.Campaign is NULL! Cannot update RaisedAmount");
                    }
                    Console.WriteLine("✓ Database updated successfully!");
                    
                    // Verify the update
                    var verifyDonation = await _context.Donations
                        .Include(d => d.Campaign)
                        .FirstOrDefaultAsync(d => d.Id == donation.Id);
                    
                    if (verifyDonation?.Campaign != null)
                    {
                        Console.WriteLine($"✓ VERIFICATION: Campaign RaisedAmount in DB is now: ৳{verifyDonation.Campaign.RaisedAmount}");
                    }
                }
                else
                {
                    Console.WriteLine($"Donation already processed (status: {donation.Status})");
                }

                // Redirect to frontend success page
                var redirectUrl = $"{frontendUrl}/payment/success?donationId={donation.Id}&transactionId={cb.TransactionId}";
                Console.WriteLine($"\n✓ Redirecting to: {redirectUrl}\n");
                return Redirect(redirectUrl);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n✗ ERROR in PaymentSuccess: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}\n");
                return Redirect($"{frontendUrl}/payment/failed?message={Uri.EscapeDataString(ex.Message)}");
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
                var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5174";
                
                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.PaymentReference == callback.TransactionId);

                if (donation != null)
                {
                    donation.Status = "failed";
                    await _context.SaveChangesAsync();
                }

                return Redirect($"{frontendUrl}/payment/failed?transactionId={callback.TransactionId}&message=Payment failed");
            }
            catch (Exception ex)
            {
                var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5174";
                return Redirect($"{frontendUrl}/payment/failed?message={Uri.EscapeDataString(ex.Message)}");
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
                var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5174";
                
                var donation = await _context.Donations
                    .FirstOrDefaultAsync(d => d.PaymentReference == callback.TransactionId);

                if (donation != null)
                {
                    donation.Status = "cancelled";
                    await _context.SaveChangesAsync();
                }

                return Redirect($"{frontendUrl}/payment/cancelled?transactionId={callback.TransactionId}");
            }
            catch (Exception ex)
            {
                var frontendUrl = _configuration["AppSettings:FrontendUrl"] ?? "http://localhost:5174";
                return Redirect($"{frontendUrl}/payment/cancelled?message={Uri.EscapeDataString(ex.Message)}");
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
                        
                        // Check if campaign goal is reached
                        if (donation.Campaign.RaisedAmount >= donation.Campaign.TargetAmount && donation.Campaign.Status == "active")
                        {
                            donation.Campaign.Status = "completed";
                        }
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
                    campaignId = donation.CampaignId,
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

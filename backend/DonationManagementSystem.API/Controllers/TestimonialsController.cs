using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Data;
using DonationManagementSystem.API.Models;
using DonationManagementSystem.API.DTOs;
using DonationManagementSystem.API.Services.ML;

namespace DonationManagementSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestimonialsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IMLPredictionService _mlPredictionService;

        private static readonly string[] ScamSignals =
        {
            "scam", "fraud", "fake", "stolen", "theft", "phishing",
            "suspicious", "cheat", "con", "money disappeared", "never received", "misused funds"
        };

        public TestimonialsController(AppDbContext context, IMLPredictionService mlPredictionService)
        {
            _context = context;
            _mlPredictionService = mlPredictionService;
        }

        private static string MapSentimentLabel(bool isPositive, float probability, int rating)
        {
            if (!isPositive || rating <= 2 || probability < 0.4f) return "negative";
            if (probability >= 0.7f && rating >= 4) return "positive";
            return "neutral";
        }

        private static bool DetectScamRisk(string comment)
        {
            var normalized = comment.ToLowerInvariant();
            return ScamSignals.Any(signal => normalized.Contains(signal, StringComparison.Ordinal));
        }

        private static string MapRiskLabel(bool isScamRisk, string sentimentLabel)
        {
            if (isScamRisk) return "scam-risk";
            if (sentimentLabel == "negative") return "complaint";
            return "normal";
        }

        // GET: api/testimonials/public - Get approved testimonials for landing page
        [HttpGet("public")]
        public async Task<ActionResult<List<TestimonialDto>>> GetPublicTestimonials([FromQuery] int limit = 10)
        {
            try
            {
                var testimonials = await _context.Testimonials
                    .Where(t => t.IsApproved && t.IsActive)
                    .OrderByDescending(t => t.IsFeatured)
                    .ThenByDescending(t => t.CreatedAt)
                    .Take(limit)
                    .Select(t => new TestimonialDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Position = t.Position,
                        Organization = t.Organization,
                        AvatarUrl = t.AvatarUrl,
                        Rating = t.Rating,
                        Comment = t.Comment,
                        BadgeType = t.BadgeType,
                        SentimentLabel = t.SentimentLabel,
                        SentimentScore = t.SentimentScore,
                        SentimentConfidence = t.SentimentConfidence,
                        RiskLabel = t.RiskLabel,
                        IsScamRisk = t.IsScamRisk,
                        AnalyzedAt = t.AnalyzedAt,
                        IsApproved = t.IsApproved,
                        IsFeatured = t.IsFeatured,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                return Ok(testimonials);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch testimonials", error = ex.Message });
            }
        }

        // GET: api/testimonials - Get all testimonials (admin only)
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<TestimonialListDto>> GetAllTestimonials(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool? isApproved = null)
        {
            try
            {
                var userType = User.Claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                if (userType != "admin")
                {
                    return Forbid();
                }

                var query = _context.Testimonials.AsQueryable();

                if (isApproved.HasValue)
                {
                    query = query.Where(t => t.IsApproved == isApproved.Value);
                }

                var totalCount = await query.CountAsync();

                var testimonials = await query
                    .OrderByDescending(t => t.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new TestimonialDto
                    {
                        Id = t.Id,
                        Name = t.Name,
                        Position = t.Position,
                        Organization = t.Organization,
                        AvatarUrl = t.AvatarUrl,
                        Rating = t.Rating,
                        Comment = t.Comment,
                        BadgeType = t.BadgeType,
                        SentimentLabel = t.SentimentLabel,
                        SentimentScore = t.SentimentScore,
                        SentimentConfidence = t.SentimentConfidence,
                        RiskLabel = t.RiskLabel,
                        IsScamRisk = t.IsScamRisk,
                        AnalyzedAt = t.AnalyzedAt,
                        IsApproved = t.IsApproved,
                        IsFeatured = t.IsFeatured,
                        CreatedAt = t.CreatedAt
                    })
                    .ToListAsync();

                return Ok(new TestimonialListDto
                {
                    Testimonials = testimonials,
                    TotalCount = totalCount,
                    PageSize = pageSize,
                    CurrentPage = page
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch testimonials", error = ex.Message });
            }
        }

        // POST: api/testimonials - Submit a new testimonial (requires authentication)
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TestimonialDto>> CreateTestimonial([FromBody] CreateTestimonialDto dto)
        {
            try
            {
                // Get authenticated user ID
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
                {
                    return Unauthorized(new { message = "User not authenticated" });
                }

                // Get user information from database
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                // Check if user submitted a testimonial in the last 7 days
                var oneWeekAgo = DateTime.UtcNow.AddDays(-7);
                var recentTestimonial = await _context.Testimonials
                    .Where(t => t.UserId == userId && t.CreatedAt >= oneWeekAgo)
                    .OrderByDescending(t => t.CreatedAt)
                    .FirstOrDefaultAsync();
                
                if (recentTestimonial != null)
                {
                    var daysRemaining = 7 - (DateTime.UtcNow - recentTestimonial.CreatedAt).Days;
                    return BadRequest(new { message = $"You can submit another review in {daysRemaining} day(s). Each user can submit one review per week." });
                }

                // Validation
                if (dto.Rating < 1 || dto.Rating > 5)
                {
                    return BadRequest(new { message = "Rating must be between 1 and 5" });
                }

                if (string.IsNullOrWhiteSpace(dto.Comment))
                {
                    return BadRequest(new { message = "Comment is required" });
                }

                if (dto.Comment.Length > 500)
                {
                    return BadRequest(new { message = "Comment must be less than 500 characters" });
                }

                var analyzedComment = dto.Comment.Trim();
                var sentimentPrediction = await _mlPredictionService.AnalyzeSentimentAsync(analyzedComment);
                var sentimentLabel = MapSentimentLabel(sentimentPrediction.IsPositive, sentimentPrediction.Probability, dto.Rating);
                var isScamRisk = DetectScamRisk(analyzedComment);
                var riskLabel = MapRiskLabel(isScamRisk, sentimentLabel);

                var testimonial = new Testimonial
                {
                    Name = $"{user.FirstName} {user.LastName}".Trim(),
                    Position = dto.Position?.Trim() ?? string.Empty,
                    Organization = dto.Organization?.Trim() ?? string.Empty,
                    Email = user.Email,
                    Rating = dto.Rating,
                    Comment = analyzedComment,
                    BadgeType = dto.BadgeType?.Trim(),
                    SentimentLabel = sentimentLabel,
                    SentimentScore = sentimentPrediction.Probability,
                    SentimentConfidence = sentimentPrediction.Probability,
                    RiskLabel = riskLabel,
                    IsScamRisk = isScamRisk,
                    AnalyzedAt = DateTime.UtcNow,
                    UserId = userId,
                    IsApproved = true, // Auto-approved - no admin approval needed
                    IsFeatured = false,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    ApprovedAt = DateTime.UtcNow
                };

                _context.Testimonials.Add(testimonial);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "Thank you for your review! It has been published successfully.",
                    testimonialId = testimonial.Id,
                    sentiment = new
                    {
                        testimonial.SentimentLabel,
                        testimonial.SentimentScore,
                        testimonial.RiskLabel,
                        testimonial.IsScamRisk
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to submit testimonial", error = ex.Message });
            }
        }

        // PUT: api/testimonials/{id} - Update testimonial status (admin only)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateTestimonial(int id, [FromBody] UpdateTestimonialDto dto)
        {
            try
            {
                var userType = User.Claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "UserId")?.Value;

                if (userType != "admin")
                {
                    return Forbid();
                }

                var testimonial = await _context.Testimonials.FindAsync(id);
                if (testimonial == null)
                {
                    return NotFound(new { message = "Testimonial not found" });
                }

                // Update fields if provided
                if (dto.IsApproved.HasValue)
                {
                    testimonial.IsApproved = dto.IsApproved.Value;
                    if (dto.IsApproved.Value)
                    {
                        testimonial.ApprovedAt = DateTime.UtcNow;
                        if (int.TryParse(userIdClaim, out int userId))
                        {
                            testimonial.ApprovedByUserId = userId;
                        }
                    }
                }

                if (dto.IsFeatured.HasValue)
                {
                    testimonial.IsFeatured = dto.IsFeatured.Value;
                }

                if (dto.IsActive.HasValue)
                {
                    testimonial.IsActive = dto.IsActive.Value;
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = "Testimonial updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to update testimonial", error = ex.Message });
            }
        }

        // DELETE: api/testimonials/{id} - Delete testimonial (admin only)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteTestimonial(int id)
        {
            try
            {
                var userType = User.Claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                if (userType != "admin")
                {
                    return Forbid();
                }

                var testimonial = await _context.Testimonials.FindAsync(id);
                if (testimonial == null)
                {
                    return NotFound(new { message = "Testimonial not found" });
                }

                _context.Testimonials.Remove(testimonial);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Testimonial deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to delete testimonial", error = ex.Message });
            }
        }

        // GET: api/testimonials/stats - Get testimonial statistics (admin only)
        [HttpGet("stats")]
        [Authorize]
        public async Task<ActionResult> GetTestimonialStats()
        {
            try
            {
                var userType = User.Claims.FirstOrDefault(c => c.Type == "UserType")?.Value;
                if (userType != "admin")
                {
                    return Forbid();
                }

                var stats = new
                {
                    total = await _context.Testimonials.CountAsync(),
                    approved = await _context.Testimonials.CountAsync(t => t.IsApproved),
                    pending = await _context.Testimonials.CountAsync(t => !t.IsApproved),
                    featured = await _context.Testimonials.CountAsync(t => t.IsFeatured),
                    averageRating = await _context.Testimonials
                        .Where(t => t.IsApproved)
                        .AverageAsync(t => (double?)t.Rating) ?? 0,
                    sentiment = new TestimonialSentimentStatsDto
                    {
                        Total = await _context.Testimonials.CountAsync(t => t.IsApproved),
                        Positive = await _context.Testimonials.CountAsync(t => t.IsApproved && t.SentimentLabel == "positive"),
                        Neutral = await _context.Testimonials.CountAsync(t => t.IsApproved && t.SentimentLabel == "neutral"),
                        Negative = await _context.Testimonials.CountAsync(t => t.IsApproved && t.SentimentLabel == "negative"),
                        ScamRisk = await _context.Testimonials.CountAsync(t => t.IsApproved && t.IsScamRisk),
                        AverageSentimentScore = await _context.Testimonials
                            .Where(t => t.IsApproved)
                            .AverageAsync(t => (double?)t.SentimentScore) ?? 0
                    }
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to fetch statistics", error = ex.Message });
            }
        }
    }
}

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;

namespace DonationManagementSystem.API
{
    /// <summary>
    /// Middleware that prevents demo accounts from performing any write operations (POST, PUT, PATCH, DELETE).
    /// Demo accounts can browse everything but cannot mutate any data.
    /// </summary>
    public class DemoAccountReadOnlyMiddleware
    {
        private readonly RequestDelegate _next;

        // The email addresses that are considered demo/read-only accounts
        private static readonly HashSet<string> DemoEmails = new(StringComparer.OrdinalIgnoreCase)
        {
            "demo.admin@donationmanagement.com",
            "demo.volunteer@donationmanagement.com"
        };

        // HTTP methods that are considered mutating (write) operations
        private static readonly HashSet<string> MutatingMethods = new(StringComparer.OrdinalIgnoreCase)
        {
            "POST", "PUT", "PATCH", "DELETE"
        };

        // Paths that are always allowed even for demo accounts (login, logout, token refresh)
        private static readonly string[] AllowedPaths =
        {
            "/api/auth/login",
            "/api/auth/logout",
            "/api/auth/refresh-token",
        };

        public DemoAccountReadOnlyMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Only intercept mutating methods
            if (!MutatingMethods.Contains(context.Request.Method))
            {
                await _next(context);
                return;
            }

            // Allow auth-related paths regardless
            var path = context.Request.Path.Value ?? string.Empty;
            if (AllowedPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase)))
            {
                await _next(context);
                return;
            }

            // Check if the authenticated user is a demo account
            var userEmail = GetEmailFromToken(context);
            if (userEmail != null && DemoEmails.Contains(userEmail))
            {
                context.Response.StatusCode = StatusCodes.Status403Forbidden;
                context.Response.ContentType = "application/json";

                var response = new
                {
                    message = "Demo accounts are read-only. This action is not permitted. Please create a real account to use this feature.",
                    isDemoRestriction = true
                };

                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                return;
            }

            await _next(context);
        }

        private static string? GetEmailFromToken(HttpContext context)
        {
            // Try to get email from already-parsed claims (set by UseAuthentication middleware)
            var emailClaim = context.User?.FindFirst(ClaimTypes.Email)
                          ?? context.User?.FindFirst("email")
                          ?? context.User?.FindFirst(JwtRegisteredClaimNames.Email);

            if (emailClaim != null)
                return emailClaim.Value;

            // Fallback: read Authorization header directly
            var authHeader = context.Request.Headers.Authorization.FirstOrDefault();
            if (authHeader == null || !authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
                return null;

            var token = authHeader["Bearer ".Length..].Trim();
            try
            {
                var handler = new JwtSecurityTokenHandler();
                if (!handler.CanReadToken(token)) return null;

                var jwtToken = handler.ReadJwtToken(token);
                return jwtToken.Claims
                    .FirstOrDefault(c => c.Type == ClaimTypes.Email
                                      || c.Type == "email"
                                      || c.Type == JwtRegisteredClaimNames.Email)
                    ?.Value;
            }
            catch
            {
                return null;
            }
        }
    }
}

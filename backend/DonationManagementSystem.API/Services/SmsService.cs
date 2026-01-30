using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DonationManagementSystem.API.Services
{
    /// <summary>
    /// Minimal SMS sender abstraction.
    /// Current implementation logs messages (safe default) and can be replaced with a real provider.
    /// </summary>
    public class SmsService : ISmsService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<SmsService> _logger;

        public SmsService(IConfiguration config, ILogger<SmsService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public Task SendSmsAsync(string toPhone, string message)
        {
            var provider = (_config["Sms:Provider"] ?? "console").ToLowerInvariant();

            // Safe default: don't call external networks by surprise.
            if (provider == "console" || provider == "log")
            {
                _logger.LogInformation("[SMS:{Provider}] To={Phone} Message={Message}", provider, toPhone, message);
                return Task.CompletedTask;
            }

            // Placeholder for future providers (e.g., Twilio / local BD gateway)
            _logger.LogWarning("SMS provider '{Provider}' is not implemented. Falling back to log.", provider);
            _logger.LogInformation("[SMS:FALLBACK] To={Phone} Message={Message}", toPhone, message);
            return Task.CompletedTask;
        }
    }
}

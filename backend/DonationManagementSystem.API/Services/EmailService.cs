using System.Net;
using System.Net.Mail;

namespace DonationManagementSystem.API.Services
{
	public class EmailService : IEmailService
	{
		private readonly IConfiguration _config;
		private readonly ILogger<EmailService> _logger;

		public EmailService(IConfiguration config, ILogger<EmailService> logger)
		{
			_config = config;
			_logger = logger;
		}

		public async Task SendEmailAsync(string toEmail, string subject, string body)
		{
			try
			{
				var smtpHost = _config["Email:SmtpHost"];
				var smtpPort = int.Parse(_config["Email:SmtpPort"] ?? "587");
				var fromEmail = _config["Email:FromEmail"];
				var fromName = _config["Email:FromName"];
				var username = _config["Email:Username"];
				// Read password from environment variable first, fallback to config
				var password = Environment.GetEnvironmentVariable("EMAIL_PASSWORD") ?? _config["Email:Password"];
				var enableSsl = bool.Parse(_config["Email:EnableSsl"] ?? "true");
				
				if (string.IsNullOrEmpty(password))
				{
					throw new Exception("Email password not configured. Set EMAIL_PASSWORD environment variable.");
				}

				using var client = new SmtpClient(smtpHost, smtpPort)
				{
					EnableSsl = enableSsl,
					Credentials = new NetworkCredential(username, password)
				};

				var mailMessage = new MailMessage
				{
					From = new MailAddress(fromEmail ?? username!, fromName),
					Subject = subject,
					Body = body,
					IsBodyHtml = true
				};

				mailMessage.To.Add(toEmail);

				await client.SendMailAsync(mailMessage);
				_logger.LogInformation($"Email sent successfully to {toEmail}");
			}
			catch (Exception ex)
			{
				_logger.LogError($"Failed to send email to {toEmail}: {ex.Message}");
				throw new Exception($"Email sending failed: {ex.Message}");
			}
		}

		public async Task SendVerificationEmailAsync(string toEmail, string firstName, string verificationToken, string verificationUrl)
		{
			var subject = "Verify Your Email - Donation Management System";
			var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
        .button {{ display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Email Verification</h1>
        </div>
        <div class='content'>
            <h2>Hello {firstName}!</h2>
            <p>Thank you for registering with the Donation Management System.</p>
            <p>Please verify your email address by clicking the button below:</p>
            <div style='text-align: center;'>
                <a href='{verificationUrl}' class='button'>Verify Email Address</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style='word-break: break-all; color: #4F46E5;'>{verificationUrl}</p>
            <p><strong>This link will expire in 24 hours.</strong></p>
            <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class='footer'>
            <p>© 2025 Donation Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

			await SendEmailAsync(toEmail, subject, body);
		}

		public async Task SendPasswordResetEmailAsync(string toEmail, string firstName, string resetToken, string resetUrl)
		{
			var subject = "Password Reset Request - Donation Management System";
			var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background-color: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
        .content {{ background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
        .button {{ display: inline-block; padding: 12px 30px; background-color: #EF4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Password Reset</h1>
        </div>
        <div class='content'>
            <h2>Hello {firstName}!</h2>
            <p>We received a request to reset your password.</p>
            <p>Click the button below to reset your password:</p>
            <div style='text-align: center;'>
                <a href='{resetUrl}' class='button'>Reset Password</a>
            </div>
            <p>Or copy and paste this link in your browser:</p>
            <p style='word-break: break-all; color: #EF4444;'>{resetUrl}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class='footer'>
            <p>© 2025 Donation Management System. All rights reserved.</p>
        </div>
    </div>
</body>
</html>";

			await SendEmailAsync(toEmail, subject, body);
		}
	}
}

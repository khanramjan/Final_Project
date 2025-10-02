namespace DonationManagementSystem.API.Services
{
	public interface IEmailService
	{
		Task SendEmailAsync(string toEmail, string subject, string body);
		Task SendVerificationEmailAsync(string toEmail, string firstName, string verificationToken, string verificationUrl);
		Task SendPasswordResetEmailAsync(string toEmail, string firstName, string resetToken, string resetUrl);
	}
}

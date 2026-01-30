namespace DonationManagementSystem.API.Services
{
    public interface ISmsService
    {
        Task SendSmsAsync(string toPhone, string message);
    }
}

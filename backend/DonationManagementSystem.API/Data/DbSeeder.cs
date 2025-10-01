using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Models;

namespace DonationManagementSystem.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            try
            {
                // Ensure database is created
                await context.Database.EnsureCreatedAsync();

                // Check if default admin exists
                if (!await context.Users.AnyAsync(u => u.UserType == "admin"))
                {
                    var defaultAdmin = new User
                    {
                        UserType = "admin",
                        FirstName = "System",
                        LastName = "Administrator",
                        Email = "admin@donationmanagement.com",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123!"),
                        Phone = "1234567890",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    };

                    context.Users.Add(defaultAdmin);
                    await context.SaveChangesAsync();

                    Console.WriteLine("✅ Default admin user created:");
                    Console.WriteLine("📧 Email: admin@donationmanagement.com");
                    Console.WriteLine("🔑 Password: Admin@123!");
                    Console.WriteLine("⚠️ Please change this password after first login!");
                }

                // Seed sample data if database is empty
                await SeedSampleData(context);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Database seeding error: {ex.Message}");
                throw;
            }
        }

        private static async Task SeedSampleData(AppDbContext context)
        {
            // Remove ALL sample data to show user's real database state
            Console.WriteLine("🧹 Removing sample data to show your REAL database...");
            
            // Remove all sample data (keep only admin and original users)
            var sampleDonations = await context.Donations.ToListAsync();
            var sampleCampaigns = await context.Campaigns.ToListAsync();
            var sampleUsers = await context.Users.Where(u => u.UserType != "admin" && u.Email != "admin@donationmanagement.com").ToListAsync();
            
            context.Donations.RemoveRange(sampleDonations);
            context.Campaigns.RemoveRange(sampleCampaigns);
            context.Users.RemoveRange(sampleUsers);
            await context.SaveChangesAsync();

            Console.WriteLine("✅ Sample data removed! Database now shows your REAL data");
            Console.WriteLine("📊 Dashboard will display actual user counts and donation amounts");
            Console.WriteLine("💡 If you want to add real users/campaigns/donations, use the frontend!");
        }
    }
}
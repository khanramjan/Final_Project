using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Models;

namespace DonationManagementSystem.API.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
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

                Console.WriteLine("Default admin user created:");
                Console.WriteLine("Email: admin@donationmanagement.com");
                Console.WriteLine("Password: Admin@123!");
                Console.WriteLine("Please change this password after first login!");
            }
        }
    }
}
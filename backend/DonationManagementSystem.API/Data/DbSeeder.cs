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
                        IsEmailVerified = true, // Admin account is pre-verified
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
            // Only seed campaigns if none exist
            if (await context.Campaigns.AnyAsync())
            {
                Console.WriteLine("✅ Sample campaigns already exist, skipping seed");
                
                // But check if Reserve Fund needs sample data
                if (!await context.ReserveFunds.AnyAsync())
                {
                    await SeedReserveFundData(context);
                }
                return;
            }

            Console.WriteLine("🌱 Seeding sample campaigns and donations for demonstration...");

            var admin = await context.Users.FirstOrDefaultAsync(u => u.UserType == "admin");
            if (admin == null)
            {
                Console.WriteLine("⚠️  Admin not found, skipping seed");
                return;
            }

            // Create sample campaigns
            var campaigns = new List<Campaign>
            {
                new Campaign
                {
                    Title = "Tree Plantation in Campus",
                    Description = "Help us plant 500 trees in the campus area to create a greener environment.",
                    TargetAmount = 10000,
                    RaisedAmount = 4500,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(90),
                    Status = "active",
                    Category = "environment",
                    Location = "Campus",
                    IsUrgent = false,
                    IsFeatured = true,
                    CreatedBy = admin.Id,
                    ApprovedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    ApprovedAt = DateTime.UtcNow.AddDays(-30)
                },
                new Campaign
                {
                    Title = "Winter Cloth Distribution",
                    Description = "Collect warm clothes and blankets for underprivileged families.",
                    TargetAmount = 20000,
                    RaisedAmount = 5000,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(60),
                    Status = "active",
                    Category = "welfare",
                    Location = "City Center",
                    IsUrgent = true,
                    IsFeatured = true,
                    CreatedBy = admin.Id,
                    ApprovedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    ApprovedAt = DateTime.UtcNow.AddDays(-20)
                },
                new Campaign
                {
                    Title = "Healthcare Fund",
                    Description = "Support medical camps and health awareness programs.",
                    TargetAmount = 50000,
                    RaisedAmount = 8500,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(120),
                    Status = "active",
                    Category = "health",
                    Location = "Regional Hospital",
                    IsUrgent = false,
                    IsFeatured = false,
                    CreatedBy = admin.Id,
                    ApprovedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    ApprovedAt = DateTime.UtcNow.AddDays(-10)
                }
            };

            context.Campaigns.AddRange(campaigns);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Created {campaigns.Count} sample campaigns");

            // Create sample donations
            var donations = new List<Donation>
            {
                // Campaign 1 donations
                new Donation { CampaignId = campaigns[0].Id, Amount = 500, DonorName = "John Doe", DonorEmail = "john@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-5), CompletedAt = DateTime.UtcNow.AddDays(-5) },
                new Donation { CampaignId = campaigns[0].Id, Amount = 1000, DonorName = "Anonymous", DonorEmail = "anon@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = true, CreatedAt = DateTime.UtcNow.AddDays(-4), CompletedAt = DateTime.UtcNow.AddDays(-4) },
                new Donation { CampaignId = campaigns[0].Id, Amount = 1500, DonorName = "Jane Smith", DonorEmail = "jane@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-3), CompletedAt = DateTime.UtcNow.AddDays(-3) },
                new Donation { CampaignId = campaigns[0].Id, Amount = 750, DonorName = "Ahmed Khan", DonorEmail = "ahmed@example.com", Status = "pending", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddHours(-2) },
                
                // Campaign 2 donations
                new Donation { CampaignId = campaigns[1].Id, Amount = 2000, DonorName = "Sarah Johnson", DonorEmail = "sarah@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-6), CompletedAt = DateTime.UtcNow.AddDays(-6) },
                new Donation { CampaignId = campaigns[1].Id, Amount = 1200, DonorName = "Michael Brown", DonorEmail = "michael@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-2), CompletedAt = DateTime.UtcNow.AddDays(-2) },
                new Donation { CampaignId = campaigns[1].Id, Amount = 800, DonorName = "Anonymous", DonorEmail = "donor@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = true, CreatedAt = DateTime.UtcNow.AddDays(-1), CompletedAt = DateTime.UtcNow.AddDays(-1) },
                
                // Campaign 3 donations
                new Donation { CampaignId = campaigns[2].Id, Amount = 3000, DonorName = "Emma Wilson", DonorEmail = "emma@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-7), CompletedAt = DateTime.UtcNow.AddDays(-7) },
                new Donation { CampaignId = campaigns[2].Id, Amount = 2500, DonorName = "Robert Davis", DonorEmail = "robert@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-4), CompletedAt = DateTime.UtcNow.AddDays(-4) },
                new Donation { CampaignId = campaigns[2].Id, Amount = 1500, DonorName = "Lisa Anderson", DonorEmail = "lisa@example.com", Status = "failed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-3) },
                new Donation { CampaignId = campaigns[2].Id, Amount = 1000, DonorName = "Anonymous", DonorEmail = "donor2@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = true, CreatedAt = DateTime.UtcNow.AddHours(-1), CompletedAt = DateTime.UtcNow.AddHours(-1) },
                new Donation { CampaignId = campaigns[2].Id, Amount = 500, DonorName = "Chris Taylor", DonorEmail = "chris@example.com", Status = "pending", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddMinutes(-30) }
            };

            context.Donations.AddRange(donations);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Created {donations.Count} sample donations");

            // Create completed campaign with overflow for Reserve Fund demo
            var completedCampaign = new Campaign
            {
                Title = "Emergency Food Relief - COMPLETED",
                Description = "Emergency food relief for flood victims. This campaign has been completed and received overflow donations.",
                TargetAmount = 5000,
                RaisedAmount = 7500, // Exceeds target by 2500
                StartDate = DateTime.UtcNow.AddDays(-45),
                EndDate = DateTime.UtcNow.AddDays(-5),
                Status = "completed",
                Category = "emergency",
                Location = "Flood Affected Areas",
                IsUrgent = false,
                IsFeatured = false,
                CreatedBy = admin.Id,
                ApprovedBy = admin.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-45),
                ApprovedAt = DateTime.UtcNow.AddDays(-45)
            };

            context.Campaigns.Add(completedCampaign);
            await context.SaveChangesAsync();

            // Create overflow donations for completed campaign
            var overflowDonations = new List<Donation>
            {
                new Donation { CampaignId = completedCampaign.Id, Amount = 2000, DonorName = "David Miller", DonorEmail = "david@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-40), CompletedAt = DateTime.UtcNow.AddDays(-40) },
                new Donation { CampaignId = completedCampaign.Id, Amount = 1500, DonorName = "Maria Garcia", DonorEmail = "maria@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-35), CompletedAt = DateTime.UtcNow.AddDays(-35) },
                new Donation { CampaignId = completedCampaign.Id, Amount = 1000, DonorName = "Anonymous Donor", DonorEmail = "generous@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = true, CreatedAt = DateTime.UtcNow.AddDays(-30), CompletedAt = DateTime.UtcNow.AddDays(-30) },
                // This donation causes overflow - campaign goal was 5000, but total is 7500
                new Donation { CampaignId = completedCampaign.Id, Amount = 3000, DonorName = "Sophia Williams", DonorEmail = "sophia@example.com", Status = "completed", PaymentMethod = "SSLCommerz", IsAnonymous = false, CreatedAt = DateTime.UtcNow.AddDays(-25), CompletedAt = DateTime.UtcNow.AddDays(-25) }
            };

            context.Donations.AddRange(overflowDonations);
            await context.SaveChangesAsync();

            // Create Reserve Fund entries for overflow
            var reserveFundEntries = new List<ReserveFund>
            {
                new ReserveFund
                {
                    Amount = 1000,
                    CampaignId = completedCampaign.Id,
                    DonorName = "Sophia Williams",
                    SourceDescription = "Overflow from Emergency Food Relief campaign (donated ৳3000 when ৳2000 was needed)",
                    CreatedAt = DateTime.UtcNow.AddDays(-25)
                },
                new ReserveFund
                {
                    Amount = 1500,
                    CampaignId = completedCampaign.Id,
                    DonorName = "Anonymous Donor",
                    SourceDescription = "Generous overflow contribution to community reserve fund",
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                }
            };

            context.ReserveFunds.AddRange(reserveFundEntries);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Created overflow campaign with Reserve Fund entries (Total: ৳{reserveFundEntries.Sum(r => r.Amount)})");
            Console.WriteLine("✅ Database seeded successfully!");
        }

        private static async Task SeedReserveFundData(AppDbContext context)
        {
            Console.WriteLine("🌱 Adding sample Reserve Fund entries...");

            var admin = await context.Users.FirstOrDefaultAsync(u => u.UserType == "admin");
            if (admin == null)
            {
                Console.WriteLine("⚠️  Admin not found, skipping Reserve Fund seed");
                return;
            }

            // Get or create a completed campaign for overflow demo
            var completedCampaign = await context.Campaigns.FirstOrDefaultAsync(c => c.Status == "completed");
            
            if (completedCampaign == null)
            {
                // Create a demo completed campaign
                completedCampaign = new Campaign
                {
                    Title = "Emergency Food Relief - COMPLETED",
                    Description = "Emergency food relief for flood victims. This campaign has been completed and received overflow donations.",
                    TargetAmount = 5000,
                    RaisedAmount = 7500, // Exceeds target by 2500
                    StartDate = DateTime.UtcNow.AddDays(-45),
                    EndDate = DateTime.UtcNow.AddDays(-5),
                    Status = "completed",
                    Category = "emergency",
                    Location = "Flood Affected Areas",
                    IsUrgent = false,
                    IsFeatured = false,
                    CreatedBy = admin.Id,
                    ApprovedBy = admin.Id,
                    CreatedAt = DateTime.UtcNow.AddDays(-45),
                    ApprovedAt = DateTime.UtcNow.AddDays(-45)
                };

                context.Campaigns.Add(completedCampaign);
                await context.SaveChangesAsync();
                Console.WriteLine("✅ Created demo completed campaign for overflow");
            }

            // Create Reserve Fund entries
            var reserveFundEntries = new List<ReserveFund>
            {
                new ReserveFund
                {
                    Amount = 1000,
                    CampaignId = completedCampaign.Id,
                    DonorName = "Sophia Williams",
                    SourceDescription = "Overflow from Emergency Food Relief campaign (donated ৳3000 when ৳2000 was needed)",
                    CreatedAt = DateTime.UtcNow.AddDays(-25)
                },
                new ReserveFund
                {
                    Amount = 1500,
                    CampaignId = completedCampaign.Id,
                    DonorName = "Anonymous Donor",
                    SourceDescription = "Generous overflow contribution to community reserve fund",
                    CreatedAt = DateTime.UtcNow.AddDays(-20)
                },
                new ReserveFund
                {
                    Amount = 2500,
                    CampaignId = completedCampaign.Id,
                    DonorName = "David Miller",
                    SourceDescription = "Overflow donation - Campaign exceeded goal, extra funds for future emergencies",
                    CreatedAt = DateTime.UtcNow.AddDays(-15)
                },
                new ReserveFund
                {
                    Amount = 3000,
                    CampaignId = completedCampaign.Id,
                    DonorName = "Maria Garcia",
                    SourceDescription = "Overflow from Medical Emergency campaign - Helping community reserve",
                    CreatedAt = DateTime.UtcNow.AddDays(-10)
                }
            };

            context.ReserveFunds.AddRange(reserveFundEntries);
            await context.SaveChangesAsync();

            Console.WriteLine($"✅ Created {reserveFundEntries.Count} Reserve Fund entries (Total: ৳{reserveFundEntries.Sum(r => r.Amount):N0})");
        }
    }
}
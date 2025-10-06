using Microsoft.EntityFrameworkCore;
using DonationManagementSystem.API.Models;

namespace DonationManagementSystem.API.Data
{
	public class AppDbContext : DbContext
	{
		public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

		public DbSet<User> Users { get; set; }
		public DbSet<Campaign> Campaigns { get; set; }
		public DbSet<Donation> Donations { get; set; }
		public DbSet<CampaignUpdate> CampaignUpdates { get; set; }
		public DbSet<SystemSettings> SystemSettings { get; set; }
		public DbSet<AuditLog> AuditLogs { get; set; }
		
		// Volunteer System
		public DbSet<VolunteerProfile> VolunteerProfiles { get; set; }
		public DbSet<VolunteerRequest> VolunteerRequests { get; set; }
		public DbSet<VolunteerAssignment> VolunteerAssignments { get; set; }
		public DbSet<VolunteerActivity> VolunteerActivities { get; set; }
		public DbSet<VolunteerAchievement> VolunteerAchievements { get; set; }
		public DbSet<VolunteerRankHistory> VolunteerRankHistories { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// User configurations
			modelBuilder.Entity<User>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.HasIndex(e => e.Email).IsUnique();
				entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
				entity.Property(e => e.FirstName).HasMaxLength(100);
				entity.Property(e => e.LastName).HasMaxLength(100);
				entity.Property(e => e.UserType).HasMaxLength(50);

				// Navigation properties
				entity.HasMany(e => e.Donations)
					  .WithOne(d => d.User)
					  .HasForeignKey(d => d.UserId)
					  .OnDelete(DeleteBehavior.SetNull);

				entity.HasMany(e => e.CampaignsCreated)
					  .WithOne(c => c.Creator)
					  .HasForeignKey(c => c.CreatedBy)
					  .OnDelete(DeleteBehavior.Restrict);

				entity.HasMany(e => e.CampaignsApproved)
					  .WithOne(c => c.Approver)
					  .HasForeignKey(c => c.ApprovedBy)
					  .OnDelete(DeleteBehavior.SetNull);
			});

			// Campaign configurations
			modelBuilder.Entity<Campaign>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
				entity.Property(e => e.Description).IsRequired();
				entity.Property(e => e.TargetAmount).HasColumnType("decimal(18,2)");
				entity.Property(e => e.RaisedAmount).HasColumnType("decimal(18,2)");
				entity.Property(e => e.Status).HasMaxLength(50);
				entity.Property(e => e.Category).HasMaxLength(100);

				// Relationships
				entity.HasOne(e => e.Creator)
					  .WithMany(u => u.CampaignsCreated)
					  .HasForeignKey(e => e.CreatedBy)
					  .OnDelete(DeleteBehavior.Restrict);

				entity.HasOne(e => e.Approver)
					  .WithMany(u => u.CampaignsApproved)
					  .HasForeignKey(e => e.ApprovedBy)
					  .OnDelete(DeleteBehavior.SetNull);
			});

			// Donation configurations
			modelBuilder.Entity<Donation>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Amount).HasColumnType("decimal(18,2)");
				entity.Property(e => e.DonorEmail).HasMaxLength(255);
				entity.Property(e => e.PaymentMethod).HasMaxLength(50);
				entity.Property(e => e.Status).HasMaxLength(50);

				// Relationships
				entity.HasOne(e => e.Campaign)
					  .WithMany(c => c.Donations)
					  .HasForeignKey(e => e.CampaignId)
					  .OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(e => e.User)
					  .WithMany(u => u.Donations)
					  .HasForeignKey(e => e.UserId)
					  .OnDelete(DeleteBehavior.SetNull);
			});

			// Campaign Update configurations
			modelBuilder.Entity<CampaignUpdate>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
				entity.Property(e => e.Content).IsRequired();

				// Relationships
				entity.HasOne(e => e.Campaign)
					  .WithMany(c => c.Updates)
					  .HasForeignKey(e => e.CampaignId)
					  .OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(e => e.Creator)
					  .WithMany()
					  .HasForeignKey(e => e.CreatedBy)
					  .OnDelete(DeleteBehavior.Restrict);
			});

			// System Settings configurations
			modelBuilder.Entity<SystemSettings>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.HasIndex(e => e.Key).IsUnique();
				entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
				entity.Property(e => e.Category).HasMaxLength(50);
				entity.Property(e => e.DataType).HasMaxLength(20);

				entity.HasOne(e => e.UpdatedByUser)
					  .WithMany()
					  .HasForeignKey(e => e.UpdatedBy)
					  .OnDelete(DeleteBehavior.Restrict);
			});

			// Audit Log configurations
			modelBuilder.Entity<AuditLog>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Action).IsRequired().HasMaxLength(100);
				entity.Property(e => e.EntityType).IsRequired().HasMaxLength(100);

				entity.HasOne(e => e.User)
					  .WithMany()
					  .HasForeignKey(e => e.UserId)
					  .OnDelete(DeleteBehavior.SetNull);
			});

			// ===== VOLUNTEER SYSTEM CONFIGURATIONS =====

			// VolunteerProfile configurations
			modelBuilder.Entity<VolunteerProfile>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.HasIndex(e => e.UserId).IsUnique();
				entity.Property(e => e.ExperienceLevel).HasMaxLength(50);
				entity.Property(e => e.Status).HasMaxLength(50);
				entity.Property(e => e.Rating).HasColumnType("decimal(3,2)");

				// One-to-One with User
				entity.HasOne(e => e.User)
					  .WithMany()
					  .HasForeignKey(e => e.UserId)
					  .OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(e => e.Verifier)
					  .WithMany()
					  .HasForeignKey(e => e.VerifiedBy)
					  .OnDelete(DeleteBehavior.NoAction);
			});

			// VolunteerRequest configurations
			modelBuilder.Entity<VolunteerRequest>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
				entity.Property(e => e.Description).IsRequired();
				entity.Property(e => e.TaskType).HasMaxLength(100);
				entity.Property(e => e.Priority).HasMaxLength(50);
				entity.Property(e => e.Status).HasMaxLength(50);

				entity.HasOne(e => e.VolunteerProfile)
					  .WithMany(vp => vp.Requests)
					  .HasForeignKey(e => e.VolunteerProfileId)
					  .OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(e => e.Campaign)
					  .WithMany()
					  .HasForeignKey(e => e.CampaignId)
					  .OnDelete(DeleteBehavior.Restrict);

				entity.HasOne(e => e.RequestedByUser)
					  .WithMany()
					  .HasForeignKey(e => e.RequestedBy)
					  .OnDelete(DeleteBehavior.Restrict);

				entity.HasOne(e => e.Assignment)
					  .WithOne(a => a.VolunteerRequest)
					  .HasForeignKey<VolunteerAssignment>(a => a.VolunteerRequestId)
					  .OnDelete(DeleteBehavior.NoAction);
			});

			// VolunteerAssignment configurations
			modelBuilder.Entity<VolunteerAssignment>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
				entity.Property(e => e.Description).IsRequired();
				entity.Property(e => e.TaskType).HasMaxLength(100);
				entity.Property(e => e.Status).HasMaxLength(50);
				entity.Property(e => e.Rating).HasColumnType("decimal(3,2)");

				entity.HasOne(e => e.VolunteerProfile)
					  .WithMany(vp => vp.Assignments)
					  .HasForeignKey(e => e.VolunteerProfileId)
					  .OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(e => e.Campaign)
					  .WithMany()
					  .HasForeignKey(e => e.CampaignId)
					  .OnDelete(DeleteBehavior.Restrict);

				entity.HasOne(e => e.Rater)
					  .WithMany()
					  .HasForeignKey(e => e.RatedBy)
					  .OnDelete(DeleteBehavior.NoAction);
			});

			// VolunteerActivity configurations
			modelBuilder.Entity<VolunteerActivity>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.ActivityType).IsRequired().HasMaxLength(100);
				entity.Property(e => e.Title).IsRequired().HasMaxLength(200);

				entity.HasOne(e => e.VolunteerProfile)
					  .WithMany(vp => vp.Activities)
					  .HasForeignKey(e => e.VolunteerProfileId)
					  .OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(e => e.VolunteerAssignment)
					  .WithMany(va => va.Activities)
					  .HasForeignKey(e => e.VolunteerAssignmentId)
					  .OnDelete(DeleteBehavior.NoAction);

				entity.HasOne(e => e.Campaign)
					  .WithMany()
					  .HasForeignKey(e => e.CampaignId)
					  .OnDelete(DeleteBehavior.NoAction);
			});

			// VolunteerAchievement configurations
			modelBuilder.Entity<VolunteerAchievement>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.AchievementType).IsRequired().HasMaxLength(100);
				entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
				entity.Property(e => e.Description).IsRequired();
				entity.Property(e => e.BadgeIcon).HasMaxLength(100);
				entity.Property(e => e.BadgeColor).HasMaxLength(20);

				entity.HasOne(e => e.VolunteerProfile)
					  .WithMany(vp => vp.Achievements)
					  .HasForeignKey(e => e.VolunteerProfileId)
					  .OnDelete(DeleteBehavior.Cascade);
			});

			// VolunteerRankHistory configurations
			modelBuilder.Entity<VolunteerRankHistory>(entity =>
			{
				entity.HasKey(e => e.Id);
				entity.Property(e => e.PreviousRank).IsRequired().HasMaxLength(50);
				entity.Property(e => e.NewRank).IsRequired().HasMaxLength(50);
				entity.Property(e => e.Reason).IsRequired().HasMaxLength(500);

				entity.HasOne(e => e.VolunteerProfile)
					  .WithMany(vp => vp.RankHistory)
					  .HasForeignKey(e => e.VolunteerProfileId)
					  .OnDelete(DeleteBehavior.Cascade);

				entity.HasOne(e => e.UpgradedByUser)
					  .WithMany()
					  .HasForeignKey(e => e.UpgradedBy)
					  .OnDelete(DeleteBehavior.NoAction);
			});
		}
	}
}

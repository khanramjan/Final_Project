using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialPostgresCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: true),
                    Phone = table.Column<string>(type: "text", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: true),
                    Organization = table.Column<string>(type: "text", nullable: true),
                    Skills = table.Column<string>(type: "text", nullable: true),
                    Interests = table.Column<string>(type: "text", nullable: true),
                    NidPhotoPath = table.Column<string>(type: "text", nullable: true),
                    VolunteerPhotoPath = table.Column<string>(type: "text", nullable: true),
                    UtilityBillPath = table.Column<string>(type: "text", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastLoginAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsEmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    EmailVerificationToken = table.Column<string>(type: "text", nullable: true),
                    EmailVerificationTokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PasswordResetToken = table.Column<string>(type: "text", nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Action = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    EntityId = table.Column<int>(type: "integer", nullable: false),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    UserAgent = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AuditLogs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Campaigns",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ImagePath = table.Column<string>(type: "text", nullable: true),
                    TargetAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    RaisedAmount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Location = table.Column<string>(type: "text", nullable: true),
                    IsUrgent = table.Column<bool>(type: "boolean", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    NeedsVolunteers = table.Column<bool>(type: "boolean", nullable: false),
                    PlatinumVolunteersNeeded = table.Column<int>(type: "integer", nullable: false),
                    GoldVolunteersNeeded = table.Column<int>(type: "integer", nullable: false),
                    SilverVolunteersNeeded = table.Column<int>(type: "integer", nullable: false),
                    BronzeVolunteersNeeded = table.Column<int>(type: "integer", nullable: false),
                    NewbieVolunteersNeeded = table.Column<int>(type: "integer", nullable: false),
                    AutoSendVolunteerRequests = table.Column<bool>(type: "boolean", nullable: false),
                    VolunteerRequestsSentAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false),
                    ApprovedBy = table.Column<int>(type: "integer", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Campaigns", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Campaigns_Users_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Campaigns_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    DataType = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsPublic = table.Column<bool>(type: "boolean", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SystemSettings_Users_UpdatedBy",
                        column: x => x.UpdatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Testimonials",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Position = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Organization = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    AvatarUrl = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    SentimentLabel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SentimentScore = table.Column<float>(type: "real", nullable: false),
                    SentimentConfidence = table.Column<float>(type: "real", nullable: false),
                    RiskLabel = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    IsScamRisk = table.Column<bool>(type: "boolean", nullable: false),
                    AnalyzedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    BadgeType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    IsFeatured = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovedByUserId = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Testimonials", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Testimonials_Users_ApprovedByUserId",
                        column: x => x.ApprovedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Testimonials_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "VolunteerProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Skills = table.Column<string>(type: "text", nullable: true),
                    Interests = table.Column<string>(type: "text", nullable: true),
                    ExperienceLevel = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    Certifications = table.Column<string>(type: "text", nullable: true),
                    AvailableDays = table.Column<string>(type: "text", nullable: true),
                    PreferredTimeSlots = table.Column<string>(type: "text", nullable: true),
                    HoursPerWeek = table.Column<int>(type: "integer", nullable: false),
                    Location = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    EmergencyContactName = table.Column<string>(type: "text", nullable: true),
                    EmergencyContactPhone = table.Column<string>(type: "text", nullable: true),
                    TotalHoursVolunteered = table.Column<int>(type: "integer", nullable: false),
                    TotalTasksCompleted = table.Column<int>(type: "integer", nullable: false),
                    TotalCampaignsSupported = table.Column<int>(type: "integer", nullable: false),
                    Rating = table.Column<decimal>(type: "numeric(3,2)", nullable: false),
                    TotalRatings = table.Column<int>(type: "integer", nullable: false),
                    Rank = table.Column<string>(type: "text", nullable: false),
                    CompletedCampaigns = table.Column<int>(type: "integer", nullable: false),
                    LastRankUpgradeAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    VerifiedBy = table.Column<int>(type: "integer", nullable: true),
                    IsApprovedByAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    AdminApprovalStatus = table.Column<string>(type: "text", nullable: false),
                    ApprovedBy = table.Column<int>(type: "integer", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApprovalNotes = table.Column<string>(type: "text", nullable: true),
                    AcceptSmsNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    AcceptEmailNotifications = table.Column<bool>(type: "boolean", nullable: false),
                    IsProfilePublic = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ApproverId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VolunteerProfiles_Users_ApproverId",
                        column: x => x.ApproverId,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VolunteerProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VolunteerProfiles_Users_VerifiedBy",
                        column: x => x.VerifiedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "CampaignUpdates",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    ImagePath = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CampaignId = table.Column<int>(type: "integer", nullable: false),
                    CreatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CampaignUpdates", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CampaignUpdates_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CampaignUpdates_Users_CreatedBy",
                        column: x => x.CreatedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Donations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DonorName = table.Column<string>(type: "text", nullable: true),
                    DonorEmail = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Message = table.Column<string>(type: "text", nullable: true),
                    IsAnonymous = table.Column<bool>(type: "boolean", nullable: false),
                    PaymentMethod = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PaymentReference = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CampaignId = table.Column<int>(type: "integer", nullable: false),
                    UserId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Donations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Donations_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Donations_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Vouchers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CampaignId = table.Column<int>(type: "integer", nullable: false),
                    VolunteerId = table.Column<int>(type: "integer", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ExpenseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Category = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReceiptPath = table.Column<string>(type: "text", nullable: true),
                    ReceiptFileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReviewedBy = table.Column<int>(type: "integer", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AdminFeedback = table.Column<string>(type: "text", nullable: true),
                    IsRequestedByAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    RequestedBy = table.Column<int>(type: "integer", nullable: true),
                    RequestedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RequestNote = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vouchers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Vouchers_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Vouchers_Users_RequestedBy",
                        column: x => x.RequestedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Vouchers_Users_ReviewedBy",
                        column: x => x.ReviewedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Vouchers_Users_VolunteerId",
                        column: x => x.VolunteerId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Withdrawals",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    CampaignId = table.Column<int>(type: "integer", nullable: false),
                    Purpose = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    RecipientName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    RecipientPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    RecipientAddress = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Notes = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ReceiptPath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    Status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    ReferenceNumber = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    IpAddress = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    WithdrawnAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    WithdrawnBy = table.Column<int>(type: "integer", nullable: false),
                    ApprovedBy = table.Column<int>(type: "integer", nullable: true),
                    ApprovedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CancelledBy = table.Column<int>(type: "integer", nullable: true),
                    CancelledAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Withdrawals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Withdrawals_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Withdrawals_Users_ApprovedBy",
                        column: x => x.ApprovedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Withdrawals_Users_CancelledBy",
                        column: x => x.CancelledBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Withdrawals_Users_WithdrawnBy",
                        column: x => x.WithdrawnBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "VolunteerAchievements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VolunteerProfileId = table.Column<int>(type: "integer", nullable: false),
                    AchievementType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    BadgeIcon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    BadgeColor = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    CurrentProgress = table.Column<int>(type: "integer", nullable: false),
                    RequiredProgress = table.Column<int>(type: "integer", nullable: false),
                    IsUnlocked = table.Column<bool>(type: "boolean", nullable: false),
                    UnlockedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Points = table.Column<int>(type: "integer", nullable: true),
                    RewardDescription = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerAchievements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VolunteerAchievements_VolunteerProfiles_VolunteerProfileId",
                        column: x => x.VolunteerProfileId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VolunteerRankHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VolunteerProfileId = table.Column<int>(type: "integer", nullable: false),
                    PreviousRank = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    NewRank = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    CampaignsCompletedAtUpgrade = table.Column<int>(type: "integer", nullable: false),
                    UpgradedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpgradedBy = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerRankHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VolunteerRankHistories_Users_UpgradedBy",
                        column: x => x.UpgradedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VolunteerRankHistories_VolunteerProfiles_VolunteerProfileId",
                        column: x => x.VolunteerProfileId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VolunteerRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VolunteerProfileId = table.Column<int>(type: "integer", nullable: false),
                    CampaignId = table.Column<int>(type: "integer", nullable: false),
                    RequestedBy = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TaskType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Priority = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EstimatedHours = table.Column<int>(type: "integer", nullable: false),
                    MeetingPoint = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    RequiredSkills = table.Column<string>(type: "text", nullable: true),
                    RequiredEquipment = table.Column<string>(type: "text", nullable: true),
                    TeamSize = table.Column<int>(type: "integer", nullable: true),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DeclineReason = table.Column<string>(type: "text", nullable: true),
                    AdminNotes = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VolunteerRequests_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VolunteerRequests_Users_RequestedBy",
                        column: x => x.RequestedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VolunteerRequests_VolunteerProfiles_VolunteerProfileId",
                        column: x => x.VolunteerProfileId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReserveFunds",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DonationId = table.Column<int>(type: "integer", nullable: true),
                    CampaignId = table.Column<int>(type: "integer", nullable: true),
                    DonorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    SourceDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReserveFunds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReserveFunds_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReserveFunds_Donations_DonationId",
                        column: x => x.DonationId,
                        principalTable: "Donations",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "VoucherItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VoucherId = table.Column<int>(type: "integer", nullable: false),
                    ItemName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Price = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    PurchaseDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Notes = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VoucherItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VoucherItems_Vouchers_VoucherId",
                        column: x => x.VoucherId,
                        principalTable: "Vouchers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VolunteerAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VolunteerProfileId = table.Column<int>(type: "integer", nullable: false),
                    CampaignId = table.Column<int>(type: "integer", nullable: false),
                    VolunteerRequestId = table.Column<int>(type: "integer", nullable: true),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    TaskType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EstimatedHours = table.Column<int>(type: "integer", nullable: false),
                    ActualHours = table.Column<int>(type: "integer", nullable: false),
                    MeetingPoint = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    CheckInTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CheckInLocation = table.Column<string>(type: "text", nullable: true),
                    CheckInLatitude = table.Column<double>(type: "double precision", nullable: true),
                    CheckInLongitude = table.Column<double>(type: "double precision", nullable: true),
                    CheckOutTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CheckOutLocation = table.Column<string>(type: "text", nullable: true),
                    CheckOutLatitude = table.Column<double>(type: "double precision", nullable: true),
                    CheckOutLongitude = table.Column<double>(type: "double precision", nullable: true),
                    ProgressPercentage = table.Column<int>(type: "integer", nullable: false),
                    ProgressNotes = table.Column<string>(type: "text", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CompletionNotes = table.Column<string>(type: "text", nullable: true),
                    CompletionEvidence = table.Column<string>(type: "text", nullable: true),
                    Rating = table.Column<decimal>(type: "numeric(3,2)", nullable: true),
                    Feedback = table.Column<string>(type: "text", nullable: true),
                    VerifiedBy = table.Column<int>(type: "integer", nullable: true),
                    VerifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RatedBy = table.Column<int>(type: "integer", nullable: true),
                    RatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CertificateIssued = table.Column<bool>(type: "boolean", nullable: false),
                    CertificatePath = table.Column<string>(type: "text", nullable: true),
                    CertificateIssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerAssignments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VolunteerAssignments_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VolunteerAssignments_Users_RatedBy",
                        column: x => x.RatedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VolunteerAssignments_VolunteerProfiles_VolunteerProfileId",
                        column: x => x.VolunteerProfileId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VolunteerAssignments_VolunteerRequests_VolunteerRequestId",
                        column: x => x.VolunteerRequestId,
                        principalTable: "VolunteerRequests",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PhysicalDonations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CampaignId = table.Column<int>(type: "integer", nullable: false),
                    VolunteerProfileId = table.Column<int>(type: "integer", nullable: false),
                    VolunteerAssignmentId = table.Column<int>(type: "integer", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    DonorName = table.Column<string>(type: "text", nullable: false),
                    DonorPhone = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: true),
                    ReferenceCode = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ConfirmationOtpHash = table.Column<string>(type: "text", nullable: true),
                    ConfirmationOtpExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CollectedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DonationId = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhysicalDonations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhysicalDonations_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PhysicalDonations_VolunteerAssignments_VolunteerAssignmentId",
                        column: x => x.VolunteerAssignmentId,
                        principalTable: "VolunteerAssignments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_PhysicalDonations_VolunteerProfiles_VolunteerProfileId",
                        column: x => x.VolunteerProfileId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VolunteerActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VolunteerProfileId = table.Column<int>(type: "integer", nullable: false),
                    VolunteerAssignmentId = table.Column<int>(type: "integer", nullable: true),
                    CampaignId = table.Column<int>(type: "integer", nullable: true),
                    ActivityType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Metadata = table.Column<string>(type: "text", nullable: true),
                    Latitude = table.Column<double>(type: "double precision", nullable: true),
                    Longitude = table.Column<double>(type: "double precision", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerActivities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VolunteerActivities_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VolunteerActivities_VolunteerAssignments_VolunteerAssignmen~",
                        column: x => x.VolunteerAssignmentId,
                        principalTable: "VolunteerAssignments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VolunteerActivities_VolunteerProfiles_VolunteerProfileId",
                        column: x => x.VolunteerProfileId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VolunteerReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ReportedByVolunteerId = table.Column<int>(type: "integer", nullable: false),
                    ReportedVolunteerId = table.Column<int>(type: "integer", nullable: false),
                    ReportType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    ProofUrls = table.Column<string>(type: "text", nullable: true),
                    CampaignId = table.Column<int>(type: "integer", nullable: true),
                    VolunteerAssignmentId = table.Column<int>(type: "integer", nullable: true),
                    Severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ReviewedBy = table.Column<int>(type: "integer", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AdminNotes = table.Column<string>(type: "text", nullable: true),
                    AdminAction = table.Column<string>(type: "text", nullable: true),
                    PreviousRank = table.Column<string>(type: "text", nullable: true),
                    NewRank = table.Column<string>(type: "text", nullable: true),
                    DowngradeReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VolunteerReports_Campaigns_CampaignId",
                        column: x => x.CampaignId,
                        principalTable: "Campaigns",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VolunteerReports_Users_ReviewedBy",
                        column: x => x.ReviewedBy,
                        principalTable: "Users",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VolunteerReports_VolunteerAssignments_VolunteerAssignmentId",
                        column: x => x.VolunteerAssignmentId,
                        principalTable: "VolunteerAssignments",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_VolunteerReports_VolunteerProfiles_ReportedByVolunteerId",
                        column: x => x.ReportedByVolunteerId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VolunteerReports_VolunteerProfiles_ReportedVolunteerId",
                        column: x => x.ReportedVolunteerId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "VolunteerWarnings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    VolunteerProfileId = table.Column<int>(type: "integer", nullable: false),
                    VolunteerReportId = table.Column<int>(type: "integer", nullable: true),
                    WarningType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Severity = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    IssuedBy = table.Column<int>(type: "integer", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsAcknowledged = table.Column<bool>(type: "boolean", nullable: false),
                    AcknowledgedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerWarnings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VolunteerWarnings_Users_IssuedBy",
                        column: x => x.IssuedBy,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VolunteerWarnings_VolunteerProfiles_VolunteerProfileId",
                        column: x => x.VolunteerProfileId,
                        principalTable: "VolunteerProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_VolunteerWarnings_VolunteerReports_VolunteerReportId",
                        column: x => x.VolunteerReportId,
                        principalTable: "VolunteerReports",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_UserId",
                table: "AuditLogs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_ApprovedBy",
                table: "Campaigns",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Campaigns_CreatedBy",
                table: "Campaigns",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignUpdates_CampaignId",
                table: "CampaignUpdates",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignUpdates_CreatedBy",
                table: "CampaignUpdates",
                column: "CreatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_CampaignId",
                table: "Donations",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Donations_UserId",
                table: "Donations",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalDonations_CampaignId",
                table: "PhysicalDonations",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalDonations_ReferenceCode",
                table: "PhysicalDonations",
                column: "ReferenceCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalDonations_VolunteerAssignmentId",
                table: "PhysicalDonations",
                column: "VolunteerAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_PhysicalDonations_VolunteerProfileId",
                table: "PhysicalDonations",
                column: "VolunteerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ReserveFunds_CampaignId",
                table: "ReserveFunds",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_ReserveFunds_DonationId",
                table: "ReserveFunds",
                column: "DonationId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_Key",
                table: "SystemSettings",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_UpdatedBy",
                table: "SystemSettings",
                column: "UpdatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Testimonials_ApprovedByUserId",
                table: "Testimonials",
                column: "ApprovedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Testimonials_UserId",
                table: "Testimonials",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerAchievements_VolunteerProfileId",
                table: "VolunteerAchievements",
                column: "VolunteerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerActivities_CampaignId",
                table: "VolunteerActivities",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerActivities_VolunteerAssignmentId",
                table: "VolunteerActivities",
                column: "VolunteerAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerActivities_VolunteerProfileId",
                table: "VolunteerActivities",
                column: "VolunteerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerAssignments_CampaignId",
                table: "VolunteerAssignments",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerAssignments_RatedBy",
                table: "VolunteerAssignments",
                column: "RatedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerAssignments_VolunteerProfileId",
                table: "VolunteerAssignments",
                column: "VolunteerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerAssignments_VolunteerRequestId",
                table: "VolunteerAssignments",
                column: "VolunteerRequestId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerProfiles_ApproverId",
                table: "VolunteerProfiles",
                column: "ApproverId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerProfiles_UserId",
                table: "VolunteerProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerProfiles_VerifiedBy",
                table: "VolunteerProfiles",
                column: "VerifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerRankHistories_UpgradedBy",
                table: "VolunteerRankHistories",
                column: "UpgradedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerRankHistories_VolunteerProfileId",
                table: "VolunteerRankHistories",
                column: "VolunteerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerReports_CampaignId",
                table: "VolunteerReports",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerReports_ReportedByVolunteerId",
                table: "VolunteerReports",
                column: "ReportedByVolunteerId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerReports_ReportedVolunteerId",
                table: "VolunteerReports",
                column: "ReportedVolunteerId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerReports_ReviewedBy",
                table: "VolunteerReports",
                column: "ReviewedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerReports_VolunteerAssignmentId",
                table: "VolunteerReports",
                column: "VolunteerAssignmentId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerRequests_CampaignId",
                table: "VolunteerRequests",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerRequests_RequestedBy",
                table: "VolunteerRequests",
                column: "RequestedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerRequests_VolunteerProfileId",
                table: "VolunteerRequests",
                column: "VolunteerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerWarnings_IssuedBy",
                table: "VolunteerWarnings",
                column: "IssuedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerWarnings_VolunteerProfileId",
                table: "VolunteerWarnings",
                column: "VolunteerProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerWarnings_VolunteerReportId",
                table: "VolunteerWarnings",
                column: "VolunteerReportId");

            migrationBuilder.CreateIndex(
                name: "IX_VoucherItems_VoucherId",
                table: "VoucherItems",
                column: "VoucherId");

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_CampaignId",
                table: "Vouchers",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_RequestedBy",
                table: "Vouchers",
                column: "RequestedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_ReviewedBy",
                table: "Vouchers",
                column: "ReviewedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Vouchers_VolunteerId",
                table: "Vouchers",
                column: "VolunteerId");

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_ApprovedBy",
                table: "Withdrawals",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_CampaignId",
                table: "Withdrawals",
                column: "CampaignId");

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_CancelledBy",
                table: "Withdrawals",
                column: "CancelledBy");

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_ReferenceNumber",
                table: "Withdrawals",
                column: "ReferenceNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_WithdrawnBy",
                table: "Withdrawals",
                column: "WithdrawnBy");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "CampaignUpdates");

            migrationBuilder.DropTable(
                name: "PhysicalDonations");

            migrationBuilder.DropTable(
                name: "ReserveFunds");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropTable(
                name: "Testimonials");

            migrationBuilder.DropTable(
                name: "VolunteerAchievements");

            migrationBuilder.DropTable(
                name: "VolunteerActivities");

            migrationBuilder.DropTable(
                name: "VolunteerRankHistories");

            migrationBuilder.DropTable(
                name: "VolunteerWarnings");

            migrationBuilder.DropTable(
                name: "VoucherItems");

            migrationBuilder.DropTable(
                name: "Withdrawals");

            migrationBuilder.DropTable(
                name: "Donations");

            migrationBuilder.DropTable(
                name: "VolunteerReports");

            migrationBuilder.DropTable(
                name: "Vouchers");

            migrationBuilder.DropTable(
                name: "VolunteerAssignments");

            migrationBuilder.DropTable(
                name: "VolunteerRequests");

            migrationBuilder.DropTable(
                name: "Campaigns");

            migrationBuilder.DropTable(
                name: "VolunteerProfiles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}

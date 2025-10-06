using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VolunteerProfiles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Skills = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Interests = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExperienceLevel = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    YearsOfExperience = table.Column<int>(type: "int", nullable: false),
                    Certifications = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AvailableDays = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreferredTimeSlots = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HoursPerWeek = table.Column<int>(type: "int", nullable: false),
                    Location = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    EmergencyContactName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    EmergencyContactPhone = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalHoursVolunteered = table.Column<int>(type: "int", nullable: false),
                    TotalTasksCompleted = table.Column<int>(type: "int", nullable: false),
                    TotalCampaignsSupported = table.Column<int>(type: "int", nullable: false),
                    TotalPeopleImpacted = table.Column<int>(type: "int", nullable: false),
                    Rating = table.Column<decimal>(type: "decimal(3,2)", nullable: false),
                    TotalRatings = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsVerified = table.Column<bool>(type: "bit", nullable: false),
                    VerifiedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    VerifiedBy = table.Column<int>(type: "int", nullable: true),
                    AcceptSmsNotifications = table.Column<bool>(type: "bit", nullable: false),
                    AcceptEmailNotifications = table.Column<bool>(type: "bit", nullable: false),
                    IsProfilePublic = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastActivityAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VolunteerProfiles", x => x.Id);
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
                name: "VolunteerAchievements",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VolunteerProfileId = table.Column<int>(type: "int", nullable: false),
                    AchievementType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BadgeIcon = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BadgeColor = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CurrentProgress = table.Column<int>(type: "int", nullable: false),
                    RequiredProgress = table.Column<int>(type: "int", nullable: false),
                    IsUnlocked = table.Column<bool>(type: "bit", nullable: false),
                    UnlockedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Points = table.Column<int>(type: "int", nullable: true),
                    RewardDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                name: "VolunteerRequests",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VolunteerProfileId = table.Column<int>(type: "int", nullable: false),
                    CampaignId = table.Column<int>(type: "int", nullable: false),
                    RequestedBy = table.Column<int>(type: "int", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaskType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Priority = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EstimatedHours = table.Column<int>(type: "int", nullable: false),
                    MeetingPoint = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    RequiredSkills = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RequiredEquipment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TeamSize = table.Column<int>(type: "int", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RespondedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeclineReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdminNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                name: "VolunteerAssignments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VolunteerProfileId = table.Column<int>(type: "int", nullable: false),
                    CampaignId = table.Column<int>(type: "int", nullable: false),
                    VolunteerRequestId = table.Column<int>(type: "int", nullable: true),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TaskType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EstimatedHours = table.Column<int>(type: "int", nullable: false),
                    ActualHours = table.Column<int>(type: "int", nullable: false),
                    MeetingPoint = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    CheckInTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckInLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckInLatitude = table.Column<double>(type: "float", nullable: true),
                    CheckInLongitude = table.Column<double>(type: "float", nullable: true),
                    CheckOutTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CheckOutLocation = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CheckOutLatitude = table.Column<double>(type: "float", nullable: true),
                    CheckOutLongitude = table.Column<double>(type: "float", nullable: true),
                    ProgressPercentage = table.Column<int>(type: "int", nullable: false),
                    ProgressNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PeopleImpacted = table.Column<int>(type: "int", nullable: true),
                    ImpactDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CompletionNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Rating = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    Feedback = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RatedBy = table.Column<int>(type: "int", nullable: true),
                    RatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CertificateIssued = table.Column<bool>(type: "bit", nullable: false),
                    CertificatePath = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CertificateIssuedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                name: "VolunteerActivities",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VolunteerProfileId = table.Column<int>(type: "int", nullable: false),
                    VolunteerAssignmentId = table.Column<int>(type: "int", nullable: true),
                    CampaignId = table.Column<int>(type: "int", nullable: true),
                    ActivityType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Metadata = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Latitude = table.Column<double>(type: "float", nullable: true),
                    Longitude = table.Column<double>(type: "float", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                        name: "FK_VolunteerActivities_VolunteerAssignments_VolunteerAssignmentId",
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
                unique: true,
                filter: "[VolunteerRequestId] IS NOT NULL");

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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VolunteerAchievements");

            migrationBuilder.DropTable(
                name: "VolunteerActivities");

            migrationBuilder.DropTable(
                name: "VolunteerAssignments");

            migrationBuilder.DropTable(
                name: "VolunteerRequests");

            migrationBuilder.DropTable(
                name: "VolunteerProfiles");
        }
    }
}

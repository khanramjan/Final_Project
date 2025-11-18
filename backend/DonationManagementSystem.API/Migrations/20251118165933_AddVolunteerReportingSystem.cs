using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerReportingSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VolunteerReports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ReportedByVolunteerId = table.Column<int>(type: "int", nullable: false),
                    ReportedVolunteerId = table.Column<int>(type: "int", nullable: false),
                    ReportType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ProofUrls = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CampaignId = table.Column<int>(type: "int", nullable: true),
                    VolunteerAssignmentId = table.Column<int>(type: "int", nullable: true),
                    Severity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReviewedBy = table.Column<int>(type: "int", nullable: true),
                    ReviewedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    AdminNotes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdminAction = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PreviousRank = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NewRank = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DowngradeReason = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
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
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VolunteerProfileId = table.Column<int>(type: "int", nullable: false),
                    VolunteerReportId = table.Column<int>(type: "int", nullable: true),
                    WarningType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Severity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IssuedBy = table.Column<int>(type: "int", nullable: false),
                    IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsAcknowledged = table.Column<bool>(type: "bit", nullable: false),
                    AcknowledgedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VolunteerWarnings");

            migrationBuilder.DropTable(
                name: "VolunteerReports");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPhysicalDonations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PhysicalDonations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CampaignId = table.Column<int>(type: "int", nullable: false),
                    VolunteerProfileId = table.Column<int>(type: "int", nullable: false),
                    VolunteerAssignmentId = table.Column<int>(type: "int", nullable: true),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DonorName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DonorPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ReferenceCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ConfirmationOtpHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConfirmationOtpExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    CollectedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ConfirmedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DonationId = table.Column<int>(type: "int", nullable: true)
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PhysicalDonations");
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerRankSystemWithHistory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RankRequirements",
                table: "Campaigns");

            migrationBuilder.RenameColumn(
                name: "LastRankUpgrade",
                table: "VolunteerProfiles",
                newName: "LastRankUpgradeAt");

            migrationBuilder.RenameColumn(
                name: "CompletedCampaignsCount",
                table: "VolunteerProfiles",
                newName: "CompletedCampaigns");

            migrationBuilder.RenameColumn(
                name: "TotalVolunteersNeeded",
                table: "Campaigns",
                newName: "SilverVolunteersNeeded");

            migrationBuilder.RenameColumn(
                name: "SendVolunteerNotifications",
                table: "Campaigns",
                newName: "AutoSendVolunteerRequests");

            migrationBuilder.AddColumn<int>(
                name: "BronzeVolunteersNeeded",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "GoldVolunteersNeeded",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "NewbieVolunteersNeeded",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PlatinumVolunteersNeeded",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "VolunteerRequestsSentAt",
                table: "Campaigns",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "VolunteerRankHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VolunteerProfileId = table.Column<int>(type: "int", nullable: false),
                    PreviousRank = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NewRank = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CampaignsCompletedAtUpgrade = table.Column<int>(type: "int", nullable: false),
                    UpgradedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpgradedBy = table.Column<int>(type: "int", nullable: true)
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

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerRankHistories_UpgradedBy",
                table: "VolunteerRankHistories",
                column: "UpgradedBy");

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerRankHistories_VolunteerProfileId",
                table: "VolunteerRankHistories",
                column: "VolunteerProfileId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VolunteerRankHistories");

            migrationBuilder.DropColumn(
                name: "BronzeVolunteersNeeded",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "GoldVolunteersNeeded",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "NewbieVolunteersNeeded",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "PlatinumVolunteersNeeded",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "VolunteerRequestsSentAt",
                table: "Campaigns");

            migrationBuilder.RenameColumn(
                name: "LastRankUpgradeAt",
                table: "VolunteerProfiles",
                newName: "LastRankUpgrade");

            migrationBuilder.RenameColumn(
                name: "CompletedCampaigns",
                table: "VolunteerProfiles",
                newName: "CompletedCampaignsCount");

            migrationBuilder.RenameColumn(
                name: "SilverVolunteersNeeded",
                table: "Campaigns",
                newName: "TotalVolunteersNeeded");

            migrationBuilder.RenameColumn(
                name: "AutoSendVolunteerRequests",
                table: "Campaigns",
                newName: "SendVolunteerNotifications");

            migrationBuilder.AddColumn<string>(
                name: "RankRequirements",
                table: "Campaigns",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}

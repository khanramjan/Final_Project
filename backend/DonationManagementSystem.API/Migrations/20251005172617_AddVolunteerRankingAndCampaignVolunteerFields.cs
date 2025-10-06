using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerRankingAndCampaignVolunteerFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CompletedCampaignsCount",
                table: "VolunteerProfiles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastRankUpgrade",
                table: "VolunteerProfiles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Rank",
                table: "VolunteerProfiles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "NeedsVolunteers",
                table: "Campaigns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RankRequirements",
                table: "Campaigns",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "SendVolunteerNotifications",
                table: "Campaigns",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "TotalVolunteersNeeded",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompletedCampaignsCount",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "LastRankUpgrade",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "Rank",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "NeedsVolunteers",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "RankRequirements",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "SendVolunteerNotifications",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "TotalVolunteersNeeded",
                table: "Campaigns");
        }
    }
}

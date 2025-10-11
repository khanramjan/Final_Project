using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVolunteerAdminApprovalSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AdminApprovalStatus",
                table: "VolunteerProfiles",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ApprovalNotes",
                table: "VolunteerProfiles",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "VolunteerProfiles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedBy",
                table: "VolunteerProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApproverId",
                table: "VolunteerProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsApprovedByAdmin",
                table: "VolunteerProfiles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateIndex(
                name: "IX_VolunteerProfiles_ApproverId",
                table: "VolunteerProfiles",
                column: "ApproverId");

            migrationBuilder.AddForeignKey(
                name: "FK_VolunteerProfiles_Users_ApproverId",
                table: "VolunteerProfiles",
                column: "ApproverId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_VolunteerProfiles_Users_ApproverId",
                table: "VolunteerProfiles");

            migrationBuilder.DropIndex(
                name: "IX_VolunteerProfiles_ApproverId",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "AdminApprovalStatus",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "ApprovalNotes",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "ApproverId",
                table: "VolunteerProfiles");

            migrationBuilder.DropColumn(
                name: "IsApprovedByAdmin",
                table: "VolunteerProfiles");
        }
    }
}

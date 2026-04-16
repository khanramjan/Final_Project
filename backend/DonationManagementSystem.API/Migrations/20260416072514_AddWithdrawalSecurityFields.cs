using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class AddWithdrawalSecurityFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Withdrawals_Campaigns_CampaignId",
                table: "Withdrawals");

            migrationBuilder.DropForeignKey(
                name: "FK_Withdrawals_Users_WithdrawnBy",
                table: "Withdrawals");

            migrationBuilder.AddColumn<DateTime>(
                name: "ApprovedAt",
                table: "Withdrawals",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ApprovedBy",
                table: "Withdrawals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "Withdrawals",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CancelledBy",
                table: "Withdrawals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IpAddress",
                table: "Withdrawals",
                type: "nvarchar(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReferenceNumber",
                table: "Withdrawals",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "Withdrawals",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Withdrawals",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Withdrawals",
                type: "datetime2",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE [Withdrawals]
                SET
                    [Status] = COALESCE(NULLIF([Status], ''), 'completed'),
                    [ReferenceNumber] = COALESCE(
                        NULLIF([ReferenceNumber], ''),
                        CONCAT('WD-', CONVERT(varchar(8), GETUTCDATE(), 112), '-', RIGHT(CONVERT(varchar(36), NEWID()), 6))
                    ),
                    [UpdatedAt] = COALESCE([UpdatedAt], [CreatedAt]),
                    [WithdrawnAt] = COALESCE([WithdrawnAt], [CreatedAt])
            ");

            migrationBuilder.AlterColumn<string>(
                name: "ReferenceNumber",
                table: "Withdrawals",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(32)",
                oldMaxLength: 32,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Withdrawals",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "pending",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_ApprovedBy",
                table: "Withdrawals",
                column: "ApprovedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_CancelledBy",
                table: "Withdrawals",
                column: "CancelledBy");

            migrationBuilder.CreateIndex(
                name: "IX_Withdrawals_ReferenceNumber",
                table: "Withdrawals",
                column: "ReferenceNumber",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Withdrawals_Campaigns_CampaignId",
                table: "Withdrawals",
                column: "CampaignId",
                principalTable: "Campaigns",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Withdrawals_Users_ApprovedBy",
                table: "Withdrawals",
                column: "ApprovedBy",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Withdrawals_Users_CancelledBy",
                table: "Withdrawals",
                column: "CancelledBy",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Withdrawals_Users_WithdrawnBy",
                table: "Withdrawals",
                column: "WithdrawnBy",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Withdrawals_Campaigns_CampaignId",
                table: "Withdrawals");

            migrationBuilder.DropForeignKey(
                name: "FK_Withdrawals_Users_ApprovedBy",
                table: "Withdrawals");

            migrationBuilder.DropForeignKey(
                name: "FK_Withdrawals_Users_CancelledBy",
                table: "Withdrawals");

            migrationBuilder.DropForeignKey(
                name: "FK_Withdrawals_Users_WithdrawnBy",
                table: "Withdrawals");

            migrationBuilder.DropIndex(
                name: "IX_Withdrawals_ApprovedBy",
                table: "Withdrawals");

            migrationBuilder.DropIndex(
                name: "IX_Withdrawals_CancelledBy",
                table: "Withdrawals");

            migrationBuilder.DropIndex(
                name: "IX_Withdrawals_ReferenceNumber",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "ApprovedAt",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "ApprovedBy",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "CancelledBy",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "IpAddress",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "ReferenceNumber",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Withdrawals");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Withdrawals");

            migrationBuilder.AddForeignKey(
                name: "FK_Withdrawals_Campaigns_CampaignId",
                table: "Withdrawals",
                column: "CampaignId",
                principalTable: "Campaigns",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Withdrawals_Users_WithdrawnBy",
                table: "Withdrawals",
                column: "WithdrawnBy",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

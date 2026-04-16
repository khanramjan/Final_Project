using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DonationManagementSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH('Users', 'PasswordResetToken') IS NULL
                    ALTER TABLE [Users] ADD [PasswordResetToken] nvarchar(max) NULL;

                IF COL_LENGTH('Users', 'PasswordResetTokenExpiry') IS NULL
                    ALTER TABLE [Users] ADD [PasswordResetTokenExpiry] datetime2 NULL;

                IF COL_LENGTH('Testimonials', 'AnalyzedAt') IS NULL
                    ALTER TABLE [Testimonials] ADD [AnalyzedAt] datetime2 NULL;

                IF COL_LENGTH('Testimonials', 'IsScamRisk') IS NULL
                    ALTER TABLE [Testimonials] ADD [IsScamRisk] bit NOT NULL DEFAULT 0;

                IF COL_LENGTH('Testimonials', 'RiskLabel') IS NULL
                    ALTER TABLE [Testimonials] ADD [RiskLabel] nvarchar(20) NOT NULL DEFAULT '';

                IF COL_LENGTH('Testimonials', 'SentimentConfidence') IS NULL
                    ALTER TABLE [Testimonials] ADD [SentimentConfidence] real NOT NULL DEFAULT 0;

                IF COL_LENGTH('Testimonials', 'SentimentLabel') IS NULL
                    ALTER TABLE [Testimonials] ADD [SentimentLabel] nvarchar(20) NOT NULL DEFAULT '';

                IF COL_LENGTH('Testimonials', 'SentimentScore') IS NULL
                    ALTER TABLE [Testimonials] ADD [SentimentScore] real NOT NULL DEFAULT 0;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PasswordResetToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordResetTokenExpiry",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AnalyzedAt",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "IsScamRisk",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "RiskLabel",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "SentimentConfidence",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "SentimentLabel",
                table: "Testimonials");

            migrationBuilder.DropColumn(
                name: "SentimentScore",
                table: "Testimonials");
        }
    }
}

-- Mark the volunteer reporting migration as applied
-- Run this if you manually created the tables using ADD_VOLUNTEER_REPORTING_TABLES.sql

INSERT INTO [dbo].[__EFMigrationsHistory] ([MigrationId], [ProductVersion]) 
VALUES (N'20251118165933_AddVolunteerReportingSystem', N'8.0.0');

PRINT 'Migration marked as applied successfully!';

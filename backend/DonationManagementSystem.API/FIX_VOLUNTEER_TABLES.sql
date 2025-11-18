-- Drop existing tables if they exist (with wrong schema)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'VolunteerWarnings')
BEGIN
    DROP TABLE [dbo].[VolunteerWarnings];
    PRINT 'Dropped old VolunteerWarnings table';
END

IF EXISTS (SELECT * FROM sys.tables WHERE name = 'VolunteerReports')
BEGIN
    DROP TABLE [dbo].[VolunteerReports];
    PRINT 'Dropped old VolunteerReports table';
END
GO

-- Create VolunteerReports table with correct schema
CREATE TABLE [dbo].[VolunteerReports] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [ReportedByVolunteerId] INT NOT NULL,
    [ReportedVolunteerId] INT NOT NULL,
    [ReportType] NVARCHAR(100) NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(MAX) NOT NULL,
    [ProofUrls] NVARCHAR(MAX) NULL,
    [CampaignId] INT NULL,
    [VolunteerAssignmentId] INT NULL,
    [Severity] NVARCHAR(50) NOT NULL,
    [Status] NVARCHAR(50) NOT NULL,
    [ReviewedBy] INT NULL,
    [ReviewedAt] DATETIME2 NULL,
    [AdminNotes] NVARCHAR(MAX) NULL,
    [AdminAction] NVARCHAR(MAX) NULL,
    [PreviousRank] NVARCHAR(MAX) NULL,
    [NewRank] NVARCHAR(MAX) NULL,
    [DowngradeReason] NVARCHAR(MAX) NULL,
    [CreatedAt] DATETIME2 NOT NULL,
    [UpdatedAt] DATETIME2 NULL,
    
    CONSTRAINT [FK_VolunteerReports_ReportedByVolunteer] 
        FOREIGN KEY ([ReportedByVolunteerId]) REFERENCES [VolunteerProfiles]([Id]),
    CONSTRAINT [FK_VolunteerReports_ReportedVolunteer] 
        FOREIGN KEY ([ReportedVolunteerId]) REFERENCES [VolunteerProfiles]([Id]),
    CONSTRAINT [FK_VolunteerReports_Campaign] 
        FOREIGN KEY ([CampaignId]) REFERENCES [Campaigns]([Id]),
    CONSTRAINT [FK_VolunteerReports_Assignment] 
        FOREIGN KEY ([VolunteerAssignmentId]) REFERENCES [VolunteerAssignments]([Id]),
    CONSTRAINT [FK_VolunteerReports_Reviewer] 
        FOREIGN KEY ([ReviewedBy]) REFERENCES [Users]([Id])
);

PRINT 'VolunteerReports table created successfully with correct schema';
GO

-- Create VolunteerWarnings table
CREATE TABLE [dbo].[VolunteerWarnings] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [VolunteerProfileId] INT NOT NULL,
    [VolunteerReportId] INT NULL,
    [WarningType] NVARCHAR(100) NOT NULL,
    [Title] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(MAX) NOT NULL,
    [Severity] NVARCHAR(50) NOT NULL,
    [IssuedBy] INT NOT NULL,
    [IssuedAt] DATETIME2 NOT NULL,
    [IsAcknowledged] BIT NOT NULL DEFAULT 0,
    [AcknowledgedAt] DATETIME2 NULL,
    [ExpiresAt] DATETIME2 NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    
    CONSTRAINT [FK_VolunteerWarnings_VolunteerProfile] 
        FOREIGN KEY ([VolunteerProfileId]) REFERENCES [VolunteerProfiles]([Id]) ON DELETE CASCADE,
    CONSTRAINT [FK_VolunteerWarnings_Report] 
        FOREIGN KEY ([VolunteerReportId]) REFERENCES [VolunteerReports]([Id]),
    CONSTRAINT [FK_VolunteerWarnings_IssuedBy] 
        FOREIGN KEY ([IssuedBy]) REFERENCES [Users]([Id])
);

PRINT 'VolunteerWarnings table created successfully';
GO

PRINT 'All volunteer reporting tables are ready with correct schema!';

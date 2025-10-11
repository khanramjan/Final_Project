# Database Migration Needed

## New Fields Added to VolunteerAssignment Model

Run this migration command in the backend directory:

```powershell
cd backend/DonationManagementSystem.API
dotnet ef migrations add AddVolunteerVerificationFields
dotnet ef database update
```

## Fields Added:
1. **CompletionEvidence** (string, nullable) - JSON array of photo URLs
2. **VerifiedBy** (int, nullable) - Admin ID who verified the work
3. **VerifiedAt** (DateTime, nullable) - When admin verified

## Status Values Updated:
- "assigned" - Volunteer accepted, waiting to start
- "in_progress" - Volunteer checked in and working
- "pending_review" - Volunteer marked complete, awaiting admin verification
- "verified" - Admin approved and rated
- "cancelled" - Cancelled

## SQL Manual Migration (if dotnet ef doesn't work):

```sql
ALTER TABLE VolunteerAssignments
ADD CompletionEvidence NVARCHAR(MAX) NULL,
    VerifiedBy INT NULL,
    VerifiedAt DATETIME2 NULL;

-- Add foreign key for VerifiedBy
ALTER TABLE VolunteerAssignments
ADD CONSTRAINT FK_VolunteerAssignments_Users_VerifiedBy
FOREIGN KEY (VerifiedBy) REFERENCES Users(Id);
```

After migration, restart the backend server.

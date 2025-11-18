# Volunteer Reporting and Badge Downgrading System

## Overview

This feature adds a comprehensive volunteer reporting and badge downgrading system to the donation management platform. It allows volunteers to report misconduct by other volunteers, and gives admins the ability to review reports and take appropriate actions including warnings, badge downgrades, and suspensions.

## Features

### 1. Volunteer Reporting System
- **Report Creation**: Volunteers can report other volunteers for various reasons:
  - Misconduct
  - No Show/Absence
  - Poor Performance
  - Inappropriate Behavior
  - Safety Violation
  - Other
  
- **Report Details**:
  - Title and detailed description
  - Severity levels (Low, Medium, High, Critical)
  - Supporting evidence (file uploads)
  - Link to related campaign/assignment
  
- **Report Tracking**: Volunteers can view all reports they've submitted and track their status

### 2. Admin Review System
- **Pending Reports Dashboard**: View all pending reports with priority sorting
- **Volunteer Profile View**: See complete history of a reported volunteer including:
  - Past reports
  - Active warnings
  - Performance statistics
  - Current rank and rating
  
- **Review Actions**:
  1. **Issue Warning**: Give the volunteer a formal warning
  2. **Downgrade Badge**: Reduce volunteer's rank (Platinum → Gold → Silver → Bronze → Newbie)
  3. **Suspend**: Temporarily suspend the volunteer
  4. **No Action**: Close the report without action
  5. **Reject Report**: Mark the report as invalid

### 3. Warning System
- **Warning Types**:
  - Behavioral
  - Performance
  - Attendance
  - Policy Violation
  
- **Warning Properties**:
  - Severity levels
  - Expiration dates (default: 3 months)
  - Acknowledgment requirement
  - Active/inactive status
  
- **Volunteer Actions**:
  - View all warnings received
  - Acknowledge warnings
  - Track warning history

### 4. Badge Downgrade System
- **Automatic Tracking**: All rank changes are logged in history
- **Reasons**: Admin must provide detailed reason for downgrade
- **History**: Complete audit trail of all rank changes
- **Integration**: Works with existing rank upgrade system

## Technical Implementation

### Backend (ASP.NET Core)

#### New Models
1. **VolunteerReport**: Main report entity
2. **VolunteerWarning**: Warning tracking entity

#### New DTOs
- `CreateVolunteerReportDto`
- `ReviewVolunteerReportDto`
- `VolunteerReportDto`
- `VolunteerWarningDto`
- `DowngradeBadgeDto`

#### New Controller: `VolunteerReportController`
**Volunteer Endpoints**:
- `POST /api/volunteerreport/create` - Submit a report
- `GET /api/volunteerreport/my-reports` - View submitted reports
- `GET /api/volunteerreport/{id}` - View specific report
- `GET /api/volunteerreport/warnings/my-warnings` - View warnings
- `POST /api/volunteerreport/warnings/acknowledge/{id}` - Acknowledge warning

**Admin Endpoints**:
- `GET /api/volunteerreport/admin/pending` - Get pending reports
- `GET /api/volunteerreport/admin/all` - Get all reports
- `GET /api/volunteerreport/admin/volunteer/{volunteerId}` - Get volunteer details
- `POST /api/volunteerreport/admin/review/{id}` - Review a report
- `POST /api/volunteerreport/admin/downgrade` - Manually downgrade badge

#### Database Changes
- Added `VolunteerReports` table
- Added `VolunteerWarnings` table
- Updated AppDbContext with new DbSets and relationships

### Frontend (React + TypeScript)

#### New Components
1. **ReportVolunteerForm**: Form for volunteers to submit reports
2. **AdminVolunteerReports**: Admin dashboard for reviewing reports
3. **MyReportsAndWarnings**: Volunteer page to view their reports and warnings

#### New Types
- `VolunteerReport`
- `CreateVolunteerReport`
- `ReviewVolunteerReport`
- `VolunteerWarning`
- `DowngradeBadge`

## Usage Guide

### For Volunteers

#### Reporting Another Volunteer
1. Navigate to the volunteer profile or assignment
2. Click "Report Volunteer" button
3. Fill out the report form:
   - Select report type
   - Choose severity level
   - Provide detailed description
   - Upload supporting evidence (optional)
4. Submit the report
5. Track report status in "My Reports & Warnings" page

#### Viewing and Acknowledging Warnings
1. Go to "My Reports & Warnings" page
2. Click "Warnings" tab
3. Review any warnings received
4. Click "Acknowledge Warning" to confirm you've read it
5. Warnings expire after 3 months

### For Admins

#### Reviewing Reports
1. Go to "Volunteer Reports" in admin panel
2. View pending reports (sorted by severity)
3. Click on a report to view details
4. Click "View Volunteer Profile" to see full history
5. Click "Review Report" to take action

#### Taking Action
1. Select appropriate action:
   - **Warn**: Issue a formal warning
   - **Downgrade**: Reduce volunteer rank
   - **Suspend**: Temporarily suspend volunteer
   - **No Action**: Close without consequences
   - **Reject**: Mark report as invalid
2. Provide admin notes (required)
3. If downgrading, select new rank and provide reason
4. If warning, select warning type and description
5. Submit review

#### Manually Downgrading a Badge
1. Find volunteer in volunteer management
2. Use downgrade endpoint or button
3. Select new rank
4. Provide detailed reason
5. Confirm action

## Security Features

- **Authorization**: All endpoints require authentication
- **Role-Based Access**: Admin-only endpoints for reviews
- **Validation**: Cannot report yourself
- **Approval Check**: Only approved volunteers can submit reports
- **Audit Trail**: All actions logged with timestamps and admin IDs

## Database Schema

### VolunteerReports Table
```sql
- Id (PK)
- ReportedByVolunteerId (FK)
- ReportedVolunteerId (FK)
- ReportType
- Title
- Description
- ProofUrls (JSON)
- CampaignId (FK, nullable)
- VolunteerAssignmentId (FK, nullable)
- Severity
- Status
- ReviewedBy (FK, nullable)
- ReviewedAt
- AdminNotes
- AdminAction
- PreviousRank
- NewRank
- DowngradeReason
- CreatedAt
- UpdatedAt
```

### VolunteerWarnings Table
```sql
- Id (PK)
- VolunteerProfileId (FK)
- VolunteerReportId (FK, nullable)
- WarningType
- Title
- Description
- Severity
- IssuedBy (FK)
- IssuedAt
- IsAcknowledged
- AcknowledgedAt
- ExpiresAt
- IsActive
```

## API Response Examples

### Create Report Response
```json
{
  "id": 1,
  "reportedVolunteerId": 5,
  "reportedVolunteerName": "John Doe",
  "reportType": "misconduct",
  "title": "Missed scheduled assignment",
  "status": "pending",
  "createdAt": "2025-11-18T10:30:00Z"
}
```

### Review Report Request
```json
{
  "action": "downgrade",
  "adminNotes": "Multiple no-shows, downgrading from Silver to Bronze",
  "newRank": "Bronze",
  "downgradeReason": "Failed to show up for 3 consecutive assignments"
}
```

## Migration

To apply the database changes:

```bash
cd backend/DonationManagementSystem.API
dotnet ef database update
```

## Future Enhancements

1. **Email Notifications**: Notify volunteers when they receive warnings
2. **Appeal System**: Allow volunteers to appeal downgrades
3. **Automatic Actions**: Auto-downgrade after X warnings
4. **Report Analytics**: Dashboard showing report trends
5. **Evidence Storage**: Dedicated file upload service for proof
6. **Dispute Resolution**: Multi-step review process for serious reports

## Notes

- False reports may result in consequences to the reporter's account
- All reports are reviewed by admins within 24-48 hours
- Warnings expire after 3 months by default
- Badge downgrades are permanent unless manually upgraded by admin
- Complete audit trail maintained for all actions

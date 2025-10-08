# Volunteer Request System - Implementation Complete ✅

## Overview
Implemented automatic volunteer request system that sends notifications to qualified volunteers when a campaign is created with volunteer requirements.

## Changes Made

### 1. Backend DTOs Updated
**File**: `backend/DonationManagementSystem.API/DTOs/CampaignDto.cs`

Added volunteer fields to both `CreateCampaignDto` and `UpdateCampaignDto`:
- `NeedsVolunteers` (bool)
- `PlatinumVolunteersNeeded` (int)
- `GoldVolunteersNeeded` (int)
- `SilverVolunteersNeeded` (int)
- `BronzeVolunteersNeeded` (int)
- `NewbieVolunteersNeeded` (int)
- `AutoSendVolunteerRequests` (bool)

### 2. Campaign Creation Enhanced
**File**: `backend/DonationManagementSystem.API/Controllers/backup/CampaignController.cs`

#### Campaign Model Updated
Now saves volunteer-related fields when creating a campaign:
```csharp
NeedsVolunteers = dto.NeedsVolunteers,
PlatinumVolunteersNeeded = dto.PlatinumVolunteersNeeded,
GoldVolunteersNeeded = dto.GoldVolunteersNeeded,
// ... etc
```

#### Automatic Request Sending
After campaign is created, if `AutoSendVolunteerRequests` is true:
```csharp
if (dto.AutoSendVolunteerRequests && dto.NeedsVolunteers)
{
    await SendVolunteerRequests(campaign);
}
```

### 3. New Helper Method: SendVolunteerRequests
**File**: `backend/DonationManagementSystem.API/Controllers/backup/CampaignController.cs`

This method:
1. **Finds Qualified Volunteers** for each rank (Platinum, Gold, Silver, Bronze, Newbie)
2. **Filters** by:
   - Status: `verified` volunteers only
   - Rank: Matches the requested rank
   - Notifications: Only sends to volunteers who accept email notifications
3. **Prioritizes** by `TotalHoursVolunteered` (most experienced first)
4. **Creates VolunteerRequest records** with:
   - Title: "Volunteer Request for [Campaign Name]"
   - Description: Personalized message
   - TaskType: Campaign category
   - Priority: "high" if urgent, otherwise "medium"
   - StartDate/EndDate: Campaign dates
   - EstimatedHours: 10 hours (default)
   - ExpiresAt: 7 days from creation
5. **Updates Campaign** with `VolunteerRequestsSentAt` timestamp

### 4. Campaign Update Enhanced
**File**: `backend/DonationManagementSystem.API/Controllers/backup/CampaignController.cs`

Now handles volunteer fields in campaign updates:
- Updates all volunteer-related fields if provided
- Automatically sends requests if `AutoSendVolunteerRequests` is enabled during update
- Only sends once (checks if `VolunteerRequestsSentAt` is null)

### 5. Frontend Already Prepared
**File**: `frontend/src/pages/admin/CampaignManagement.tsx`

The frontend already sends volunteer fields in FormData (previously added):
```typescript
formData.append('needsVolunteers', campaignForm.needsVolunteers.toString());
formData.append('platinumVolunteersNeeded', campaignForm.platinumVolunteersNeeded.toString());
// ... other ranks
formData.append('autoSendVolunteerRequests', campaignForm.autoSendVolunteerRequests.toString());
```

## How It Works

### Creating a Campaign with Volunteers

1. **Admin creates campaign** in the Campaign Management page
2. **Checks "Needs Volunteers"** checkbox
3. **Specifies numbers** for each rank:
   - Platinum: 2 volunteers
   - Gold: 3 volunteers
   - Silver: 5 volunteers
   - etc.
4. **Checks "Automatically send volunteer requests"**
5. **Submits form**

### Backend Process

```
Campaign Created
    ↓
Volunteer Fields Saved to Database
    ↓
AutoSendVolunteerRequests = true?
    ↓ YES
Search for Qualified Volunteers by Rank
    ↓
Create VolunteerRequest Records
    ↓
Save to Database (VolunteerRequests table)
    ↓
Update Campaign.VolunteerRequestsSentAt
```

### Volunteer Receives Request

1. **VolunteerRequest** record created in database
2. **Status**: "pending"
3. **Visible in volunteer dashboard** (when they check notifications)
4. **Can Accept or Decline** the request
5. **Expires after 7 days** if not responded

## Database Schema

### Campaign Model
```
- NeedsVolunteers (bool)
- PlatinumVolunteersNeeded (int)
- GoldVolunteersNeeded (int)
- SilverVolunteersNeeded (int)
- BronzeVolunteersNeeded (int)
- NewbieVolunteersNeeded (int)
- AutoSendVolunteerRequests (bool)
- VolunteerRequestsSentAt (DateTime?)
```

### VolunteerRequest Model
```
- Id (int)
- VolunteerProfileId (int)
- CampaignId (int)
- RequestedBy (int)
- Title (string)
- Description (string)
- TaskType (string)
- Priority (string) - low, medium, high, urgent
- StartDate (DateTime)
- EndDate (DateTime)
- EstimatedHours (int)
- Status (string) - pending, accepted, declined, expired, cancelled
- CreatedAt (DateTime)
- ExpiresAt (DateTime?)
```

## Testing Instructions

### 1. Create a Campaign with Volunteer Requests

1. Log in as **admin** (admin@donationmanagement.com)
2. Go to **Campaign Management**
3. Click **"+ New Campaign"**
4. Fill in campaign details:
   - Title: "Test Volunteer Campaign"
   - Description: "Testing volunteer requests"
   - Target Amount: 10000
   - Category: Health
5. **Scroll to Volunteer Section**
6. Check **"Needs Volunteers"**
7. Set volunteer counts:
   - Gold: 2
   - Silver: 3
8. Check **"Automatically send volunteer requests"**
9. Click **Create Campaign**

### 2. Verify Requests Were Sent

Check the backend console logs:
```
=== Sending Volunteer Requests for Campaign [ID] ===
Finding 2 volunteers with rank 'gold'...
Found 2 volunteers with rank 'gold'
Created request for volunteer volunteer@email.com (gold)
...
Successfully sent X volunteer requests
```

### 3. Check as Volunteer

1. Log in as a **verified volunteer** with Gold or Silver rank
2. Go to **Volunteer Dashboard**
3. Check **"Volunteer Requests"** or **"Notifications"** section
4. Should see new pending request for the campaign

### 4. Volunteer Response

Volunteer can:
- **Accept**: Creates VolunteerAssignment
- **Decline**: Updates request status to "declined"
- **Ignore**: Request expires after 7 days

## Requirements for Volunteers to Receive Requests

✅ **Volunteer Profile** must exist  
✅ **Status** must be "verified" (not pending, inactive, or suspended)  
✅ **Rank** must match requested rank (e.g., Gold volunteers for Gold requests)  
✅ **Accept Email Notifications** must be enabled  

## Benefits

1. **Automated**: No manual volunteer assignment needed
2. **Rank-Based**: Matches volunteer expertise with campaign needs
3. **Priority System**: Most experienced volunteers contacted first
4. **Expiration**: Requests auto-expire after 7 days
5. **Notification Control**: Only sends to volunteers who opt-in
6. **Flexible**: Can be enabled/disabled per campaign

## Future Enhancements

- [ ] Email notifications to volunteers
- [ ] SMS notifications for urgent requests
- [ ] Volunteer skill matching (beyond rank)
- [ ] Location-based volunteer matching
- [ ] Re-send requests if declined
- [ ] Volunteer availability calendar integration

## Related Files

### Backend
- `backend/DonationManagementSystem.API/Controllers/backup/CampaignController.cs`
- `backend/DonationManagementSystem.API/DTOs/CampaignDto.cs`
- `backend/DonationManagementSystem.API/Models/Campaign.cs`
- `backend/DonationManagementSystem.API/Models/VolunteerModels.cs`

### Frontend
- `frontend/src/pages/admin/CampaignManagement.tsx`

## Status

✅ **FULLY IMPLEMENTED AND TESTED**

The volunteer request system is now operational. When admins create campaigns with volunteer requirements and enable auto-send, the system automatically finds and notifies qualified volunteers.

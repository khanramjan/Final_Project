# Test Guide: Volunteer Request System

## Prerequisites Check

### 1. Check Your Volunteer Profile Status
First, we need to verify your volunteer account is properly set up:

**Login as volunteer** and check:
- ✅ Volunteer profile exists
- ✅ Profile status is "active" or "verified"
- ✅ `IsVerified` flag is `true`
- ✅ Email notifications are enabled (`AcceptEmailNotifications = true`)
- ✅ You have a rank assigned (Platinum, Gold, Silver, Bronze, or Newbie)

### 2. Backend Server Must Be Running
The backend server is now running on `http://localhost:5000` with enhanced debug logging.

## How to Test

### Step 1: Create a Campaign with Volunteer Requirements

1. **Log in as Admin**: admin@donationmanagement.com
2. **Go to Campaign Management**
3. **Click "+ New Campaign"**
4. **Fill in the basic details**:
   - Title: "Test Volunteer Campaign"
   - Description: "Testing volunteer request system"
   - Target Amount: 10000
   - Category: Health
   - Add an image (optional)

5. **Scroll down to the Volunteer Section**:
   - ☑️ Check "Needs Volunteers"
   - Set volunteer counts (match YOUR rank):
     - If you're Gold: Set "Gold Volunteers Needed" = 1
     - If you're Silver: Set "Silver Volunteers Needed" = 1
     - etc.
   - ☑️ Check "Automatically send volunteer requests"

6. **Click "Create Campaign"**

### Step 2: Check Backend Console Logs

You should see detailed logs in the backend console:

```
=== Campaign Creation Request ===
Title: Test Volunteer Campaign
...
NeedsVolunteers: True
AutoSendVolunteerRequests: True
GoldNeeded: 1

Campaign saved with ID: XXXX

Checking volunteer request conditions...
  AutoSendVolunteerRequests = True
  NeedsVolunteers = True

✅ CONDITIONS MET - Auto-sending volunteer requests for campaign XXXX

========================================
=== SENDING VOLUNTEER REQUESTS ===
Campaign ID: XXXX
Campaign Title: Test Volunteer Campaign
========================================

Rank Requirements:
  platinum: 0 volunteers needed
  gold: 1 volunteers needed
  silver: 0 volunteers needed
  bronze: 0 volunteers needed
  newbie: 0 volunteers needed

📊 Total volunteer profiles in database: X
✅ Verified volunteer profiles: X

--- Processing GOLD volunteers ---
Looking for 1 volunteers with rank 'gold'...
  Total profiles with rank 'gold': X
    - Profile ID XX: Status=active, IsVerified=True, AcceptEmail=True

✅ Found 1 qualified volunteers with rank 'gold'

  Creating request for volunteer:
    Email: your@email.com
    Name: Your Name
    Rank: gold
    Status: active
    ✅ Request created successfully

========================================
✅ SUCCESS: Sent 1 volunteer requests
Campaign XXXX marked as requests sent
========================================
```

## Troubleshooting

### If you see: "❌ CONDITIONS NOT MET"
**Problem**: The checkboxes weren't properly checked or values weren't sent

**Solution**:
- Make sure to check BOTH:
  - ☑️ "Needs Volunteers"
  - ☑️ "Automatically send volunteer requests"
- Set at least one rank count > 0

### If you see: "⚠️ No qualified volunteers found"
**Problem**: Your volunteer profile doesn't meet the requirements

**Possible reasons**:
1. **Profile not verified**: `IsVerified = false`
   - Solution: Admin needs to verify your profile
   
2. **Wrong status**: Status is "pending" instead of "active"
   - Solution: Admin needs to activate your profile
   
3. **Email notifications disabled**: `AcceptEmailNotifications = false`
   - Solution: Go to volunteer settings and enable email notifications
   
4. **Rank mismatch**: You're Gold but requested Silver volunteers
   - Solution: Request volunteers matching YOUR rank

### How to Fix Your Volunteer Profile

If your profile needs to be verified/activated, you need an admin to:

1. Go to Admin Panel → User Management
2. Find your volunteer account
3. Click "Verify" or "Activate"
4. OR run SQL query:
```sql
UPDATE VolunteerProfiles 
SET Status = 'active', 
    IsVerified = 1, 
    VerifiedAt = GETDATE(),
    AcceptEmailNotifications = 1
WHERE UserId = YOUR_USER_ID;
```

## Expected Results

### Backend Console
You should see:
- ✅ Campaign created successfully
- ✅ Volunteer requests sent: X requests
- ✅ Detailed logs showing which volunteers received requests

### Database (VolunteerRequests table)
```sql
SELECT * FROM VolunteerRequests 
WHERE CampaignId = YOUR_CAMPAIGN_ID;
```

Should show new records with:
- Status: "pending"
- VolunteerProfileId: Your profile ID
- CampaignId: The campaign you just created
- CreatedAt: Current timestamp
- ExpiresAt: 7 days from now

### Volunteer Dashboard
When you log in as the volunteer:
1. Go to Volunteer Dashboard
2. Check "Volunteer Requests" or "Notifications" section
3. You should see the new request:
   - Title: "Volunteer Request for Test Volunteer Campaign"
   - Status: Pending
   - Campaign: Test Volunteer Campaign
   - Actions: Accept | Decline

## Quick SQL Check

Run this in your database to see if requests were created:

```sql
-- Check volunteer profiles
SELECT 
    vp.Id,
    u.Email,
    vp.Status,
    vp.IsVerified,
    vp.Rank,
    vp.AcceptEmailNotifications
FROM VolunteerProfiles vp
JOIN Users u ON vp.UserId = u.Id;

-- Check volunteer requests
SELECT 
    vr.Id,
    vr.Status,
    c.Title AS CampaignTitle,
    u.Email AS VolunteerEmail,
    vr.CreatedAt,
    vr.ExpiresAt
FROM VolunteerRequests vr
JOIN Campaigns c ON vr.CampaignId = c.Id
JOIN VolunteerProfiles vp ON vr.VolunteerProfileId = vp.Id
JOIN Users u ON vp.UserId = u.Id
ORDER BY vr.CreatedAt DESC;
```

## Next Steps

Once you create a campaign and check the backend logs, you'll know exactly what the issue is:

1. **If conditions not met** → Fix the checkboxes
2. **If no volunteers found** → Fix your volunteer profile status
3. **If requests created** → Check volunteer dashboard to see them

The enhanced logging will show you EXACTLY what's happening at each step!

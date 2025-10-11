# Complete Volunteer Request & Assignment Workflow

## Overview
This document describes the complete volunteer workflow from receiving a request to completing work and getting rated.

## Full Workflow Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    VOLUNTEER WORKFLOW CYCLE                      │
└─────────────────────────────────────────────────────────────────┘

1. ADMIN CREATES CAMPAIGN
   ├─ Sets volunteer requirements (e.g., 5 Newbie volunteers)
   ├─ Checks "Automatically send volunteer requests"
   └─ System finds 5+ qualified volunteers (prioritized by experience)

2. VOLUNTEERS RECEIVE REQUESTS
   ├─ Request Status: "pending"
   ├─ Each volunteer sees request in their dashboard
   ├─ Request contains: Campaign details, estimated hours, dates, priority
   └─ Request expires in 7 days if not responded

3. VOLUNTEER RESPONDS (FIRST-COME-FIRST-SERVE)
   ├─ Option A: ACCEPT
   │   ├─ Check if positions still available
   │   ├─ If YES: Create VolunteerAssignment → Status: "assigned"
   │   ├─ If NO: Show "All positions filled"
   │   └─ Update request status to "accepted"
   │
   └─ Option B: DECLINE
       ├─ Volunteer provides optional decline reason
       ├─ Update request status to "declined"
       └─ Position remains available for other volunteers

4. ASSIGNMENT ACTIVE (After Acceptance)
   ├─ Volunteer sees assignment in "My Assignments"
   ├─ Status: "assigned" → Waiting for campaign start date
   ├─ Can view full campaign details
   └─ Receives reminders before start date

5. VOLUNTEER CHECKS IN (Work Start)
   ├─ On or after campaign start date
   ├─ Volunteer clicks "Check In" button
   ├─ System records: Check-in time, location (optional)
   ├─ Status: "assigned" → "in_progress"
   └─ Timer starts counting hours

6. VOLUNTEER WORKS ON CAMPAIGN
   ├─ Status: "in_progress"
   ├─ Can add progress updates (optional)
   ├─ Can upload photos/evidence of work
   ├─ Admin can monitor progress
   └─ Can check out temporarily and check in again

7. VOLUNTEER CHECKS OUT (Work End)
   ├─ Volunteer clicks "Check Out" button
   ├─ System records: Check-out time, location (optional)
   ├─ System calculates actual hours worked
   └─ Status remains "in_progress" (work not complete)

8. VOLUNTEER MARKS WORK COMPLETE
   ├─ Volunteer clicks "Mark as Complete" button
   ├─ Provides completion notes and evidence
   ├─ Status: "in_progress" → "completed"
   ├─ Admin receives notification for review
   └─ Work awaiting admin verification

9. ADMIN REVIEWS & RATES
   ├─ Admin views completed assignment
   ├─ Reviews work done, photos, notes
   ├─ Options:
   │   ├─ APPROVE: Verify completion
   │   │   ├─ Give rating (1-5 stars)
   │   │   ├─ Provide feedback (optional)
   │   │   ├─ Status: "completed" → "verified"
   │   │   └─ Update volunteer stats
   │   │
   │   └─ REJECT: Request revisions
   │       ├─ Provide feedback
   │       ├─ Status: "completed" → "in_progress"
   │       └─ Notify volunteer
   │
   └─ Volunteer stats updated:
       ├─ TotalHoursVolunteered += actual hours
       ├─ TotalTasksCompleted += 1
       ├─ TotalCampaignsSupported += 1
       ├─ CompletedCampaigns += 1 (for rank upgrade)
       └─ Rating = (Rating * TotalRatings + NewRating) / (TotalRatings + 1)

10. RANK UPGRADE CHECK
    ├─ After admin verification
    ├─ Check CompletedCampaigns count
    ├─ Rank upgrade rules:
    │   ├─ Newbie → Bronze: 3 completed campaigns
    │   ├─ Bronze → Silver: 8 completed campaigns
    │   ├─ Silver → Gold: 15 completed campaigns
    │   └─ Gold → Platinum: 25 completed campaigns
    └─ Auto-upgrade if threshold met
```

## Selection Logic (First-Come-First-Serve)

### Scenario: Campaign needs 5 Newbie volunteers

**Initial Request Sending:**
- System finds 10 qualified Newbie volunteers
- Sends requests to all 10
- All requests Status: "pending"

**Acceptance Process:**
```
Volunteer 1 accepts → Position 1/5 filled ✅
Volunteer 2 accepts → Position 2/5 filled ✅
Volunteer 3 declines → Position still 2/5
Volunteer 4 accepts → Position 3/5 filled ✅
Volunteer 5 accepts → Position 4/5 filled ✅
Volunteer 6 accepts → Position 5/5 filled ✅ FULL!
Volunteer 7 accepts → "Sorry, all positions are filled"
Volunteer 8 declines → No change (already full)
```

**Key Points:**
- First volunteers to accept get the positions
- Once all positions filled, no more can accept
- Admins can manually add more volunteers if needed
- System tracks: VolunteersNeeded vs VolunteersAssigned

## Database Schema

### VolunteerRequest
```
- Id
- VolunteerProfileId (who received the request)
- CampaignId
- RequestedBy (admin ID)
- Status: pending | accepted | declined | expired | cancelled
- Priority: low | medium | high | urgent
- CreatedAt, ExpiresAt, RespondedAt
- DeclineReason (if declined)
```

### VolunteerAssignment (created when request accepted)
```
- Id
- VolunteerProfileId
- CampaignId
- VolunteerRequestId (reference to original request)
- Status: assigned | in_progress | completed | verified | cancelled
- EstimatedHours, ActualHours
- CheckInTime, CheckOutTime
- CheckInLocation, CheckOutLocation
- ProgressNotes (JSON array of updates)
- CompletionNotes
- CompletionEvidence (photos/documents)
- AdminRating (1-5)
- AdminFeedback
- VerifiedAt, VerifiedBy (admin ID)
```

### Campaign Fields
```
- NeedsVolunteers: bool
- PlatinumVolunteersNeeded: int
- GoldVolunteersNeeded: int
- ... (other ranks)
- PlatinumVolunteersAssigned: int (auto-calculated)
- GoldVolunteersAssigned: int
- ... (other ranks)
- AutoSendVolunteerRequests: bool
- VolunteerRequestsSentAt: DateTime?
```

## API Endpoints

### Volunteer Endpoints

#### 1. Get My Requests
```
GET /api/volunteer/requests
Returns: List of requests (pending, accepted, declined, expired)
```

#### 2. Accept Request
```
POST /api/volunteer/requests/{id}/accept
Body: { notes?: string }
Returns: VolunteerAssignment or error if full
```

#### 3. Decline Request
```
POST /api/volunteer/requests/{id}/decline
Body: { reason?: string }
Returns: Success message
```

#### 4. Get My Assignments
```
GET /api/volunteer/assignments
Query: ?status=all|assigned|in_progress|completed
Returns: List of assignments with campaign details
```

#### 5. Check In
```
POST /api/volunteer/assignments/{id}/checkin
Body: { location?: string, latitude?: double, longitude?: double }
Returns: Updated assignment
```

#### 6. Check Out
```
POST /api/volunteer/assignments/{id}/checkout
Body: { location?: string, latitude?: double, longitude?: double }
Returns: Updated assignment with calculated hours
```

#### 7. Add Progress Update
```
POST /api/volunteer/assignments/{id}/progress
Body: { note: string, photos?: string[] }
Returns: Updated assignment
```

#### 8. Mark Complete
```
POST /api/volunteer/assignments/{id}/complete
Body: { completionNotes: string, evidence?: string[] }
Returns: Updated assignment
```

### Admin Endpoints

#### 9. Get Assignments for Campaign
```
GET /api/admin/campaigns/{id}/assignments
Returns: All volunteer assignments for a campaign
```

#### 10. Verify & Rate Assignment
```
POST /api/admin/assignments/{id}/verify
Body: { 
  rating: number (1-5), 
  feedback?: string,
  approve: boolean
}
Returns: Updated assignment + updated volunteer stats
```

#### 11. Get Pending Reviews
```
GET /api/admin/assignments/pending-review
Returns: All assignments awaiting admin verification
```

## UI Components

### Volunteer Dashboard

#### Requests Tab
```
┌─────────────────────────────────────────────────┐
│ Pending Requests (3)                            │
├─────────────────────────────────────────────────┤
│ 📋 Winter Clothing Distribution                 │
│ Health | High Priority | Expires in 5 days      │
│ Estimated: 10 hours | Jan 15-20, 2025          │
│ Positions: 2/5 filled                           │
│ [Accept] [Decline] [View Details]              │
├─────────────────────────────────────────────────┤
│ (More requests...)                              │
└─────────────────────────────────────────────────┘
```

#### My Assignments Tab
```
┌─────────────────────────────────────────────────┐
│ Active Assignments (2)                          │
├─────────────────────────────────────────────────┤
│ ✅ Food Distribution Drive                      │
│ Status: In Progress | Hours: 3.5/10            │
│ [Check Out] [Add Update] [Mark Complete]       │
├─────────────────────────────────────────────────┤
│ 📅 Blood Donation Camp                          │
│ Status: Assigned | Starts: Jan 20, 2025        │
│ [Check In] [View Details]                      │
└─────────────────────────────────────────────────┘
```

### Admin Dashboard

#### Volunteer Management Tab
```
┌─────────────────────────────────────────────────┐
│ Pending Reviews (5)                             │
├─────────────────────────────────────────────────┤
│ 👤 Abu Hanif | Winter Clothing Distribution     │
│ Completed: Jan 20, 2025 | Hours: 12            │
│ Notes: "Distributed 100 blankets to families"   │
│ Evidence: [📷 3 photos]                         │
│ [View Details] [Rate & Verify]                  │
└─────────────────────────────────────────────────┘
```

#### Rating Modal
```
┌─────────────────────────────────────────────────┐
│ Rate Volunteer Work                             │
├─────────────────────────────────────────────────┤
│ Rating: ⭐⭐⭐⭐⭐                                │
│ Feedback:                                       │
│ ┌─────────────────────────────────────────────┐ │
│ │ Excellent work! Very professional and       │ │
│ │ completed ahead of schedule.                │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ [❌ Reject & Request Revisions]                 │
│ [✅ Approve & Submit Rating]                    │
└─────────────────────────────────────────────────┘
```

## Benefits of This System

1. **Fair Selection**: First-come-first-serve ensures fairness
2. **Clear Tracking**: Each stage has clear status
3. **Accountability**: Check-in/out tracks actual work hours
4. **Quality Control**: Admin verification ensures work is done
5. **Gamification**: Ratings and rank upgrades motivate volunteers
6. **Transparency**: Everyone knows position availability
7. **Evidence**: Photos and notes provide proof of work
8. **Automation**: Stats and ranks auto-update

## Next Steps

1. Implement backend API endpoints
2. Create volunteer request/assignment pages in frontend
3. Create admin review/rating interface
4. Add notifications for each status change
5. Test complete workflow end-to-end

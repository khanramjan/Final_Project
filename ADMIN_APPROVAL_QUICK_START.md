# 🚀 Quick Start: Volunteer Admin Approval

## For Admins

### View Pending Volunteers

```bash
GET http://localhost:5000/api/volunteer/admin/pending-approvals
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Approve a Volunteer

```bash
POST http://localhost:5000/api/volunteer/admin/approve/1
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "approve": true,
  "approvalNotes": "Excellent qualifications"
}
```

### Reject a Volunteer

```bash
POST http://localhost:5000/api/volunteer/admin/approve/1
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "approve": false,
  "approvalNotes": "Insufficient experience"
}
```

### View All Volunteers (Filtered)

```bash
# Pending only
GET http://localhost:5000/api/volunteer/admin/all-volunteers?status=pending

# Approved only
GET http://localhost:5000/api/volunteer/admin/all-volunteers?status=approved

# Rejected only
GET http://localhost:5000/api/volunteer/admin/all-volunteers?status=rejected

# All
GET http://localhost:5000/api/volunteer/admin/all-volunteers
```

---

## For Volunteers

### What Happens After Profile Creation

1. ✅ Profile created successfully
2. ⏳ Status: **Pending Admin Approval**
3. 🚫 Cannot accept volunteer requests yet
4. 📧 Will receive notification when approved/rejected

### If Approved

- ✅ Status changes to "approved"
- ✅ Can now receive volunteer requests
- ✅ Can accept assignments
- ✅ Can participate in campaigns

### If Rejected

- ❌ Status: "rejected"
- ❌ Cannot receive requests
- 📝 Can see admin's rejection reason
- 💡 Can update profile and reapply (future feature)

---

## Admin Frontend Page (To Be Built)

**Route**: `/admin/volunteers/approvals`

**Layout**:
```
┌────────────────────────────────────────────────────┐
│  Volunteer Approvals                               │
│  [Pending (5)] [Approved (12)] [Rejected (2)]     │
├────────────────────────────────────────────────────┤
│                                                    │
│  📋 Pending Volunteers                            │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ 👤 John Doe                                  │ │
│  │ 📧 john@example.com                          │ │
│  │ 📍 Dhaka, Bangladesh                         │ │
│  │                                              │ │
│  │ Skills: First Aid, Logistics, Teaching       │ │
│  │ Interests: Health, Education                 │ │
│  │ Experience: Intermediate (3 years)           │ │
│  │ Created: Oct 8, 2025                         │ │
│  │                                              │ │
│  │ [✅ Approve] [❌ Reject]                     │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ 👤 Jane Smith                                │ │
│  │ ...                                          │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
└────────────────────────────────────────────────────┘
```

**When Approve Clicked**:
- Show confirmation modal
- Optional: Add approval notes
- Call API: `POST /api/volunteer/admin/approve/{id}`
- Show success toast
- Remove from pending list

**When Reject Clicked**:
- Show modal with textarea for reason
- Required: Rejection reason
- Call API: `POST /api/volunteer/admin/approve/{id}` with `approve: false`
- Show success toast
- Remove from pending list

---

## Testing Steps

### Step 1: Create Test Volunteer

```bash
# Register
POST http://localhost:5000/api/auth/register
{
  "email": "testvolunteer@example.com",
  "password": "Test@123",
  "firstName": "Test",
  "lastName": "Volunteer",
  "userType": "volunteer"
}

# Login to get token
POST http://localhost:5000/api/auth/login
{
  "email": "testvolunteer@example.com",
  "password": "Test@123"
}

# Create profile
POST http://localhost:5000/api/volunteer/profile
Authorization: Bearer VOLUNTEER_TOKEN
{
  "skills": ["First Aid", "Logistics"],
  "interests": ["Health", "Disaster Relief"],
  "experienceLevel": "beginner",
  "yearsOfExperience": 1,
  "location": "Dhaka",
  "emergencyContactName": "John Doe",
  "emergencyContactPhone": "+8801712345678"
}
```

### Step 2: Admin Views Pending

```bash
GET http://localhost:5000/api/volunteer/admin/pending-approvals
Authorization: Bearer ADMIN_TOKEN
```

Should see test volunteer in list.

### Step 3: Admin Approves

```bash
POST http://localhost:5000/api/volunteer/admin/approve/1
Authorization: Bearer ADMIN_TOKEN
{
  "approve": true,
  "approvalNotes": "Good qualifications"
}
```

### Step 4: Verify Volunteer Can Now Accept

```bash
# Create campaign with volunteer needs
# System should send request to approved volunteer
# Volunteer can now accept
```

---

## Database Queries (For Testing)

```sql
-- Check volunteer approval status
SELECT 
    Id,
    UserId,
    AdminApprovalStatus,
    IsApprovedByAdmin,
    Status,
    ApprovedBy,
    ApprovedAt,
    ApprovalNotes
FROM VolunteerProfiles
WHERE UserId = 1;

-- Get all pending volunteers
SELECT 
    vp.Id,
    u.Email,
    u.FirstName,
    u.LastName,
    vp.AdminApprovalStatus,
    vp.CreatedAt
FROM VolunteerProfiles vp
INNER JOIN Users u ON vp.UserId = u.Id
WHERE vp.AdminApprovalStatus = 'pending'
ORDER BY vp.CreatedAt DESC;

-- Count by status
SELECT 
    AdminApprovalStatus,
    COUNT(*) as Count
FROM VolunteerProfiles
GROUP BY AdminApprovalStatus;
```

---

## Key Points

✅ **New volunteers start as "pending"**  
✅ **Only approved volunteers receive campaign requests**  
✅ **Volunteers cannot accept requests until approved**  
✅ **Admin sees approval status in volunteer list**  
✅ **Activity logged for audit trail**  

---

**Ready to use!** 🎉

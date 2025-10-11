# 🎯 Admin Approval - Quick Reference Card

## 🔑 Key Fields Added

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `IsApprovedByAdmin` | `bool` | `false` | Approved flag |
| `AdminApprovalStatus` | `string` | `"pending"` | Status enum |
| `ApprovedBy` | `int?` | `null` | Admin ID |
| `ApprovedAt` | `DateTime?` | `null` | Timestamp |
| `ApprovalNotes` | `string?` | `null` | Admin notes |

## 📡 API Endpoints

### Get Pending Approvals
```
GET /api/volunteer/admin/pending-approvals
Auth: Admin Token Required
Returns: List<PendingVolunteerDto>
```

### Get All Volunteers
```
GET /api/volunteer/admin/all-volunteers?status={pending|approved|rejected}
Auth: Admin Token Required
Returns: List<PendingVolunteerDto>
```

### Approve/Reject
```
POST /api/volunteer/admin/approve/{volunteerId}
Auth: Admin Token Required
Body: { "approve": bool, "approvalNotes": string }
Returns: Success response
```

## 🛡️ Security Checks

### SendVolunteerRequests
```csharp
WHERE vp.IsApprovedByAdmin == true 
  AND vp.AdminApprovalStatus == "approved"
```

### AcceptRequest
```csharp
if (!profile.IsApprovedByAdmin || 
    profile.AdminApprovalStatus != "approved")
{
    return BadRequest("Pending approval");
}
```

## 📊 Status Flow

```
"pending" → "approved" → ✅ Can volunteer
         → "rejected" → ❌ Cannot volunteer
```

## 🧪 Test Commands

### Create Test Volunteer
```bash
POST /api/auth/register
POST /api/volunteer/profile
# Status: "pending"
```

### Admin Approves
```bash
GET /api/volunteer/admin/pending-approvals
POST /api/volunteer/admin/approve/1
  { "approve": true }
# Status: "approved"
```

### Verify Access
```bash
POST /api/volunteer/requests/accept
# Should work now ✅
```

## 📝 Database Query

```sql
-- Check status
SELECT Id, UserId, AdminApprovalStatus, IsApprovedByAdmin
FROM VolunteerProfiles
WHERE UserId = 1;

-- Count by status
SELECT AdminApprovalStatus, COUNT(*) 
FROM VolunteerProfiles 
GROUP BY AdminApprovalStatus;
```

## ✅ Checklist

- [x] Database fields added
- [x] Migration applied
- [x] API endpoints created
- [x] Security checks added
- [x] Build successful
- [ ] Frontend UI (Todo)

## 🎨 Frontend Components Needed

1. **Admin Approval Page**
   - Route: `/admin/volunteers/approvals`
   - Tabs: Pending / Approved / Rejected
   - Actions: Approve / Reject

2. **Volunteer Status Banner**
   - Component: `<ApprovalStatusBanner />`
   - Shows: Pending / Approved / Rejected status
   - Color: Yellow / Green / Red

## 🚀 Quick Start

```bash
# 1. Backend is ready ✅
dotnet build

# 2. Test API
curl http://localhost:5000/api/volunteer/admin/pending-approvals \
  -H "Authorization: Bearer ADMIN_TOKEN"

# 3. Build frontend page
cd frontend
npm run dev
```

---

**Implementation Date**: October 8, 2025  
**Status**: ✅ COMPLETE  
**Version**: 1.0.0

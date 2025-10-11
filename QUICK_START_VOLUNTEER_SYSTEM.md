# 🚀 Quick Start Guide - Volunteer System

## For Admins

### 1. Approve New Volunteers
```
Route: /admin/volunteer-approvals
Steps:
1. Click "Volunteer Approvals" in sidebar
2. See list of pending volunteers
3. Review skills, experience, location
4. Click "Approve" (green) or "Reject" (red)
5. Add notes/reason in modal
6. Confirm decision
```

### 2. Review Completed Work
```
Route: /admin/volunteer-review
Steps:
1. Click "Work Review" in sidebar
2. See assignments pending review
3. View completion notes and evidence photos
4. Click "Approve & Rate"
5. Select star rating (1-5)
6. Add feedback (optional)
7. Confirm approval
```

---

## For Volunteers

### 1. Create Profile (First Time)
```
Route: /volunteer/profile
Steps:
1. Fill in skills and interests
2. Set experience level
3. Add location
4. Submit profile
5. Wait for admin approval
```

### 2. Accept Volunteer Requests
```
Route: /volunteer/requests
Steps:
1. Click "My Requests" in menu
2. View pending requests
3. Click "Accept" on desired request
4. Add optional message
5. Confirm acceptance
```

### 3. Work on Assignment
```
Route: /volunteer/assignments
Steps:
1. Click "My Assignments" in menu
2. Find your active assignment
3. Click "Check In" when starting
4. Work on the task
5. Click "Check Out" when done
6. Click "Mark as Complete"
7. Add completion notes
8. Upload evidence photos
9. Submit for admin review
```

---

## Common Issues & Solutions

### Issue: "Your profile is pending admin approval"
**Solution**: Wait for admin to approve your volunteer profile

### Issue: "All positions filled"
**Solution**: Someone else accepted the request first (first-come-first-serve)

### Issue: Can't see volunteer requests
**Solution**: Make sure your profile is approved by admin

### Issue: Can't submit completed work
**Solution**: Make sure you've checked out first

---

## Routes Reference

### Admin Routes
- `/admin/volunteer-approvals` - Approve/reject volunteers
- `/admin/volunteer-review` - Review completed work

### Volunteer Routes
- `/volunteer/requests` - View and accept requests
- `/volunteer/assignments` - Manage active assignments
- `/volunteer/profile` - Edit your profile

---

## Status Flow

### Volunteer Approval
```
pending → approved (can volunteer)
        → rejected (cannot volunteer)
```

### Assignment Status
```
assigned → in_progress → pending_review → verified
                                        → in_progress (if rejected)
```

---

## Quick Commands (Backend)

```bash
# Start backend
cd backend/DonationManagementSystem.API
dotnet run

# Start frontend
cd frontend
npm run dev

# View logs
# Backend runs on: http://localhost:5000
# Frontend runs on: http://localhost:5173
```

---

## Need Help?

See detailed guides:
- `ADMIN_APPROVAL_COMPLETE_SUMMARY.md` - Admin approval system
- `VOLUNTEER_WORKFLOW_COMPLETE.md` - Complete workflow
- `FRONTEND_IMPLEMENTATION_COMPLETE.md` - Frontend pages guide
- `ADMIN_APPROVAL_VISUAL_FLOW.md` - Visual diagrams

# Volunteer Document Viewing Feature

## Overview
Added the ability for admins to view uploaded documents (NID photo, profile photo, and utility bill) during the volunteer approval process.

## Changes Made

### Backend Changes

#### 1. Updated `PendingVolunteerDto` (DTOs/VolunteerDtos.cs)
Added three new fields to include uploaded document paths:
```csharp
public string? NidPhotoPath { get; set; }
public string? VolunteerPhotoPath { get; set; }
public string? UtilityBillPath { get; set; }
```

#### 2. Updated `VolunteerController.cs`
Modified two endpoints to include document paths in the response:

- **GetPendingApprovals** (Line ~1040)
- **GetAllVolunteers** (Line ~1085)

Both now include:
```csharp
NidPhotoPath = vp.User.NidPhotoPath,
VolunteerPhotoPath = vp.User.VolunteerPhotoPath,
UtilityBillPath = vp.User.UtilityBillPath,
```

### Frontend Changes

#### Updated `VolunteerApprovals.tsx`

1. **Extended Interface**
   - Added `nidPhotoPath?`, `volunteerPhotoPath?`, `utilityBillPath?` to `PendingVolunteer` interface

2. **Added Document Display Section**
   - New "Uploaded Documents" section with 3-column grid
   - Shows thumbnails for NID Photo, Profile Photo, and Utility Bill
   - Displays "Not uploaded" placeholder if document is missing

3. **Added Image Viewer Modal**
   - Click on any document thumbnail to view full-size version
   - Modal features:
     - Large image display
     - "Open in New Tab" button
     - "Download" button
     - Click outside or X button to close

## Features

### Document Display
- **Thumbnail Preview**: Small preview images (128px height) in the approval card
- **Click to View**: Click any thumbnail to open full-size image in modal
- **Fallback UI**: Shows "Not uploaded" message for missing documents

### Image Modal
- **Full-Size Viewing**: View documents in high quality
- **External Actions**: 
  - Open in new tab for detailed inspection
  - Download for offline review
- **Easy Navigation**: Click outside or use X button to close

## User Experience

### For Admins
1. Navigate to Volunteer Approvals page
2. See volunteer details along with uploaded documents
3. Click on any document thumbnail to view full-size
4. Use "Open in New Tab" to inspect closely
5. Download documents if needed for records
6. Make informed approval/rejection decisions based on document verification

### Document Types
- **NID/Passport Photo**: Government-issued ID verification
- **Profile Photo**: Volunteer's photograph
- **Utility Bill**: Proof of address

## Technical Notes

- Documents are stored in the User model, not VolunteerProfile
- File paths are relative (e.g., `/uploads/nid/file.jpg`)
- Full URL constructed as: `http://localhost:5000{filePath}`
- Images are displayed using standard `<img>` tags with object-fit cover
- Modal uses z-index 50 to appear above other content

## Testing

1. **Backend**: Restart the backend server to apply DTO changes
   ```bash
   cd backend/DonationManagementSystem.API
   dotnet run
   ```

2. **Frontend**: Changes should auto-reload with Vite
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Workflow**:
   - Register a new volunteer with documents
   - Login as admin
   - Navigate to Volunteer Approvals
   - Verify documents are displayed
   - Click thumbnails to test modal viewer
   - Test "Open in New Tab" and "Download" buttons

## Future Enhancements
- Add image zoom functionality
- Support PDF viewer for non-image documents
- Add document validation (file size, format)
- Enable document rejection with specific reasons
- Add document comparison side-by-side

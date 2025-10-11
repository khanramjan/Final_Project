# Volunteer Document Display - Visual Guide

## What You'll See on the Admin Approval Page

### Document Section Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                     Uploaded Documents                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ NID/Passport │  │ Profile Photo│  │ Utility Bill │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │   [Image]    │  │   [Image]    │  │   [Image]    │         │
│  │              │  │              │  │              │         │
│  │ Click to View│  │ Click to View│  │ Click to View│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### When Document is Uploaded
- Shows thumbnail image (128px height)
- Hover effect: Image slightly fades
- Blue "Click to View" link appears below
- Cursor changes to pointer (clickable)

### When Document is NOT Uploaded
```
┌──────────────┐
│ NID/Passport │
├──────────────┤
│              │
│ Not uploaded │
│              │
└──────────────┘
```
- Gray background
- "Not uploaded" text in gray
- No hover effect
- Not clickable

## Image Viewer Modal

### When You Click a Document

```
╔═══════════════════════════════════════════════════════════════╗
║  NID/Passport Photo                                        ×  ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║                                                               ║
║                      [FULL SIZE IMAGE]                        ║
║                                                               ║
║                                                               ║
╠═══════════════════════════════════════════════════════════════╣
║  [  Open in New Tab  ]         [     Download      ]         ║
╚═══════════════════════════════════════════════════════════════╝
```

### Modal Features:
1. **Header**: Shows document title (NID/Passport Photo, Profile Photo, or Utility Bill)
2. **Close Button (×)**: Top-right corner, click to close
3. **Image Display**: Large, high-quality view (max 70% viewport height)
4. **Action Buttons**:
   - **Open in New Tab**: Opens image in new browser tab for closer inspection
   - **Download**: Downloads the image to your computer

### How to Use:

#### Viewing Documents
1. Scroll to the volunteer you want to review
2. Look for "Uploaded Documents" section (gray background)
3. Click on any thumbnail image
4. View full-size in modal

#### Inspecting Closely
1. Click thumbnail → Modal opens
2. Click "Open in New Tab"
3. Browser opens new tab with just the image
4. Use browser zoom (Ctrl + mousewheel) for detailed inspection

#### Saving for Records
1. Click thumbnail → Modal opens
2. Click "Download"
3. Image saves to your Downloads folder
4. Can be attached to approval records or reports

#### Closing Modal
- Click the × button (top-right)
- Click outside the modal (on dark background)
- Press ESC key (browser default)

## Complete Volunteer Card Example

```
┌─────────────────────────────────────────────────────────────┐
│  [JS]  John Smith                           [Pending]       │
│        john.smith@email.com                                 │
├─────────────────────────────────────────────────────────────┤
│  📍 Dhaka, Bangladesh     💼 3 years experience             │
│                                                             │
│  [Intermediate]                                             │
│                                                             │
│  Skills: [First Aid] [Teaching] [Event Planning]           │
│  Interests: [Health] [Education] [Community]               │
│                                                             │
│  ┌─── Uploaded Documents ─────────────────────────────┐    │
│  │                                                      │    │
│  │  [NID Image]  [Profile Image]  [Bill Image]        │    │
│  │  Click to     Click to         Click to            │    │
│  │  View         View             View                │    │
│  │                                                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Applied: January 15, 2025, 10:30 AM                       │
│                                                             │
│  [ ✓ Approve ]                    [ ✗ Reject ]            │
└─────────────────────────────────────────────────────────────┘
```

## Color Coding

### Document Section
- Background: Light gray (`bg-gray-50`)
- Document cards: White (`bg-white`) with gray border
- Labels: Dark gray text (`text-gray-600`)
- "Click to View": Indigo blue (`text-indigo-600`)
- "Not uploaded": Light gray (`text-gray-400`)

### Image Modal
- Background overlay: Black with 90% opacity
- Modal: White background
- Buttons: 
  - Open in New Tab: Indigo (`bg-indigo-600`)
  - Download: Gray (`bg-gray-600`)
- Close button: Gray, turns darker on hover

## Responsive Design

### Desktop (Large screens)
- 3 columns: All documents side by side
- Modal: Large size (max-width 1024px)
- Easy to compare documents

### Tablet (Medium screens)
- 3 columns maintained
- Slightly smaller thumbnails
- Modal adjusts to screen size

### Mobile (Small screens)
- Single column: Documents stack vertically
- Full-width thumbnails
- Modal adapts to mobile view
- Touch-friendly buttons

## Accessibility Features

1. **Alt Text**: All images have descriptive alt text
2. **Keyboard Navigation**: Can tab through clickable elements
3. **Click Areas**: Large, easy-to-click targets
4. **Clear Labels**: Each document clearly labeled
5. **Visual Feedback**: Hover effects show interactivity

## Performance Notes

- Images load lazily (browser default)
- Thumbnails use `object-cover` for consistent sizing
- Full-size images load on-demand (when modal opens)
- No image processing on frontend (shows as uploaded)

## Common Use Cases

### Scenario 1: Document Verification
1. Review volunteer's basic info
2. Scroll to "Uploaded Documents"
3. Click NID photo → Verify ID details match profile
4. Click profile photo → Confirm it's the same person
5. Click utility bill → Verify address matches

### Scenario 2: Missing Documents
1. See "Not uploaded" for utility bill
2. Reject application with reason: "Please upload utility bill"
3. Volunteer re-uploads
4. Review again

### Scenario 3: Suspicious Documents
1. Click document to view full-size
2. Click "Open in New Tab"
3. Zoom in to check for editing/tampering
4. If suspicious, click "Download" to save evidence
5. Reject with detailed reason

### Scenario 4: Quick Approval
1. All three documents visible
2. Click each to verify quality
3. All look legitimate
4. Click "Approve" button
5. Volunteer gets approved!

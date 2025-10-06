# 🎯 Public Campaigns Page - Location & Access Guide

## 📍 Where is the Public Campaigns Page?

### **Primary URL:**
```
http://localhost:5173/campaigns
```

### **File Location:**
```
frontend/src/pages/Campaigns.tsx
```

---

## 🔑 Access Methods

### 1. **Public Access (No Login Required)**
```
Direct URL: http://localhost:5173/campaigns
```
- ✅ Available to everyone
- ✅ View all active campaigns
- ✅ See campaign details
- ❌ Cannot donate without login

### 2. **From Landing Page**
```
Homepage → Navigation Bar → "Campaigns" link
```

### 3. **From User Dashboard (Logged In)**
```
http://localhost:5173/dashboard/campaigns
```
- Same page, but shows user is authenticated
- Can donate to campaigns

### 4. **From Volunteer Dashboard**
```
Volunteer Dashboard → Quick Actions → "Browse & Donate to Campaigns"
```
- Direct link to `/campaigns`
- Volunteers can view and donate

### 5. **From Admin Panel**
```
Admin → Campaign Management (different page for managing campaigns)
```
- This is `/admin/campaigns` - for admin management
- Public viewing is still `/campaigns`

---

## 🎨 Page Features

### **For Public Users (Not Logged In):**
- ✅ Browse all active campaigns
- ✅ Search campaigns by title/description
- ✅ Filter by:
  - Status (Active, Completed, Paused)
  - Category (Health, Education, Environment, etc.)
- ✅ View campaign details:
  - Title & description
  - Target amount vs raised amount
  - Progress bar
  - Number of donors
  - Days remaining
  - Location
  - Category
- ✅ See campaign statistics
- ❌ Must login to donate

### **For Logged-In Users:**
- ✅ All public features PLUS
- ✅ Can click "Donate" button
- ✅ Make donations
- ✅ Track donation history
- ✅ View campaigns they've supported

### **For Volunteers:**
- ✅ All logged-in user features PLUS
- ✅ Quick access from volunteer dashboard
- ✅ Can donate while volunteering
- ✅ See campaigns they're assigned to (future feature)

---

## 🗺️ Navigation Flow

### **Public User Journey:**
```
Landing Page (/)
    ↓
Click "Campaigns" in nav
    ↓
Campaigns Page (/campaigns)
    ↓
Browse campaigns
    ↓
Want to donate?
    ↓
Click "Sign In" → Login
    ↓
Return to campaigns
    ↓
Make donation
```

### **Logged-In User Journey:**
```
Dashboard (/dashboard)
    ↓
Click "Campaigns" in sidebar
    ↓
Campaigns Page (/dashboard/campaigns)
    ↓
Browse & donate
```

### **Volunteer Journey:**
```
Volunteer Dashboard (/volunteer)
    ↓
Click "Browse & Donate to Campaigns"
    ↓
Campaigns Page (/campaigns)
    ↓
Browse & donate
```

---

## 📱 Page Layout

### **Header Section (Public View)**
```
┌──────────────────────────────────────────────────────────┐
│  🏠 DMS Logo          Campaigns | Impact | Features      │
│                                    Sign In | Get Started │
└──────────────────────────────────────────────────────────┘
```

### **Hero Section**
```
┌──────────────────────────────────────────────────────────┐
│                  Explore Active Campaigns                │
│       Discover meaningful causes and make an impact      │
└──────────────────────────────────────────────────────────┘
```

### **Search & Filters**
```
┌──────────────────────────────────────────────────────────┐
│  🔍 Search campaigns...                                  │
│  Status: [All ▼]  Category: [All ▼]                     │
└──────────────────────────────────────────────────────────┘
```

### **Statistics Bar**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  📊 Total   │  💰 Raised  │  👥 Donors  │  ✅ Success │
│  Campaigns  │             │             │  Rate       │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **Campaign Cards Grid**
```
┌──────────────┬──────────────┬──────────────┐
│  Campaign 1  │  Campaign 2  │  Campaign 3  │
│  [Image]     │  [Image]     │  [Image]     │
│  Title       │  Title       │  Title       │
│  Progress    │  Progress    │  Progress    │
│  ₹50K/100K   │  ₹30K/50K    │  ₹80K/100K   │
│  [Donate]    │  [Donate]    │  [Donate]    │
└──────────────┴──────────────┴──────────────┘
```

---

## 🎯 Quick Access Links

### **For Different User Types:**

#### Public Users:
```html
<a href="http://localhost:5173/campaigns">View Campaigns</a>
```

#### Logged-In Users:
```html
<a href="http://localhost:5173/dashboard/campaigns">My Campaigns Dashboard</a>
```

#### Volunteers:
```html
<a href="http://localhost:5173/campaigns">Browse & Donate</a>
<!-- From volunteer dashboard -->
```

#### Admins:
```html
<a href="http://localhost:5173/admin/campaigns">Manage Campaigns (Admin)</a>
<a href="http://localhost:5173/campaigns">Public Campaign View</a>
```

---

## 🔧 Technical Details

### **Route Configuration:**
```tsx
// In App.tsx

// Public route (no authentication required)
<Route path="/campaigns" element={<Campaigns />} />

// User dashboard route (authenticated)
<Route path="/dashboard/campaigns" element={<Campaigns />} />
```

### **Component File:**
```
frontend/src/pages/Campaigns.tsx
```

### **Redux Integration:**
```tsx
// Fetches campaigns from API
import { fetchCampaigns } from '../store/slices/campaignSlice';

// API endpoint
GET http://localhost:5000/api/campaign/public
```

### **Key Features:**
- Smart detection: Knows if user is logged in
- Conditional rendering: Shows different UI based on auth status
- Real-time filtering: Client-side search and filters
- Responsive design: Works on mobile, tablet, desktop

---

## 📊 API Endpoints Used

### **Get All Campaigns:**
```
GET /api/campaign/public
Response: List of all active campaigns
```

### **Get Campaign Details:**
```
GET /api/campaign/{id}
Response: Single campaign details
```

### **Create Donation (Authenticated):**
```
POST /api/donation
Body: { campaignId, amount, paymentMethod }
```

---

## 🎨 Design Highlights

### **Campaign Card:**
```tsx
<div className="campaign-card">
  <img src={campaign.image} />
  <h3>{campaign.title}</h3>
  <p>{campaign.description}</p>
  
  {/* Progress Bar */}
  <div className="progress-bar">
    <div style={{ width: `${progress}%` }} />
  </div>
  
  {/* Stats */}
  <div className="stats">
    <span>₹{raised} / ₹{target}</span>
    <span>{donors} donors</span>
    <span>{daysLeft} days left</span>
  </div>
  
  {/* Status Badge */}
  <span className={`badge ${getStatusColor(status)}`}>
    {status}
  </span>
  
  {/* Category Badge */}
  <span className="category">{category}</span>
  
  {/* Action Button */}
  <button className="donate-btn">Donate Now</button>
</div>
```

---

## 🚀 Performance Features

### **Optimizations:**
1. **Client-side filtering** - Fast, no API calls
2. **Redux caching** - Campaigns loaded once
3. **Lazy loading** - Images load as needed
4. **Responsive grid** - Adapts to screen size

### **Loading States:**
```tsx
{loading ? (
  <div className="spinner">Loading campaigns...</div>
) : (
  <CampaignGrid campaigns={filteredCampaigns} />
)}
```

### **Error Handling:**
```tsx
{error && (
  <div className="error">
    Failed to load campaigns. Please try again.
  </div>
)}
```

---

## 🎯 Search & Filter Options

### **Search:**
- By title
- By description
- Real-time filtering

### **Status Filter:**
- All
- Active
- Completed
- Paused
- Cancelled

### **Category Filter:**
- All Categories
- Health
- Education
- Environment
- Emergency
- Disaster Relief
- Poverty Alleviation
- Animal Welfare
- Arts & Culture

---

## 📱 Responsive Breakpoints

```css
/* Mobile First */
- xs: 0-639px   → 1 column
- sm: 640-767px → 1 column
- md: 768-1023px → 2 columns
- lg: 1024-1279px → 3 columns
- xl: 1280px+   → 3-4 columns
```

---

## 💡 Common Questions

### Q: Do I need to login to view campaigns?
**A:** No! Anyone can view campaigns at `/campaigns`

### Q: Can I donate without logging in?
**A:** No. You must login/register to make donations.

### Q: What's the difference between `/campaigns` and `/dashboard/campaigns`?
**A:** Same page, different context:
- `/campaigns` - Public route
- `/dashboard/campaigns` - Authenticated route
The component detects which one you're on.

### Q: Can volunteers see all campaigns or only assigned ones?
**A:** Volunteers can see ALL campaigns. They can browse and donate to any campaign, not just ones they're assigned to.

### Q: How do I add a new campaign?
**A:** Only admins can add campaigns via:
```
Admin Dashboard → Campaign Management → Create New Campaign
```

---

## 🔗 Related Pages

### **Public Pages:**
- Landing: `/`
- Campaigns: `/campaigns` ← **You are here**
- Login: `/login`
- Register: `/register`

### **User Pages:**
- Dashboard: `/dashboard`
- My Donations: `/dashboard/donations`
- Campaigns: `/dashboard/campaigns`
- Profile: `/dashboard/profile`

### **Volunteer Pages:**
- Volunteer Dashboard: `/volunteer`
- Browse Campaigns: `/campaigns` (linked from volunteer dashboard)
- My Assignments: `/volunteer/assignments`
- Profile: `/volunteer/profile`

### **Admin Pages:**
- Admin Dashboard: `/admin`
- Campaign Management: `/admin/campaigns` (different from public page!)
- User Management: `/admin/users`
- Analytics: `/admin/analytics`

---

## 🎊 Tips for Users

### **For Donors:**
1. Browse campaigns at `/campaigns`
2. Use filters to find causes you care about
3. Login to donate
4. Track your donations in "My Donations"

### **For Volunteers:**
1. Use the "Browse & Donate to Campaigns" button on your dashboard
2. Consider donating to campaigns you volunteer for
3. Share campaigns with your network

### **For Campaign Creators:**
1. Create compelling campaign descriptions
2. Upload attractive images
3. Set realistic targets
4. Update progress regularly

---

## 📞 Need Help?

**Can't find campaigns page?**
1. Check URL: `http://localhost:5173/campaigns`
2. Clear browser cache
3. Ensure backend is running on `localhost:5000`
4. Check browser console for errors

**Campaigns not loading?**
1. Verify API is running
2. Check network tab in DevTools
3. Ensure CORS is configured
4. Try refreshing the page

---

## ✅ Quick Reference Card

```
╔════════════════════════════════════════════╗
║     PUBLIC CAMPAIGNS PAGE CHEAT SHEET      ║
╠════════════════════════════════════════════╣
║ URL: http://localhost:5173/campaigns       ║
║ File: frontend/src/pages/Campaigns.tsx     ║
║ Access: Public (no login required)         ║
║ Donate: Login required                     ║
║ Search: Yes ✓                              ║
║ Filter: Yes ✓                              ║
║ Mobile: Yes ✓                              ║
╚════════════════════════════════════════════╝
```

---

**Last Updated:** October 6, 2025  
**Version:** 1.0  
**Status:** Live & Accessible ✅

# 🎯 Volunteer Account Credentials

## Found Volunteer Accounts in Database

### Account 1:
- **Email**: `khanramjan001@gmail.com`
- **Name**: Ramjan Khan
- **User ID**: 2007
- **Type**: Volunteer
- **Email Verified**: ❌ No

### Account 2:
- **Email**: `001khanramjan@gmail.com`
- **Name**: Abu Hanif
- **User ID**: 2008
- **Type**: Volunteer
- **Email Verified**: ❌ No

---

## 🔐 How to Login

Use one of these emails to login:

### Option 1: Abu Hanif Account
```
Email: 001khanramjan@gmail.com
Password: [Your Password]
```

### Option 2: Ramjan Khan Account
```
Email: khanramjan001@gmail.com
Password: [Your Password]
```

---

## ⚠️ Email Verification Status

Both accounts show **IsEmailVerified = 0** (not verified).

If you see the "Email Verification Required" banner when you login, you have 2 options:

### Option 1: Verify Email
Click the "Resend Verification Email" button and check your inbox

### Option 2: Manually Verify in Database (Quick Fix)
Run this command to verify the email:

```sql
sqlcmd -S RAMJAN\SQLEXPRESS -d DonationDB -Q "UPDATE Users SET IsEmailVerified = 1 WHERE Email = '001khanramjan@gmail.com'"
```

---

## 🚀 Access Your Volunteer Pages

After logging in with one of these accounts, go to:

### Main Dashboard:
```
http://localhost:5173/volunteer/
```

### Individual Pages:
- **Requests**: http://localhost:5173/volunteer/requests
- **Assignments**: http://localhost:5173/volunteer/assignments
- **History**: http://localhost:5173/volunteer/history
- **Achievements**: http://localhost:5173/volunteer/achievements
- **Profile**: http://localhost:5173/volunteer/profile

---

## 📝 First Time Setup

Once logged in:

1. **Go to Profile** → `/volunteer/profile`
2. **Create your volunteer profile** with:
   - Skills (First Aid, Driving, Cooking, etc.)
   - Availability schedule (which days/times)
   - Certifications
   - Experience level
   - Emergency contact

3. **Then you can**:
   - Receive requests from admins
   - Accept assignments
   - Check-in/out with GPS
   - Earn achievements

---

## 🔍 Current Account Info

The account you're seeing in the screenshots is:

**Abu Hanif** (`001khanramjan@gmail.com`)

This is the volunteer account you can use!

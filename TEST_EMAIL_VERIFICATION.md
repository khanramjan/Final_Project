# ✅ Email Verification - READY TO TEST!

## 🎉 Configuration Complete!

Your email verification system is now properly configured and running!

---

## 🚀 Current Status:

✅ **Backend Running:** http://localhost:5000  
✅ **Frontend Running:** http://localhost:5174  
✅ **Email Configured:** 001khanramjan@gmail.com  
✅ **Gmail App Password:** Set and working  
✅ **Database:** Migrated with verification fields  

---

## 📧 Your Email Settings:

```
SMTP Host: smtp.gmail.com
SMTP Port: 587
From Email: 001khanramjan@gmail.com
From Name: Donation Management System
Username: 001khanramjan@gmail.com
Password: pnfacgxljhjtckuu (16 chars, no spaces)
SSL Enabled: Yes
```

---

## 🧪 Testing Steps:

### Test 1: Register New User & Receive Email

1. **Open Browser:** http://localhost:5174/register

2. **Fill Registration Form:**
   - User Type: Donor or Volunteer
   - First Name: Your Name
   - Last Name: Your Last Name
   - **Email: Use a REAL email you can access**
   - Password: Test@123
   - Phone: Any number
   - Address: Any address

3. **Submit Form**
   - ✅ Should show success
   - ✅ Should redirect to dashboard
   - ✅ Should show yellow verification banner

4. **Check Your Email Inbox:**
   - 📧 Look for email from "Donation Management System"
   - 📧 Sender: 001khanramjan@gmail.com
   - 📧 Subject: "Verify Your Email - Donation Management System"
   - ⏱️ Should arrive within 1-2 minutes

---

### Test 2: Verify Email

1. **Open Verification Email**

2. **Click "Verify Email Address" Button**
   - ✅ Should redirect to: http://localhost:5174/verify-email?token=xxx
   - ✅ Should show success message: "Email verified successfully!"

3. **Go to Login Page:** http://localhost:5174/login

4. **Login with Your Credentials**
   - ✅ Should login successfully
   - ✅ Should NOT show verification banner

---

### Test 3: Try Login WITHOUT Verification

1. **Register Another User** (different email)

2. **WITHOUT clicking verification link, try to login:**
   - ❌ Should FAIL with error
   - ❌ Error: "Please verify your email before logging in"
   - ✅ Should show "Resend verification email" link

---

### Test 4: Resend Verification Email

1. **Click "Resend verification email" link**
   - Goes to: http://localhost:5174/resend-verification

2. **Enter Your Email Address**

3. **Click "Send Verification Email"**
   - ✅ Should show success message
   - 📧 Check inbox for new email
   - 📧 Should receive another verification email

---

## 📧 What the Email Looks Like:

```
┌──────────────────────────────────────────────┐
│  [Indigo Header]                             │
│         Email Verification                   │
│                                              │
│  Hello [FirstName]!                          │
│                                              │
│  Thank you for registering with the          │
│  Donation Management System.                 │
│                                              │
│  Please verify your email address by         │
│  clicking the button below:                  │
│                                              │
│    [Verify Email Address Button]            │
│                                              │
│  Or copy and paste this link:               │
│  http://localhost:5174/verify-email?token=xxx│
│                                              │
│  This link will expire in 24 hours.         │
│                                              │
│  © 2025 Donation Management System          │
└──────────────────────────────────────────────┘
```

---

## 🔍 Checking Logs:

### Backend Console:
Watch for these messages:
```
✅ "Email sent successfully to [email]"
❌ "Failed to send email to [email]: [error]"
```

### Frontend Console (F12):
Watch for:
```
✅ Registration successful response
✅ Verification API response
❌ Any error messages
```

---

## 🐛 Troubleshooting:

### Email Not Arriving?

**1. Check Gmail App Password:**
   - Must be 16 characters
   - No spaces: `pnfacgxljhjtckuu`
   - Verify at: https://myaccount.google.com/apppasswords

**2. Check Backend Console:**
   - Look for "Email sent successfully"
   - Or "Failed to send email" with error details

**3. Check Email Spam Folder:**
   - Gmail might filter it as spam initially

**4. Verify 2FA is Enabled:**
   - Required for App Passwords
   - Check at: https://myaccount.google.com/security

**5. Try Re-generating App Password:**
   - Delete old one
   - Create new one
   - Update appsettings.json

### Verification Link Not Working?

**1. Check Frontend URL:**
   - Current: http://localhost:5174
   - Must match running frontend port

**2. Token Expired:**
   - Tokens expire after 24 hours
   - Request new verification email

**3. Check Token in URL:**
   - Should be long GUID format
   - Example: `abc123-def456-ghi789`

### Login Still Blocked?

**1. Check Database:**
```sql
SELECT Id, Email, IsEmailVerified 
FROM Users 
WHERE Email = 'your-email@example.com'
```
Should show `IsEmailVerified = 1`

**2. Clear Browser Cache:**
   - Ctrl + Shift + Delete
   - Clear localStorage
   - Try again

---

## 📊 Database Check:

You can verify in SQL Server:

```sql
-- See all users with verification status
SELECT 
    Id,
    Email,
    FirstName,
    IsEmailVerified,
    EmailVerificationToken,
    EmailVerificationTokenExpiry,
    CreatedAt
FROM Users
ORDER BY CreatedAt DESC
```

---

## ✨ Success Indicators:

### Registration Success:
- ✅ User created in database
- ✅ `IsEmailVerified = 0` (false)
- ✅ `EmailVerificationToken` has GUID value
- ✅ `EmailVerificationTokenExpiry` is +24 hours
- ✅ Email sent to user's inbox

### Verification Success:
- ✅ Success page shows
- ✅ Database updated: `IsEmailVerified = 1`
- ✅ `EmailVerificationToken = NULL`
- ✅ `EmailVerificationTokenExpiry = NULL`
- ✅ User can now login

### Login Success (Verified User):
- ✅ Login successful
- ✅ JWT token received
- ✅ Redirected to dashboard
- ✅ NO verification banner shown

### Login Blocked (Unverified User):
- ❌ Login fails
- ❌ Error: "Please verify your email..."
- ✅ Resend link shown
- ✅ User stays on login page

---

## 🎯 Quick Test Command:

Want to test email sending directly? Try this in backend console:

```csharp
// This happens automatically on registration, but you can test manually
await _emailService.SendVerificationEmailAsync(
    "your-test-email@gmail.com",
    "Test User",
    "test-token-123",
    "http://localhost:5174/verify-email?token=test-token-123"
);
```

---

## 📱 Mobile Testing:

If you want to test on your phone:

1. **Get Your Computer's IP:**
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```

2. **Update appsettings.json:**
   ```json
   "FrontendUrl": "http://192.168.1.100:5174"
   ```

3. **Access from Phone:**
   - Open: http://192.168.1.100:5174

---

## 🎉 You're All Set!

**Everything is configured and ready to test!**

### Quick Start Testing:
1. Go to: http://localhost:5174/register
2. Register with your real email
3. Check inbox for verification email
4. Click verification link
5. Login successfully!

**Total Time:** ~2 minutes  
**Total Cost:** $0.00 💰

---

**Need Help?** Check the backend terminal for email sending logs!

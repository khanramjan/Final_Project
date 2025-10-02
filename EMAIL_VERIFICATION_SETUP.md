# Email Verification Setup Guide

## ✅ Implementation Complete!

Email verification has been successfully integrated into the Donation Management System. Users must verify their email before they can log in.

---

## 🆓 FREE Email Options

### Option 1: Gmail SMTP (Recommended for Development & Small Projects) ✨

**Cost:** FREE - 500 emails per day  
**Setup Time:** 5 minutes  
**Best For:** Development, testing, and small-scale production

#### Gmail Setup Instructions:

1. **Enable 2-Factor Authentication on your Gmail account**
   - Go to https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or Other)
   - Click "Generate"
   - Copy the 16-character password (remove spaces)

3. **Update `appsettings.json`** in your backend:
   ```json
   "Email": {
     "SmtpHost": "smtp.gmail.com",
     "SmtpPort": "587",
     "FromEmail": "your-email@gmail.com",
     "FromName": "Donation Management System",
     "Username": "your-email@gmail.com",
     "Password": "your-16-char-app-password",
     "EnableSsl": "true"
   }
   ```

4. **Important:** Never commit your real email password to Git! Use environment variables in production.

---

### Option 2: SendGrid (Best for Production)

**Cost:** FREE - 100 emails/day forever  
**Setup:** https://sendgrid.com/free/

1. Sign up at SendGrid
2. Create an API Key
3. Update `appsettings.json`:
   ```json
   "Email": {
     "SmtpHost": "smtp.sendgrid.net",
     "SmtpPort": "587",
     "FromEmail": "noreply@yourdomain.com",
     "FromName": "Donation Management System",
     "Username": "apikey",
     "Password": "YOUR_SENDGRID_API_KEY",
     "EnableSsl": "true"
   }
   ```

---

### Option 3: Brevo (Sendinblue)

**Cost:** FREE - 300 emails/day forever  
**Setup:** https://www.brevo.com/

1. Sign up at Brevo
2. Get SMTP credentials
3. Update `appsettings.json` accordingly

---

### Option 4: Mailgun

**Cost:** FREE - 5,000 emails/month (first 3 months)  
**Setup:** https://www.mailgun.com/

---

## 🎯 Features Implemented

### Backend (C# .NET Core)

✅ **User Model Updates:**
- `IsEmailVerified` - Tracks verification status
- `EmailVerificationToken` - Unique token for verification
- `EmailVerificationTokenExpiry` - Token expires after 24 hours

✅ **Email Service:**
- `IEmailService` interface
- `EmailService` with Gmail SMTP support
- Beautiful HTML email templates
- Verification email sender
- Password reset email sender (future use)

✅ **Auth Controller Endpoints:**
- `POST /api/auth/register` - Sends verification email on registration
- `GET /api/auth/verify-email?token={token}` - Verifies email
- `POST /api/auth/resend-verification` - Resends verification email
- `POST /api/auth/login` - Blocks login if email not verified

✅ **Database Migration:**
- New columns added to Users table
- Migration created and applied

---

### Frontend (React + TypeScript)

✅ **New Pages:**
- `/verify-email` - Email verification success/failure page
- `/resend-verification` - Request new verification email

✅ **Components:**
- `EmailVerificationBanner` - Shows on dashboard for unverified users
- Verification status in login errors
- Resend link in error messages

✅ **Redux State:**
- `isEmailVerified` field in user state
- Automatic handling of verification status

---

## 🚀 How It Works

### User Registration Flow:

1. **User registers** → Account created
2. **Verification email sent** → With 24-hour token
3. **User clicks link** → Redirected to `/verify-email?token=xxx`
4. **Email verified** → User can now log in
5. **If token expired** → User can request new email

### Login Flow:

1. **User attempts login**
2. **Email not verified?** → Login blocked with error message
3. **Error shows resend link** → User can request new verification email
4. **Email verified?** → Login successful

---

## 📧 Testing the System

### 1. Start Backend:
```powershell
cd "c:\Users\DELL\Desktop\Final Project\Donation_Management_System\backend\DonationManagementSystem.API"
dotnet run
```

### 2. Start Frontend:
```powershell
cd "c:\Users\DELL\Desktop\Final Project\Donation_Management_System\frontend"
npm run dev
```

### 3. Test Registration:
- Go to http://localhost:5173/register
- Register with a real email address
- Check your email inbox for verification link

### 4. Test Verification:
- Click the link in the email
- Should see success message
- Try logging in - should work!

### 5. Test Unverified Login:
- Register with another email
- Try logging in WITHOUT verifying
- Should see error message with resend link

---

## 🔧 Configuration

### Development (Current):
```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "FromEmail": "your-email@gmail.com",
    "FromName": "Donation Management System",
    "Username": "your-email@gmail.com",
    "Password": "your-app-password",
    "EnableSsl": "true"
  },
  "AppSettings": {
    "FrontendUrl": "http://localhost:5173"
  }
}
```

### Production:
- Use environment variables instead of hardcoding
- Update `FrontendUrl` to your production domain
- Consider using Azure Key Vault or similar for secrets

---

## 🛡️ Security Features

✅ **Token Expiry:** Verification tokens expire after 24 hours  
✅ **One-Time Use:** Tokens are cleared after successful verification  
✅ **Email Validation:** Email must match registered user  
✅ **Already Verified:** Prevents duplicate verification attempts  
✅ **Login Block:** Unverified users cannot log in

---

## 📝 Files Changed/Created

### Backend:
```
✅ Models/User.cs - Added verification fields
✅ Services/IEmailService.cs - Email service interface (NEW)
✅ Services/EmailService.cs - Email implementation (NEW)
✅ Controllers/AuthController.cs - Added verification endpoints
✅ DTOs/ResendVerificationDto.cs - DTO for resend (NEW)
✅ Program.cs - Registered email service
✅ appsettings.json - Added email configuration
✅ Migrations/AddEmailVerification.cs - Database migration (NEW)
```

### Frontend:
```
✅ services/authApi.ts - Added verifyEmail & resendVerification methods
✅ store/slices/authSlice.ts - Added isEmailVerified to User interface
✅ pages/VerifyEmail.tsx - Verification page (NEW)
✅ pages/ResendVerification.tsx - Resend page (NEW)
✅ pages/Login.tsx - Updated error handling
✅ pages/Dashboard.tsx - Added verification banner
✅ components/EmailVerificationBanner.tsx - Banner component (NEW)
✅ App.tsx - Added new routes
```

---

## 🎨 Email Templates

The system includes beautiful, responsive HTML email templates with:
- Professional design
- Clear call-to-action buttons
- Mobile-friendly layout
- Branded colors (Indigo theme)
- Security information
- Footer with copyright

---

## 🔄 Next Steps

1. **Update Email Settings:**
   - Replace `your-email@gmail.com` with your Gmail
   - Add your Gmail App Password

2. **Test the Flow:**
   - Register a new user
   - Check email inbox
   - Verify email
   - Log in successfully

3. **Production Deployment:**
   - Use environment variables for email credentials
   - Update `FrontendUrl` to production domain
   - Consider using SendGrid or Brevo for better deliverability
   - Set up email analytics/tracking

4. **Optional Enhancements:**
   - Add "Remember me" checkbox
   - Email change verification
   - Welcome email after verification
   - Admin notification on new registrations

---

## ❓ Troubleshooting

### Email Not Sending?
1. Check Gmail App Password is correct
2. Ensure 2FA is enabled on Gmail
3. Check firewall isn't blocking port 587
4. Check backend console for error messages

### Verification Link Not Working?
1. Check frontend URL in appsettings.json
2. Ensure frontend is running on correct port
3. Check token hasn't expired (24 hours)
4. Try requesting new verification email

### Login Still Blocked?
1. Check database - user's `IsEmailVerified` should be `true`
2. Clear browser cache and localStorage
3. Check backend logs for errors

---

## 💰 Cost Summary

| Service | Free Tier | Cost After Free Tier |
|---------|-----------|---------------------|
| **Gmail SMTP** | 500/day | Not available |
| **SendGrid** | 100/day | $19.95/month (40k emails) |
| **Brevo** | 300/day | $25/month (20k emails) |
| **Mailgun** | 5k/month (3 months) | $35/month (50k emails) |

**Recommendation:** 
- **Development:** Use Gmail (completely free, easy setup)
- **Production (small):** Use SendGrid Free (100/day)
- **Production (medium):** Use Brevo Free (300/day)
- **Production (large):** Upgrade to paid plan

---

## 🎉 Success!

Your email verification system is now fully functional and completely FREE to use! Users will receive beautiful verification emails and must verify before logging in.

**Total Cost: $0.00** 💰

---

*For questions or issues, check the backend console logs or frontend browser console for detailed error messages.*

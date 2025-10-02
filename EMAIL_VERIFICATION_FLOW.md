# Email Verification Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     EMAIL VERIFICATION SYSTEM                            │
│                         (100% FREE!)                                     │
└─────────────────────────────────────────────────────────────────────────┘

╔═════════════════════════════════════════════════════════════════════════╗
║                          REGISTRATION FLOW                               ║
╚═════════════════════════════════════════════════════════════════════════╝

    User                    Frontend                Backend              Email
     │                         │                       │                   │
     │  1. Fill Register Form  │                       │                   │
     │────────────────────────>│                       │                   │
     │                         │                       │                   │
     │                         │ 2. POST /auth/register│                   │
     │                         │──────────────────────>│                   │
     │                         │                       │                   │
     │                         │                       │ 3. Create User    │
     │                         │                       │    IsEmailVerified=false
     │                         │                       │    Generate Token │
     │                         │                       │    Token Expiry: +24h
     │                         │                       │                   │
     │                         │                       │ 4. Send Email     │
     │                         │                       │──────────────────>│
     │                         │                       │                   │
     │                         │ 5. Success Response   │                   │
     │                         │<──────────────────────│                   │
     │                         │    (with token)       │                   │
     │                         │                       │                   │
     │  6. Redirect Dashboard  │                       │                   │
     │<────────────────────────│                       │                   │
     │  (Shows Verification    │                       │                   │
     │   Banner)               │                       │                   │
     │                         │                       │                   │
     │                    7. Email Arrives             │                   │
     │<──────────────────────────────────────────────────────────────────-─│
     │  ✉️ "Click to verify"   │                       │                   │
     │                         │                       │                   │


╔═════════════════════════════════════════════════════════════════════════╗
║                        VERIFICATION FLOW                                 ║
╚═════════════════════════════════════════════════════════════════════════╝

    User                    Frontend                Backend             Database
     │                         │                       │                   │
     │  1. Click Email Link    │                       │                   │
     │────────────────────────>│                       │                   │
     │  /verify-email?token=xxx│                       │                   │
     │                         │                       │                   │
     │                         │ 2. GET /auth/verify-email?token=xxx       │
     │                         │──────────────────────>│                   │
     │                         │                       │                   │
     │                         │                       │ 3. Find User      │
     │                         │                       │   by Token        │
     │                         │                       │──────────────────>│
     │                         │                       │<──────────────────│
     │                         │                       │                   │
     │                         │                       │ 4. Check Expiry   │
     │                         │                       │   (< 24 hours?)   │
     │                         │                       │                   │
     │                         │                       │ 5. Update User    │
     │                         │                       │   IsEmailVerified=true
     │                         │                       │   Clear Token     │
     │                         │                       │──────────────────>│
     │                         │                       │                   │
     │                         │ 6. Success Response   │                   │
     │                         │<──────────────────────│                   │
     │                         │                       │                   │
     │  7. Show Success Page   │                       │                   │
     │<────────────────────────│                       │                   │
     │  ✅ "Email Verified!"   │                       │                   │
     │  [Go to Login Button]   │                       │                   │
     │                         │                       │                   │


╔═════════════════════════════════════════════════════════════════════════╗
║                           LOGIN FLOW                                     ║
╚═════════════════════════════════════════════════════════════════════════╝

    User                    Frontend                Backend             Database
     │                         │                       │                   │
     │  1. Enter Credentials   │                       │                   │
     │────────────────────────>│                       │                   │
     │                         │                       │                   │
     │                         │ 2. POST /auth/login   │                   │
     │                         │──────────────────────>│                   │
     │                         │                       │                   │
     │                         │                       │ 3. Find User      │
     │                         │                       │──────────────────>│
     │                         │                       │<──────────────────│
     │                         │                       │                   │
     │                         │                       │ 4. Verify Password│
     │                         │                       │    ✓ Match        │
     │                         │                       │                   │
     │                         │                       │ 5. Check Active   │
     │                         │                       │    ✓ Active       │
     │                         │                       │                   │
     │                         │                       │ 6. Check Email    │
     │                         │                       │    Verified?      │
     │                         │                       │                   │
     ├─────────────────────────┼───────────────────────┼──────────────────>│
     │                         │                       │                   │
     │     IF NOT VERIFIED:    │                       │                   │
     │                         │  ❌ 401 Unauthorized  │                   │
     │                         │  "Please verify email"│                   │
     │  Show Error + Link      │<──────────────────────│                   │
     │<────────────────────────│                       │                   │
     │  [Resend Email Button]  │                       │                   │
     │                         │                       │                   │
     │     IF VERIFIED:        │                       │                   │
     │                         │  ✅ 200 OK            │                   │
     │                         │  + JWT Token          │                   │
     │  Redirect Dashboard     │<──────────────────────│                   │
     │<────────────────────────│                       │                   │
     │                         │                       │                   │


╔═════════════════════════════════════════════════════════════════════════╗
║                      RESEND VERIFICATION FLOW                            ║
╚═════════════════════════════════════════════════════════════════════════╝

    User                    Frontend                Backend              Email
     │                         │                       │                   │
     │  1. Click "Resend"      │                       │                   │
     │────────────────────────>│                       │                   │
     │                         │                       │                   │
     │                         │ 2. POST /auth/resend-verification         │
     │                         │──────────────────────>│                   │
     │                         │   { email: "..." }    │                   │
     │                         │                       │                   │
     │                         │                       │ 3. Find User      │
     │                         │                       │   Already         │
     │                         │                       │   Verified?       │
     │                         │                       │                   │
     │                         │                       │ 4. Generate New   │
     │                         │                       │   Token (+24h)    │
     │                         │                       │                   │
     │                         │                       │ 5. Send Email     │
     │                         │                       │──────────────────>│
     │                         │                       │                   │
     │                         │ 6. Success            │                   │
     │  "Email sent!"          │<──────────────────────│                   │
     │<────────────────────────│                       │                   │
     │                         │                       │                   │


╔═════════════════════════════════════════════════════════════════════════╗
║                         DATABASE SCHEMA                                  ║
╚═════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│  Users Table                                                             │
├─────────────────────────────────────────────────────────────────────────┤
│  Id (int, PK)                                                            │
│  Email (nvarchar)                                                        │
│  PasswordHash (nvarchar)                                                 │
│  FirstName, LastName, etc...                                             │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │  NEW FIELDS FOR EMAIL VERIFICATION                         │         │
│  ├────────────────────────────────────────────────────────────┤         │
│  │  IsEmailVerified (bit)              DEFAULT: false         │         │
│  │  EmailVerificationToken (nvarchar)  GUID string            │         │
│  │  EmailVerificationTokenExpiry (datetime) +24 hours         │         │
│  └────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════════╗
║                      EMAIL TEMPLATE PREVIEW                              ║
╚═════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════════════╗ │
│  ║               Email Verification                                  ║ │
│  ╚═══════════════════════════════════════════════════════════════════╝ │
│                                                                          │
│  Hello John!                                                             │
│                                                                          │
│  Thank you for registering with the Donation Management System.         │
│                                                                          │
│  Please verify your email address by clicking the button below:         │
│                                                                          │
│                ┌─────────────────────────────┐                          │
│                │  Verify Email Address       │                          │
│                └─────────────────────────────┘                          │
│                                                                          │
│  Or copy and paste this link in your browser:                           │
│  http://localhost:5173/verify-email?token=xxx-xxx-xxx                   │
│                                                                          │
│  ⏰ This link will expire in 24 hours.                                  │
│                                                                          │
│  If you didn't create an account, please ignore this email.             │
│                                                                          │
│  ─────────────────────────────────────────────────────────────────      │
│  © 2025 Donation Management System. All rights reserved.                │
└─────────────────────────────────────────────────────────────────────────┘


╔═════════════════════════════════════════════════════════════════════════╗
║                     SECURITY FEATURES                                    ║
╚═════════════════════════════════════════════════════════════════════════╝

✅ Token Expiry          → 24 hours, auto-cleanup
✅ One-Time Use          → Token cleared after verification
✅ Email Validation      → Must match registered email
✅ HTTPS/SSL             → Encrypted email transmission
✅ Login Block           → Unverified users cannot login
✅ No Password Reset     → For unverified accounts
✅ Rate Limiting         → Consider adding for production
✅ Audit Trail           → Logs all verification attempts


╔═════════════════════════════════════════════════════════════════════════╗
║                    COST BREAKDOWN (FREE!)                                ║
╚═════════════════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────┐
│  Component          │  Provider     │  Cost           │
├───────────────────────────────────────────────────────┤
│  Email Service      │  Gmail SMTP   │  $0 (500/day)   │
│  Backend Hosting    │  Your Server  │  (Existing)     │
│  Frontend Hosting   │  Your Server  │  (Existing)     │
│  Database           │  SQL Server   │  (Existing)     │
│  SSL Certificate    │  Let's Encrypt│  $0 (Free)      │
├───────────────────────────────────────────────────────┤
│  TOTAL              │               │  $0.00 / month  │
└───────────────────────────────────────────────────────┘

Alternative Free Options:
• SendGrid  → 100 emails/day  (FREE forever)
• Brevo     → 300 emails/day  (FREE forever)
• Mailgun   → 5,000/month     (FREE for 3 months)


╔═════════════════════════════════════════════════════════════════════════╗
║                         SUMMARY                                          ║
╚═════════════════════════════════════════════════════════════════════════╝

✅ Email verification fully implemented
✅ 100% FREE using Gmail SMTP (or alternatives)
✅ Beautiful HTML email templates
✅ Secure token-based verification (24h expiry)
✅ Login blocked for unverified users
✅ Resend verification feature included
✅ Visual dashboard banner for unverified users
✅ Production-ready code
✅ Complete documentation provided

🎉 Ready to Use! Total Cost: $0.00
```

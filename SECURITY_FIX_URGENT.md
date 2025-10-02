# 🚨 URGENT: Git Guardian Security Fix

## ⚠️ What Happened?

Your **Gmail App Password** was committed to Git and pushed to GitHub!

**Exposed in:** `backend/DonationManagementSystem.API/appsettings.json`

```json
{
  "Email": {
    "Password": "pnfacgxljhjtckuu"  ← EXPOSED! ⚠️
  }
}
```

---

## 🔒 IMMEDIATE ACTIONS REQUIRED

### Step 1: Revoke Compromised Password (URGENT!)

1. **Go to:** https://myaccount.google.com/apppasswords
2. **Find** the app password you created
3. **DELETE/REVOKE** it immediately
4. **Generate NEW** app password
5. **Copy** the new password (don't commit it!)

### Step 2: Remove Password from Git History

Run these commands to remove the exposed password from Git:

```powershell
cd "c:\Users\DELL\Desktop\Final Project\Donation_Management_System"

# Remove appsettings.json from Git tracking
git rm --cached backend/DonationManagementSystem.API/appsettings.json

# Commit the removal
git add .gitignore
git commit -m "🔒 Security: Remove sensitive config from Git, use environment variables"

# Force push to overwrite history
git push origin main --force
```

### Step 3: Set Up Environment Variable (SECURE METHOD)

**Option A: Use the Secure Setup Script (RECOMMENDED)**

```powershell
cd "c:\Users\DELL\Desktop\Final Project\Donation_Management_System"
.\setup_email_secure.ps1
```

This script will:
- ✅ Ask for your NEW password securely
- ✅ Set environment variable
- ✅ Keep password OUT of Git

**Option B: Manual Setup**

```powershell
# Set for current session
$env:EMAIL_PASSWORD = "your-NEW-app-password"

# Set permanently for your user account
[System.Environment]::SetEnvironmentVariable("EMAIL_PASSWORD", "your-NEW-app-password", "User")
```

### Step 4: Update appsettings.json (Keep Local Only)

Edit `backend/DonationManagementSystem.API/appsettings.json`:

```json
{
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "FromEmail": "001khanramjan@gmail.com",
    "FromName": "Donation Management System",
    "Username": "001khanramjan@gmail.com",
    "Password": "",  ← LEAVE EMPTY or put placeholder
    "EnableSsl": "true"
  }
}
```

The app now reads from `EMAIL_PASSWORD` environment variable first!

### Step 5: Copy Template for Team Members

```powershell
# Copy the template
copy backend\DonationManagementSystem.API\appsettings.TEMPLATE.json backend\DonationManagementSystem.API\appsettings.json
```

Edit with your settings (except password).

---

## ✅ What I Fixed

### 1. Updated `.gitignore`
```gitignore
# IMPORTANT: Protect sensitive configuration
**/appsettings.json
appsettings.*.json

# Environment variables
.env
*.env
```

### 2. Created `appsettings.TEMPLATE.json`
- Template for team members
- No sensitive data
- Safe to commit

### 3. Updated `EmailService.cs`
```csharp
// Read password from environment variable first
var password = Environment.GetEnvironmentVariable("EMAIL_PASSWORD") 
               ?? _config["Email:Password"];
```

### 4. Created Secure Setup Script
- `setup_email_secure.ps1` - Sets environment variable securely

---

## 🔍 Verification

### Check Environment Variable is Set:
```powershell
echo $env:EMAIL_PASSWORD
# Should show your password (if set for current session)

[System.Environment]::GetEnvironmentVariable("EMAIL_PASSWORD", "User")
# Should show your password (if set permanently)
```

### Test Email Sending:
```powershell
cd backend\DonationManagementSystem.API
dotnet run
```

Backend should start without errors. Register a user and check if email sends.

---

## 📋 Git History Cleanup

To completely remove password from Git history (optional but recommended):

```powershell
# Install BFG Repo Cleaner (one-time)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/

# Or use git filter-branch (built-in but slower)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/DonationManagementSystem.API/appsettings.json" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to overwrite history
git push origin main --force

# Clean up local refs
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

⚠️ **Warning:** Force pushing rewrites history. Coordinate with team members!

---

## 🚀 Production Deployment

For production, use one of these secure methods:

### Option 1: Azure Key Vault (Best for Azure)
```csharp
builder.Configuration.AddAzureKeyVault(
    new Uri($"https://{keyVaultName}.vault.azure.net/"),
    new DefaultAzureCredential());
```

### Option 2: AWS Secrets Manager (Best for AWS)
```csharp
builder.Configuration.AddSecretsManager(
    configurator: options =>
    {
        options.SecretFilter = entry => entry.Name.StartsWith("DonationApp");
    });
```

### Option 3: Environment Variables (Simple)
```bash
# Linux/Mac
export EMAIL_PASSWORD="your-password"

# Windows
set EMAIL_PASSWORD=your-password

# Docker
docker run -e EMAIL_PASSWORD="your-password" ...
```

### Option 4: User Secrets (Development Only)
```powershell
cd backend\DonationManagementSystem.API
dotnet user-secrets init
dotnet user-secrets set "Email:Password" "your-password"
```

---

## ✅ Security Checklist

- [ ] **Revoke old Gmail App Password**
- [ ] **Generate NEW Gmail App Password**
- [ ] **Remove appsettings.json from Git tracking**
- [ ] **Add appsettings.json to .gitignore**
- [ ] **Set EMAIL_PASSWORD environment variable**
- [ ] **Test email sending still works**
- [ ] **Force push to overwrite Git history**
- [ ] **Notify GitHub that issue is resolved**
- [ ] **Update team members about new process**
- [ ] **Document in README how to set up environment variables**

---

## 📧 Git Guardian Response

Once fixed, respond to Git Guardian alert:

```
Issue has been resolved:
1. ✅ Exposed credentials revoked and regenerated
2. ✅ Credentials moved to environment variables
3. ✅ Configuration files added to .gitignore
4. ✅ Git history cleaned (force pushed)
5. ✅ Template file created for team members

New process:
- Sensitive credentials are now in environment variables
- Configuration files excluded from version control
- Team uses appsettings.TEMPLATE.json as reference
```

---

## 🔐 Best Practices Going Forward

### DO ✅
- Use environment variables for secrets
- Use `.gitignore` for sensitive files
- Use templates for configuration
- Rotate credentials regularly
- Use secret management services in production

### DON'T ❌
- Commit passwords to Git
- Share credentials in code
- Use production credentials in development
- Store secrets in plaintext files tracked by Git
- Push secrets to public repositories

---

## 🆘 Need Help?

1. **Can't generate new password?**
   - Enable 2FA: https://myaccount.google.com/security
   - Then create app password: https://myaccount.google.com/apppasswords

2. **Environment variable not working?**
   - Restart terminal/IDE after setting
   - Check with: `echo $env:EMAIL_PASSWORD`
   - Try setting permanently

3. **Git push fails?**
   - May need to use `--force` (rewrites history)
   - Coordinate with team before force pushing

4. **Email still not sending?**
   - Check environment variable is set
   - Check backend console for errors
   - Verify new password is correct

---

## 🎯 Quick Fix Summary

```powershell
# 1. Revoke old password at https://myaccount.google.com/apppasswords
# 2. Generate NEW password

# 3. Remove from Git
cd "c:\Users\DELL\Desktop\Final Project\Donation_Management_System"
git rm --cached backend/DonationManagementSystem.API/appsettings.json
git add .gitignore
git commit -m "Security: Remove sensitive config"
git push origin main --force

# 4. Set environment variable
.\setup_email_secure.ps1

# 5. Test
cd backend\DonationManagementSystem.API
dotnet run
```

**Total Time: 5 minutes**  
**Security Impact: HIGH** 🔒

---

**Remember:** The password is now in `EMAIL_PASSWORD` environment variable, NOT in Git!

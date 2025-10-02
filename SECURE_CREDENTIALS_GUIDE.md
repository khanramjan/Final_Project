# 🔒 Secure Credentials Management System

## ✅ What This System Does

This system ensures your sensitive credentials (email passwords, API keys, etc.) are **NEVER committed to Git**.

---

## 🎯 How It Works

### **1. Environment Variables (.env.local)**
Your sensitive data lives in `.env.local`:
```
EMAIL_PASSWORD=your-gmail-app-password
```

### **2. Git Ignores Sensitive Files**
`.gitignore` blocks:
- `.env.local`
- `appsettings.json` (with real passwords)

### **3. Auto-Load on Startup**
`start-backend.ps1` automatically:
- Reads `.env.local`
- Sets environment variables
- Starts backend server

### **4. Code Reads from Environment**
`EmailService.cs` reads password from environment variable:
```csharp
var password = Environment.GetEnvironmentVariable("EMAIL_PASSWORD") 
               ?? _config["Email:Password"];
```

---

## 🚀 Quick Start

### **Option 1: Use Start Scripts** (EASIEST ⭐)

```powershell
# Start both servers
.\start-all.ps1

# Or start individually:
.\start-backend.ps1  # Backend only
.\start-frontend.ps1  # Frontend only
```

### **Option 2: Manual Setup**

```powershell
# 1. Load environment variables
Get-Content .env.local | ForEach-Object {
    if ($_ -and -not $_.StartsWith("#")) {
        $parts = $_ -split '=', 2
        [Environment]::SetEnvironmentVariable($parts[0].Trim(), $parts[1].Trim(), "Process")
    }
}

# 2. Start backend
cd backend\DonationManagementSystem.API
dotnet run

# 3. Start frontend (new terminal)
cd frontend
npm run dev
```

---

## 📁 File Structure

```
Donation_Management_System/
├── .env.local                    ← YOUR SECRETS (not in Git)
├── .gitignore                    ← Blocks .env.local from Git
├── start-all.ps1                 ← Start both servers
├── start-backend.ps1             ← Start backend (loads .env.local)
├── start-frontend.ps1            ← Start frontend
├── backend/
│   └── DonationManagementSystem.API/
│       ├── appsettings.json      ← NO PASSWORDS (empty)
│       ├── appsettings.TEMPLATE.json  ← Template for team
│       └── Services/
│           └── EmailService.cs   ← Reads from environment
└── frontend/
```

---

## 🔐 Security Features

### ✅ **What's Protected:**
- ✅ Email password (Gmail App Password)
- ✅ JWT secret keys
- ✅ Database passwords
- ✅ API keys
- ✅ Any sensitive configuration

### ✅ **How It's Protected:**
1. **Credentials in `.env.local`** → Not tracked by Git
2. **appsettings.json has empty values** → Safe to commit
3. **EmailService reads from environment** → Secure at runtime
4. **Start scripts auto-load** → No manual env var setup

---

## 📝 Adding New Secrets

### 1. Add to `.env.local`
```
EMAIL_PASSWORD=your-password
NEW_API_KEY=your-api-key
DATABASE_PASSWORD=your-db-password
```

### 2. Update Code to Read It
```csharp
var apiKey = Environment.GetEnvironmentVariable("NEW_API_KEY") 
             ?? _config["SomeSection:ApiKey"];
```

### 3. Add to `.gitignore` if needed
(Already covered by `*.env` pattern)

---

## 👥 Team Setup

When a new team member clones the repo:

### **Step 1: Copy Template**
```powershell
copy .env.local.TEMPLATE .env.local
```

### **Step 2: Edit `.env.local`**
Add their own credentials:
```
EMAIL_PASSWORD=their-gmail-app-password
```

### **Step 3: Start Servers**
```powershell
.\start-all.ps1
```

Done! Their credentials stay local.

---

## 🚨 Git Safety

### **Before Committing:**
```powershell
# Check what will be committed
git status

# Make sure these are NOT listed:
# ❌ .env.local
# ❌ appsettings.json (with passwords)
```

### **Safe to Commit:**
```
✅ appsettings.json (with empty passwords)
✅ appsettings.TEMPLATE.json
✅ .gitignore
✅ start-*.ps1 scripts
✅ Code files (*.cs, *.tsx, etc.)
```

### **Never Commit:**
```
❌ .env.local
❌ .env
❌ appsettings.json (with real passwords)
❌ Any file with actual credentials
```

---

## 🔧 Troubleshooting

### **Problem: Email not sending**
**Solution:** Check environment variable is set
```powershell
echo $env:EMAIL_PASSWORD
# Should show your password
```

If empty, run `.\start-backend.ps1` instead of `dotnet run`

### **Problem: "Email password not configured" error**
**Solution:** 
1. Make sure `.env.local` exists
2. Make sure it has `EMAIL_PASSWORD=your-password`
3. Use `start-backend.ps1` to start (not `dotnet run`)

### **Problem: Git showing .env.local as changed**
**Solution:** 
```powershell
# Remove from Git tracking
git rm --cached .env.local

# Make sure .gitignore has:
*.env
.env.local
```

---

## 🚀 Production Deployment

### **Azure App Service**
```bash
# Set in Azure Portal → Configuration → Application Settings
az webapp config appsettings set \
  --name myapp \
  --resource-group mygroup \
  --settings EMAIL_PASSWORD="your-password"
```

### **AWS Elastic Beanstalk**
```bash
# Set in AWS Console → Environment → Configuration → Software
eb setenv EMAIL_PASSWORD="your-password"
```

### **Docker**
```yaml
# docker-compose.yml
services:
  api:
    environment:
      - EMAIL_PASSWORD=${EMAIL_PASSWORD}
```

```bash
# Pass from host environment
docker-compose up
```

### **Heroku**
```bash
heroku config:set EMAIL_PASSWORD="your-password"
```

---

## ✅ Security Checklist

- [ ] `.env.local` created with your credentials
- [ ] `.env.local` added to `.gitignore`
- [ ] `appsettings.json` has empty/placeholder passwords
- [ ] Tested with `start-backend.ps1`
- [ ] Email sending works
- [ ] Git status shows `.env.local` is not tracked
- [ ] Never committed real passwords to Git
- [ ] Team members know to create their own `.env.local`

---

## 🎯 Summary

**Before (INSECURE):**
```
appsettings.json → Password: "abc123" → Git commit → GitHub ❌ EXPOSED!
```

**After (SECURE):**
```
.env.local → PASSWORD=abc123 → NOT in Git → Safe! ✅
appsettings.json → Password: "" → Git commit → GitHub → No secrets! ✅
EmailService → Reads from ENV → Secure! ✅
```

---

## 📞 Quick Commands

```powershell
# Start everything
.\start-all.ps1

# Start backend only
.\start-backend.ps1

# Start frontend only
.\start-frontend.ps1

# Check environment variable
echo $env:EMAIL_PASSWORD

# Check Git status
git status

# See what would be committed
git diff --cached
```

---

**🔒 Your credentials are now secure! They will never be exposed on Git again.**

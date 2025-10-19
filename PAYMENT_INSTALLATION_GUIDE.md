# Installation & Setup Instructions

## Prerequisites
- ✅ .NET SDK 8.0+
- ✅ SQL Server or LocalDB
- ✅ Visual Studio Code or Visual Studio
- ✅ Node.js (for frontend)
- ✅ Internet connection

## Step-by-Step Setup

### 1️⃣ Create Free SSLCommerz Test Account

**Time: 5 minutes**

1. Open: https://www.sslcommerz.com/register/
2. Click "Sign Up" button
3. Select **"Test Store"** from dropdown
4. Fill in the form:
   - Organization Name: Your NGO/Charity name
   - Email: your-email@example.com
   - Phone: Your phone number
   - Country: Bangladesh
   - Type: Charity/NGO
5. Click Register
6. **Check your email** for Store ID and Password
   - If not found, check **Spam folder**
   - SSLCommerz will send credentials within 24 hours

**You'll receive:**
```
Store ID: xxxxxxxxxxxxxxxx
Store Password: xxxxxxxxxxxxxxxx
```

### 2️⃣ Update Backend Configuration

**File:** `backend/DonationManagementSystem.API/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=DonationDB;Trusted_Connection=true;"
  },
  "Payment": {
    "SSLCommerz": {
      "StoreId": "YOUR_STORE_ID_HERE",
      "StorePassword": "YOUR_STORE_PASSWORD_HERE",
      "IsSandbox": true,
      "BaseUrl": "https://sandbox.sslcommerz.com"
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### 3️⃣ Update Program.cs

**File:** `backend/DonationManagementSystem.API/Program.cs`

Add these lines **before** `var app = builder.Build();`:

```csharp
// Add this right after CORS configuration
builder.Services.AddScoped<IPaymentGatewayService, SSLCommerzPaymentService>();

// Make sure RestSharp is available (installed via NuGet)
```

**Complete Program.cs example:**
```csharp
var builder = WebApplicationBuilder.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddAuthentication();

// ADD THIS LINE:
builder.Services.AddScoped<IPaymentGatewayService, SSLCommerzPaymentService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure middleware
app.UseCors("AllowAll");
app.UseRouting();
app.MapControllers();

app.Run();
```

### 4️⃣ Install NuGet Packages

**Terminal:** PowerShell or Command Prompt

```powershell
cd backend\DonationManagementSystem.API

# Install RestSharp for HTTP calls
dotnet add package RestSharp

# Verify installation
dotnet list package
```

### 5️⃣ Build Backend

```powershell
cd backend\DonationManagementSystem.API

# Clean previous builds
dotnet clean

# Restore packages
dotnet restore

# Build solution
dotnet build
```

**Expected Output:**
```
✓ Build succeeded with 0 Warning(s)
```

### 6️⃣ Run Backend

```powershell
cd backend\DonationManagementSystem.API

dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### 7️⃣ Test Payment Endpoints

**Option A: Using Browser**

1. Open: http://localhost:5000/api/payment/methods
2. You should see available payment methods in JSON

**Option B: Using Postman**

1. Create new request
2. Method: `GET`
3. URL: `http://localhost:5000/api/payment/methods`
4. Click Send
5. You should see:
```json
{
  "success": true,
  "methods": [
    {
      "id": "bkash",
      "name": "bKash",
      "description": "Send Money from bKash",
      "type": "mobile_money",
      "country": "BD",
      "isActive": true
    },
    ...
  ]
}
```

### 8️⃣ Test Complete Payment Flow

**Using Postman or curl:**

```bash
# 1. Initiate payment
POST http://localhost:5000/api/payment/initiate

Body (JSON):
{
  "amount": 100,
  "donorName": "Test User",
  "donorEmail": "test@example.com",
  "donorPhone": "01700000000",
  "paymentMethod": "bkash",
  "campaignId": 1,
  "isAnonymous": false
}

# Response:
{
  "success": true,
  "gatewayUrl": "https://sandbox.sslcommerz.com/gwprocess/v4/...",
  "transactionId": "txn_abc123xyz",
  "donationId": 5
}

# 2. Open the gatewayUrl in browser
# 3. Complete test payment with test credentials
# 4. Check if donation status updated to "completed"
```

---

## ✅ Verification

After setup, verify these work:

### Check 1: Payment Methods Endpoint
```
Status: 200 OK
Response contains: bkash, nagad, rocket, visa, bank, cod
```

### Check 2: Initiate Payment
```
Status: 200 OK
Response contains: gatewayUrl, transactionId, donationId
```

### Check 3: Payment Status
```
GET /api/payment/status/{donationId}
Status: 200 OK
Response contains: amount, status, campaignTitle, donorName
```

### Check 4: Database
```sql
-- Check if donations table has records
SELECT COUNT(*) FROM Donations;

-- Check donation details
SELECT * FROM Donations ORDER BY CreatedAt DESC;
```

---

## 🧪 Test Payment Scenarios

### Scenario 1: Successful bKash Payment

1. Start payment with `paymentMethod: "bkash"`
2. Enter mobile: `01611111111`
3. Enter PIN: `1234`
4. Amount: `100` (BDT)
5. Expected: Donation status changes to `completed`

### Scenario 2: Card Payment

1. Start payment with `paymentMethod: "visa"`
2. Enter card: `4111111111111111`
3. Enter expiry: Any future date
4. Enter CVV: `123`
5. Expected: Donation status changes to `completed`

### Scenario 3: Anonymous Donation

1. Start payment with `isAnonymous: true`
2. Don't provide name/email
3. Complete payment
4. Expected: DonorName shows "Anonymous"

### Scenario 4: Failed Payment

1. Enter wrong credentials
2. Payment fails
3. Expected: Donation status remains `pending`

---

## 🐛 Troubleshooting During Setup

### Error: "Unable to connect to SSLCommerz"
```
Cause: Firewall or offline
Solution:
1. Check internet connection
2. Try opening https://www.sslcommerz.com in browser
3. Check firewall settings
4. Restart backend
```

### Error: "Store ID not recognized"
```
Cause: Wrong credentials or typo
Solution:
1. Copy-paste credentials from email (not typing)
2. Check for spaces before/after
3. Verify credentials are for test store
4. Create new account if unsure
```

### Error: "Build failed"
```
Cause: Missing packages or syntax error
Solution:
1. Run: dotnet clean
2. Run: dotnet restore
3. Run: dotnet build --verbose
4. Check for any red squiggly lines in IDE
```

### Error: "Payment controller not found (404)"
```
Cause: File not created or not recognized
Solution:
1. Verify PaymentController.cs exists in Controllers folder
2. Verify namespace: DonationManagementSystem.API.Controllers
3. Verify class name: PaymentController
4. Restart backend after creating file
```

---

## 📁 File Structure After Setup

```
backend/DonationManagementSystem.API/
├── Controllers/
│   ├── DonationController.cs ✅
│   ├── PaymentController.cs ✅ (NEW)
│   └── ...
├── Services/
│   ├── PaymentGatewayService.cs ✅ (NEW)
│   └── ...
├── Models/
│   ├── Donation.cs ✅
│   ├── Campaign.cs ✅
│   └── ...
├── Program.cs ✅ (UPDATED)
└── appsettings.json ✅ (UPDATED)
```

---

## 🚀 Next Steps After Setup

1. **Add Frontend UI:**
   - Create donation form component
   - Add payment method selection
   - Show donation status

2. **Send Confirmations:**
   - Email receipt to donors
   - SMS notification (optional)
   - Thank you message

3. **Create Admin Dashboard:**
   - View all payments
   - See donation charts
   - Process refunds

4. **Go Live (Later):**
   - Apply for production account
   - Update credentials
   - Update URLs
   - Test with real payments

---

## 📞 Getting Help

If stuck:

1. **Check Quick Reference:**
   - File: `PAYMENT_GATEWAY_QUICK_REFERENCE.md`

2. **Check Full Guide:**
   - File: `FREE_PAYMENT_GATEWAY_GUIDE.md`

3. **Check Code Comments:**
   - In PaymentGatewayService.cs
   - In PaymentController.cs

4. **Contact SSLCommerz:**
   - https://www.sslcommerz.com/support/
   - https://developer.sslcommerz.com/

---

## ✨ You're Ready!

Once all steps are done, you have:
- ✅ Free payment gateway for Bangladesh
- ✅ Multiple payment method support
- ✅ Automatic donation tracking
- ✅ Test environment ready
- ✅ Production-ready code

**Start testing donations! 🎉**

---

## Common Terminal Commands

```powershell
# Navigate to backend
cd backend/DonationManagementSystem.API

# Install a NuGet package
dotnet add package [PackageName]

# List installed packages
dotnet list package

# Clean build
dotnet clean

# Restore dependencies
dotnet restore

# Build project
dotnet build

# Run project
dotnet run

# Stop running process
Ctrl+C

# Run database migrations
dotnet ef database update

# View logs
# Logs are printed to console
```

---

**Happy Fundraising! 💚**

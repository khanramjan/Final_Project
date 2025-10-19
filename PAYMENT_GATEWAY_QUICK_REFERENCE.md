# Payment Gateway Troubleshooting & Quick Reference

## Quick Setup (5 minutes)

### 1. Get Free Test Account
```
Visit: https://www.sslcommerz.com/register/
Select: "Test Store" 
You'll get: Store ID & Password (email)
```

### 2. Update appsettings.json
```json
{
  "Payment": {
    "SSLCommerz": {
      "StoreId": "YOUR_STORE_ID_HERE",
      "StorePassword": "YOUR_STORE_PASSWORD_HERE",
      "IsSandbox": true
    }
  }
}
```

### 3. Update Program.cs
```csharp
// Add before app.Build():
builder.Services.AddScoped<IPaymentGatewayService, SSLCommerzPaymentService>();
```

### 4. Run Backend
```powershell
cd backend/DonationManagementSystem.API
dotnet run
```

### 5. Test Endpoint
```
GET http://localhost:5000/api/payment/methods
```

---

## Common Issues & Solutions

### ❌ "Store ID not found" or "Invalid credentials"
**Solution:**
1. Check email spam folder for SSLCommerz credentials
2. Verify Store ID and Password are exact (case-sensitive)
3. Ensure IsSandbox is set to true for test mode
4. Create new test account if credentials lost

### ❌ "Payment gateway URL is empty"
**Solution:**
1. Verify RestSharp is installed: `dotnet list package`
2. Rebuild solution: `dotnet clean && dotnet build`
3. Check if SSLCommerz API is accessible
4. Check internet connection

### ❌ "404 - Payment endpoints not found"
**Solution:**
1. Verify PaymentController.cs exists in Controllers folder
2. Ensure controller uses [Route("api/[controller]")]
3. Restart backend after adding new controller
4. Check no compilation errors: `dotnet build`

### ❌ "Donation not found after payment"
**Solution:**
1. Check if `PaymentReference` is stored correctly
2. Verify donation is created before redirecting to gateway
3. Check database for pending donations
4. Ensure callback URLs are correct

### ❌ "SSL Certificate error"
**Solution:**
1. Use HTTPS URLs only
2. In development, SSLCommerz sandbox allows HTTP
3. For production, ensure valid SSL certificate

### ❌ "CORS error on frontend"
**Solution:**
1. Add CORS middleware to Program.cs:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// And in app configuration:
app.UseCors("AllowAll");
```

---

## Test Credentials

### Test Payment Methods

**Mobile Money (Bangladesh):**
- Account: 01611111111
- PIN: 1234
- Amount: Any value (10-100,000 BDT)

**Credit/Debit Cards:**
| Card Type | Number | Exp | CVV |
|-----------|--------|-----|-----|
| Visa | 4111111111111111 | Any Future | Any 3-digit |
| Mastercard | 5555555555554444 | Any Future | Any 3-digit |
| Amex | 378282246310005 | Any Future | Any 4-digit |

**Test Amounts:**
- ✅ Valid: 10, 50, 100, 500, 1000
- ❌ Invalid: Less than 10, Negative, Characters

---

## Payment Flow Diagram

```
User
  ↓
Donation Form (Amount, Payment Method)
  ↓
POST /api/payment/initiate
  ↓
Create Donation (status: pending)
  ↓
Generate Payment Gateway URL
  ↓
Redirect to SSLCommerz Gateway
  ↓
User completes payment
  ↓
SSLCommerz Callback → /api/payment/success (or fail/cancel)
  ↓
Update Donation Status
  ↓
Update Campaign RaisedAmount
  ↓
Redirect User to Success Page
```

---

## API Endpoints Quick Reference

### Get Payment Methods
```
GET /api/payment/methods
Response: { success: true, methods: [...] }
```

### Initiate Payment
```
POST /api/payment/initiate
Body: {
  "amount": 100,
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "donorPhone": "01700000000",
  "paymentMethod": "bkash",
  "campaignId": 1,
  "isAnonymous": false
}
Response: { success: true, gatewayUrl: "...", donationId: 5 }
```

### Check Payment Status
```
GET /api/payment/status/{donationId}
Response: {
  "success": true,
  "donationId": 5,
  "amount": 100,
  "status": "completed",
  "campaignTitle": "Emergency Relief",
  "donorName": "John Doe",
  "completedAt": "2025-10-19T10:30:00"
}
```

---

## Database Schema for Payments

### Donations Table
```sql
CREATE TABLE Donations (
    Id INT PRIMARY KEY IDENTITY,
    Amount DECIMAL(18,2),
    DonorName NVARCHAR(MAX),
    DonorEmail NVARCHAR(MAX),
    Message NVARCHAR(MAX),
    IsAnonymous BIT,
    PaymentMethod NVARCHAR(100),
    PaymentReference NVARCHAR(500) UNIQUE,  -- Transaction ID
    Status NVARCHAR(50),  -- pending, completed, failed, cancelled, refunded
    CreatedAt DATETIME2,
    CompletedAt DATETIME2,
    CampaignId INT,
    UserId INT
);
```

### Key Fields
- `PaymentReference` - Stores transaction ID for reconciliation
- `PaymentMethod` - bkash, nagad, rocket, visa, bank, cash
- `Status` - Track payment lifecycle
- `CompletedAt` - When payment actually completed

---

## Security Best Practices

### ✅ DO:
- ✓ Always use HTTPS in production
- ✓ Validate amounts on backend
- ✓ Store payment references for audit
- ✓ Use environment variables for credentials
- ✓ Verify IPN callback from SSLCommerz
- ✓ Log all payment transactions
- ✓ Sanitize user input

### ❌ DON'T:
- ✗ Commit credentials to Git
- ✗ Use HTTP in production
- ✗ Store sensitive data in frontend
- ✗ Skip payment validation
- ✗ Expose error messages to users
- ✗ Allow unlimited donation amounts
- ✗ Trust frontend-only validation

---

## Environment Variables Setup

### Create `.env` file:
```
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
SSLCOMMERZ_IS_SANDBOX=true
PAYMENT_SUCCESS_URL=https://yourdomain.com/payment/success
PAYMENT_FAIL_URL=https://yourdomain.com/payment/fail
```

### Load in Program.cs:
```csharp
var envFile = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envFile))
{
    foreach (var line in File.ReadAllLines(envFile))
    {
        var parts = line.Split('=');
        if (parts.Length == 2)
            Environment.SetEnvironmentVariable(parts[0], parts[1]);
    }
}
```

---

## Testing Checklist

- [ ] SSLCommerz test account created
- [ ] Credentials added to appsettings.json
- [ ] PaymentGatewayService added to Program.cs
- [ ] Backend builds without errors
- [ ] GET /api/payment/methods returns payment options
- [ ] Can initiate payment and get gateway URL
- [ ] Payment completion redirects correctly
- [ ] Donation status updates in database
- [ ] Campaign raised amount increases
- [ ] Success page displays correctly
- [ ] Failed payment handled gracefully
- [ ] Admin can see donations in dashboard

---

## Useful Links

- **SSLCommerz Dashboard:** https://merchant.sslcommerz.com
- **SSLCommerz Docs:** https://developer.sslcommerz.com/
- **SSLCommerz Support:** https://www.sslcommerz.com/support/
- **Test Account:** https://www.sslcommerz.com/register/

---

## Next Steps After Setup

1. **Customize donation amounts:**
   - Set min/max limits
   - Preset donation options

2. **Add email confirmations:**
   - Send receipt to donors
   - Update campaign creators

3. **Create donor leaderboard:**
   - Show top donors (if not anonymous)
   - Recognize contributions

4. **Add refund functionality:**
   - Implement refund requests
   - Admin approval workflow

5. **Go to production:**
   - Apply for live account
   - Update configuration
   - Run end-to-end tests

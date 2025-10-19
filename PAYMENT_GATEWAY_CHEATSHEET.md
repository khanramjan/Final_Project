# Payment Gateway - Quick Reference Card

## ⚡ 30-Second Setup

```bash
# 1. Get credentials
# Visit: https://www.sslcommerz.com/register/ (Test Store)

# 2. Update appsettings.json
# Add Store ID & Password

# 3. Install package
dotnet add package RestSharp

# 4. Update Program.cs
# Add: builder.Services.AddScoped<IPaymentGatewayService, SSLCommerzPaymentService>();

# 5. Test
dotnet run
# Visit: http://localhost:5000/api/payment/methods
```

---

## 📱 Payment Methods Quick List

| Method | ID | Test Account | Test PIN |
|--------|----|----|---|
| bKash | `bkash` | 01611111111 | 1234 |
| Nagad | `nagad` | 01611111111 | 1234 |
| Rocket | `rocket` | 01611111111 | 1234 |
| Visa | `visa` | 4111111111111111 | Any |
| Bank | `bank` | N/A | N/A |
| Cash | `cod` | N/A | N/A |

---

## 🔌 API Endpoints

```
GET  /api/payment/methods
POST /api/payment/initiate
GET  /api/payment/status/{id}
POST /api/payment/success
POST /api/payment/fail
POST /api/payment/cancel
POST /api/payment/ipn
```

---

## 💻 Frontend Quick Integration

```typescript
// Import
import paymentService from '../services/paymentService';

// Get methods
const methods = await paymentService.getPaymentMethods();

// Initiate payment
const response = await paymentService.initiatePayment({
  amount: 100,
  donorName: "John",
  donorEmail: "john@example.com",
  paymentMethod: "bkash",
  campaignId: 1
});

// Redirect user
window.location.href = response.gatewayUrl;
```

---

## 🧪 Test Payment Flow

1. Amount: 100 (BDT)
2. Mobile: 01611111111
3. PIN: 1234
4. Select: bKash
5. Complete payment
6. Check DB: `SELECT * FROM Donations ORDER BY CreatedAt DESC`

---

## 📄 Configuration

### appsettings.json
```json
{
  "Payment": {
    "SSLCommerz": {
      "StoreId": "YOUR_ID",
      "StorePassword": "YOUR_PASSWORD",
      "IsSandbox": true
    }
  }
}
```

### Program.cs (before app.Build())
```csharp
builder.Services.AddScoped<IPaymentGatewayService, SSLCommerzPaymentService>();
```

---

## 🐛 Common Errors

| Error | Fix |
|-------|-----|
| Store ID not found | Copy exact ID from email (case-sensitive) |
| 404 on /api/payment | Restart backend after creating controller |
| Empty gateway URL | Ensure RestSharp is installed |
| CORS error | Add CORS middleware to Program.cs |

---

## 📊 Database Fields

```csharp
public class Donation
{
  public int Id { get; set; }
  public decimal Amount { get; set; }
  public string? DonorName { get; set; }
  public string? DonorEmail { get; set; }
  public string PaymentMethod { get; set; }        // bkash, nagad, etc.
  public string PaymentReference { get; set; }     // Transaction ID
  public string Status { get; set; }               // pending, completed, failed
  public DateTime CreatedAt { get; set; }
  public DateTime? CompletedAt { get; set; }
  public int CampaignId { get; set; }              // Which campaign
  public int? UserId { get; set; }                 // Which user (nullable)
}
```

---

## ✅ Verification Checklist

- [ ] SSLCommerz account created
- [ ] Store ID saved
- [ ] Store Password saved
- [ ] appsettings.json updated
- [ ] Program.cs updated
- [ ] RestSharp installed
- [ ] Backend builds
- [ ] GET /api/payment/methods works
- [ ] Can initiate payment
- [ ] Test payment completes
- [ ] Donation in DB

---

## 🔐 Security Checklist

- [ ] Using HTTPS (production)
- [ ] Credentials in environment variables
- [ ] JWT authentication enabled
- [ ] Input validation on backend
- [ ] Payment reference verification
- [ ] Admin checks implemented
- [ ] Logging enabled
- [ ] Error messages don't leak info

---

## 📞 Support Resources

| Resource | Link |
|----------|------|
| SSLCommerz | https://www.sslcommerz.com |
| Developer | https://developer.sslcommerz.com |
| Dashboard | https://merchant.sslcommerz.com |
| Docs | Read the 7 guide files included |

---

## 🚀 Go-Live Checklist

- [ ] All endpoints tested
- [ ] Test payment flow works
- [ ] Error scenarios handled
- [ ] Email notifications work
- [ ] Admin dashboard displays
- [ ] Donation tracking works
- [ ] Database backups automated
- [ ] Monitoring/logging enabled
- [ ] Applied for live account
- [ ] Updated credentials for production
- [ ] HTTPS certificate installed
- [ ] Final end-to-end test

---

## 💡 Pro Tips

1. **Test thoroughly** before going live
2. **Keep credentials secure** - use env variables
3. **Log all transactions** for reconciliation
4. **Send email receipts** to donors
5. **Monitor payment failures** and contact donors
6. **Process refunds quickly** for trust
7. **Test edge cases** (timeout, network error, etc.)
8. **Update documentation** for your team

---

## 📱 Component Structure

```
DonationForm
├─ Amount input (+ presets)
├─ Donor info section
│  ├─ Name
│  ├─ Email
│  └─ Phone
├─ Payment method selection
│  └─ 6 radio buttons
└─ Submit button
     └─ Calls paymentService.initiatePayment()
     └─ Redirects to SSLCommerz

PaymentSuccess
├─ Success message
├─ Donation details
└─ Navigation buttons

PaymentFailed
├─ Error message
├─ Retry option
└─ Support info
```

---

## 🎯 Key Numbers

| Item | Value |
|------|-------|
| Setup time | 10-15 min |
| API endpoints | 7 |
| Payment methods | 6 |
| Documentation files | 8 |
| Code files | 2 |
| Test cost | $0 |
| Production fee | ~2% |
| Min donation | 10 BDT |

---

## 📋 File Manifest

```
✅ PaymentGatewayService.cs (Backend)
✅ PaymentController.cs (Backend)
✅ DonationForm.tsx (Frontend - sample)
✅ paymentService.ts (Frontend - sample)
✅ PaymentSuccess.tsx (Frontend - sample)
✅ PaymentFailed.tsx (Frontend - sample)

📄 8 Documentation files
📄 1 Setup script
```

---

## 🎓 Learning Path

**5 min** - Read this card
**15 min** - Read PAYMENT_INSTALLATION_GUIDE.md
**30 min** - Implement backend config
**15 min** - Create React components
**10 min** - Test payment flow
**5 min** - Deploy

**Total: ~1.5 hours to have working payment system**

---

**You've got this! 💪**

Need help? See: PAYMENT_GATEWAY_QUICK_REFERENCE.md

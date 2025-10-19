# Free Payment Gateway Integration for Bangladesh - Complete Guide

## Overview
This guide shows you how to integrate **FREE** payment gateway options specifically for Bangladesh into your donation system.

---

## 🎯 Best Free Payment Gateway Options for Bangladesh

### 1. **SSLCommerz** (Recommended for Bangladesh)
- ✅ **Completely FREE** for test/sandbox mode
- ✅ Supports: Bkash, Nagad, Rocket, Card payments
- ✅ Most popular in BD
- ✅ Easy integration
- 📱 Mobile money: Bkash, Nagad, Rocket
- 💳 Cards: Visa, Mastercard
- 🏦 Bank transfers

### 2. **Stripe** (Free Testing)
- ✅ Free test mode (no real charges)
- ✅ Global support including BD
- 💪 Most developer-friendly

### 3. **Payfort by Amazon** (Limited BD Support)
- ✅ Free sandbox testing
- ⚠️ Limited BD support

### 4. **Cash on Delivery / Manual Payment**
- ✅ 100% FREE
- Perfect for NGOs/charities
- Community-based payments

---

## 🚀 IMPLEMENTATION: SSLCommerz (Recommended for Bangladesh)

### Step 1: Get Free SSLCommerz Sandbox Account

1. Visit: https://www.sslcommerz.com
2. Click "Sign Up" → "Merchant Account"
3. Choose: "Test Store/Sandbox"
4. Fill form (use test data):
   - Business: Your Organization
   - Email: your@email.com
   - Phone: 01XXXXXXXXX
5. You'll get:
   - **Store ID** (test)
   - **Store Password** (test)

### Step 2: Install NuGet Package

```powershell
cd backend/DonationManagementSystem.API
dotnet add package SSLCommerz.Lib
# or for HTTP client
dotnet add package RestSharp
```

### Step 3: Create Payment Gateway Service

Create `Services/PaymentGatewayService.cs`:

✅ **DONE** - See PaymentGatewayService.cs for full implementation

### Step 4: Create Payment Controller

Create `Controllers/PaymentController.cs`:

✅ **DONE** - See PaymentController.cs for full implementation

### Step 5: Update Program.cs (Dependency Injection)

Add to `Program.cs`:

```csharp
// In Program.cs, add these lines before app.Build():

// Payment Gateway Services
builder.Services.AddScoped<IPaymentGatewayService, SSLCommerzPaymentService>();

// CORS Configuration (if needed)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSSLCommerz", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});
```

### Step 6: Update appsettings.json

Add payment configuration to `appsettings.json`:

```json
{
  "Payment": {
    "SSLCommerz": {
      "StoreId": "YOUR_TEST_STORE_ID",
      "StorePassword": "YOUR_TEST_STORE_PASSWORD",
      "IsSandbox": true,
      "BaseUrl": "https://sandbox.sslcommerz.com"
    }
  }
}
```

**Get your Test Credentials:**
1. Visit: https://www.sslcommerz.com/register/
2. Select "Test Store"
3. Fill the form with test data
4. You'll receive Store ID and Password via email

---

## 🎨 FRONTEND IMPLEMENTATION

### Step 1: Create Payment Service (Frontend)

Create `frontend/src/services/paymentService.ts`:

```typescript
import api from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  country: string;
  isActive: boolean;
  type: string;
}

export interface InitiatePaymentRequest {
  amount: number;
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  message?: string;
  isAnonymous?: boolean;
  paymentMethod: string;
  campaignId: number;
}

export interface PaymentInitResponse {
  success: boolean;
  gatewayUrl: string;
  transactionId: string;
  donationId: number;
}

class PaymentService {
  // Get available payment methods
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await api.get('/payment/methods');
    return response.methods;
  }

  // Initiate payment
  async initiatePayment(request: InitiatePaymentRequest): Promise<PaymentInitResponse> {
    return api.post('/payment/initiate', request);
  }

  // Check payment status
  async getPaymentStatus(donationId: number) {
    return api.get(`/payment/status/${donationId}`);
  }
}

export default new PaymentService();
```

### Step 2: Create Donation Form Component

Create `frontend/src/components/DonationForm.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import paymentService, { PaymentMethod } from '../services/paymentService';

const DonationForm: React.FC<{ campaignId: number }> = ({ campaignId }) => {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadMethods = async () => {
      try {
        const data = await paymentService.getPaymentMethods();
        setMethods(data);
      } catch (error) {
        console.error('Failed to load payment methods', error);
      }
    };
    loadMethods();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await paymentService.initiatePayment({
        amount: parseFloat(amount),
        donorName,
        donorEmail,
        donorPhone,
        isAnonymous,
        paymentMethod,
        campaignId
      });

      if (response.success) {
        // Redirect to payment gateway
        window.location.href = response.gatewayUrl;
      }
    } catch (error) {
      console.error('Payment initiation failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Make a Donation</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Amount (BDT)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount in Taka"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
          required
          min="10"
        />
      </div>

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm">Donate anonymously</span>
        </label>
      </div>

      {!isAnonymous && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              required={!isAnonymous}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              required={!isAnonymous}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Phone (Optional)</label>
            <input
              type="tel"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              placeholder="01XXXXXXXXX"
            />
          </div>
        </>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Payment Method</label>
        <div className="grid grid-cols-2 gap-3">
          {methods.map((method) => (
            <label key={method.id} className="flex items-center p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="paymentMethod"
                value={method.id}
                checked={paymentMethod === method.id}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm">{method.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? 'Processing...' : 'Donate Now'}
      </button>
    </form>
  );
};

export default DonationForm;
```

### Step 3: Create Payment Success Page

Create `frontend/src/pages/PaymentSuccess.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import paymentService from '../services/paymentService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const donationId = searchParams.get('donation');
    if (donationId) {
      const loadDonation = async () => {
        try {
          const data = await paymentService.getPaymentStatus(parseInt(donationId));
          setDonation(data);
        } catch (error) {
          console.error('Failed to load donation', error);
        } finally {
          setLoading(false);
        }
      };
      loadDonation();
    }
  }, [searchParams]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow text-center">
      <h1 className="text-2xl font-bold text-green-600 mb-4">✓ Payment Successful!</h1>
      {donation && (
        <div className="space-y-3">
          <p><strong>Donation ID:</strong> {donation.donationId}</p>
          <p><strong>Amount:</strong> ৳{donation.amount}</p>
          <p><strong>Campaign:</strong> {donation.campaignTitle}</p>
          <p><strong>Status:</strong> {donation.status}</p>
        </div>
      )}
      <button onClick={() => window.location.href = '/'} className="mt-6 bg-primary-600 text-white px-4 py-2 rounded">
        Return Home
      </button>
    </div>
  );
};

export default PaymentSuccess;
```

---

## 🔑 Configuration Checklist

- [ ] Get SSLCommerz Test Account (https://www.sslcommerz.com/register/)
- [ ] Add Store ID to appsettings.json
- [ ] Add Store Password to appsettings.json
- [ ] Install RestSharp NuGet package
- [ ] Add payment service to Program.cs
- [ ] Create Payment Controller endpoints
- [ ] Create frontend payment service
- [ ] Create donation form component
- [ ] Update campaign pages to include donation button
- [ ] Test in sandbox mode

---

## 🧪 Testing Payment Flow

### Test Card Numbers (SSLCommerz Sandbox):
- **Visa:** 4111111111111111
- **Mastercard:** 5555555555554444
- **Amex:** 378282246310005

### Test Mobile Payments:
- **bKash:** 01611111111 (PIN: 1234)
- **Nagad:** 01611111111 (PIN: 1234)
- **Rocket:** 01611111111 (PIN: 1234)

### Test Amount:
- Use any amount above 10 BDT

---

## 📱 Adding Manual Payment Methods

For organizations that want to accept:
- Cash donations
- Cheque donations
- Bank transfers
- Direct deposits

Add to your form:

```csharp
// In PaymentGatewayService.cs GetAvailablePaymentMethodsAsync()
new PaymentMethod 
{ 
    Id = "manual_cash", 
    Name = "Cash Collection", 
    Description = "Pay cash at our office", 
    Type = "cash"
},
new PaymentMethod 
{ 
    Id = "manual_bank", 
    Name = "Bank Transfer", 
    Description = "Transfer to: [Your Bank Account]", 
    Type = "bank_transfer"
}
```

---

## 🚀 Going Live (Production)

When ready to go live:

1. **Create Production SSLCommerz Account:**
   - Go to https://www.sslcommerz.com
   - Submit your organization details
   - Provide bank account info
   - SSLCommerz will verify and provide live credentials

2. **Update Configuration:**
   ```json
   "IsSandbox": false,
   "StoreId": "YOUR_PRODUCTION_STORE_ID",
   "StorePassword": "YOUR_PRODUCTION_PASSWORD"
   ```

3. **Update Frontend URLs:**
   - Change `localhost:5173` to your production domain

4. **Test End-to-End:**
   - Make small test donations
   - Verify payments complete successfully
   - Check database records

---

## 💡 Alternative: Other Free Payment Solutions

### Stripe Test Mode
```csharp
// Also completely free for testing
// Easy migration to production
// Global coverage
```

### Square (Free Testing)
```csharp
// Square Developer: https://developer.squareup.com
// Free sandbox for testing
// Good for card payments
```

### Manual Fundraising
```csharp
// For NGOs: Accept donations via:
// - Offline collection
// - Bank transfers
// - Post office deposits
```

---

## ✨ Best Practices

1. **Always use HTTPS** - Even in production
2. **Validate amounts** - Min 10 BDT, reasonable max
3. **Store payment references** - For reconciliation
4. **Send confirmations** - Email receipt to donors
5. **Test thoroughly** - Before going live
6. **Log all transactions** - For audit trail
7. **Handle edge cases** - Cancelled, failed, timeout
8. **Secure credentials** - Never commit keys to Git

---

## 📞 Support

- **SSLCommerz Support:** https://www.sslcommerz.com/support/
- **SSLCommerz Docs:** https://developer.sslcommerz.com/
- **Test Credentials Email:** Check spam folder after registration

## 🎉 You're all set!

Your donation system now supports multiple payment methods completely FREE in sandbox mode. Test thoroughly and let your donors help your cause!


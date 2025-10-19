# Frontend Payment Integration Guide

## 🎨 React Components for Payment

### 1. Payment Service (Frontend)

Create: `frontend/src/services/paymentService.ts`

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

interface PaymentInitResponse {
  success: boolean;
  gatewayUrl: string;
  transactionId: string;
  donationId: number;
}

class PaymentService {
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get('/payment/methods');
      return response.methods;
    } catch (error) {
      console.error('Failed to fetch payment methods', error);
      return [];
    }
  }

  async initiatePayment(request: InitiatePaymentRequest): Promise<PaymentInitResponse> {
    try {
      const response = await api.post('/payment/initiate', request);
      return response;
    } catch (error) {
      console.error('Failed to initiate payment', error);
      throw error;
    }
  }

  async getPaymentStatus(donationId: number) {
    try {
      return await api.get(`/payment/status/${donationId}`);
    } catch (error) {
      console.error('Failed to get payment status', error);
      throw error;
    }
  }
}

export default new PaymentService();
```

---

### 2. Donation Form Component

Create: `frontend/src/components/DonationForm.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import paymentService, { PaymentMethod } from '../services/paymentService';

interface DonationFormProps {
  campaignId: number;
  campaignTitle: string;
  onSuccess?: (donationId: number) => void;
  onError?: (error: string) => void;
}

const DonationForm: React.FC<DonationFormProps> = ({
  campaignId,
  campaignTitle,
  onSuccess,
  onError
}) => {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [message, setMessage] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [presets] = useState([100, 500, 1000, 5000]);

  useEffect(() => {
    const loadMethods = async () => {
      try {
        const data = await paymentService.getPaymentMethods();
        setMethods(data.filter(m => m.isActive));
        // Set first available method as default
        if (data.length > 0) {
          setPaymentMethod(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load payment methods', err);
        setError('Could not load payment methods');
        onError?.('Could not load payment methods');
      }
    };
    loadMethods();
  }, [onError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum < 10) {
        throw new Error('Minimum donation is 10 BDT');
      }

      if (!isAnonymous) {
        if (!donorName.trim()) throw new Error('Name is required');
        if (!donorEmail.trim()) throw new Error('Email is required');
      }

      // Initiate payment
      const response = await paymentService.initiatePayment({
        amount: amountNum,
        donorName: isAnonymous ? undefined : donorName,
        donorEmail: isAnonymous ? undefined : donorEmail,
        donorPhone: donorPhone || undefined,
        message: message || undefined,
        isAnonymous,
        paymentMethod,
        campaignId
      });

      if (response.success) {
        // Redirect to payment gateway
        window.location.href = response.gatewayUrl;
        onSuccess?.(response.donationId);
      } else {
        throw new Error('Failed to initiate payment');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Payment initiation failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <BanknotesIcon className="h-8 w-8 text-primary-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Make a Donation</h2>
          <p className="text-sm text-gray-600">{campaignTitle}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Donation Amount (BDT)
          </label>

          {/* Quick preset amounts */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className={`p-2 rounded-lg border-2 transition-colors ${
                  amount === preset.toString()
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
                }`}
              >
                ৳{preset.toLocaleString()}
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Or enter custom amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            required
            min="10"
            step="1"
          />
          <p className="text-xs text-gray-500 mt-1">Minimum: 10 BDT</p>
        </div>

        {/* Anonymous Donation Option */}
        <div>
          <label className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="rounded w-4 h-4"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">
              Donate anonymously
            </span>
          </label>
        </div>

        {/* Donor Information (if not anonymous) */}
        {!isAnonymous && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={donorPhone}
                onChange={(e) => setDonorPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
              />
            </div>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Message (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share why you're donating (public with your name if not anonymous)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-600"
            rows={3}
          />
        </div>

        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-3">
            {methods.map((method) => (
              <label
                key={method.id}
                className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === method.id
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="hidden"
                />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{method.name}</p>
                  <p className="text-xs text-gray-600">{method.description}</p>
                </div>
                {paymentMethod === method.id && (
                  <div className="ml-auto">
                    <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                      <svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              Processing...
            </span>
          ) : (
            `Donate ৳${amount || '0'}`
          )}
        </button>

        {/* Security Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            🔒 Your payment is secure and encrypted. We use SSLCommerz for processing.
          </p>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;
```

---

### 3. Payment Success Page

Create: `frontend/src/pages/PaymentSuccess.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import paymentService from '../services/paymentService';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />

        <h1 className="text-3xl font-bold text-green-600 mb-2">
          Payment Successful!
        </h1>

        <p className="text-gray-600 mb-6">
          Thank you for your generous donation
        </p>

        {donation && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-3">
            <div>
              <p className="text-xs text-gray-600">Donation ID</p>
              <p className="font-medium text-gray-900">#{donation.donationId}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Amount Donated</p>
              <p className="font-medium text-gray-900">
                ৳{donation.amount.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Campaign</p>
              <p className="font-medium text-gray-900">{donation.campaignTitle}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Your Name</p>
              <p className="font-medium text-gray-900">{donation.donorName}</p>
            </div>

            <div>
              <p className="text-xs text-gray-600">Status</p>
              <p className="font-medium text-green-600 capitalize">
                {donation.status}
              </p>
            </div>
          </div>
        )}

        <p className="text-sm text-gray-600 mb-6">
          A receipt has been sent to your email.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>

          <button
            onClick={() => navigate('/campaigns')}
            className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            View Campaigns
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
```

---

### 4. Payment Failed Page

Create: `frontend/src/pages/PaymentFailed.tsx`

```typescript
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

const PaymentFailed: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const donationId = searchParams.get('donation');

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <ExclamationCircleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />

        <h1 className="text-3xl font-bold text-red-600 mb-2">
          Payment Failed
        </h1>

        <p className="text-gray-600 mb-6">
          Unfortunately, your payment could not be processed.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-700">
            Please try again or contact support if the problem persists.
          </p>
          {donationId && (
            <p className="text-xs text-red-600 mt-2">Donation ID: {donationId}</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-900 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Go Home
          </button>

          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
```

---

## 📱 Adding to Campaign Page

In your campaign detail page, add:

```typescript
import DonationForm from '../components/DonationForm';

export const CampaignDetail: React.FC = () => {
  const [campaign, setCampaign] = useState<any>(null);

  return (
    <div className="space-y-8">
      {/* Campaign Details */}
      <div>
        {/* ... campaign info ... */}
      </div>

      {/* Donation Form Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Support This Campaign</h2>
        <DonationForm
          campaignId={campaign?.id || 0}
          campaignTitle={campaign?.title || ''}
          onSuccess={(donationId) => {
            console.log('Donation created:', donationId);
            // Optionally refresh campaign data
          }}
          onError={(error) => {
            console.error('Donation error:', error);
            // Show error toast
          }}
        />
      </div>
    </div>
  );
};
```

---

## 🔧 Router Setup

Add routes in your React Router configuration:

```typescript
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import DonationForm from './components/DonationForm';

function App() {
  return (
    <Router>
      <Routes>
        {/* ... other routes ... */}
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/payment/cancelled" element={<PaymentFailed />} />
        {/* ... other routes ... */}
      </Routes>
    </Router>
  );
}
```

---

## 🎨 Styling Notes

- Uses Tailwind CSS
- Requires `@heroicons/react` for icons
- Responsive design (mobile-friendly)
- Accessible form inputs
- Loading states
- Error handling

Install icons if needed:
```bash
npm install @heroicons/react
```

---

## 📋 Environment Variables

If needed, add to `.env.local`:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_PAYMENT_GATEWAY=sslcommerz
```

---

This gives you a complete, professional payment UI ready to integrate with your campaign pages!

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import physicalDonationService from '../services/physicalDonationService';

export default function ConfirmPhysicalDonation() {
  const navigate = useNavigate();
  const [referenceCode, setReferenceCode] = useState('');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!referenceCode.trim() || !otp.trim()) {
      setError('Both reference code and OTP are required');
      return;
    }

    try {
      setSubmitting(true);
      await physicalDonationService.confirm({
        referenceCode: referenceCode.trim(),
        otp: otp.trim(),
      });
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm donation');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Donation Confirmed!</h2>
          <p className="text-gray-600 mb-4">
            Thank you for confirming your donation. Your contribution has been recorded.
          </p>
          <p className="text-sm text-gray-500">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Donation</h1>
          <p className="text-gray-600">
            Enter the reference code and OTP from your SMS to confirm your physical donation.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
            <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Code
            </label>
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
              className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 font-mono"
              placeholder="PC260118-AB12CD"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Example: PC260118-AB12CD (from your SMS)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              OTP (6 digits)
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 font-mono text-lg tracking-wider"
              placeholder="123456"
              maxLength={6}
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              6-digit code from your SMS
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? 'Confirming...' : 'Confirm Donation'}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Didn't receive SMS? Contact the volunteer who collected your donation.
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { authApiService } from '../services/authApi';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EmailVerificationBanner = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Don't show banner if user is verified or dismissed
  if (!user || user.isEmailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (!user.email) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const response = await authApiService.resendVerification(user.email);
      setMessage(response.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to resend email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address to access all features. Check your inbox for the verification link.
            </p>
            {message && (
              <p className="mt-2 font-medium text-yellow-900">
                {message}
              </p>
            )}
          </div>
          <div className="mt-4">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleResend}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </div>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;

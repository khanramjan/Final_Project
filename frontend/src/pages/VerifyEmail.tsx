import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApiService } from '../services/authApi';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUser } from '../store/slices/authSlice';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'already-verified'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided. Please use the link from your email, or request a new verification email below.');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await authApiService.verifyEmail(token);
      
      // Update user state to reflect verification
      if (isAuthenticated) {
        dispatch(updateUser({ isEmailVerified: true }));
      }
      
      if (response.alreadyVerified) {
        setStatus('already-verified');
        setMessage(response.message);
      } else {
        setStatus('success');
        setMessage(response.message);
      }
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Email verification failed');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button
              onClick={handleGoToLogin}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Go to Login
            </button>
          </div>
        )}

        {status === 'already-verified' && (
          <div className="text-center">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Verified</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-green-800">
                    ✅ Your email is verified! The verification banner should disappear now.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  Go to Dashboard
                </button>
              </div>
            ) : (
              <button
                onClick={handleGoToLogin}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Go to Login
              </button>
            )}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircleIcon className="mx-auto h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-red-600 mb-4">{message}</p>
            
            {!searchParams.get('token') && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">📧 How to verify your email:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Check your email inbox for the verification email</li>
                  <li>Click the "Verify Email Address" button in the email</li>
                  <li>Or click "Request New Verification Link" below if you didn't receive the email</li>
                </ol>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/resend-verification')}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Request New Verification Link
              </button>
              <button
                onClick={handleGoToLogin}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

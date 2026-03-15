import { Link, useSearchParams } from 'react-router-dom';
import { XCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get('tran_id');
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Error Header */}
        <div className="bg-red-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <XCircleIcon className="h-16 w-16 text-red-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Failed</h1>
          <p className="text-red-100 text-lg">Your donation could not be processed</p>
        </div>

        {/* Error Details */}
        <div className="p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-900 mb-3">What happened?</h3>
            <p className="text-red-800 mb-4">
              {error || 'Your payment was not successful. This could be due to insufficient funds, incorrect payment details, or a network issue.'}
            </p>
            {transactionId && (
              <div className="text-sm text-red-700">
                <strong>Transaction ID:</strong> <span className="font-mono">{transactionId}</span>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Common Issues & Solutions:</h4>
            <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
              <li>Check if you have sufficient balance in your account</li>
              <li>Verify your payment details (card number, CVV, expiry date)</li>
              <li>Ensure your internet connection is stable</li>
              <li>Try a different payment method</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>📞 Need Help?</strong> If you continue to experience issues, please contact our support team with your transaction ID.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/campaigns"
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center flex items-center justify-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Try Again
            </Link>
            <Link
              to="/"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              Go to Home
            </Link>
          </div>

          {/* Support Information */}
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">Still want to help?</p>
            <p className="text-sm text-gray-500">
              You can try donating again or choose a different payment method.
              Your support means a lot to us!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;


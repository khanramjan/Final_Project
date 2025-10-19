import { Link } from 'react-router-dom';
import { XCircleIcon, HeartIcon } from '@heroicons/react/24/outline';

const PaymentCancelled = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Cancelled Header */}
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <XCircleIcon className="h-16 w-16 text-gray-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-gray-100 text-lg">You cancelled the donation process</p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">What happened?</h3>
            <p className="text-gray-700 mb-4">
              You chose to cancel the payment process. No charges were made to your account.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-900">
              <strong>💙 Changed your mind?</strong> You can always come back and make a donation anytime. 
              Every contribution, no matter how small, makes a difference!
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-yellow-900 mb-2">Other ways you can help:</h4>
            <ul className="text-sm text-yellow-800 space-y-2 list-disc list-inside">
              <li>Share the campaign with your friends and family</li>
              <li>Follow us on social media for updates</li>
              <li>Volunteer your time and skills</li>
              <li>Spread awareness about the cause</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/campaigns"
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center flex items-center justify-center"
            >
              <HeartIcon className="h-5 w-5 mr-2" />
              Browse Campaigns
            </Link>
            <Link
              to="/"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              Go to Home
            </Link>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">Questions about donating?</p>
            <p className="text-sm text-gray-500">
              Feel free to explore our campaigns and learn more about the impact your donation can make.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;

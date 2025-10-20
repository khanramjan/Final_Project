import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, HeartIcon } from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCampaigns } from '../store/slices/campaignSlice';

interface DonationDetails {
  donationId: number;
  campaignId: number;
  status: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  campaignTitle: string;
  createdAt: string;
  completedAt: string;
}

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [donationDetails, setDonationDetails] = useState<DonationDetails | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Refresh campaigns data after successful payment
    // Add delay to allow backend to process the donation and update RaisedAmount
    const timer = setTimeout(() => {
      console.log('PaymentSuccess: Fetching fresh campaign data...');
      dispatch(fetchCampaigns());
    }, 2000); // Increased to 2 seconds

    return () => clearTimeout(timer);
  }, [dispatch]);

  useEffect(() => {
    const fetchDonationDetails = async () => {
      try {
        // Get donation ID from URL parameters (set by backend redirect)
        const donationId = searchParams.get('donationId');
        
        if (donationId) {
          const response = await fetch(`http://localhost:5000/api/payment/status/${donationId}`);
          const data = await response.json();
          
          if (data.success) {
            setDonationDetails(data);
          } else {
            setError('Failed to fetch donation details');
          }
        } else {
          setError('Invalid payment confirmation');
        }
      } catch (err) {
        console.error('Error fetching donation details:', err);
        setError('Failed to fetch donation details');
      } finally {
        setLoading(false);
      }
    };

    fetchDonationDetails();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-3">
              <CheckCircleIcon className="h-16 w-16 text-green-500" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-green-100 text-lg">Thank you for your generous donation</p>
        </div>

        {/* Donation Details */}
        <div className="p-8">
          {error ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          ) : donationDetails ? (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-gray-900 text-xl">৳{donationDetails.amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Campaign:</span>
                    <span className="font-semibold text-gray-900">{donationDetails.campaignTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold text-gray-900 capitalize">{donationDetails.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-mono text-sm text-gray-900">{donationDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                      {donationDetails.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-primary-900">
                  <strong>📧 Receipt:</strong> A donation receipt has been sent to your email address (if provided).
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900">
                  <strong>🎉 Impact:</strong> Your donation will make a real difference! Thank you for supporting this cause.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Completed</h3>
              <p className="text-gray-600">Your donation has been processed successfully!</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            {donationDetails?.campaignId && (
              <Link
                to={`/campaigns/${donationDetails.campaignId}`}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-semibold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg text-center"
              >
                📊 View Updated Campaign
              </Link>
            )}
            <Link
              to={isAuthenticated ? "/dashboard/campaigns" : "/campaigns"}
              className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center"
            >
              <HeartIcon className="h-5 w-5 inline mr-2" />
              Donate to More Campaigns
            </Link>
            <Link
              to={isAuthenticated ? "/dashboard" : "/"}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              Go to Home
            </Link>
          </div>

          {/* Share Section */}
          <div className="mt-8 text-center border-t pt-6">
            <p className="text-sm text-gray-600 mb-3">Help us reach more supporters!</p>
            <div className="flex justify-center gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                Share on Facebook
              </button>
              <button className="px-4 py-2 bg-blue-400 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
                Share on Twitter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

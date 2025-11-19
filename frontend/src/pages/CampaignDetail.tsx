import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, HeartIcon, ShareIcon, MapPinIcon, CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAppSelector } from '../store/hooks';
import CampaignPoster from '../components/Volunteer/CampaignPoster';

interface Campaign {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  goalAmount: number;
  currentAmount: number;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  location?: string;
  createdBy?: {
    id: number;
    name: string;
  };
}

const CampaignDetail = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);

  useEffect(() => {
    const fetchCampaignDetail = async () => {
      try {
        if (!campaignId) {
          setError('Campaign ID not found');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/campaign/${campaignId}`);
        const data = await response.json();

        if (data.success && data.campaign) {
          setCampaign(data.campaign);
        } else {
          setError('Campaign not found');
        }
      } catch (err) {
        console.error('Error fetching campaign:', err);
        setError('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaignDetail();
  }, [campaignId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <p className="text-gray-600 mb-6">{error || 'Campaign not found'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.title}</h1>
          <button className="flex items-center space-x-2 text-primary-600 hover:text-primary-700">
            <ShareIcon className="h-5 w-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Image & Info */}
          <div className="lg:col-span-2">
            {/* Campaign Image */}
            <div className="rounded-xl overflow-hidden shadow-lg mb-6">
              <img
                src={campaign.imageUrl}
                alt={campaign.title}
                className="w-full h-96 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/800x400?text=Campaign+Image';
                }}
              />
            </div>

            {/* Campaign Description */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About This Campaign</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{campaign.description}</p>
            </div>

            {/* Campaign Details */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <MapPinIcon className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{campaign.location || 'Not specified'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center space-x-3">
                  <CalendarDaysIcon className="h-6 w-6 text-primary-600" />
                  <div>
                    <p className="text-sm text-gray-600">Days Left</p>
                    <p className="font-semibold text-gray-900">{daysLeft} days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Progress & Actions */}
          <div>
            {/* Progress Card */}
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-20">
              <div className="space-y-4">
                {/* Progress Stats */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-gray-600">Campaign Progress</span>
                    <span className="text-2xl font-bold text-primary-600">{progress.toFixed(2)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Amount Raised */}
                <div className="border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Raised:</span>
                      <span className="font-bold text-gray-900">৳{campaign.currentAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal Amount:</span>
                      <span className="font-bold text-gray-900">৳{campaign.goalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-bold text-red-600">৳{Math.max(0, campaign.goalAmount - campaign.currentAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                {campaign.currentAmount >= campaign.goalAmount && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-800">Goal Reached! 🎉</span>
                  </div>
                )}

                {/* Donate Button */}
                <button
                  onClick={() => navigate(`/campaigns?donate=${campaign.id}`)}
                  className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg font-bold hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  <HeartIcon className="h-5 w-5" />
                  <span>Donate to This Campaign</span>
                </button>

                {/* Print Poster Button - Volunteers Only */}
                {isAuthenticated && user?.userType?.toLowerCase() === 'volunteer' && (
                  <button
                    onClick={() => setIsPosterModalOpen(true)}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center space-x-2"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <span>Print Campaign Poster</span>
                  </button>
                )}

                {/* Share Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                    Facebook
                  </button>
                  <button className="py-2 bg-blue-400 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors">
                    Twitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Poster Modal */}
      {isPosterModalOpen && campaign && (
        <CampaignPoster
          campaign={campaign}
          onClose={() => setIsPosterModalOpen(false)}
        />
      )}
    </div>
  );
};

export default CampaignDetail;

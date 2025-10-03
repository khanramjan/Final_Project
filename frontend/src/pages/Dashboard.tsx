import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDonations } from '../store/slices/donationSlice';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import { fetchDonors } from '../store/slices/donorSlice';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import DonationTrendChart from '../components/DonationTrendChart';
import CategoryDistributionChart from '../components/CategoryDistributionChart';
import ImpactInsights from '../components/ImpactInsights';
import DonationHistoryTimeline from '../components/DonationHistoryTimeline';
import RecommendedCampaigns from '../components/RecommendedCampaigns';
import { 
  HeartIcon, 
  TrophyIcon, 
  ChartBarIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline';
import type { RootState } from '../store';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);

  // Mock data - Replace with real API calls
  const userStats = {
    totalDonated: 0,
    totalDonations: 0,
    campaignsSupported: 0,
    averageDonation: 0,
    givingStreak: 0,
    monthsActive: 0,
    peopleImpacted: 0
  };

  const donationTrends = [
    { month: 'Jan', amount: 0, count: 0 },
    { month: 'Feb', amount: 0, count: 0 },
    { month: 'Mar', amount: 0, count: 0 },
    { month: 'Apr', amount: 0, count: 0 },
    { month: 'May', amount: 0, count: 0 },
    { month: 'Jun', amount: 0, count: 0 }
  ];

  const categoryDistribution = [
    { name: 'Education', value: 0, color: '#3b82f6' },
    { name: 'Healthcare', value: 0, color: '#10b981' },
    { name: 'Emergency', value: 0, color: '#ef4444' },
    { name: 'Environment', value: 0, color: '#059669' },
    { name: 'Community', value: 0, color: '#8b5cf6' }
  ];

  const donationHistory: Array<{
    id: number;
    amount: number;
    campaignTitle: string;
    campaignCategory: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    impactMessage?: string;
  }> = [];

  useEffect(() => {
    // TODO: Fetch user's personal donation data from API
    // Example: GET /api/donations/my-donations
    // Example: GET /api/donations/my-stats
    // Example: GET /api/donations/my-trends
    
    dispatch(fetchDonations());
    dispatch(fetchCampaigns());
    dispatch(fetchDonors());
    setLoading(false);
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'Donor'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Track your impact and continue making a difference</p>
      </div>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Donated</p>
              <p className="text-3xl font-bold mt-2">
                ${loading ? '...' : userStats.totalDonated.toLocaleString()}
              </p>
              <p className="text-blue-100 text-xs mt-2">
                {userStats.totalDonations} donations
              </p>
            </div>
            <HeartIcon className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Campaigns Supported</p>
              <p className="text-3xl font-bold mt-2">{userStats.campaignsSupported}</p>
              <p className="text-green-100 text-xs mt-2">
                {userStats.campaignsSupported > 0 ? 'Making a difference' : 'Start supporting'}
              </p>
            </div>
            <TrophyIcon className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Average Donation</p>
              <p className="text-3xl font-bold mt-2">
                ${userStats.averageDonation.toLocaleString()}
              </p>
              <p className="text-purple-100 text-xs mt-2">
                {userStats.givingStreak} month streak
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">People Impacted</p>
              <p className="text-3xl font-bold mt-2">{userStats.peopleImpacted}</p>
              <p className="text-orange-100 text-xs mt-2">
                {userStats.monthsActive} months active
              </p>
            </div>
            <CalendarDaysIcon className="h-12 w-12 text-orange-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonationTrendChart data={donationTrends} />
        <CategoryDistributionChart data={categoryDistribution} />
      </div>

      {/* Impact & History Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImpactInsights
          totalDonated={userStats.totalDonated}
          campaignsSupported={userStats.campaignsSupported}
          donationCount={userStats.totalDonations}
          givingStreak={userStats.givingStreak}
          monthsActive={userStats.monthsActive}
        />
        <DonationHistoryTimeline donations={donationHistory} />
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended For You</h3>
        <RecommendedCampaigns />
      </div>
    </div>
  );
};

export default Dashboard;

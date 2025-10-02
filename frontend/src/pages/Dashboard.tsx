import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDonations } from '../store/slices/donationSlice';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import { fetchDonors } from '../store/slices/donorSlice';
import StatsCard from '../components/StatsCard';
import RecentDonations from '../components/RecentDonations';
import RecommendedCampaigns from '../components/RecommendedCampaigns';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import campaignService from '../services/campaignService';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => (state as any).auth.user);
  const [realStats, setRealStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalDonors: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        // Fetch real campaigns data
        const campaignsData = await campaignService.getAllCampaigns({
          page: 1,
          pageSize: 100
        });
        
        const totalRaised = campaignsData.campaigns.reduce((sum: number, camp: any) => sum + (camp.currentAmount || 0), 0);
        const activeCampaigns = campaignsData.campaigns.filter((c: any) => c.status === 'approved').length;
        
        setRealStats({
          totalCampaigns: campaignsData.totalCount,
          activeCampaigns: activeCampaigns,
          totalRaised: totalRaised,
          totalDonors: 0 // Will be updated when donation API is ready
        });
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
    dispatch(fetchDonations());
    dispatch(fetchCampaigns());
    dispatch(fetchDonors());
  }, [dispatch]);

  const stats = [
    {
      title: 'My Donations',
      value: `$0`,
      change: 'No donations yet',
      trend: 'up' as const,
    },
    {
      title: 'Campaigns Supported',
      value: '0',
      change: 'Start supporting campaigns',
      trend: 'up' as const,
    },
    {
      title: 'Active Campaigns',
      value: loading ? '...' : realStats.activeCampaigns,
      change: 'Available to support',
      trend: 'up' as const,
    },
    {
      title: 'My Impact',
      value: '0',
      change: 'People helped',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your donation management system</p>
      </div>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDonations />
        <RecommendedCampaigns />
      </div>
    </div>
  );
};

export default Dashboard;

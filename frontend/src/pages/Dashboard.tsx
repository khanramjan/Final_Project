import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDonations } from '../store/slices/donationSlice';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import { fetchDonors } from '../store/slices/donorSlice';
import StatsCard from '../components/StatsCard';
import RecentDonations from '../components/RecentDonations';
import CampaignProgress from '../components/CampaignProgress';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const donations = useAppSelector((state) => (state as any).donations);
  const campaigns = useAppSelector((state) => (state as any).campaigns);
  const donors = useAppSelector((state) => (state as any).donors);

  useEffect(() => {
    dispatch(fetchDonations());
    dispatch(fetchCampaigns());
    dispatch(fetchDonors());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Donations',
      value: `$${donations.totalAmount?.toLocaleString() || '0'}`,
      change: '+12.5%',
      trend: 'up' as const,
    },
    {
      title: "Today's Donations",
      value: `$${donations.todaysTotal?.toLocaleString() || '0'}`,
      change: '+8.2%',
      trend: 'up' as const,
    },
    {
      title: 'Active Campaigns',
      value: campaigns.campaigns?.filter((c: any) => c.status === 'active').length || 0,
      change: '+2',
      trend: 'up' as const,
    },
    {
      title: 'Total Donors',
      value: donors.donors?.length || 0,
      change: '+5.1%',
      trend: 'up' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your donation management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentDonations />
        <CampaignProgress />
      </div>
    </div>
  );
};

export default Dashboard;

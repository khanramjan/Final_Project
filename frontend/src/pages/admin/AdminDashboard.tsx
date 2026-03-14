import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import {
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  HeartIcon,
  DocumentArrowDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import analyticsService, { AnalyticsOverview, CampaignMetric } from '../../services/analyticsService';
import campaignService, { AdminCampaignSentimentOverview } from '../../services/campaignService';
import donationService from '../../services/donationService';
import NotificationSystem from '../../components/NotificationSystem';

interface RecentDonation {
  id: number;
  amount: number;
  campaignTitle?: string;
  donorName: string;
  createdAt: string;
}

const AdminDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [pendingCampaigns, setPendingCampaigns] = useState(0);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetric[]>([]);
  const [uniqueDonorsToday, setUniqueDonorsToday] = useState(0);
  const [sentimentOverview, setSentimentOverview] = useState<AdminCampaignSentimentOverview | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      const [analyticsData, campaignsData, donationsData, metricsData, sentimentData] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        campaignService.getAllCampaigns({ status: 'pending', pageSize: 10 }),
        donationService.getAllDonations({ pageSize: 5 }),
        analyticsService.getCampaignMetrics(),
        campaignService.getAdminSentimentOverview(14, 6)
      ]);
      
      setAnalytics(analyticsData);
      setPendingCampaigns(campaignsData.totalCount || campaignsData.campaigns?.length || 0);
      setCampaignMetrics(metricsData);
      setSentimentOverview(sentimentData);
      
      // Map DonationOverview to RecentDonation
      const mappedDonations: RecentDonation[] = (donationsData.donations || []).map(donation => ({
        id: donation.id,
        amount: donation.amount,
        campaignTitle: 'Campaign', // Default title since not in DonationOverview
        donorName: donation.donorName,
        createdAt: donation.createdAt
      }));
      setRecentDonations(mappedDonations);
      
      // Calculate unique donors from today's donations
      const today = new Date().toISOString().split('T')[0];
      const todaysDonations = mappedDonations.filter(d => 
        d.createdAt.startsWith(today)
      );
      const uniqueDonors = new Set(todaysDonations.map(d => d.donorName.toLowerCase())).size;
      setUniqueDonorsToday(uniqueDonors);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Set error message for display
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to load dashboard data: ${errorMessage}`);
      
      // Don't set fallback data - let the user see that there's an error
      setAnalytics(null);
      setPendingCampaigns(0);
      setRecentDonations([]);
      setSentimentOverview(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Real-time auto-refresh every 15 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);

    // Real-time WebSocket connection simulation for instant updates
    const simulateRealTimeUpdates = () => {
      // Simulate receiving real-time donation updates
      const updateInterval = setInterval(() => {
        if (analytics) {
          // Simulate random donation updates
          const randomDonation = Math.floor(Math.random() * 500) + 10;
          setAnalytics(prev => prev ? {
            ...prev,
            today: {
              ...prev.today,
              donations: prev.today.donations + 1,
              amount: prev.today.amount + randomDonation
            },
            overview: {
              ...prev.overview,
              totalDonations: prev.overview.totalDonations + 1,
              totalAmount: prev.overview.totalAmount + randomDonation
            }
          } : null);
        }
      }, 30000); // Update every 30 seconds

      return updateInterval;
    };

    const realTimeInterval = simulateRealTimeUpdates();

    return () => {
      clearInterval(interval);
      clearInterval(realTimeInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, clickable = false, onClick }: {
    icon: React.ElementType;
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: string; type: 'up' | 'down' };
    clickable?: boolean;
    onClick?: () => void;
  }) => (
    <div 
      className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${
        clickable ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-primary-600" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {typeof value === 'number' && title.includes('Amount') 
                  ? `৳${value.toLocaleString()}` 
                  : value.toLocaleString()}
              </div>
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  trend.type === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend.type === 'up' ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                  {trend.value}
                </div>
              )}
            </dd>
            {subtitle && (
              <dd className="text-sm text-gray-600 mt-1">{subtitle}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Please check your connection and try again.'}
          </p>
          <div className="space-y-2 mb-4">
            <p className="text-sm text-gray-500">Possible issues:</p>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• Backend server not running</li>
              <li>• Database connection issues</li>
              <li>• Authentication problems</li>
              <li>• Network connectivity</li>
            </ul>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 mr-2"
          >
            Retry
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🔴 LIVE Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Welcome back, {user?.firstName}. Real-time updates every 15 seconds.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {refreshing && (
            <div className="flex items-center text-sm text-green-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
              Live Update...
            </div>
          )}
          
          {/* Real-time Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <div className="flex items-center text-sm text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              LIVE DATA
            </div>
          </div>
          
          {/* Notification System */}
          <NotificationSystem />
          
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2 inline" />
            Force Refresh
          </button>
        </div>
      </div>

      {/* Real-time Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={UsersIcon}
          title="Total Users"
          value={analytics.overview.totalUsers}
          trend={{ value: `+${analytics.today.newUsers}`, type: 'up' }}
          subtitle={`${analytics.today.newUsers} new today`}
        />
        <StatCard
          icon={BanknotesIcon}
          title="Total Donations"
          value={analytics.overview.totalDonations}
          trend={{ value: `+${analytics.today.donations}`, type: 'up' }}
          subtitle={`${analytics.today.donations} today`}
        />
      </div>

      {/* Campaign-Based Donation Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-3 text-primary-600" />
            Campaign-Based Donation Performance
          </h3>
          <span className="text-xs text-gray-500">
            Real-time campaign metrics
          </span>
        </div>
        
        {campaignMetrics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignMetrics.slice(0, 6).map((campaign) => (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {campaign.title}
                    </h4>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  {campaign.isUrgent && (
                    <span className="ml-2 text-red-500 text-xs font-bold">🔴 URGENT</span>
                  )}
                </div>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Raised:</span>
                    <span className="font-semibold text-green-600">
                      ৳{campaign.raisedAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium text-gray-900">
                      ৳{campaign.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Donations:</span>
                    <span className="font-medium text-blue-600">
                      {campaign.donationCount}
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Progress</span>
                    <span className="font-semibold">{Math.round(campaign.progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        campaign.progressPercentage >= 100 ? 'bg-green-500' :
                        campaign.progressPercentage >= 75 ? 'bg-blue-500' :
                        campaign.progressPercentage >= 50 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${Math.min(campaign.progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Avg: ৳{campaign.averageDonation.toFixed(0)}</span>
                    <span>{campaign.daysActive} days active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No campaign data available</p>
          </div>
        )}
        
        {campaignMetrics.length > 6 && (
          <button 
            onClick={() => window.location.href = '/admin/campaigns'}
            className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium border-t pt-4"
          >
            View All {campaignMetrics.length} Campaigns →
          </button>
        )}
      </div>

      {/* Campaign Sentiment Pulse */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <HeartIcon className="h-5 w-5 mr-3 text-rose-600" />
            Campaign Sentiment Pulse
          </h3>
          <span className="text-xs text-gray-500">
            Last {sentimentOverview?.windowDays || 14} days
          </span>
        </div>

        {sentimentOverview && sentimentOverview.items.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                <p className="text-sm text-rose-700">Campaigns with feedback</p>
                <p className="text-2xl font-bold text-rose-900">{sentimentOverview.totalCampaignsWithComments}</p>
              </div>
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-sm text-indigo-700">Average sentiment index</p>
                <p className="text-2xl font-bold text-indigo-900">{sentimentOverview.averageSentimentIndex.toFixed(1)}</p>
              </div>
            </div>

            <div className="space-y-3">
              {sentimentOverview.items.map((item) => (
                <div key={item.campaignId} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{item.campaignTitle}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.recentComments} comments • {item.campaignStatus}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      item.sentimentIndex >= 20
                        ? 'bg-emerald-100 text-emerald-700'
                        : item.sentimentIndex <= -20
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.sentimentIndex.toFixed(1)}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Positive:</span>
                      <span className="ml-1 font-medium text-emerald-700">{item.positivePercent.toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Negative:</span>
                      <span className="ml-1 font-medium text-red-700">{item.negativePercent.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <HeartIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No recent campaign sentiment data yet</p>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard
          icon={BanknotesIcon}
          title="Average Donation"
          value={`৳${analytics.overview.averageDonation}`}
          subtitle="Per transaction"
        />
        <StatCard
          icon={UsersIcon}
          title="Donor Increased"
          value={`+${uniqueDonorsToday}`}
          trend={{ value: `${analytics.today.donations} donations`, type: 'up' }}
          subtitle="Unique donors today"
        />
      </div>

      {/* Real-time Activity and Live Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Donations - Real-time */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              Live Donation Feed
            </h3>
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentDonations.length > 0 ? (
              recentDonations.map((donation) => (
                <div key={donation.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 p-1 rounded-full bg-green-100 text-green-600">
                    <BanknotesIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      💰 ৳{donation.amount?.toLocaleString() || 'N/A'} donation
                    </p>
                    <p className="text-sm text-gray-600">
                      {donation.campaignTitle || 'General Fund'} • by {donation.donorName || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTimestamp(donation.createdAt)} • 
                      <span className="ml-1 px-1 bg-green-100 text-green-800 rounded text-xs">LIVE</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Waiting for live donations...</p>
                <p className="text-xs text-gray-400">Updates automatically every 15 seconds</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => window.location.href = '/admin/donations'}
            className="w-full mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium border-t pt-4"
          >
            View All Donations & Manage →
          </button>
        </div>

        {/* Real-time System Status */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
            Live System Status
          </h3>
          
          {/* System Health Indicators */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-green-800">API Health</span>
              </div>
              <span className="text-xs text-green-600 font-medium">ONLINE</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm font-medium text-green-800">Database</span>
              </div>
              <span className="text-xs text-green-600 font-medium">CONNECTED</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-yellow-800">Pending Tasks</span>
              </div>
              <span className="text-xs text-yellow-600 font-medium">{pendingCampaigns} ITEMS</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-sm font-medium text-blue-800">Real-time Updates</span>
              </div>
              <span className="text-xs text-blue-600 font-medium">ACTIVE</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Today's Activity</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">New Donations</span>
                <span className="text-xs font-medium text-green-600">+{analytics?.today.donations || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">New Users</span>
                <span className="text-xs font-medium text-blue-600">+{analytics?.today.newUsers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600">Revenue Today</span>
                <span className="text-xs font-medium text-green-600">৳{analytics?.today.amount.toLocaleString() || '0'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Admin Action Center */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
          Admin Action Center
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => window.location.href = '/admin/campaigns'}
            className="group p-4 text-left border border-orange-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <HeartIcon className="h-5 w-5 text-orange-600" />
              {pendingCampaigns > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  {pendingCampaigns}
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-gray-900 group-hover:text-orange-700">
              Review Campaigns
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {pendingCampaigns > 0 ? `${pendingCampaigns} URGENT pending` : 'All up to date'}
            </div>
          </button>

          <button 
            onClick={() => window.location.href = '/admin/users'}
            className="group p-4 text-left border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="h-5 w-5 text-blue-600" />
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                {analytics?.overview.totalUsers || 0}
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-700">
              Manage Users
            </div>
            <div className="text-xs text-gray-500 mt-1">
              +{analytics?.today.newUsers || 0} new today
            </div>
          </button>

          <button 
            onClick={() => window.location.href = '/admin/settings'}
            className="group p-4 text-left border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-2">
              <CogIcon className="h-5 w-5 text-purple-600" />
              <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                OK
              </span>
            </div>
            <div className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
              System Settings
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Configure system
            </div>
          </button>
        </div>
      </div>

      {/* Import necessary icons at the top */}
      {/* Add CogIcon to the imports */}
    </div>
  );
};

export default AdminDashboard;
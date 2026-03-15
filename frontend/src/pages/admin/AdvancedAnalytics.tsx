import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import analyticsService from '../../services/analyticsService';

// Mock Chart Component (replace with actual chart library like Chart.js or Recharts)
const SimpleChart = ({ title, data, type = 'line' }: { title: string; data: any[]; type?: 'line' | 'bar' }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center text-gray-500">
        <ChartBarIcon className="h-12 w-12 mx-auto mb-2" />
        <p className="text-sm">Chart: {title}</p>
        <p className="text-xs mt-1">{data.length} data points • {type} chart</p>
      </div>
    </div>
  </div>
);

const AdvancedAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [campaignPerformance, setCampaignPerformance] = useState<any[]>([]);
  const [donationTrends, setDonationTrends] = useState<any[]>([]);
  const [userInsights, setUserInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  // const [selectedMetric, setSelectedMetric] = useState('donations');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      const [
        dashboardData,
        trendsData,
        campaignData,
        insightsData
      ] = await Promise.all([
        analyticsService.getDashboardAnalytics(),
        analyticsService.getDonationTrends(12),
        analyticsService.getCampaignPerformance(10),
        analyticsService.getUserInsights()
      ]);
      
      setAnalytics(dashboardData);
      setDonationTrends(trendsData);
      setCampaignPerformance(campaignData);
      setUserInsights(insightsData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      
      // Mock data for fallback
      setAnalytics({
        overview: {
          totalUsers: 1247,
          totalCampaigns: 23,
          activeCampaigns: 18,
          totalDonations: 856,
          totalAmount: 125630.50,
          averageDonation: 146.80,
          successRate: 68.5
        },
        today: { donations: 12, amount: 2450.00, newUsers: 5 },
        weekly: { donations: 85, amount: 12750.00 },
        monthly: { donations: 342, amount: 47230.00, growth: 15.2 }
      });
      
      setDonationTrends([
        { month: 'Jan', amount: 45000, count: 120, average: 375 },
        { month: 'Feb', amount: 52000, count: 145, average: 359 },
        { month: 'Mar', amount: 48000, count: 135, average: 356 },
        { month: 'Apr', amount: 61000, count: 180, average: 339 },
        { month: 'May', amount: 58000, count: 165, average: 352 }
      ]);
      
      setCampaignPerformance([
        { id: 1, title: 'শিক্ষা সহায়তা', targetAmount: 50000, raisedAmount: 42000, progressPercentage: 84, donationCount: 120, category: 'শিক্ষা' },
        { id: 2, title: 'স্বাস্থ্য সেবা', targetAmount: 75000, raisedAmount: 68000, progressPercentage: 91, donationCount: 200, category: 'স্বাস্থ্য' }
      ]);
      
      setUserInsights({
        userTypes: [
          { userType: 'donor', count: 850, percentage: 68 },
          { userType: 'volunteer', count: 397, percentage: 32 }
        ],
        newUsersThisMonth: 125,
        topDonors: [
          { id: 1, name: 'রহিম আহমেদ', totalDonated: 25000, donationCount: 8 },
          { id: 2, name: 'ফাতিমা খাতুন', totalDonated: 18000, donationCount: 6 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const blob = await analyticsService.exportAnalytics('overview', 'csv', {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive insights and detailed reporting
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="1y">Last Year</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2 inline" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900">
                ৳{analytics?.overview?.totalAmount?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analytics?.monthly?.growth || 0}%</span>
                <span className="text-sm text-gray-500 ml-1">this month</span>
              </div>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.overview?.totalDonations?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                <ArrowTrendingUpIcon className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">+{analytics?.today?.donations || 0}</span>
                <span className="text-sm text-gray-500 ml-1">today</span>
              </div>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Campaigns</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.overview?.activeCampaigns || '0'}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">
                  {((analytics?.overview?.activeCampaigns / analytics?.overview?.totalCampaigns) * 100).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">of total</span>
              </div>
            </div>
            <ChartBarIcon className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.overview?.successRate || '0'}%
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">
                  ৳{analytics?.overview?.averageDonation?.toLocaleString() || '0'}
                </span>
                <span className="text-sm text-gray-500 ml-1">avg donation</span>
              </div>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleChart 
          title="Donation Trends (Monthly)"
          data={donationTrends}
          type="line"
        />
        <SimpleChart 
          title="Campaign Performance"
          data={campaignPerformance}
          type="bar"
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Campaigns */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Campaigns</h3>
          <div className="space-y-4">
            {campaignPerformance.slice(0, 5).map((campaign, index) => (
              <div key={campaign.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-700">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{campaign.title}</p>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${campaign.progressPercentage}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-500">{campaign.progressPercentage}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ৳{campaign.raisedAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">{campaign.donationCount} donations</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Statistics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Insights</h3>
          <div className="space-y-4">
            {userInsights?.userTypes?.map((userType: any) => (
              <div key={userType.userType} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UsersIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {userType.userType === 'donor' ? 'Donors' : 'Volunteers'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{userType.count}</p>
                  <p className="text-xs text-gray-500">{userType.percentage}%</p>
                </div>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Users (This Month)</span>
                <span className="text-sm font-medium text-green-600">
                  +{userInsights?.newUsersThisMonth || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Donors */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Donors</h3>
          <div className="space-y-4">
            {userInsights?.topDonors?.map((donor: any, index: number) => (
              <div key={donor.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-green-700">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{donor.name}</p>
                  <p className="text-xs text-gray-500">{donor.donationCount} donations</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ৳{donor.totalDonated.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Monthly Trends</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Average
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Growth
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {donationTrends.map((trend, index) => {
                const prevTrend = donationTrends[index - 1];
                const growth = prevTrend 
                  ? ((trend.amount - prevTrend.amount) / prevTrend.amount * 100).toFixed(1)
                  : '0';
                
                return (
                  <tr key={trend.month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trend.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ৳{trend.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trend.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ৳{trend.average.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`flex items-center ${
                        parseFloat(growth) >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {parseFloat(growth) >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                        )}
                        {Math.abs(parseFloat(growth))}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
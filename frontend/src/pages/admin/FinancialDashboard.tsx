import { useState, useEffect } from 'react';
import { 
  BanknotesIcon, 
  ChartBarIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface CampaignBalance {
  id: number;
  title: string;
  status: string;
  targetAmount: number;
  raisedAmount: number;
  donationCount: number;
  createdAt: string;
}

interface ReserveFundEntry {
  id: number;
  amount: number;
  campaignTitle: string;
  donorName: string;
  sourceDescription: string;
  createdAt: string;
}

interface FinancialSummary {
  totalInSystem: number;
  totalInCampaigns: number;
  reserveFund: number;
  activeCampaigns: number;
  completedCampaigns: number;
}

interface CampaignDetails {
  campaign: {
    id: number;
    title: string;
    status: string;
    targetAmount: number;
    raisedAmount: number;
    overflowAmount: number;
    totalReceived: number;
  };
  donations: Array<{
    id: number;
    amount: number;
    donorName: string;
    isAnonymous: boolean;
    createdAt: string;
  }>;
  overflow: {
    total: number;
    entries: Array<{
      id: number;
      amount: number;
      donorName: string;
      sourceDescription: string;
      createdAt: string;
    }>;
  };
}

const FinancialDashboard = () => {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignBalance[]>([]);
  const [reserveEntries, setReserveEntries] = useState<ReserveFundEntry[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'reserve'>('campaigns');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/financial/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      setSummary(data.summary);
      setCampaigns(data.campaigns);
      setReserveEntries(data.reserveFund.recentEntries);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setLoading(false);
    }
  };

  const fetchCampaignDetails = async (campaignId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/financial/campaign/${campaignId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      setSelectedCampaign(data);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching campaign details:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="mt-2 text-gray-600">Track all donations and campaign finances</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-blue-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <BanknotesIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Total in System</p>
            <p className="text-2xl font-bold mt-1">৳{summary?.totalInSystem.toLocaleString()}</p>
          </div>

          <div className="bg-green-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <ChartBarIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Campaign Funds</p>
            <p className="text-2xl font-bold mt-1">৳{summary?.totalInCampaigns.toLocaleString()}</p>
          </div>

          <div className="bg-purple-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Reserve Fund</p>
            <p className="text-2xl font-bold mt-1">৳{summary?.reserveFund.toLocaleString()}</p>
          </div>

          <div className="bg-orange-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Active Campaigns</p>
            <p className="text-2xl font-bold mt-1">{summary?.activeCampaigns}</p>
          </div>

          <div className="bg-teal-600 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
            </div>
            <p className="text-sm font-medium opacity-90">Completed</p>
            <p className="text-2xl font-bold mt-1">{summary?.completedCampaigns}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Campaign Breakdown
              </button>
              <button
                onClick={() => setActiveTab('reserve')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'reserve'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reserve Fund
              </button>
            </div>
          </div>
        </div>

        {/* Campaigns Table */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raised
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donations
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => {
                    const progress = Math.round((campaign.raisedAmount / campaign.targetAmount) * 100);
                    return (
                      <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                          <div className="text-xs text-gray-500 flex items-center mt-1">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {new Date(campaign.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {campaign.status === 'completed' ? (
                              <CheckCircleIcon className="h-3 w-3 mr-1" />
                            ) : (
                              <ClockIcon className="h-3 w-3 mr-1" />
                            )}
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          ৳{campaign.targetAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
                          ৳{campaign.raisedAmount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${progress >= 100 ? 'bg-green-600' : 'bg-blue-600'}`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              ></div>
                            </div>
                            <span className={`text-sm font-medium ${progress >= 100 ? 'text-green-600' : 'text-blue-600'}`}>
                              {progress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                          {campaign.donationCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => fetchCampaignDetails(campaign.id)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reserve Fund Table */}
        {activeTab === 'reserve' && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reserve Fund Entries</h3>
                  <p className="text-sm text-gray-500 mt-1">Overflow donations from completed campaigns</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Reserve</p>
                  <p className="text-2xl font-bold text-purple-600">৳{summary?.reserveFund.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reserveEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.campaignTitle}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {entry.donorName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {entry.sourceDescription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-purple-600">
                        ৳{entry.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Campaign Details Modal */}
      {showModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 px-6 py-4 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{selectedCampaign.campaign.title}</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-xs text-blue-600 font-medium">Target Amount</p>
                  <p className="text-xl font-bold text-blue-900">৳{selectedCampaign.campaign.targetAmount.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-xs text-green-600 font-medium">Campaign Fund</p>
                  <p className="text-xl font-bold text-green-900">৳{selectedCampaign.campaign.raisedAmount.toLocaleString()}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-xs text-purple-600 font-medium">Overflow</p>
                  <p className="text-xl font-bold text-purple-900">৳{selectedCampaign.campaign.overflowAmount.toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-xs text-orange-600 font-medium">Total Received</p>
                  <p className="text-xl font-bold text-orange-900">৳{selectedCampaign.campaign.totalReceived.toLocaleString()}</p>
                </div>
              </div>

              {/* Donations List */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">All Donations</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedCampaign.donations.map((donation) => (
                        <tr key={donation.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {donation.isAnonymous ? '🎭 Anonymous' : donation.donorName}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            ৳{donation.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overflow Entries */}
              {selectedCampaign.overflow.total > 0 && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Overflow to Reserve Fund</h4>
                  <div className="border border-purple-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-purple-200">
                      <thead className="bg-purple-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase">Donor</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-700 uppercase">Description</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-purple-700 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-purple-100">
                        {selectedCampaign.overflow.entries.map((entry) => (
                          <tr key={entry.id}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{entry.donorName}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{entry.sourceDescription}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-purple-600 text-right">
                              ৳{entry.amount.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialDashboard;



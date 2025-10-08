import { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  HeartIcon,
  TrophyIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface Donation {
  id: number;
  amount: number;
  campaignTitle: string;
  campaignCategory: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  transactionId: string;
  impactMessage?: string;
}

const Donations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');

  // Mock data - Replace with API call
  useEffect(() => {
    // TODO: Fetch from API - GET /api/donations/my-donations
    const mockDonations: Donation[] = [
      // Empty for now - user hasn't made donations yet
    ];
    
    setDonations(mockDonations);
    setLoading(false);
  }, []);

  // Calculate statistics
  const stats = {
    total: donations.length,
    totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
    completed: donations.filter(d => d.status === 'completed').length,
    pending: donations.filter(d => d.status === 'pending').length,
    failed: donations.filter(d => d.status === 'failed').length,
    averageAmount: donations.length > 0 
      ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length 
      : 0
  };

  // Filter donations
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = donation.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         donation.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;
    
    // Date filtering logic
    let matchesDate = true;
    if (dateRange !== 'all') {
      const donationDate = new Date(donation.date);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          matchesDate = donationDate.toDateString() === now.toDateString();
          break;
        case 'week': {
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          matchesDate = donationDate >= weekAgo;
          break;
        }
        case 'month': {
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          matchesDate = donationDate >= monthAgo;
          break;
        }
        case 'year': {
          const yearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
          matchesDate = donationDate >= yearAgo;
          break;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Education': 'bg-blue-100 text-blue-700 border-blue-200',
      'Healthcare': 'bg-green-100 text-green-700 border-green-200',
      'Emergency': 'bg-red-100 text-red-700 border-red-200',
      'Environment': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Community': 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Exporting donations...');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Donations</h1>
          <p className="text-gray-600 mt-1">Track and manage your contribution history</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Export
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Donated</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                ৳{stats.totalAmount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stats.total} donations</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <HeartIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{stats.completed}</p>
              <p className="text-xs text-gray-500 mt-1">Successful donations</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Amount</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                ৳{stats.averageAmount.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per donation</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Campaigns</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">
                {new Set(donations.map(d => d.campaignTitle)).size}
              </p>
              <p className="text-xs text-gray-500 mt-1">Supported</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrophyIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by campaign or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FunnelIcon className="inline h-4 w-4 mr-1" />
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CalendarDaysIcon className="inline h-4 w-4 mr-1" />
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations List/Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {donations.length === 0 ? 'No donations yet' : 'No donations found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {donations.length === 0 
                ? 'Start making a difference by supporting campaigns that matter to you.'
                : 'Try adjusting your filters to see more results.'}
            </p>
            {donations.length === 0 && (
              <a
                href="/dashboard/campaigns"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Campaigns
              </a>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {donation.campaignTitle}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border mt-1 w-fit ${getCategoryColor(donation.campaignCategory)}`}>
                          {donation.campaignCategory}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ৳{donation.amount.toLocaleString()}
                      </span>
                      <br />
                      <span className="text-xs text-gray-500">{donation.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(donation.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(donation.status)}
                        {getStatusBadge(donation.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-500">
                        {donation.transactionId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {filteredDonations.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-3">
          <p className="text-sm text-gray-600">
            Showing <span className="font-medium text-gray-900">{filteredDonations.length}</span> of{' '}
            <span className="font-medium text-gray-900">{donations.length}</span> donations
            {(searchTerm || statusFilter !== 'all' || dateRange !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setDateRange('all');
                }}
                className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default Donations;

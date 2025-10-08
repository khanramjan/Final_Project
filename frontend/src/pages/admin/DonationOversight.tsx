import { useState, useEffect } from 'react';
import {
  EyeIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import donationService, { DonationOverview, DonationFilters } from '../../services/donationService';

const DonationOversight = () => {
  const [donations, setDonations] = useState<DonationOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DonationFilters>({
    page: 1,
    pageSize: 20,
    status: 'all'
  });
  const [totalDonations, setTotalDonations] = useState(0);
  const [selectedDonations, setSelectedDonations] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDonations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const response = await donationService.getAllDonations(filters);
      setDonations(response.donations);
      setTotalDonations(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      setRefreshing(true);
      await fetchDonations();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefund = async (donationId: number, reason: string = 'Administrative refund') => {
    try {
      setActionLoading(donationId);
      await donationService.refundDonation(donationId, { reason });
      await fetchDonations();
    } catch (error) {
      console.error('Failed to refund donation:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const exportDonations = async () => {
    try {
      // Create CSV export
      const csvContent = [
        'ID,Donor,Amount,Status,Payment Method,Campaign,Date,Message',
        ...donations.map(d => [
          d.id,
          `"${d.donorName}"`,
          d.amount,
          d.status,
          'Card', // Default since payment method not in interface
          'Campaign', // Default since campaign not in interface
          new Date(d.createdAt).toLocaleDateString(),
          `"${d.message || ''}"`
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donations-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export donations:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'pending': return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'refunded': return <ArrowPathIcon className="h-4 w-4 text-gray-500" />;
      default: return <BanknotesIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalPages = Math.ceil(totalDonations / (filters.pageSize || 20));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Donation Oversight</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage all donations in real-time
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {refreshing && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              Refreshing...
            </div>
          )}
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2 inline" />
            Refresh
          </button>
          <button
            onClick={exportDonations}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2 inline" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                ৳{donations.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Donations</p>
              <p className="text-2xl font-semibold text-gray-900">{totalDonations.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {donations.filter(d => d.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {donations.filter(d => d.status === 'failed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              placeholder="Search donor name..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, pageSize: 20, status: 'all' })}
              className="w-full bg-gray-100 text-gray-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-200"
            >
              <FunnelIcon className="h-4 w-4 mr-2 inline" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={donations.length > 0 && selectedDonations.length === donations.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedDonations(donations.map(d => d.id));
                      } else {
                        setSelectedDonations([]);
                      }
                    }}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No donations found
                  </td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedDonations.includes(donation.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDonations([...selectedDonations, donation.id]);
                          } else {
                            setSelectedDonations(selectedDonations.filter(id => id !== donation.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {donation.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        ৳{donation.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(donation.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(donation.status)}`}>
                          {donation.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      <div>
                        {new Date(donation.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-xs">
                        {new Date(donation.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {donation.message || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          title="View Details"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        {donation.status === 'completed' && (
                          <button
                            onClick={() => handleRefund(donation.id)}
                            disabled={actionLoading === donation.id}
                            title="Refund"
                            className="text-red-400 hover:text-red-600 disabled:opacity-50"
                          >
                            <ArrowPathIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((filters.page || 1) - 1) * (filters.pageSize || 20) + 1} to{' '}
                {Math.min((filters.page || 1) * (filters.pageSize || 20), totalDonations)} of{' '}
                {totalDonations} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {filters.page} of {totalPages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={filters.page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonationOversight;
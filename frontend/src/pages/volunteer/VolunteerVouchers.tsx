import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PlusIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TagIcon,
  DocumentArrowUpIcon,
} from '@heroicons/react/24/outline';
import voucherService, { VoucherResponseDto } from '../../services/voucherService';

export default function VolunteerVouchers() {
  const [vouchers, setVouchers] = useState<VoucherResponseDto[]>([]);
  const [requests, setRequests] = useState<VoucherResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'vouchers' | 'requests'>('vouchers');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [vouchersData, requestsData] = await Promise.all([
        voucherService.getMyVouchers().catch(err => {
          console.error('Error fetching vouchers:', err);
          return [];
        }),
        voucherService.getMyVoucherRequests().catch(err => {
          console.error('Error fetching requests:', err);
          return [];
        }),
      ]);
      setVouchers(vouchersData);
      setRequests(requestsData);
    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ElementType; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Rejected' },
      requested: { color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon, text: 'Requested by Admin' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Vouchers</h1>
          <p className="mt-1 text-sm text-gray-600">
            Submit and track expense vouchers for your volunteer work
          </p>
        </div>
        <Link
          to="/volunteer/vouchers/submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Submit Voucher
        </Link>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('vouchers')}
            className={`${
              activeTab === 'vouchers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Vouchers ({vouchers?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`${
              activeTab === 'requests'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Admin Requests ({requests?.length || 0})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'vouchers' ? (
        <div>
          {!vouchers || vouchers.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No vouchers</h3>
              <p className="mt-1 text-sm text-gray-500">
                You haven't submitted any vouchers yet.
              </p>
              <div className="mt-6">
                <Link
                  to="/volunteer/vouchers/submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Submit Your First Voucher
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {voucher.campaignTitle}
                      </h3>
                      {getStatusBadge(voucher.status)}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(voucher.amount)}
                        </span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <TagIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {voucher.category}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-400" />
                        {formatDate(voucher.expenseDate)}
                      </div>

                      {voucher.receiptFileName && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DocumentArrowUpIcon className="h-5 w-5 mr-2 text-gray-400" />
                          Receipt attached
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {voucher.description}
                    </p>

                    {voucher.adminFeedback && (
                      <div
                        className={`p-3 rounded-md text-sm mb-4 ${
                          voucher.status === 'approved'
                            ? 'bg-green-50 text-green-800'
                            : 'bg-red-50 text-red-800'
                        }`}
                      >
                        <p className="font-medium">Admin Feedback:</p>
                        <p className="mt-1">{voucher.adminFeedback}</p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <span className="text-xs text-gray-500">
                        Submitted {formatDate(voucher.createdAt)}
                      </span>
                      <Link
                        to={`/volunteer/vouchers/${voucher.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {!requests || requests.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                No admin has requested a voucher from you.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {request.campaignTitle}
                      </h3>
                      {getStatusBadge(request.status)}
                    </div>

                    {request.requestNote && (
                      <div className="bg-blue-100 p-3 rounded-md mb-4">
                        <p className="text-sm font-medium text-blue-900">Admin's Note:</p>
                        <p className="text-sm text-blue-800 mt-1">{request.requestNote}</p>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <CalendarDaysIcon className="h-5 w-5 mr-2 text-gray-400" />
                      Requested {formatDate(request.requestedAt || request.createdAt)}
                    </div>

                    <Link
                      to={`/volunteer/vouchers/submit?requestId=${request.id}&campaignId=${request.campaignId}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Voucher
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import voucherService, { VoucherResponseDto, ReviewVoucherDto } from '../../services/voucherService';

export default function VoucherManagement() {
  const [vouchers, setVouchers] = useState<VoucherResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherResponseDto | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [adminFeedback, setAdminFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  // Request voucher form
  const [volunteers] = useState<never[]>([]);
  const [requestForm, setRequestForm] = useState({
    campaignId: 0,
    volunteerId: 0,
    requestNote: '',
  });

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await voucherService.getAllVouchers(
        statusFilter === 'all' ? undefined : statusFilter
      );
      setVouchers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vouchers');
      console.error('Error fetching vouchers:', err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const fetchVolunteers = async () => {
    try {
      // Disabled for now - no getAllVolunteers method
      // const data = await volunteerService.getAllVolunteers();
      // setVolunteers(data);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
    }
  };

  const fetchCampaigns = async () => {
    try {
      // Disabled for now
      // For now, we'll use a placeholder
      // const data = await campaignService.getAllCampaigns();
      // setCampaigns(data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const handleReviewVoucher = (voucher: VoucherResponseDto, action: 'approve' | 'reject') => {
    setSelectedVoucher(voucher);
    setReviewAction(action);
    setAdminFeedback('');
    setShowReviewModal(true);
  };

  const confirmReview = async () => {
    if (!selectedVoucher) return;

    try {
      setProcessing(true);
      const reviewData: ReviewVoucherDto = {
        action: reviewAction,
        adminFeedback: adminFeedback || undefined,
      };

      await voucherService.reviewVoucher(selectedVoucher.id, reviewData);
      setShowReviewModal(false);
      setSelectedVoucher(null);
      setAdminFeedback('');
      await fetchVouchers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to review voucher');
      console.error('Error reviewing voucher:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestVoucher = async () => {
    try {
      setProcessing(true);
      setError(null);

      if (!requestForm.campaignId || !requestForm.volunteerId) {
        setError('Please select both campaign and volunteer');
        setProcessing(false);
        return;
      }

      await voucherService.requestVoucher(requestForm);
      setShowRequestModal(false);
      setRequestForm({ campaignId: 0, volunteerId: 0, requestNote: '' });
      await fetchVouchers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request voucher');
      console.error('Error requesting voucher:', err);
    } finally {
      setProcessing(false);
    }
  };

  const filteredVouchers = vouchers.filter(
    (v) =>
      v.campaignTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ElementType; text: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon, text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircleIcon, text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircleIcon, text: 'Rejected' },
      requested: { color: 'bg-blue-100 text-blue-800', icon: DocumentTextIcon, text: 'Requested' },
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

  const totalExpenditure = filteredVouchers
    .filter((v) => v.status === 'approved')
    .reduce((sum, v) => sum + v.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Voucher Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review and approve expense vouchers from volunteers
          </p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Request Voucher
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.filter((v) => v.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.filter((v) => v.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-8 w-8 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">
                {vouchers.filter((v) => v.status === 'rejected').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Approved</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalExpenditure)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search vouchers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="requested">Requested</option>
            </select>
          </div>
        </div>
      </div>

      {/* Voucher List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No vouchers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            No vouchers match your current filters.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Volunteer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredVouchers.map((voucher) => (
                <tr key={voucher.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {voucher.volunteerName}
                        </div>
                        <div className="text-sm text-gray-500">{voucher.volunteerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{voucher.campaignTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(voucher.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{voucher.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(voucher.expenseDate)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(voucher.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {voucher.status === 'pending' ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReviewVoucher(voucher, 'approve')}
                          className="text-green-600 hover:text-green-900"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReviewVoucher(voucher, 'reject')}
                          className="text-red-600 hover:text-red-900"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedVoucher(voucher)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedVoucher && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {reviewAction === 'approve' ? 'Approve' : 'Reject'} Voucher
            </h3>

            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Volunteer:</strong> {selectedVoucher.volunteerName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Campaign:</strong> {selectedVoucher.campaignTitle}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Amount:</strong> {formatCurrency(selectedVoucher.amount)}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Description:</strong> {selectedVoucher.description}
              </p>
            </div>

            {/* Line Items */}
            {selectedVoucher.items && selectedVoucher.items.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Expense Items</h4>
                <div className="border border-gray-200 rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Item</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Total</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedVoucher.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.itemName}
                            {item.notes && (
                              <div className="text-xs text-gray-500">{item.notes}</div>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{formatCurrency(item.price)}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {formatDate(item.purchaseDate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Receipt Image */}
            {selectedVoucher.receiptPath && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Receipt Image</h4>
                <div className="border border-gray-200 rounded-md p-2">
                  <img
                    src={`http://localhost:5000${selectedVoucher.receiptPath}`}
                    alt="Receipt"
                    className="max-w-full h-auto rounded"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <a
                    href={`http://localhost:5000${selectedVoucher.receiptPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 mt-2 inline-block"
                  >
                    Open in new tab
                  </a>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback {reviewAction === 'reject' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                rows={3}
                value={adminFeedback}
                onChange={(e) => setAdminFeedback(e.target.value)}
                placeholder={
                  reviewAction === 'approve'
                    ? 'Optional feedback for the volunteer'
                    : 'Please provide a reason for rejection'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmReview}
                disabled={processing || (reviewAction === 'reject' && !adminFeedback.trim())}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  reviewAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:bg-gray-400 disabled:cursor-not-allowed`}
              >
                {processing ? 'Processing...' : reviewAction === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Voucher Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Request Voucher from Volunteer</h3>

            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign <span className="text-red-500">*</span>
                </label>
                <select
                  value={requestForm.campaignId}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, campaignId: parseInt(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="0">Select a campaign</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volunteer <span className="text-red-500">*</span>
                </label>
                <select
                  value={requestForm.volunteerId}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, volunteerId: parseInt(e.target.value) }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="0">Select a volunteer</option>
                  {volunteers.map((volunteer) => (
                    <option key={volunteer.userId} value={volunteer.userId}>
                      {volunteer.user.firstName} {volunteer.user.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={requestForm.requestNote}
                  onChange={(e) =>
                    setRequestForm((prev) => ({ ...prev, requestNote: e.target.value }))
                  }
                  placeholder="Explain why you're requesting this voucher..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRequestModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestVoucher}
                disabled={processing}
                className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {processing ? 'Requesting...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

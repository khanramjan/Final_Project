import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

type WithdrawalStatus = 'pending' | 'approved' | 'completed' | 'rejected' | 'cancelled';

interface Campaign {
  id: number;
  title: string;
  raisedAmount: number;
  withdrawn: number;
  pending?: number;
  approved?: number;
  available: number;
}

interface Withdrawal {
  id: number;
  amount: number;
  campaignId: number;
  campaignTitle: string;
  purpose: string;
  recipientName: string | null;
  recipientPhone: string | null;
  recipientAddress: string | null;
  notes: string | null;
  status: WithdrawalStatus;
  referenceNumber: string;
  withdrawnAt: string;
  withdrawnBy: number;
  withdrawnByName: string;
  approvedBy: number | null;
  approvedByName: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  cancelledBy: number | null;
  cancelledByName: string | null;
  cancelledAt: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface WithdrawalTotals {
  completedWithdrawn: number;
  pendingAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  cancelledAmount: number;
}

interface ApiError {
  message?: string;
}

interface Notice {
  type: 'success' | 'error' | 'info';
  message: string;
}

const initialForm = {
  campaignId: '',
  amount: '',
  purpose: '',
  recipientName: '',
  recipientPhone: '',
  recipientAddress: '',
  notes: '',
};

const statusOptions: Array<{ value: 'all' | WithdrawalStatus; label: string }> = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const SINGLE_WITHDRAWAL_LIMIT = 500000;

const WithdrawalManagement = () => {
  const dispatch = useAppDispatch();
  const currentUserId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [totals, setTotals] = useState<WithdrawalTotals>({
    completedWithdrawn: 0,
    pendingAmount: 0,
    approvedAmount: 0,
    rejectedAmount: 0,
    cancelledAmount: 0,
  });
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | WithdrawalStatus>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState<Withdrawal | null>(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    void Promise.all([fetchDashboardData(), fetchWithdrawals()]);
  }, []);

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === Number.parseInt(formData.campaignId, 10)),
    [campaigns, formData.campaignId],
  );

  const amountError = useMemo(() => {
    if (!formData.amount.trim()) {
      return 'Amount is required';
    }

    if (!/^\d+(\.\d{1,2})?$/.test(formData.amount.trim())) {
      return 'Amount must be a number with up to 2 decimal places';
    }

    const numericAmount = Number.parseFloat(formData.amount);
    if (Number.isNaN(numericAmount)) {
      return 'Amount is invalid';
    }

    if (numericAmount < 10) {
      return 'Minimum withdrawal amount is ৳10';
    }

    if (numericAmount > SINGLE_WITHDRAWAL_LIMIT) {
      return `Single withdrawal limit is ৳${SINGLE_WITHDRAWAL_LIMIT.toLocaleString()}`;
    }

    if (selectedCampaign && numericAmount > selectedCampaign.available) {
      return `Amount exceeds available balance (৳${selectedCampaign.available.toLocaleString()})`;
    }

    return '';
  }, [formData.amount, selectedCampaign]);

  const canPreview = Boolean(
    formData.campaignId &&
      formData.purpose.trim().length >= 3 &&
      !amountError,
  );

  const showNotice = (type: Notice['type'], message: string) => {
    setNotice({ type, message });
  };

  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  });

  const fetchDashboardData = async () => {
    let lastError: string | null = null;

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await fetch('/api/financial/dashboard', {
          headers: getAuthHeaders(),
        });

        const payload = (await response.json().catch(() => ({}))) as ApiError & { campaigns?: Campaign[] };

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            dispatch(logout());
            showNotice('error', 'Your admin session expired. Please log in again.');
            return;
          }

          lastError = payload.message || `Failed to fetch campaign balances (HTTP ${response.status})`;
          throw new Error(lastError);
        }

        setCampaigns(payload.campaigns || []);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unable to load campaign balances.';

        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 700));
          continue;
        }
      }
    }

    console.error('Error fetching campaigns:', lastError);
    showNotice('error', lastError || 'Unable to load campaign balances.');
  };

  const fetchWithdrawals = async (campaignId = selectedCampaignId, status = statusFilter) => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams();
      if (campaignId) {
        params.append('campaignId', campaignId.toString());
      }
      if (status !== 'all') {
        params.append('status', status);
      }

      const query = params.toString();
      const endpoint = query
        ? `/api/financial/withdrawals?${query}`
        : '/api/financial/withdrawals';

      const response = await fetch(endpoint, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch withdrawals');
      }

      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
      setTotals(data.totals || {
        completedWithdrawn: 0,
        pendingAmount: 0,
        approvedAmount: 0,
        rejectedAmount: 0,
        cancelledAmount: 0,
      });
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      showNotice('error', 'Unable to load withdrawal records.');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchDashboardData(), fetchWithdrawals(selectedCampaignId, statusFilter)]);
  };

  const getStatusClasses = (status: WithdrawalStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (value: number) => `৳${value.toLocaleString()}`;

  const closeCreateFlow = () => {
    setShowFormModal(false);
    setShowConfirmModal(false);
    setConfirmChecked(false);
    setFormData(initialForm);
  };

  const handleFormPreview = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canPreview) {
      showNotice('error', amountError || 'Please complete all required fields.');
      return;
    }

    setConfirmChecked(false);
    setShowConfirmModal(true);
  };

  const handleCreateWithdrawal = async () => {
    if (!canPreview || !confirmChecked) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/financial/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...formData,
          campaignId: Number.parseInt(formData.campaignId, 10),
          amount: Number.parseFloat(formData.amount),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorPayload = payload as ApiError;
        throw new Error(errorPayload.message || 'Failed to submit withdrawal request');
      }

      showNotice(
        'success',
        `Withdrawal submitted in pending state. Reference: ${payload.referenceNumber || 'N/A'}`,
      );

      closeCreateFlow();
      await refreshAll();
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      showNotice('error', error instanceof Error ? error.message : 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveOrComplete = async (withdrawal: Withdrawal) => {
    if (currentUserId !== null && withdrawal.withdrawnBy === currentUserId) {
      showNotice('error', 'Maker-checker policy: you cannot approve or complete your own withdrawal request.');
      return;
    }

    setActionLoadingId(withdrawal.id);
    try {
      const response = await fetch(`/api/financial/withdrawals/${withdrawal.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          reason:
            withdrawal.status === 'pending'
              ? 'Approved by admin from withdrawal management interface'
              : 'Marked as completed from withdrawal management interface',
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorPayload = payload as ApiError;
        throw new Error(errorPayload.message || 'Failed to update withdrawal status');
      }

      showNotice('success', payload.message || 'Withdrawal status updated.');
      await refreshAll();
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      showNotice('error', error instanceof Error ? error.message : 'Failed to update withdrawal status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (withdrawal: Withdrawal) => {
    setActionLoadingId(withdrawal.id);
    try {
      const response = await fetch(`/api/financial/withdrawals/${withdrawal.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ reason: 'Cancelled by admin from withdrawal management interface' }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorPayload = payload as ApiError;
        throw new Error(errorPayload.message || 'Failed to cancel withdrawal');
      }

      showNotice('success', payload.message || 'Withdrawal cancelled.');
      await refreshAll();
    } catch (error) {
      console.error('Error cancelling withdrawal:', error);
      showNotice('error', error instanceof Error ? error.message : 'Failed to cancel withdrawal');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (withdrawal: Withdrawal) => {
    if (currentUserId !== null && withdrawal.withdrawnBy === currentUserId) {
      showNotice('error', 'Maker-checker policy: you cannot reject your own withdrawal request.');
      return;
    }

    setRejectTarget(withdrawal);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectTarget || rejectReason.trim().length < 5) {
      showNotice('error', 'Rejection reason must be at least 5 characters.');
      return;
    }

    setActionLoadingId(rejectTarget.id);
    try {
      const response = await fetch(`/api/financial/withdrawals/${rejectTarget.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorPayload = payload as ApiError;
        throw new Error(errorPayload.message || 'Failed to reject withdrawal');
      }

      showNotice('success', payload.message || 'Withdrawal rejected.');
      setShowRejectModal(false);
      setRejectTarget(null);
      setRejectReason('');
      await refreshAll();
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      showNotice('error', error instanceof Error ? error.message : 'Failed to reject withdrawal');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Management</h1>
          <p className="text-gray-600">Secure withdrawal lifecycle with approval, completion, and audit visibility.</p>
        </div>
        <button
          onClick={() => setShowFormModal(true)}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Withdrawal Request
        </button>
      </div>

      {notice && (
        <div
          className={`rounded-lg border px-4 py-3 flex items-start justify-between gap-3 ${
            notice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : notice.type === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-blue-200 bg-blue-50 text-blue-800'
          }`}
        >
          <div className="flex items-start gap-2">
            {notice.type === 'success' ? <CheckCircleIcon className="h-5 w-5 mt-0.5" /> : <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />}
            <p className="text-sm font-medium">{notice.message}</p>
          </div>
          <button onClick={() => setNotice(null)} className="text-sm font-semibold hover:opacity-70">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Completed</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">{formatCurrency(totals.completedWithdrawn)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Pending</p>
          <p className="text-xl font-bold text-amber-700 mt-1">{formatCurrency(totals.pendingAmount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Approved</p>
          <p className="text-xl font-bold text-blue-700 mt-1">{formatCurrency(totals.approvedAmount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Rejected</p>
          <p className="text-xl font-bold text-rose-700 mt-1">{formatCurrency(totals.rejectedAmount)}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Cancelled</p>
          <p className="text-xl font-bold text-slate-700 mt-1">{formatCurrency(totals.cancelledAmount)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 truncate">{campaign.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Raised</span>
                <span className="font-semibold text-green-700">{formatCurrency(campaign.raisedAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Completed Withdrawn</span>
                <span className="font-semibold text-red-600">{formatCurrency(campaign.withdrawn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending + Approved</span>
                <span className="font-semibold text-amber-600">
                  {formatCurrency((campaign.pending || 0) + (campaign.approved || 0))}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Available</span>
                <span className="font-bold text-blue-700">{formatCurrency(campaign.available)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={selectedCampaignId ?? ''}
            onChange={(event) => {
              const nextCampaign = event.target.value ? Number.parseInt(event.target.value, 10) : null;
              setSelectedCampaignId(nextCampaign);
              void fetchWithdrawals(nextCampaign, statusFilter);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Campaigns</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>{campaign.title}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => {
              const nextStatus = event.target.value as 'all' | WithdrawalStatus;
              setStatusFilter(nextStatus);
              void fetchWithdrawals(selectedCampaignId, nextStatus);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => void refreshAll()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">Loading withdrawals...</td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No withdrawals found for the selected filters.</td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => {
                  const isOwnRequest = currentUserId !== null && withdrawal.withdrawnBy === currentUserId;

                  return (
                  <Fragment key={withdrawal.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-semibold text-blue-700">{withdrawal.referenceNumber}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{new Date(withdrawal.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{withdrawal.campaignTitle}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatCurrency(withdrawal.amount)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${getStatusClasses(withdrawal.status)}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{withdrawal.withdrawnByName}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                          {withdrawal.status === 'pending' && (
                            <>
                              {!isOwnRequest && (
                                <>
                                  <button
                                    onClick={() => void handleApproveOrComplete(withdrawal)}
                                    disabled={actionLoadingId === withdrawal.id}
                                    className="px-2.5 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => openRejectModal(withdrawal)}
                                    disabled={actionLoadingId === withdrawal.id}
                                    className="px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => void handleCancel(withdrawal)}
                                disabled={actionLoadingId === withdrawal.id}
                                className="px-2.5 py-1 bg-slate-600 text-white rounded-md hover:bg-slate-700 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              {isOwnRequest && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                                  Own request: awaiting another admin
                                </span>
                              )}
                            </>
                          )}

                          {withdrawal.status === 'approved' && (
                            <>
                              {!isOwnRequest && (
                                <>
                                  <button
                                    onClick={() => void handleApproveOrComplete(withdrawal)}
                                    disabled={actionLoadingId === withdrawal.id}
                                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
                                  >
                                    Mark Completed
                                  </button>
                                  <button
                                    onClick={() => openRejectModal(withdrawal)}
                                    disabled={actionLoadingId === withdrawal.id}
                                    className="px-2.5 py-1 bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                </>
                              )}
                              {isOwnRequest && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                                  Own request: awaiting another admin
                                </span>
                              )}
                            </>
                          )}

                          <button
                            onClick={() => setExpandedRow(expandedRow === withdrawal.id ? null : withdrawal.id)}
                            className="px-2.5 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                          >
                            {expandedRow === withdrawal.id ? 'Hide Details' : 'Details'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {expandedRow === withdrawal.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-sm">
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <p className="text-xs text-gray-500 uppercase">Purpose</p>
                              <p className="font-medium text-gray-900 mt-1">{withdrawal.purpose}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <p className="text-xs text-gray-500 uppercase">Recipient</p>
                              <p className="font-medium text-gray-900 mt-1">{withdrawal.recipientName || 'N/A'}</p>
                              <p className="text-xs text-gray-500 mt-1">{withdrawal.recipientPhone || '-'}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <p className="text-xs text-gray-500 uppercase">Security</p>
                              <p className="font-medium text-gray-900 mt-1 flex items-center gap-1">
                                <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                                {withdrawal.ipAddress || 'IP unavailable'}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">Requested: {new Date(withdrawal.createdAt).toLocaleString()}</p>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-3">
                              <p className="text-xs text-gray-500 uppercase">Lifecycle</p>
                              <p className="text-gray-900 mt-1">Approved By: {withdrawal.approvedByName || '-'}</p>
                              <p className="text-gray-900">Approved At: {withdrawal.approvedAt ? new Date(withdrawal.approvedAt).toLocaleString() : '-'}</p>
                              <p className="text-gray-900">Cancelled By: {withdrawal.cancelledByName || '-'}</p>
                              <p className="text-gray-900">Cancelled At: {withdrawal.cancelledAt ? new Date(withdrawal.cancelledAt).toLocaleString() : '-'}</p>
                            </div>
                          </div>

                          {withdrawal.rejectionReason && (
                            <div className="mt-3 bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
                              <span className="font-semibold">Rejection/Cancel reason:</span> {withdrawal.rejectionReason}
                            </div>
                          )}

                          {withdrawal.notes && (
                            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                              <span className="font-semibold">Notes:</span> {withdrawal.notes}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )})
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">Create Withdrawal Request</h2>
              <p className="text-sm text-gray-600 mt-1">Step 1 of 2: Fill details before confirmation.</p>

              <form onSubmit={handleFormPreview} className="space-y-4 mt-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
                  <select
                    required
                    value={formData.campaignId}
                    onChange={(event) => setFormData((prev) => ({ ...prev, campaignId: event.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select campaign</option>
                    {campaigns.filter((campaign) => campaign.available >= 10).map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.title} (Available: {formatCurrency(campaign.available)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (BDT)</label>
                  <input
                    required
                    type="text"
                    inputMode="decimal"
                    value={formData.amount}
                    onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 ${amountError ? 'border-rose-300 focus:ring-rose-500' : 'border-gray-300 focus:ring-green-500'}`}
                    placeholder="e.g. 2500.00"
                  />
                  <p className={`mt-1 text-xs ${amountError ? 'text-rose-600' : 'text-gray-500'}`}>
                    {amountError || `Validation: minimum ৳10, max ৳${SINGLE_WITHDRAWAL_LIMIT.toLocaleString()}, max available balance, max 2 decimal places.`}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <input
                    required
                    type="text"
                    value={formData.purpose}
                    onChange={(event) => setFormData((prev) => ({ ...prev, purpose: event.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Purpose of fund release"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(event) => setFormData((prev) => ({ ...prev, recipientName: event.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Phone</label>
                    <input
                      type="text"
                      value={formData.recipientPhone}
                      onChange={(event) => setFormData((prev) => ({ ...prev, recipientPhone: event.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
                  <input
                    type="text"
                    value={formData.recipientAddress}
                    onChange={(event) => setFormData((prev) => ({ ...prev, recipientAddress: event.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Optional internal notes"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeCreateFlow}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canPreview}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    Preview Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xl w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">Confirm Withdrawal Request</h2>
              <p className="text-sm text-gray-600 mt-1">Step 2 of 2: Verify and confirm.</p>

              <div className="mt-4 rounded-lg border border-gray-200 p-4 bg-gray-50 space-y-2 text-sm">
                <p><span className="font-semibold">Reference Number:</span> Auto-generated on submit</p>
                <p><span className="font-semibold">Campaign:</span> {selectedCampaign?.title || 'N/A'}</p>
                <p><span className="font-semibold">Amount:</span> {formatCurrency(Number.parseFloat(formData.amount || '0'))}</p>
                <p><span className="font-semibold">Purpose:</span> {formData.purpose}</p>
                <p><span className="font-semibold">Recipient:</span> {formData.recipientName || 'N/A'}</p>
              </div>

              <label className="mt-4 flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(event) => setConfirmChecked(event.target.checked)}
                  className="mt-1"
                />
                <span>
                  I confirm this withdrawal of <strong>{formatCurrency(Number.parseFloat(formData.amount || '0'))}</strong> from <strong>{selectedCampaign?.title || 'the selected campaign'}</strong>.
                </span>
              </label>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!confirmChecked || isSubmitting}
                  onClick={() => void handleCreateWithdrawal()}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectModal && rejectTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">Reject Withdrawal</h2>
              <p className="text-sm text-gray-600 mt-1">Reference: {rejectTarget.referenceNumber}</p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (required)</label>
                <textarea
                  value={rejectReason}
                  onChange={(event) => setRejectReason(event.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                  placeholder="Explain why this withdrawal is rejected"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectTarget(null);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => void handleReject()}
                  disabled={actionLoadingId === rejectTarget.id}
                  className="flex-1 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50"
                >
                  {actionLoadingId === rejectTarget.id ? 'Rejecting...' : 'Reject Withdrawal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalManagement;

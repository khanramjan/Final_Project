import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  BanknotesIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import volunteerService from '../../services/volunteerService';
import api from '../../services/api';
import physicalDonationService from '../../services/physicalDonationService';
import type { VolunteerAssignment } from '../../types/volunteer.types';
import type {
  PhysicalDonationItem,
  SubmitPhysicalDonationResponse,
} from '../../types/physicalDonation.types';

type CampaignInfo = {
  id: number;
  title: string;
  status: string;
  goalAmount: number;
  currentAmount: number;
};

type PublicCampaignListResponse = {
  campaigns: CampaignInfo[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function VolunteerPhysicalDonationsPage() {
  // Form
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignInfo[]>([]);

  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<SubmitPhysicalDonationResponse | null>(null);

  // List
  const [items, setItems] = useState<PhysicalDonationItem[]>([]);
  const [listStatus, setListStatus] = useState<'all' | 'submitted' | 'confirmed'>('all');
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const selectedAssignment = useMemo(() => {
    const id = Number(selectedAssignmentId);
    if (!selectedAssignmentId || Number.isNaN(id)) return null;
    return assignments.find(a => a.id === id) ?? null;
  }, [assignments, selectedAssignmentId]);

  const effectiveCampaignId = useMemo(() => {
    if (selectedAssignment) return selectedAssignment.campaignId;
    const id = Number(selectedCampaignId);
    if (!selectedCampaignId || Number.isNaN(id)) return null;
    return id;
  }, [selectedAssignment, selectedCampaignId]);

  const campaignTitleById = useMemo(() => {
    const map = new Map<number, string>();
    assignments.forEach(a => {
      if (a.campaignId && a.campaignTitle) map.set(a.campaignId, a.campaignTitle);
    });
    campaigns.forEach(c => {
      if (c.id && c.title) map.set(c.id, c.title);
    });
    return map;
  }, [assignments, campaigns]);

  // Get selected campaign's remaining amount
  const selectedCampaignInfo = useMemo(() => {
    if (!effectiveCampaignId) return null;
    return campaigns.find(c => c.id === effectiveCampaignId) ?? null;
  }, [campaigns, effectiveCampaignId]);

  const remainingAmount = useMemo(() => {
    if (!selectedCampaignInfo) return null;
    return Math.max(0, selectedCampaignInfo.goalAmount - selectedCampaignInfo.currentAmount);
  }, [selectedCampaignInfo]);

  const totals = useMemo(() => {
    const submitted = items.filter(i => i.status === 'submitted');
    const confirmed = items.filter(i => i.status === 'confirmed');
    const submittedAmount = submitted.reduce((sum, i) => sum + (i.amount || 0), 0);
    const confirmedAmount = confirmed.reduce((sum, i) => sum + (i.amount || 0), 0);
    return {
      submittedCount: submitted.length,
      confirmedCount: confirmed.length,
      submittedAmount,
      confirmedAmount,
    };
  }, [items]);

  const loadBootstrapData = useCallback(async () => {
    try {
      const [activeAssignments, publicCampaigns] = await Promise.all([
        volunteerService.getActiveAssignments().catch(() => [] as VolunteerAssignment[]),
        api.get<PublicCampaignListResponse>('/campaign/public?page=1&pageSize=100&status=active')
          .then(r => r.campaigns)
          .catch(() => [] as CampaignInfo[]),
      ]);

      setAssignments(activeAssignments);
      setCampaigns(publicCampaigns);
    } catch {
      // Non-blocking; form still allows manual entry.
    }
  }, []);

  const loadMyCollections = useCallback(async () => {
    try {
      setLoadingList(true);
      setListError(null);
      const data = await physicalDonationService.my(listStatus);
      setItems(data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Failed to load physical collections');
    } finally {
      setLoadingList(false);
    }
  }, [listStatus]);

  useEffect(() => {
    void loadBootstrapData();
  }, [loadBootstrapData]);

  useEffect(() => {
    void loadMyCollections();
  }, [loadMyCollections]);

  const resetForm = () => {
    setSelectedAssignmentId('');
    setSelectedCampaignId('');
    setDonorName('');
    setDonorPhone('');
    setAmount('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitError(null);
    setSubmitSuccess(null);

    const numericAmount = Number(amount);
    if (!effectiveCampaignId) {
      setSubmitError('Please select a campaign (or pick an active assignment).');
      return;
    }

    if (!donorPhone.trim()) {
      setSubmitError('Donor phone is required (SMS confirmation).');
      return;
    }

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setSubmitError('Amount must be greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await physicalDonationService.submit({
        campaignId: effectiveCampaignId,
        volunteerAssignmentId: selectedAssignment ? selectedAssignment.id : null,
        amount: numericAmount,
        donorName: donorName.trim() || undefined,
        donorPhone: donorPhone.trim(),
        notes: notes.trim() || undefined,
      });

      setSubmitSuccess(res);
      resetForm();
      await loadMyCollections();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit physical donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BanknotesIcon className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Physical Collection</h1>
            <p className="text-gray-600">
              Submit cash collections and track donor SMS confirmations.
            </p>
          </div>
        </div>

        {/* Submit card */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Submit a Collection</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <InformationCircleIcon className="h-5 w-5" />
              <span>Donor receives an SMS with OTP</span>
            </div>
          </div>

          {submitError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-700">{submitError}</div>
            </div>
          )}

          {submitSuccess && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex gap-3">
              <CheckCircleIcon className="h-5 w-5 text-emerald-700 mt-0.5" />
              <div className="text-sm text-emerald-800">
                <div className="font-medium">Submitted successfully</div>
                <div className="mt-1">
                  Ref: <span className="font-mono">{submitSuccess.referenceCode}</span> · OTP expires:{' '}
                  {formatDateTime(submitSuccess.otpExpiresAt)}
                </div>
                <div className="mt-1 text-emerald-700">
                  Ask the donor to confirm using the OTP from the SMS.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Assignment (optional)</label>
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => {
                    setSelectedAssignmentId(e.target.value);
                    setSelectedCampaignId('');
                  }}
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select assignment</option>
                  {assignments.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.title} ({a.campaignTitle || `Campaign #${a.campaignId}`})
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Picking an assignment auto-selects its campaign.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign</label>
                {selectedAssignment ? (
                  <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                    {selectedAssignment.campaignTitle || `Campaign #${selectedAssignment.campaignId}`}
                  </div>
                ) : (
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select campaign</option>
                    {campaigns.map(c => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                )}
                {/* Show campaign progress */}
                {selectedCampaignInfo && (
                  <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-700">Campaign Progress</span>
                      <span className="font-medium text-blue-900">
                        ৳{selectedCampaignInfo.currentAmount.toLocaleString()} / ৳{selectedCampaignInfo.goalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (selectedCampaignInfo.currentAmount / selectedCampaignInfo.goalAmount) * 100)}%` }}
                      />
                    </div>
                    {remainingAmount !== null && remainingAmount > 0 ? (
                      <p className="text-sm text-blue-800 font-medium">
                        🎯 Remaining need: <span className="text-blue-900">৳{remainingAmount.toLocaleString()}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-emerald-700 font-medium">
                        ✅ Campaign has reached its target!
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name (optional)</label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="e.g., Rahim Ahmed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Donor Phone</label>
                <input
                  type="tel"
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="01XXXXXXXXX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (৳)</label>
                <input
                  type="number"
                  min={1}
                  max={remainingAmount ?? undefined}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="500"
                  required
                />
                {remainingAmount !== null && remainingAmount > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    Maximum collectable: ৳{remainingAmount.toLocaleString()}
                  </p>
                )}
                {remainingAmount !== null && Number(amount) > remainingAmount && (
                  <p className="mt-1 text-xs text-red-600 font-medium">
                    ⚠️ Amount exceeds remaining need (৳{remainingAmount.toLocaleString()})
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Anything to remember (location, receipt, etc.)"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setSubmitError(null);
                  setSubmitSuccess(null);
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled={submitting}
              >
                Clear
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Submit Collection'}
              </button>
            </div>
          </form>
        </div>

        {/* List card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">My Collections</h2>
              <p className="text-sm text-gray-600">
                Submitted: {totals.submittedCount} (৳{totals.submittedAmount.toFixed(2)}) · Confirmed: {totals.confirmedCount} (৳{totals.confirmedAmount.toFixed(2)})
              </p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={listStatus}
                onChange={(e) => setListStatus(e.target.value as 'all' | 'submitted' | 'confirmed')}
                className="rounded-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              >
                <option value="all">All</option>
                <option value="submitted">Submitted</option>
                <option value="confirmed">Confirmed</option>
              </select>

              <button
                type="button"
                onClick={loadMyCollections}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowPathIcon className="h-5 w-5" />
                Refresh
              </button>
            </div>
          </div>

          {listError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {listError}
            </div>
          )}

          {loadingList ? (
            <div className="py-10 text-center text-gray-500">Loading…</div>
          ) : items.length === 0 ? (
            <div className="py-10 text-center text-gray-500">No collections found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ref</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Collected</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Confirmed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((row) => {
                    const campaignName = campaignTitleById.get(row.campaignId) || `Campaign #${row.campaignId}`;
                    const statusPill = row.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-yellow-100 text-yellow-800';

                    return (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-sm font-mono text-gray-700">{row.referenceCode}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{campaignName}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">৳{row.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          <div className="font-medium">{row.donorName || '—'}</div>
                          <div className="text-xs text-gray-500">{row.donorPhone}</div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${statusPill}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(row.collectedAt)}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{formatDateTime(row.confirmedAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

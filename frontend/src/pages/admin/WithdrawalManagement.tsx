import { useState, useEffect } from 'react';
import { BanknotesIcon, PlusIcon, CalendarIcon, UserIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  title: string;
  raisedAmount: number;
  withdrawn: number;
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
  withdrawnAt: string;
  withdrawnByName: string;
  createdAt: string;
}

const WithdrawalManagement = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    campaignId: '',
    amount: '',
    purpose: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    notes: '',
  });

  useEffect(() => {
    fetchDashboardData();
    fetchWithdrawals();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/financial/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const fetchWithdrawals = async (campaignId?: number) => {
    try {
      const token = localStorage.getItem('token');
      const url = campaignId 
        ? `http://localhost:5000/api/financial/withdrawals?campaignId=${campaignId}`
        : 'http://localhost:5000/api/financial/withdrawals';
      
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/financial/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          campaignId: parseInt(formData.campaignId),
          amount: parseFloat(formData.amount)
        })
      });

      if (response.ok) {
        alert('Withdrawal recorded successfully!');
        setIsModalOpen(false);
        setFormData({
          campaignId: '',
          amount: '',
          purpose: '',
          recipientName: '',
          recipientPhone: '',
          recipientAddress: '',
          notes: '',
        });
        fetchDashboardData();
        fetchWithdrawals();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to record withdrawal');
      }
    } catch (error) {
      console.error('Error recording withdrawal:', error);
      alert('Failed to record withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const selectedCampaign = campaigns.find(c => c.id === parseInt(formData.campaignId));

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Management</h1>
          <p className="text-gray-600">Track money withdrawn from bank account</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Record Withdrawal
        </button>
      </div>

      {/* Campaign Balances */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {campaigns.map(campaign => (
          <div key={campaign.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 truncate">{campaign.title}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Raised:</span>
                <span className="font-semibold text-green-600">৳{campaign.raisedAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Withdrawn:</span>
                <span className="font-semibold text-red-600">৳{campaign.withdrawn.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Available:</span>
                <span className="font-bold text-blue-600">৳{campaign.available.toLocaleString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={selectedCampaignId || ''}
          onChange={(e) => {
            const id = e.target.value ? parseInt(e.target.value) : null;
            setSelectedCampaignId(id);
            fetchWithdrawals(id || undefined);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Campaigns</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purpose</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Withdrawn By</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {withdrawals.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No withdrawals recorded yet
                </td>
              </tr>
            ) : (
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(withdrawal.withdrawnAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{withdrawal.campaignTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                    ৳{withdrawal.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{withdrawal.purpose}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {withdrawal.recipientName || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{withdrawal.withdrawnByName}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Record Withdrawal</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Campaign Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign *
                  </label>
                  <select
                    required
                    value={formData.campaignId}
                    onChange={(e) => setFormData({ ...formData, campaignId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select Campaign</option>
                    {campaigns.filter(c => c.available > 0).map(c => (
                      <option key={c.id} value={c.id}>
                        {c.title} (Available: ৳{c.available.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (৳) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedCampaign?.available || undefined}
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter amount"
                  />
                  {selectedCampaign && (
                    <p className="text-sm text-gray-600 mt-1">
                      Available: ৳{selectedCampaign.available.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Purpose *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Paid to beneficiary"
                  />
                </div>

                {/* Recipient Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Name
                    </label>
                    <input
                      type="text"
                      value={formData.recipientName}
                      onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.recipientPhone}
                      onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipient Address
                  </label>
                  <input
                    type="text"
                    value={formData.recipientAddress}
                    onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Optional"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Additional notes (optional)"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {loading ? 'Recording...' : 'Record Withdrawal'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalManagement;

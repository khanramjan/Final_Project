import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  TagIcon,
  DocumentArrowUpIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import voucherService, { SubmitVoucherDto, VoucherItemDto } from '../../services/voucherService';
import volunteerService from '../../services/volunteerService';

interface Campaign {
  id: number;
  title: string;
  status: string;
}

const EXPENSE_CATEGORIES = [
  'Food & Beverages',
  'Transportation',
  'Medical Supplies',
  'Equipment',
  'Communication',
  'Accommodation',
  'Utilities',
  'Others',
];

export default function SubmitVoucher() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('requestId');
  const preselectedCampaignId = searchParams.get('campaignId');

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<File | null>(null);

  const [formData, setFormData] = useState<SubmitVoucherDto>({
    campaignId: preselectedCampaignId ? parseInt(preselectedCampaignId) : 0,
    amount: 0,
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    category: '',
    items: [],
  });

  const [items, setItems] = useState<VoucherItemDto[]>([
    {
      itemName: '',
      price: 0,
      quantity: 1,
      purchaseDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  ]);

  useEffect(() => {
    fetchMyCampaigns();
  }, []);

  useEffect(() => {
    // Calculate total amount from items
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setFormData((prev) => ({ ...prev, amount: total }));
  }, [items]);

  const fetchMyCampaigns = async () => {
    try {
      const assignments = await volunteerService.getMyAssignments();
      // Filter for completed campaigns only
      const completedCampaigns = assignments
        .filter((a) => a.campaignStatus === 'completed')
        .map((a) => ({
          id: a.campaignId,
          title: a.campaignTitle,
          status: a.campaignStatus,
        }));
      
      const uniqueCampaigns = Array.from(
        new Map(completedCampaigns.map((c) => [c.id, c])).values()
      );
      
      setCampaigns(uniqueCampaigns);

      if (uniqueCampaigns.length === 0) {
        setError('No completed campaigns available. You can only submit vouchers for completed campaigns.');
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load your assigned campaigns');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'campaignId' ? parseInt(value) || 0 : value,
    }));
  };

  const handleItemChange = (index: number, field: keyof VoucherItemDto, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'price' || field === 'quantity' ? Number(value) || 0 : value,
    };
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        itemName: '',
        price: 0,
        quantity: 1,
        purchaseDate: new Date().toISOString().split('T')[0],
        notes: '',
      },
    ]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, and PDF files are allowed');
        return;
      }
      setReceipt(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.campaignId) {
        setError('Please select a campaign');
        setLoading(false);
        return;
      }
      if (formData.amount <= 0) {
        setError('Amount must be greater than 0');
        setLoading(false);
        return;
      }
      if (!formData.description.trim()) {
        setError('Please provide a description');
        setLoading(false);
        return;
      }
      if (!formData.category) {
        setError('Please select a category');
        setLoading(false);
        return;
      }

      // Validate items
      const validItems = items.filter((item) => item.itemName.trim() && item.price > 0);
      if (validItems.length === 0) {
        setError('Please add at least one expense item');
        setLoading(false);
        return;
      }

      const submitData = {
        ...formData,
        items: validItems,
      };

      if (requestId) {
        await voucherService.updateRequestedVoucher(parseInt(requestId), submitData, receipt || undefined);
      } else {
        await voucherService.submitVoucher(submitData, receipt || undefined);
      }

      navigate('/volunteer/vouchers', {
        state: { message: 'Voucher submitted successfully!' },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit voucher');
      console.error('Error submitting voucher:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {requestId ? 'Complete Voucher Request' : 'Submit Expense Voucher'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Submit your expense voucher for relief distribution work. Only completed campaigns are eligible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {/* Campaign Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign <span className="text-red-500">*</span>
          </label>
          <select
            name="campaignId"
            value={formData.campaignId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
            disabled={!!preselectedCampaignId}
          >
            <option value="">Select a completed campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            Only completed campaigns are shown
          </p>
        </div>

        {/* Expense Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <TagIcon className="w-5 h-5 inline mr-1" />
            Expense Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          >
            <option value="">Select a category</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Expense Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarDaysIcon className="w-5 h-5 inline mr-1" />
            Expense Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="expenseDate"
            value={formData.expenseDate}
            onChange={handleInputChange}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DocumentTextIcon className="w-5 h-5 inline mr-1" />
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="Describe what the expense was for and why it was necessary"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Provide context about the expenses and their purpose
          </p>
        </div>

        {/* Expense Items */}
        <div className="border-t pt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Expense Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              <PlusIcon className="w-5 h-5 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg relative">
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.itemName}
                      onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g., Rice bags"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={item.purchaseDate}
                      onChange={(e) => handleItemChange(index, 'purchaseDate', e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="1"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={item.notes || ''}
                      onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Additional notes about this item"
                    />
                  </div>

                  <div className="md:col-span-2 text-right">
                    <span className="text-sm font-medium text-gray-700">
                      Subtotal: ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-emerald-600">${formData.amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Receipt Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DocumentArrowUpIcon className="w-5 h-5 inline mr-1" />
            Receipt / Proof (Optional)
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-emerald-50 file:text-emerald-700
              hover:file:bg-emerald-100"
          />
          {receipt && (
            <p className="mt-2 text-sm text-emerald-600">
              Selected: {receipt.name} ({(receipt.size / 1024).toFixed(2)} KB)
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Upload a photo or PDF of your receipts (Max: 5MB, JPG/PNG/PDF)
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/volunteer/vouchers')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Voucher'}
          </button>
        </div>
      </form>
    </div>
  );
}

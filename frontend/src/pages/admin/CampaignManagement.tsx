import { useState, useEffect } from 'react';
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import campaignService, { Campaign, CampaignFilters } from '../../services/campaignService';
import VolunteerRecommendations from '../../components/VolunteerRecommendations';

interface CampaignForm {
  id?: number;
  title: string;
  description: string;
  targetAmount: number;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  status: string;
  isUrgent: boolean;
  isFeatured: boolean;
  image?: File | null;
  // Volunteer request fields
  needsVolunteers: boolean;
  platinumVolunteersNeeded: number;
  goldVolunteersNeeded: number;
  silverVolunteersNeeded: number;
  bronzeVolunteersNeeded: number;
  newbieVolunteersNeeded: number;
  autoSendVolunteerRequests: boolean;
}

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CampaignFilters>({
    page: 1,
    pageSize: 10,
    status: 'all'
  });
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [selectedCampaigns, setSelectedCampaigns] = useState<number[]>([]);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for creating/editing campaigns
  const [campaignForm, setCampaignForm] = useState<CampaignForm>({
    title: '',
    description: '',
    targetAmount: 0,
    category: 'health',
    location: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'active',
    isUrgent: false,
    isFeatured: false,
    image: null,
    needsVolunteers: false,
    platinumVolunteersNeeded: 0,
    goldVolunteersNeeded: 0,
    silverVolunteersNeeded: 0,
    bronzeVolunteersNeeded: 0,
    newbieVolunteersNeeded: 0,
    autoSendVolunteerRequests: false
  });

  // ML Recommendations
  const [showRecommendationsPreview, setShowRecommendationsPreview] = useState(false);
  const [createdCampaignId, setCreatedCampaignId] = useState<number | null>(null);

  const categories = [
    { value: 'health', label: 'Health' },
    { value: 'education', label: 'Education' },
    { value: 'environment', label: 'Environment' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'disaster', label: 'Disaster Relief' },
    { value: 'poverty', label: 'Poverty Alleviation' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' },
    { value: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignService.getAllCampaigns(filters);
      setCampaigns(response.campaigns);
      setTotalCampaigns(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      // Fallback to empty state on error
      setCampaigns([]);
      setTotalCampaigns(0);
    } finally {
      setLoading(false);
    }
  };

  // Create new campaign
  const handleCreateCampaign = async () => {
    try {
      setActionLoading(-1);
      
      // Validation
      if (!campaignForm.title.trim()) {
        alert('Campaign title is required!');
        return;
      }
      
      if (!campaignForm.description.trim()) {
        alert('Campaign description is required!');
        return;
      }
      
      if (campaignForm.targetAmount <= 0) {
        alert('Target amount must be greater than 0!');
        return;
      }
      
      if (!campaignForm.category) {
        alert('Category is required!');
        return;
      }
      
      console.log('Creating campaign with form data:', campaignForm);
      
      const formData = new FormData();
      formData.append('title', campaignForm.title.trim());
      formData.append('description', campaignForm.description.trim());
      formData.append('targetAmount', campaignForm.targetAmount.toString());
      formData.append('startDate', campaignForm.startDate || new Date().toISOString().split('T')[0]);
      formData.append('endDate', campaignForm.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      formData.append('category', campaignForm.category);
      formData.append('location', campaignForm.location || '');
      formData.append('status', campaignForm.status);
      formData.append('isUrgent', campaignForm.isUrgent.toString());
      formData.append('isFeatured', campaignForm.isFeatured.toString());
      
      // Add volunteer request fields
      formData.append('needsVolunteers', campaignForm.needsVolunteers.toString());
      formData.append('platinumVolunteersNeeded', campaignForm.platinumVolunteersNeeded.toString());
      formData.append('goldVolunteersNeeded', campaignForm.goldVolunteersNeeded.toString());
      formData.append('silverVolunteersNeeded', campaignForm.silverVolunteersNeeded.toString());
      formData.append('bronzeVolunteersNeeded', campaignForm.bronzeVolunteersNeeded.toString());
      formData.append('newbieVolunteersNeeded', campaignForm.newbieVolunteersNeeded.toString());
      formData.append('autoSendVolunteerRequests', campaignForm.autoSendVolunteerRequests.toString());
      
      if (campaignForm.image) {
        formData.append('image', campaignForm.image);
        console.log('Image attached:', campaignForm.image.name);
      }
      
      console.log('Sending FormData to API...');
      // Log FormData entries
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      const result = await campaignService.createCampaign(formData);
      console.log('Campaign created successfully:', result);
      
      await fetchCampaigns();
      
      // Show ML recommendations preview if auto-send is enabled
      if (campaignForm.autoSendVolunteerRequests && result.campaignId) {
        setCreatedCampaignId(result.campaignId);
        setShowRecommendationsPreview(true);
      } else {
        setShowCreateModal(false);
        resetForm();
        alert('Campaign created successfully!');
      }
    } catch (error) {
      console.error('Failed to create campaign:', error);
      console.error('Error details:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert(`Failed to create campaign! Error: ${errorMessage}`);
    } finally {
      setActionLoading(null);
    }
  };

  // Edit campaign
  const handleEditCampaign = async () => {
    try {
      setActionLoading(editingCampaign?.id || -1);
      
      const formData = new FormData();
      formData.append('title', campaignForm.title);
      formData.append('description', campaignForm.description);
      formData.append('targetAmount', campaignForm.targetAmount.toString());
      formData.append('startDate', campaignForm.startDate);
      formData.append('endDate', campaignForm.endDate);
      formData.append('category', campaignForm.category);
      formData.append('location', campaignForm.location);
      formData.append('status', campaignForm.status);
      formData.append('isUrgent', campaignForm.isUrgent.toString());
      formData.append('isFeatured', campaignForm.isFeatured.toString());
      
      // Add volunteer request fields
      formData.append('needsVolunteers', campaignForm.needsVolunteers.toString());
      formData.append('platinumVolunteersNeeded', campaignForm.platinumVolunteersNeeded.toString());
      formData.append('goldVolunteersNeeded', campaignForm.goldVolunteersNeeded.toString());
      formData.append('silverVolunteersNeeded', campaignForm.silverVolunteersNeeded.toString());
      formData.append('bronzeVolunteersNeeded', campaignForm.bronzeVolunteersNeeded.toString());
      formData.append('newbieVolunteersNeeded', campaignForm.newbieVolunteersNeeded.toString());
      formData.append('autoSendVolunteerRequests', campaignForm.autoSendVolunteerRequests.toString());
      
      if (campaignForm.image) {
        formData.append('image', campaignForm.image);
      }
      
      await campaignService.updateCampaign(editingCampaign!.id, formData);
      await fetchCampaigns();
      setShowEditModal(false);
      setEditingCampaign(null);
      resetForm();
      
      alert('Campaign updated successfully!');
    } catch (error) {
      console.error('Failed to edit campaign:', error);
      alert('Failed to update campaign!');
    } finally {
      setActionLoading(null);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (campaignId: number) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      setActionLoading(campaignId);
      
      await campaignService.deleteCampaign(campaignId);
      await fetchCampaigns();
      
      alert('Campaign deleted successfully!');
    } catch (error) {
      console.error('Failed to delete campaign:', error);
      alert('Failed to delete campaign!');
    } finally {
      setActionLoading(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setCampaignForm({
      title: '',
      description: '',
      targetAmount: 0,
      category: 'health',
      location: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'approved',
      isUrgent: false,
      isFeatured: false,
      image: null,
      needsVolunteers: false,
      platinumVolunteersNeeded: 0,
      goldVolunteersNeeded: 0,
      silverVolunteersNeeded: 0,
      bronzeVolunteersNeeded: 0,
      newbieVolunteersNeeded: 0,
      autoSendVolunteerRequests: false
    });
  };

  // Open edit modal
  const openEditModal = (campaign: Campaign) => {
    setCampaignForm({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      targetAmount: campaign.targetAmount,
      category: campaign.category,
      location: campaign.location || '',
      startDate: campaign.startDate.split('T')[0],
      endDate: campaign.endDate.split('T')[0],
      status: campaign.status,
      isUrgent: campaign.isUrgent,
      isFeatured: campaign.isFeatured,
      image: null,
      needsVolunteers: (campaign as any).needsVolunteers || false,
      platinumVolunteersNeeded: (campaign as any).platinumVolunteersNeeded || 0,
      goldVolunteersNeeded: (campaign as any).goldVolunteersNeeded || 0,
      silverVolunteersNeeded: (campaign as any).silverVolunteersNeeded || 0,
      bronzeVolunteersNeeded: (campaign as any).bronzeVolunteersNeeded || 0,
      newbieVolunteersNeeded: (campaign as any).newbieVolunteersNeeded || 0,
      autoSendVolunteerRequests: (campaign as any).autoSendVolunteerRequests || false
    });
    setEditingCampaign(campaign);
    setShowEditModal(true);
  };

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters({ ...filters, search: term, page: 1 });
  };

  const handleStatusChange = async (campaignId: number, status: string) => {
    try {
      setActionLoading(campaignId);
      
      // Use the approveCampaign method for status changes
      const approval = {
        isApproved: status === 'approved',
        isFeatured: false,
        rejectionReason: status === 'suspended' ? 'Administrative action' : undefined
      };
      
      await campaignService.approveCampaign(campaignId, approval);
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedCampaigns.length === 0) return;

    try {
      setLoading(true);
      const approval = {
        isApproved: action === 'approved',
        isFeatured: false,
        rejectionReason: action === 'suspended' ? 'Bulk administrative action' : undefined
      };
      
      await Promise.all(
        selectedCampaigns.map(id => 
          campaignService.approveCampaign(id, approval)
        )
      );
      setSelectedCampaigns([]);
      await fetchCampaigns();
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportCampaigns = async () => {
    try {
      // For now, create a simple CSV export using campaign data
      const csvContent = [
        'ID,Title,Category,Status,Target,Raised,Progress,Creator,Created',
        ...campaigns.map(c => [
          c.id,
          `"${c.title}"`,
          c.category,
          c.status,
          c.targetAmount,
          c.raisedAmount,
          c.progressPercentage.toFixed(2),
          `"${c.creatorName}"`,
          new Date(c.createdAt).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campaigns-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Failed to export campaigns:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIndicator = (campaign: Campaign) => {
    if (campaign.isUrgent) {
      return <ExclamationTriangleIcon className="h-4 w-4 text-red-500" title="Urgent" />;
    }
    if (campaign.daysRemaining <= 7) {
      return <ClockIcon className="h-4 w-4 text-orange-500" title="Ending Soon" />;
    }
    return null;
  };

  const totalPages = Math.ceil(totalCampaigns / (filters.pageSize || 10));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaign Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all campaigns and create new campaigns
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={exportCampaigns}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-2 inline" />
            Export
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-green-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-green-700 flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status || 'all'}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters({ page: 1, pageSize: 10, status: 'all' });
                setSearchTerm('');
              }}
              className="w-full bg-gray-100 text-gray-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-200"
            >
              <FunnelIcon className="h-4 w-4 mr-2 inline" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedCampaigns.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedCampaigns.length} ক্যাম্পেইন নির্বাচিত
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkAction('approved')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                অনুমোদন
              </button>
              <button
                onClick={() => handleBulkAction('suspended')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                স্থগিত
              </button>
              <button
                onClick={() => setSelectedCampaigns([])}
                className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={campaigns.length > 0 && selectedCampaigns.length === campaigns.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCampaigns(campaigns.map(c => c.id));
                      } else {
                        setSelectedCampaigns([]);
                      }
                    }}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ক্যাম্পেইন
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  প্রোগ্রেস
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তৈরিকারী
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  তৈরির তারিখ
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                  </td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    কোন ক্যাম্পেইন খুঁজে পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCampaigns([...selectedCampaigns, campaign.id]);
                          } else {
                            setSelectedCampaigns(selectedCampaigns.filter(id => id !== campaign.id));
                          }
                        }}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        {campaign.imagePath && (
                          <img
                            src={campaign.imagePath}
                            alt={campaign.title}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                          />
                        )}
                        <div>
                          <div className="flex items-center">
                            <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                            {getUrgencyIndicator(campaign)}
                            {campaign.isFeatured && (
                              <ChartBarIcon className="h-4 w-4 text-yellow-500 ml-1" title="ফিচার্ড" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{categories.find(c => c.value === campaign.category)?.label || campaign.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          ৳{campaign.raisedAmount.toLocaleString()} / ৳{campaign.targetAmount.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${Math.min(campaign.progressPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {campaign.progressPercentage.toFixed(1)}% • {campaign.donationCount} দান
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {statusOptions.find(s => s.value === campaign.status)?.label || campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {campaign.creatorName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString('bn-BD')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          title="দেখুন"
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(campaign)}
                          title="সম্পাদনা"
                          className="text-blue-400 hover:text-blue-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          disabled={actionLoading === campaign.id}
                          title="মুছে ফেলুন"
                          className="text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        {campaign.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(campaign.id, 'approved')}
                              disabled={actionLoading === campaign.id}
                              title="অনুমোদন"
                              className="text-green-400 hover:text-green-600 disabled:opacity-50"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(campaign.id, 'suspended')}
                              disabled={actionLoading === campaign.id}
                              title="স্থগিত"
                              className="text-red-400 hover:text-red-600 disabled:opacity-50"
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          </>
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
                দেখানো হচ্ছে {((filters.page || 1) - 1) * (filters.pageSize || 10) + 1} থেকে{' '}
                {Math.min((filters.page || 1) * (filters.pageSize || 10), totalCampaigns)} এর মধ্যে{' '}
                {totalCampaigns} টি ফলাফল
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) - 1 })}
                  disabled={filters.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  পূর্ববর্তী
                </button>
                <span className="text-sm text-gray-700">
                  পৃষ্ঠা {filters.page} এর {totalPages}
                </span>
                <button
                  onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                  disabled={filters.page === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            {/* Show recommendations preview after campaign creation */}
            {showRecommendationsPreview && createdCampaignId ? (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <SparklesIcon className="h-6 w-6 text-purple-600" />
                    <h3 className="text-lg font-medium text-gray-900">AI-Powered Volunteer Recommendations</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                      setShowRecommendationsPreview(false);
                      setCreatedCampaignId(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    Your campaign has been created successfully! Below are recommended volunteers who best match your campaign requirements. You can review their profiles before sending requests.
                  </p>
                </div>
                
                <VolunteerRecommendations
                  campaignId={createdCampaignId}
                  topN={15}
                  minimumScore={0.4}
                  onRecommendationSelect={(selectedVolunteers) => {
                    console.log('Selected volunteers:', selectedVolunteers);
                  }}
                />
                
                <div className="flex items-center justify-end space-x-4 pt-4 border-t mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                      setShowRecommendationsPreview(false);
                      setCreatedCampaignId(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Create New Campaign</h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={(e) => { e.preventDefault(); handleCreateCampaign(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title *</label>
                    <input
                      type="text"
                      required
                      value={campaignForm.title}
                      onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter campaign title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={campaignForm.category}
                      onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter detailed campaign description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (৳) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={campaignForm.targetAmount}
                      onChange={(e) => setCampaignForm({ ...campaignForm, targetAmount: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={campaignForm.status}
                      onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Photo Upload Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCampaignForm({ ...campaignForm, image: file });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {campaignForm.image && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {campaignForm.image.name}
                    </p>
                  )}
                </div>

                {/* Volunteer Request Section */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="needsVolunteers"
                      checked={campaignForm.needsVolunteers}
                      onChange={(e) => setCampaignForm({ ...campaignForm, needsVolunteers: e.target.checked })}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="needsVolunteers" className="ml-2 text-sm font-medium text-gray-700">
                      This campaign needs volunteers
                    </label>
                  </div>

                  {campaignForm.needsVolunteers && (
                    <div className="ml-6 space-y-4 bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-3">Specify how many volunteers needed for each rank:</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            💎 Platinum
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={campaignForm.platinumVolunteersNeeded}
                            onChange={(e) => setCampaignForm({ ...campaignForm, platinumVolunteersNeeded: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            🏆 Gold
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={campaignForm.goldVolunteersNeeded}
                            onChange={(e) => setCampaignForm({ ...campaignForm, goldVolunteersNeeded: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            🥈 Silver
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={campaignForm.silverVolunteersNeeded}
                            onChange={(e) => setCampaignForm({ ...campaignForm, silverVolunteersNeeded: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            🥉 Bronze
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={campaignForm.bronzeVolunteersNeeded}
                            onChange={(e) => setCampaignForm({ ...campaignForm, bronzeVolunteersNeeded: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            🌱 Newbie
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={campaignForm.newbieVolunteersNeeded}
                            onChange={(e) => setCampaignForm({ ...campaignForm, newbieVolunteersNeeded: Number(e.target.value) })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center pt-2">
                        <input
                          type="checkbox"
                          id="autoSendVolunteerRequests"
                          checked={campaignForm.autoSendVolunteerRequests}
                          onChange={(e) => setCampaignForm({ ...campaignForm, autoSendVolunteerRequests: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="autoSendVolunteerRequests" className="ml-2 text-sm text-gray-700">
                          Automatically send requests to volunteers (via email and notification panel)
                        </label>
                      </div>

                      {campaignForm.autoSendVolunteerRequests && (
                        <div className="bg-blue-100 border border-blue-200 rounded p-3 text-sm text-blue-800">
                          <strong>Note:</strong> Volunteers will be matched based on their rank, skills, availability, and location proximity.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isUrgent"
                      checked={campaignForm.isUrgent}
                      onChange={(e) => setCampaignForm({ ...campaignForm, isUrgent: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="isUrgent" className="ml-2 text-sm text-gray-700">Urgent Campaign</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={campaignForm.isFeatured}
                      onChange={(e) => setCampaignForm({ ...campaignForm, isFeatured: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-700">Featured Campaign</label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === -1}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === -1 ? 'Creating...' : 'Create Campaign'}
                  </button>
                </div>
              </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && editingCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Campaign</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingCampaign(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => { e.preventDefault(); handleEditCampaign(); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title *</label>
                    <input
                      type="text"
                      required
                      value={campaignForm.title}
                      onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      required
                      value={campaignForm.category}
                      onChange={(e) => setCampaignForm({ ...campaignForm, category: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    required
                    rows={4}
                    value={campaignForm.description}
                    onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (৳) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={campaignForm.targetAmount}
                      onChange={(e) => setCampaignForm({ ...campaignForm, targetAmount: Number(e.target.value) })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={campaignForm.status}
                      onChange={(e) => setCampaignForm({ ...campaignForm, status: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Photo Upload Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setCampaignForm({ ...campaignForm, image: file });
                      }
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-green-500 focus:border-green-500"
                  />
                  {campaignForm.image && (
                    <p className="text-sm text-gray-600 mt-1">
                      Selected: {campaignForm.image.name}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsUrgent"
                      checked={campaignForm.isUrgent}
                      onChange={(e) => setCampaignForm({ ...campaignForm, isUrgent: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="editIsUrgent" className="ml-2 text-sm text-gray-700">Urgent Campaign</label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editIsFeatured"
                      checked={campaignForm.isFeatured}
                      onChange={(e) => setCampaignForm({ ...campaignForm, isFeatured: e.target.checked })}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <label htmlFor="editIsFeatured" className="ml-2 text-sm text-gray-700">Featured Campaign</label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingCampaign(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading === editingCampaign?.id}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading === editingCampaign?.id ? 'Updating...' : 'Update Campaign'}
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

export default CampaignManagement;
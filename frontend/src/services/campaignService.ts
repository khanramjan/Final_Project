import api from './api';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  imagePath?: string;
  targetAmount: number;
  raisedAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  category: string;
  location?: string;
  isUrgent: boolean;
  isFeatured: boolean;
  createdAt: string;
  approvedAt?: string;
  creatorName: string;
  approverName?: string;
  progressPercentage: number;
  donationCount: number;
  daysRemaining: number;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  pendingCampaigns: number;
  completedCampaigns: number;
  totalTargetAmount: number;
  totalRaisedAmount: number;
  averageSuccess: number;
  categoryStats: CategoryStats[];
}

export interface CategoryStats {
  category: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface CampaignFilters {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CampaignApproval {
  isApproved: boolean;
  rejectionReason?: string;
  isFeatured?: boolean;
}

export interface CampaignUpdate {
  id: number;
  title: string;
  content: string;
  imagePath?: string;
  createdAt: string;
  creatorName: string;
}

export interface Donation {
  id: number;
  amount: number;
  donorName: string;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
  completedAt?: string;
  status?: string;
}

class CampaignService {
  // Create new campaign
  async createCampaign(formData: FormData): Promise<{
    message: string;
    campaignId: number;
  }> {
    const response = await fetch('http://localhost:5000/api/campaign/admin/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get all campaigns for admin
  async getAllCampaigns(filters: CampaignFilters = {}): Promise<{
    campaigns: Campaign[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    
    // Only add status filter if it's not 'all' 
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    // Only add category filter if it's not empty
    if (filters.category && filters.category !== '') {
      params.append('category', filters.category);
    }
    
    if (filters.search) params.append('search', filters.search);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    try {
      const result = await api.get<{
        campaigns: Campaign[];
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>(`/campaign/admin/all?${params.toString()}`);
      return result;
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      throw error;
    }
  }

  // Get pending campaigns
  async getPendingCampaigns(): Promise<Campaign[]> {
    return api.get('/campaign/admin/pending');
  }

  // Approve or reject campaign
  async approveCampaign(id: number, approval: CampaignApproval): Promise<{
    message: string;
    campaign: {
      id: number;
      status: string;
      approvedAt?: string;
      isFeatured: boolean;
      rejectionReason?: string;
    };
  }> {
    return api.post(`/campaign/admin/approve/${id}`, approval);
  }

  // Update campaign
  async updateCampaign(id: number, formData: FormData): Promise<{ message: string }> {
    const response = await fetch(`http://localhost:5000/api/campaign/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'An error occurred' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Delete campaign
  async deleteCampaign(id: number): Promise<{ message: string }> {
    return api.delete(`/campaign/admin/${id}`);
  }

  // Get campaign statistics
  async getCampaignStats(): Promise<CampaignStats> {
    return api.get('/campaign/admin/stats');
  }

  // Toggle featured status
  async toggleFeaturedStatus(id: number): Promise<{
    message: string;
    isFeatured: boolean;
  }> {
    return api.post(`/campaign/admin/feature/${id}`, {});
  }

  // Get campaign details with donations and updates
  async getCampaignDetails(id: number): Promise<{
    campaign: Campaign;
    donations: Donation[];
    updates: CampaignUpdate[];
    donationStats: Array<{ Date: string; Amount: number; Count: number }>;
  }> {
    return api.get(`/campaign/${id}/details`);
  }
}

export default new CampaignService();
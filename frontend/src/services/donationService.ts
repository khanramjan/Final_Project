import api from './api';

export interface DonationOverview {
  id: number;
  amount: number;
  donorName: string;
  message?: string;
  isAnonymous: boolean;
  status: string;
  createdAt: string;
  completedAt?: string;
}

export interface DonationStats {
  totalAmount: number;
  totalDonations: number;
  averageAmount: number;
  todayAmount: number;
  todayCount: number;
  monthlyAmount: number;
  monthlyCount: number;
  completedDonations: number;
  pendingDonations: number;
  failedDonations: number;
  successRate: number;
  monthlyTrend: Array<{
    month: string;
    amount: number;
    count: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    count: number;
    percentage: number;
  }>;
}

export interface DonationFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  campaignId?: number;
}

export interface RefundRequest {
  reason?: string;
}

export interface StatusUpdate {
  status: string;
}

class DonationService {
  // Get all donations for admin
  async getAllDonations(filters: DonationFilters = {}): Promise<{
    donations: DonationOverview[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.campaignId) params.append('campaignId', filters.campaignId.toString());

    return api.get(`/donation/admin/all?${params.toString()}`);
  }

  // Get donation statistics
  async getDonationStats(): Promise<DonationStats> {
    return api.get('/donation/admin/stats');
  }

  // Get recent donations
  async getRecentDonations(limit: number = 10): Promise<Array<{
    id: number;
    amount: number;
    donorName: string;
    campaignTitle: string;
    status: string;
    createdAt: string;
    paymentMethod: string;
  }>> {
    return api.get(`/donation/admin/recent?limit=${limit}`);
  }

  // Refund donation
  async refundDonation(id: number, refundData: RefundRequest): Promise<{ message: string }> {
    return api.post(`/donation/admin/${id}/refund`, refundData);
  }

  // Update donation status
  async updateDonationStatus(id: number, statusData: StatusUpdate): Promise<{ message: string }> {
    return api.put(`/donation/admin/${id}/status`, statusData);
  }

  // Export donations
  async exportDonations(
    format: string = 'csv',
    filters: {
      startDate?: string;
      endDate?: string;
      status?: string;
      campaignId?: number;
    } = {}
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.status) params.append('status', filters.status);
    if (filters.campaignId) params.append('campaignId', filters.campaignId.toString());

    const response = await fetch(`http://localhost:5000/api/donation/admin/export?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }
}

export default new DonationService();
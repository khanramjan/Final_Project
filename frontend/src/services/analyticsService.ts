import api from './api';

export interface AnalyticsOverview {
  overview: {
    totalUsers: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalDonations: number;
    totalAmount: number;
    averageDonation: number;
    successRate: number;
  };
  today: {
    donations: number;
    amount: number;
    newUsers: number;
  };
  weekly: {
    donations: number;
    amount: number;
  };
  monthly: {
    donations: number;
    amount: number;
    growth: number;
  };
}

export interface DonationTrend {
  month: string;
  amount: number;
  count: number;
  average: number;
}

export interface CampaignPerformance {
  id: number;
  title: string;
  targetAmount: number;
  raisedAmount: number;
  donationCount: number;
  progressPercentage: number;
  averageDonation: number;
  category: string;
  daysActive: number;
  isUrgent: boolean;
  isFeatured: boolean;
}

export interface CategoryBreakdown {
  category: string;
  campaignCount: number;
  totalRaised: number;
  averageRaised: number;
  donationCount: number;
  percentage: number;
}

export interface UserInsights {
  userTypes: Array<{
    userType: string;
    count: number;
    percentage: number;
  }>;
  newUsersThisMonth: number;
  registrationTrends: Array<{
    month: string;
    registrations: Array<{
      userType: string;
      count: number;
    }>;
  }>;
  topDonors: Array<{
    id: number;
    name: string;
    email: string;
    donationCount: number;
    totalDonated: number;
    lastDonation?: string;
  }>;
}

export interface PaymentInsights {
  paymentMethods: Array<{
    paymentMethod: string;
    count: number;
    totalAmount: number;
    averageAmount: number;
    percentage: number;
  }>;
  donationRanges: Array<{
    range: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface RecentActivity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  status: string;
  userName?: string;
  relatedEntity?: string;
  relatedEntityId?: number;
}

export interface CampaignMetric {
  id: number;
  title: string;
  category: string;
  targetAmount: number;
  raisedAmount: number;
  donationCount: number;
  status: string;
  isUrgent: boolean;
  isFeatured: boolean;
  progressPercentage: number;
  averageDonation: number;
  daysActive: number;
  lastDonationDate?: string;
  imagePath?: string;
}

class AnalyticsService {
  // Get dashboard analytics
  async getDashboardAnalytics(): Promise<AnalyticsOverview> {
    return api.get('/analytics/dashboard');
  }

  // Get donation trends
  async getDonationTrends(months: number = 12): Promise<DonationTrend[]> {
    return api.get(`/analytics/donation-trends?months=${months}`);
  }

  // Get campaign performance
  async getCampaignPerformance(limit: number = 10): Promise<CampaignPerformance[]> {
    return api.get(`/analytics/campaign-performance?limit=${limit}`);
  }

  // Get category breakdown
  async getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
    return api.get('/analytics/category-breakdown');
  }

  // Get user insights
  async getUserInsights(): Promise<UserInsights> {
    return api.get('/analytics/user-insights');
  }

  // Get payment insights
  async getPaymentInsights(): Promise<PaymentInsights> {
    return api.get('/analytics/payment-insights');
  }

  // Get recent activities
  async getRecentActivities(limit: number = 20): Promise<RecentActivity[]> {
    return api.get(`/analytics/recent-activities?limit=${limit}`);
  }

  // Get campaign metrics
  async getCampaignMetrics(): Promise<CampaignMetric[]> {
    return api.get('/analytics/campaign-metrics');
  }

  // Export analytics
  async exportAnalytics(
    type: string = 'overview',
    format: string = 'csv',
    filters: {
      startDate?: string;
      endDate?: string;
    } = {}
  ): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('type', type);
    params.append('format', format);
    
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await fetch(`http://localhost:5000/api/analytics/export?${params.toString()}`, {
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

export default new AnalyticsService();
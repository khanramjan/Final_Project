import api from './api';

export interface DashboardStats {
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

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  phone?: string;
  address?: string;
  organization?: string;
  skills?: string;
  interests?: string;
}

export interface UsersPagedResult {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface Activity {
  id: number;
  type: string;
  message: string;
  timestamp: string;
  status: string;
  userName?: string;
  relatedEntity?: string;
  relatedEntityId?: number;
}

export interface UsersFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  userType?: string;
  isActive?: boolean;
}

export interface CreateAdminData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

class AdminService {
  // Dashboard Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  }

  async getRecentActivity(limit: number = 10): Promise<Activity[]> {
    const response = await api.get(`/analytics/recent-activities?limit=${limit}`);
    return response.data;
  }

  // User Management
  async getUsers(filters: UsersFilters = {}): Promise<UsersPagedResult> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.userType) params.append('userType', filters.userType);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());

    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  }

  async getUser(id: number): Promise<User> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<void> {
    await api.put(`/admin/users/${id}`, userData);
  }

  async deleteUser(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }

  async toggleUserStatus(id: number): Promise<{ message: string; isActive: boolean }> {
    const response = await api.post(`/admin/users/${id}/toggle-status`);
    return response.data;
  }

  async createAdminUser(adminData: CreateAdminData): Promise<void> {
    await api.post('/auth/create-admin', adminData);
  }
}

export default new AdminService();
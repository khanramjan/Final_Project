import api from './api';
import type {
  VolunteerProfile,
  CreateVolunteerProfile,
  UpdateVolunteerProfile,
  VolunteerRequest,
  AcceptRequest,
  DeclineRequest,
  VolunteerAssignment,
  CheckIn,
  CheckOut,
  UpdateProgress,
  VolunteerDashboard,
  VolunteerHistory,
  VolunteerAchievement,
} from '../types/volunteer.types';

class VolunteerService {
  // ===== PROFILE MANAGEMENT =====

  async getMyProfile(): Promise<VolunteerProfile> {
    return api.get<VolunteerProfile>('/volunteer/profile');
  }

  async createProfile(data: CreateVolunteerProfile): Promise<VolunteerProfile> {
    return api.post<VolunteerProfile>('/volunteer/profile', data);
  }

  async updateProfile(data: UpdateVolunteerProfile): Promise<VolunteerProfile> {
    return api.put<VolunteerProfile>('/volunteer/profile', data);
  }

  // ===== REQUESTS MANAGEMENT =====

  async getMyRequests(status?: string): Promise<VolunteerRequest[]> {
    const endpoint = status ? `/volunteer/requests?status=${status}` : '/volunteer/requests';
    return api.get<VolunteerRequest[]>(endpoint);
  }

  async getPendingRequests(): Promise<VolunteerRequest[]> {
    return api.get<VolunteerRequest[]>('/volunteer/requests/pending');
  }

  async getNewRequestsCount(): Promise<{ 
    count: number; 
    hasNew: boolean; 
    requests: Array<{
      id: number;
      title: string;
      campaignTitle: string;
      priority: string;
      createdAt: string;
    }>;
  }> {
    return api.get<{ 
      count: number; 
      hasNew: boolean; 
      requests: Array<{
        id: number;
        title: string;
        campaignTitle: string;
        priority: string;
        createdAt: string;
      }>;
    }>('/volunteer/requests/new-count');
  }

  async acceptRequest(data: AcceptRequest): Promise<VolunteerAssignment> {
    return api.post<VolunteerAssignment>('/volunteer/requests/accept', data);
  }

  async declineRequest(data: DeclineRequest): Promise<{ message: string }> {
    return api.post<{ message: string }>('/volunteer/requests/decline', data);
  }

  // ===== ASSIGNMENTS MANAGEMENT =====

  async getMyAssignments(status?: string): Promise<VolunteerAssignment[]> {
    const endpoint = status ? `/volunteer/assignments?status=${status}` : '/volunteer/assignments';
    return api.get<VolunteerAssignment[]>(endpoint);
  }

  async getActiveAssignments(): Promise<VolunteerAssignment[]> {
    return api.get<VolunteerAssignment[]>('/volunteer/assignments/active');
  }

  async getAssignment(id: number): Promise<VolunteerAssignment> {
    return api.get<VolunteerAssignment>(`/volunteer/assignments/${id}`);
  }

  async checkIn(data: CheckIn): Promise<VolunteerAssignment> {
    return api.post<VolunteerAssignment>('/volunteer/assignments/checkin', data);
  }

  async checkOut(data: CheckOut): Promise<VolunteerAssignment> {
    return api.post<VolunteerAssignment>('/volunteer/assignments/checkout', data);
  }

  async updateProgress(data: UpdateProgress): Promise<VolunteerAssignment> {
    return api.put<VolunteerAssignment>('/volunteer/assignments/progress', data);
  }

  // ===== DASHBOARD & STATISTICS =====

  async getDashboard(): Promise<VolunteerDashboard> {
    return api.get<VolunteerDashboard>('/volunteer/dashboard');
  }

  async getHistory(page: number = 1, pageSize: number = 20): Promise<VolunteerHistory> {
    return api.get<VolunteerHistory>(`/volunteer/history?page=${page}&pageSize=${pageSize}`);
  }

  async getAchievements(): Promise<VolunteerAchievement[]> {
    return api.get<VolunteerAchievement[]>('/volunteer/achievements');
  }

  // ===== HELPER METHODS =====

  async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Failed to get location: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    
    // Parse the UTC date string and convert to local time
    const date = new Date(dateString);
    
    // Format in local timezone
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    }).format(date);
  }

  getPriorityColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'assigned':
        return 'text-purple-600 bg-purple-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'declined':
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusText(status: string): string {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // ===== RANK HELPERS =====

  getRankColor(rank: string): string {
    switch (rank) {
      case 'Gold':
        return 'text-yellow-900 bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 'Silver':
        return 'text-gray-700 bg-gradient-to-r from-gray-300 to-gray-500';
      case 'Bronze':
        return 'text-orange-900 bg-gradient-to-r from-orange-400 to-orange-700';
      case 'Iron':
        return 'text-gray-800 bg-gradient-to-r from-gray-400 to-gray-600';
      case 'Newbie':
      default:
        return 'text-gray-700 bg-gray-200';
    }
  }

  getRankBadgeColor(rank: string): string {
    switch (rank) {
      case 'Gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Silver':
        return 'bg-gray-200 text-gray-800 border-gray-400';
      case 'Bronze':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Iron':
        return 'bg-gray-300 text-gray-900 border-gray-500';
      case 'Newbie':
      default:
        return 'bg-gray-100 text-gray-600 border-gray-300';
    }
  }

  getRankIcon(rank: string): string {
    switch (rank) {
      case 'Gold':
        return '🏆';
      case 'Silver':
        return '🥈';
      case 'Bronze':
        return '�';
      case 'Iron':
        return '⚙️';
      case 'Newbie':
      default:
        return '🌱';
    }
  }

  getNextRank(currentRank: string): { rank: string; campaignsNeeded: number } {
    const rankProgression: Record<string, { next: string; required: number }> = {
      Newbie: { next: 'Iron', required: 5 },
      Iron: { next: 'Bronze', required: 10 },
      Bronze: { next: 'Silver', required: 15 },
      Silver: { next: 'Gold', required: 20 },
      Gold: { next: 'Gold', required: 0 },
    };

    const progression = rankProgression[currentRank] || rankProgression.Newbie;
    return { rank: progression.next, campaignsNeeded: progression.required };
  }

  getRankProgress(completedCampaigns: number, currentRank: string): number {
    const next = this.getNextRank(currentRank);
    if (next.rank === currentRank) return 100; // Max rank

    const rankRequirements: Record<string, number> = {
      Newbie: 0,
      Iron: 5,
      Bronze: 10,
      Silver: 15,
      Gold: 20,
    };

    const currentRequired = rankRequirements[currentRank] || 0;
    const nextRequired = next.campaignsNeeded;
    const progress = ((completedCampaigns - currentRequired) / (nextRequired - currentRequired)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  }
}

export default new VolunteerService();

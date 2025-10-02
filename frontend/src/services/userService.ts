import api from './api';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class UserService {
  async updateProfile(data: UpdateProfileData): Promise<any> {
    const response = await api.put('/auth/profile', data);
    return response;
  }

  async changePassword(data: ChangePasswordData): Promise<any> {
    const response = await api.post('/auth/change-password', data);
    return response;
  }
}

export default new UserService();

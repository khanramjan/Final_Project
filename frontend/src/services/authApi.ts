const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  userType: 'donor' | 'volunteer';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  address?: string;
  organization?: string;
  skills?: string;
  interests?: string;
  nidPhoto?: File;
  volunteerPhoto?: File;
  utilityBill?: File;
}

export interface AuthResponse {
  message: string;
  token: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    isActive: boolean;
    isEmailVerified?: boolean;
  };
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

class AuthApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const formData = new FormData();
    
    // Append all the text fields
    formData.append('userType', userData.userType);
    formData.append('firstName', userData.firstName);
    formData.append('lastName', userData.lastName);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('phone', userData.phone);
    
    if (userData.address) formData.append('address', userData.address);
    if (userData.organization) formData.append('organization', userData.organization);
    if (userData.skills) formData.append('skills', userData.skills);
    if (userData.interests) formData.append('interests', userData.interests);
    
    // Append files if they exist
    if (userData.nidPhoto) formData.append('nidPhoto', userData.nidPhoto);
    if (userData.volunteerPhoto) formData.append('volunteerPhoto', userData.volunteerPhoto);
    if (userData.utilityBill) formData.append('utilityBill', userData.utilityBill);

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: formData, // Don't set Content-Type header for FormData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    return response.json();
  }

  async refreshToken(refreshData: RefreshTokenRequest): Promise<{ token: string; refreshToken: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refreshData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Token refresh failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Even if logout fails on server, we'll clear local storage
      console.warn('Server logout failed, but clearing local storage');
    }

    // Clear local storage regardless
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  }

  async verifyEmail(token: string): Promise<{ message: string; alreadyVerified?: boolean }> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Email verification failed');
    }

    return response.json();
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to resend verification email');
    }

    return response.json();
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get current user');
    }

    return response.json();
  }
}

export const authApiService = new AuthApiService();
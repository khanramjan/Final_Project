import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'viewer';
  isActive: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  tokenExpiry: number | null;
}

// Helper function to check if token is expired
const isTokenExpired = (expiry: number | null): boolean => {
  if (!expiry) return false;
  return Date.now() >= expiry;
};

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  const expiryTime = tokenExpiry ? parseInt(tokenExpiry) : null;
  
  // Check if token exists and is not expired
  const isValidToken = token && !isTokenExpired(expiryTime);
  
  if (!isValidToken && token) {
    // Clean up expired token
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
  }

  return {
    user: null,
    token: isValidToken ? token : null,
    loading: false,
    error: null,
    isAuthenticated: !!isValidToken,
    tokenExpiry: isValidToken ? expiryTime : null,
  };
};

const initialState: AuthState = getInitialState();

// Mock login for development - replace with real API call
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock validation - replace with real API call
    if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
      const token = 'mock-jwt-token-admin';
      const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      const user: User = {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiry', expiry.toString());
      
      return { user, token, expiry };
    } else if (credentials.email === 'manager@example.com' && credentials.password === 'manager123') {
      const token = 'mock-jwt-token-manager';
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      const user: User = {
        id: 2,
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager',
        isActive: true
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiry', expiry.toString());
      
      return { user, token, expiry };
    } else if (credentials.email === 'viewer@example.com' && credentials.password === 'viewer123') {
      const token = 'mock-jwt-token-viewer';
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      const user: User = {
        id: 3,
        email: 'viewer@example.com',
        firstName: 'Viewer',
        lastName: 'User',
        role: 'viewer',
        isActive: true
      };
      
      localStorage.setItem('token', token);
      localStorage.setItem('tokenExpiry', expiry.toString());
      
      return { user, token, expiry };
    } else {
      throw new Error('Invalid email or password');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: { 
    email: string; 
    password: string; 
    firstName: string; 
    lastName: string; 
  }) => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock registration - replace with real API call
    const token = 'mock-jwt-token-new-user';
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    const user: User = {
      id: Date.now(), // Mock ID
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'viewer', // Default role for new users
      isActive: true
    };
    
    localStorage.setItem('token', token);
    localStorage.setItem('tokenExpiry', expiry.toString());
    
    return { user, token, expiry };
  }
);

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    
    // Check if token is expired
    if (isTokenExpired(state.auth.tokenExpiry)) {
      throw new Error('Token expired');
    }
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock user data based on token - replace with real API call
    if (state.auth.token === 'mock-jwt-token-admin') {
      return {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin' as const,
        isActive: true
      };
    } else if (state.auth.token === 'mock-jwt-token-manager') {
      return {
        id: 2,
        email: 'manager@example.com',
        firstName: 'Manager',
        lastName: 'User',
        role: 'manager' as const,
        isActive: true
      };
    } else if (state.auth.token === 'mock-jwt-token-viewer') {
      return {
        id: 3,
        email: 'viewer@example.com',
        firstName: 'Viewer',
        lastName: 'User',
        role: 'viewer' as const,
        isActive: true
      };
    } else {
      throw new Error('Invalid token');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newToken = state.auth.token + '-refreshed';
    const newExpiry = Date.now() + (24 * 60 * 60 * 1000);
    
    localStorage.setItem('token', newToken);
    localStorage.setItem('tokenExpiry', newExpiry.toString());
    
    return { token: newToken, expiry: newExpiry };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.tokenExpiry = null;
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
    },
    clearError: (state) => {
      state.error = null;
    },
    checkTokenExpiry: (state) => {
      if (isTokenExpired(state.tokenExpiry)) {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.tokenExpiry = null;
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.tokenExpiry = action.payload.expiry;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.tokenExpiry = null;
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.tokenExpiry = action.payload.expiry;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Fetch current user cases
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.tokenExpiry = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
      })
      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.tokenExpiry = action.payload.expiry;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.tokenExpiry = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiry');
      });
  },
});

export const { logout, clearError, checkTokenExpiry } = authSlice.actions;
export default authSlice.reducer;

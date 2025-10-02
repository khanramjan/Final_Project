import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApiService, LoginRequest, RegisterRequest } from '../../services/authApi';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  isActive: boolean;
  isEmailVerified?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
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
  const refreshToken = localStorage.getItem('refreshToken');
  const tokenExpiry = localStorage.getItem('tokenExpiry');
  const userData = localStorage.getItem('user');
  const expiryTime = tokenExpiry ? parseInt(tokenExpiry) : null;
  
  // Check if token exists and is not expired
  const isValidToken = token && !isTokenExpired(expiryTime);
  
  if (!isValidToken && token) {
    // Clean up expired token
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
  }

  let user: User | null = null;
  if (isValidToken && userData) {
    try {
      user = JSON.parse(userData);
    } catch {
      user = null;
    }
  }

  return {
    user: user,
    token: isValidToken ? token : null,
    refreshToken: isValidToken ? refreshToken : null,
    loading: false,
    error: null,
    isAuthenticated: !!isValidToken,
    tokenExpiry: isValidToken ? expiryTime : null,
  };
};

const initialState: AuthState = getInitialState();

// Real login using API
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest) => {
    const response = await authApiService.login(credentials);
    
    // Calculate expiry time (24 hours from now)
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    
    // Store in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('tokenExpiry', expiry.toString());
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return { 
      user: response.user, 
      token: response.token, 
      refreshToken: response.refreshToken,
      expiry 
    };
  }
);

// Real registration using API
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterRequest) => {
    const response = await authApiService.register(userData);
    
    // Calculate expiry time (24 hours from now)
    const expiry = Date.now() + (24 * 60 * 60 * 1000);
    
    // Store in localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('tokenExpiry', expiry.toString());
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return { 
      user: response.user, 
      token: response.token, 
      refreshToken: response.refreshToken,
      expiry 
    };
  }
);

// Refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState }) => {
    const state = getState() as { auth: AuthState };
    
    if (!state.auth.token || !state.auth.refreshToken) {
      throw new Error('No tokens available');
    }

    const response = await authApiService.refreshToken({
      token: state.auth.token,
      refreshToken: state.auth.refreshToken
    });
    
    const newExpiry = Date.now() + (24 * 60 * 60 * 1000);
    
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('tokenExpiry', newExpiry.toString());
    
    return { 
      token: response.token, 
      refreshToken: response.refreshToken,
      expiry: newExpiry 
    };
  }
);

// Logout
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await authApiService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.tokenExpiry = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    checkTokenExpiry: (state) => {
      if (isTokenExpired(state.tokenExpiry)) {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.tokenExpiry = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
      }
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
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
        state.refreshToken = action.payload.refreshToken;
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
        state.refreshToken = null;
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
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiry = action.payload.expiry;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Registration failed';
      })
      // Refresh token cases
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.tokenExpiry = action.payload.expiry;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.tokenExpiry = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('user');
      })
      // Logout cases
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.tokenExpiry = null;
      });
  },
});

export const { logout, clearError, checkTokenExpiry, updateUser } = authSlice.actions;
export default authSlice.reducer;

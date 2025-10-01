import { createListenerMiddleware } from '@reduxjs/toolkit';
import { refreshToken, checkTokenExpiry, logout } from '../slices/authSlice';
import type { RootState, AppDispatch } from '..';

// Create the listener middleware
export const authMiddleware = createListenerMiddleware();

// Token refresh interval (check every 5 minutes)
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000;

// Set up automatic token expiry checking
let tokenCheckInterval: number | null = null;

const startTokenRefreshTimer = (dispatch: AppDispatch, getState: () => RootState) => {
  // Clear existing interval
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
  }

  tokenCheckInterval = setInterval(() => {
    const state = getState();
    const { isAuthenticated, tokenExpiry, refreshToken: refreshTokenValue } = state.auth;

    if (!isAuthenticated || !tokenExpiry || !refreshTokenValue) {
      return;
    }

    // Check if token expires in the next 15 minutes
    const timeUntilExpiry = tokenExpiry - Date.now();
    const fifteenMinutes = 15 * 60 * 1000;

    if (timeUntilExpiry <= fifteenMinutes && timeUntilExpiry > 0) {
      // Token is expiring soon, refresh it
      dispatch(refreshToken());
    } else if (timeUntilExpiry <= 0) {
      // Token has expired, check and logout if necessary
      dispatch(checkTokenExpiry());
    }
  }, TOKEN_CHECK_INTERVAL);
};

const stopTokenRefreshTimer = () => {
  if (tokenCheckInterval) {
    clearInterval(tokenCheckInterval);
    tokenCheckInterval = null;
  }
};

// Listen for login success to start token refresh timer
authMiddleware.startListening({
  predicate: (_, currentState, previousState) => {
    const prevAuth = (previousState as RootState).auth;
    const currentAuth = (currentState as RootState).auth;
    
    // Start timer when user becomes authenticated
    return !prevAuth.isAuthenticated && currentAuth.isAuthenticated;
  },
  effect: (_, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    startTokenRefreshTimer(dispatch as AppDispatch, getState as () => RootState);
  },
});

// Listen for logout to stop token refresh timer
authMiddleware.startListening({
  predicate: (_, currentState, previousState) => {
    const prevAuth = (previousState as RootState).auth;
    const currentAuth = (currentState as RootState).auth;
    
    // Stop timer when user becomes unauthenticated
    return prevAuth.isAuthenticated && !currentAuth.isAuthenticated;
  },
  effect: () => {
    stopTokenRefreshTimer();
  },
});

// Listen for token refresh failures to logout user
authMiddleware.startListening({
  actionCreator: refreshToken.rejected,
  effect: (_, listenerApi) => {
    const { dispatch } = listenerApi;
    console.warn('Token refresh failed, logging out user');
    dispatch(logout());
  },
});

// Auto-start timer if user is already authenticated on app load
export const initializeAuthMiddleware = (dispatch: AppDispatch, getState: () => RootState) => {
  const state = getState();
  if (state.auth.isAuthenticated) {
    startTokenRefreshTimer(dispatch, getState);
  }
};
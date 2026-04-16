import { describe, it, expect, beforeEach } from 'vitest';
import reducer, { logout, clearError, updateUser, login } from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    tokenExpiry: null,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('should return initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle logout', () => {
    const loggedInState = {
      ...initialState,
      user: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', userType: 'donor', isActive: true },
      token: 'fake-token',
      isAuthenticated: true,
    };
    
    // Set some localStorage items that logout should clear
    localStorage.setItem('token', 'fake-token');
    
    const state = reducer(loggedInState, logout());
    
    expect(state).toEqual(initialState);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should handle clearError', () => {
    const errorState = {
      ...initialState,
      error: 'Some error message',
    };
    expect(reducer(errorState, clearError())).toEqual(initialState);
  });

  it('should handle updateUser', () => {
    const loggedInState = {
      ...initialState,
      user: { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', userType: 'donor', isActive: true },
    };
    
    const state = reducer(loggedInState, updateUser({ firstName: 'Updated' }));
    
    expect(state.user?.firstName).toBe('Updated');
    expect(state.user?.email).toBe('test@example.com');
  });

  it('should handle login.pending', () => {
    const state = reducer(initialState, { type: login.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle login.fulfilled', () => {
    const user = { id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', userType: 'donor', isActive: true };
    const payload = {
      user,
      token: 'token123',
      refreshToken: 'refresh123',
      expiry: Date.now() + 86400000,
    };
    
    const state = reducer(initialState, { type: login.fulfilled.type, payload });
    
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('token123');
    expect(state.user).toEqual(user);
  });

  it('should handle login.rejected', () => {
    const state = reducer(initialState, {
      type: login.rejected.type,
      error: { message: 'Invalid credentials' }
    });
    
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Invalid credentials');
    expect(state.isAuthenticated).toBe(false);
  });
});

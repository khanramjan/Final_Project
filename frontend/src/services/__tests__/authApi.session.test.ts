import { describe, it, expect, beforeEach } from 'vitest';
import { authApiService } from '../authApi';

describe('authApiService session flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('refreshToken returns renewed credentials', async () => {
    const result = await authApiService.refreshToken({
      token: 'old-jwt-token',
      refreshToken: 'old-refresh-token',
    });

    expect(result.token).toBe('new-jwt-token');
    expect(result.refreshToken).toBe('new-refresh-token');
  });

  it('logout clears local storage tokens even when server call succeeds', async () => {
    localStorage.setItem('token', 'jwt-token');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('tokenExpiry', '999999999');

    await authApiService.logout();

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('tokenExpiry')).toBeNull();
  });
});

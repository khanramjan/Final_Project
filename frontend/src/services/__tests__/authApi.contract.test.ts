import { describe, it, expect } from 'vitest';
import { authApiService } from '../authApi';

const isAuthUser = (value: unknown): value is {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  isActive: boolean;
} => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'number' &&
    typeof v.email === 'string' &&
    typeof v.firstName === 'string' &&
    typeof v.lastName === 'string' &&
    typeof v.userType === 'string' &&
    typeof v.isActive === 'boolean'
  );
};

describe('authApi contract tests', () => {
  it('login response matches expected auth contract', async () => {
    const response = await authApiService.login({
      email: 'test@example.com',
      password: 'password123'
    });

    expect(typeof response.message).toBe('string');
    expect(typeof response.token).toBe('string');
    expect(typeof response.refreshToken).toBe('string');
    expect(isAuthUser(response.user)).toBe(true);
  });

  it('register response matches expected auth contract', async () => {
    const response = await authApiService.register({
      userType: 'donor',
      firstName: 'New',
      lastName: 'User',
      email: 'new@example.com',
      password: 'password123',
      phone: '0123456789',
    });

    expect(typeof response.message).toBe('string');
    expect(typeof response.token).toBe('string');
    expect(typeof response.refreshToken).toBe('string');
    expect(isAuthUser(response.user)).toBe(true);
  });
});

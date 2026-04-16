import { describe, it, expect } from 'vitest';
import { authApiService } from '../authApi';

describe('authApiService', () => {
  it('should perform login successfully', async () => {
    // This will be intercepted by MSW handlers defined in src/test/mocks/handlers.ts
    const response = await authApiService.login({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(response.token).toBe('fake-jwt-token');
    expect(response.user.email).toBe('test@example.com');
  });

  it('should perform register successfully', async () => {
    const response = await authApiService.register({
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      userType: 'donor',
      phone: '0123456789'
    });
    
    expect(response.token).toBe('fake-jwt-token');
    expect(response.user.email).toBe('new@example.com');
  });

  it('should throw error on invalid login', async () => {
    await expect(authApiService.login({
      email: 'wrong@example.com',
      password: 'wrongpassword'
    })).rejects.toThrow();
  });
});

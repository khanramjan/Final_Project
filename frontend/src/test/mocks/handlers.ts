import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('http://localhost:5000/api/auth/login', async ({ request }) => {
    const body = await request.json() as any;
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        message: 'Login successful',
        token: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
        user: {
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          userType: 'donor',
          isActive: true,
        }
      });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.post('http://localhost:5000/api/auth/register', async () => {
    return HttpResponse.json({
      message: 'Registration successful',
      token: 'fake-jwt-token',
      refreshToken: 'fake-refresh-token',
      user: {
        id: 2,
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        userType: 'donor',
        isActive: true,
      }
    });
  }),
  
  http.post('http://localhost:5000/api/auth/refresh-token', async () => {
    return HttpResponse.json({
      token: 'new-jwt-token',
      refreshToken: 'new-refresh-token'
    });
  }),

  http.post('http://localhost:5000/api/auth/logout', async () => {
    return HttpResponse.json({ message: 'Logout successful' });
  }),

  http.get('http://localhost:5000/api/campaign/admin/all', async () => {
    return HttpResponse.json({
      campaigns: [
        {
          id: 1,
          title: 'Health Support Campaign',
          description: 'Help families with urgent healthcare support.',
          targetAmount: 10000,
          raisedAmount: 4500,
          startDate: '2026-04-01',
          endDate: '2026-05-01',
          status: 'active',
          category: 'health',
          isUrgent: true,
          isFeatured: false,
          createdAt: '2026-04-01T10:00:00Z',
          creatorName: 'Admin User',
          progressPercentage: 45,
          donationCount: 12,
          daysRemaining: 24,
        }
      ],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1
    });
  })
];

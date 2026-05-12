import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ProtectedRoute from '../../components/ProtectedRoute';

const renderWithProvider = (
  isAuthenticated: boolean,
  requiredRole?: 'admin' | 'manager' | 'viewer',
  userType: string = 'admin'
) => {
  const store = configureStore({
    reducer: {
      auth: (state = { isAuthenticated, user: isAuthenticated ? { userType } : null }) => state as any
    }
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
          <Route path="/protected" element={
            <ProtectedRoute requiredRole={requiredRole}>
              <div>Protected Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderWithProvider(false);
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated without roles', () => {
    renderWithProvider(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when authenticated with correct role', () => {
    renderWithProvider(true, 'viewer');
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows access denied when authenticated but wrong role', () => {
    renderWithProvider(true, 'admin', 'donor');
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });
});

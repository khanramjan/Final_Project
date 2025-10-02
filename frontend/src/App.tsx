import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { store } from './store';
import { initializeAuthMiddleware } from './store/middleware/authMiddleware';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import Donors from './pages/Donors';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import CampaignManagement from './pages/admin/CampaignManagement';
import DonationOversight from './pages/admin/DonationOversight';
import AdvancedAnalytics from './pages/admin/AdvancedAnalytics';
import SystemSettings from './pages/admin/SystemSettings';
import ProtectedRoute from './components/ProtectedRoute';
import ApiTest from './components/ApiTest';

function AppContent() {
  useEffect(() => {
    // Initialize auth middleware on app start
    initializeAuthMiddleware(store.dispatch, store.getState);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/donations" element={<Donations />} />
                  <Route path="/donors" element={<Donors />} />
                  <Route path="/campaigns" element={<Campaigns />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="campaigns" element={<CampaignManagement />} />
          <Route path="donations" element={<DonationOversight />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="advanced-analytics" element={<AdvancedAnalytics />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;

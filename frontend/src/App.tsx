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
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentCancelled from './pages/PaymentCancelled';
import CampaignDetail from './pages/CampaignDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import ModernAnalytics from './pages/admin/ModernAnalytics';
import UserManagement from './pages/admin/UserManagement';
import CampaignManagement from './pages/admin/CampaignManagement';
import DonationOversight from './pages/admin/DonationOversight';
import FinancialDashboard from './pages/admin/FinancialDashboard';
import WithdrawalManagement from './pages/Admin/WithdrawalManagement';
import SystemSettings from './pages/admin/SystemSettings';
import VolunteerApprovals from './pages/admin/VolunteerApprovals';
import VolunteerReview from './pages/admin/VolunteerReview';
import AdminVolunteerReports from './pages/admin/AdminVolunteerReports';
import ProtectedRoute from './components/ProtectedRoute';
import ApiTest from './components/ApiTest';
// Volunteer Pages
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import VolunteerRequests from './pages/volunteer/VolunteerRequests';
import MyAssignments from './pages/volunteer/MyAssignments';
import VolunteerHistoryPage from './pages/volunteer/VolunteerHistoryPage';
import VolunteerAchievementsPage from './pages/volunteer/VolunteerAchievementsPage';
import VolunteerProfilePage from './pages/volunteer/VolunteerProfilePage';
import MyReportsAndWarnings from './pages/volunteer/MyReportsAndWarnings';
import ReportVolunteer from './pages/volunteer/ReportVolunteer';
import VolunteerPhysicalDonationsPage from './pages/volunteer/VolunteerPhysicalDonationsPage';
import VolunteerVouchers from './pages/volunteer/VolunteerVouchers';
import SubmitVoucher from './pages/volunteer/SubmitVoucher';
import ConfirmPhysicalDonation from './pages/ConfirmPhysicalDonation';
// Admin Voucher Management
import VoucherManagement from './pages/admin/VoucherManagement';
import MLInsights from './pages/admin/MLInsights';
import AdminTestimonials from './pages/admin/AdminTestimonials';
// Legal Pages
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import Documentation from './pages/Documentation';
import ReserveFundPage from './pages/ReserveFundPage';
import Reviews from './pages/Reviews';

function AppContent() {
  useEffect(() => {
    // Initialize auth middleware on app start
    initializeAuthMiddleware(store.dispatch, store.getState);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/campaigns/:campaignId" element={<CampaignDetail />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/resend-verification" element={<ResendVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/failed" element={<PaymentFailed />} />
        <Route path="/payment/cancelled" element={<PaymentCancelled />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/reserve-fund" element={<ReserveFundPage />} />
        <Route path="/confirm-donation" element={<ConfirmPhysicalDonation />} />
        <Route path="/reviews" element={<Reviews />} />
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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="analytics" element={<ModernAnalytics />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="campaigns" element={<CampaignManagement />} />
          <Route path="donations" element={<DonationOversight />} />
          <Route path="financial" element={<FinancialDashboard />} />
          <Route path="withdrawals" element={<WithdrawalManagement />} />
          <Route path="volunteer-approvals" element={<VolunteerApprovals />} />
          <Route path="volunteer-review" element={<VolunteerReview />} />
          <Route path="volunteer-reports" element={<AdminVolunteerReports />} />
          <Route path="vouchers" element={<VoucherManagement />} />
          <Route path="ml-insights" element={<MLInsights />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="settings" element={<SystemSettings />} />
        </Route>
        <Route
          path="/volunteer/*"
          element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<VolunteerDashboard />} />
                  <Route path="/requests" element={<VolunteerRequests />} />
                  <Route path="/assignments" element={<MyAssignments />} />
                  <Route path="/physical-donations" element={<VolunteerPhysicalDonationsPage />} />
                  <Route path="/history" element={<VolunteerHistoryPage />} />
                  <Route path="/achievements" element={<VolunteerAchievementsPage />} />
                  <Route path="/profile" element={<VolunteerProfilePage />} />
                  <Route path="/reports-warnings" element={<MyReportsAndWarnings />} />
                  <Route path="/report-volunteer" element={<ReportVolunteer />} />
                  <Route path="/vouchers" element={<VolunteerVouchers />} />
                  <Route path="/vouchers/submit" element={<SubmitVoucher />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          }
        />
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

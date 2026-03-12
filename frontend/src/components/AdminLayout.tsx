import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import {
  HomeIcon,
  UsersIcon,
  HeartIcon,
  BanknotesIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  CheckBadgeIcon,
  ClipboardDocumentCheckIcon,
  ShieldExclamationIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import NotificationSystem from './NotificationSystem';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: HomeIcon, current: location.pathname === '/admin/dashboard' },
    { name: 'User Management', href: '/admin/users', icon: UsersIcon, current: location.pathname === '/admin/users' },
    { name: 'Campaign Management', href: '/admin/campaigns', icon: HeartIcon, current: location.pathname === '/admin/campaigns' },
    { name: 'Donations', href: '/admin/donations', icon: BanknotesIcon, current: location.pathname === '/admin/donations' },
    { name: 'Vouchers', href: '/admin/vouchers', icon: DocumentTextIcon, current: location.pathname === '/admin/vouchers' },
    { name: 'Financial Tracking', href: '/admin/financial', icon: ChartBarIcon, current: location.pathname === '/admin/financial' },
    { name: 'Withdrawals', href: '/admin/withdrawals', icon: ArrowDownTrayIcon, current: location.pathname === '/admin/withdrawals' },
    { name: 'Volunteer Approvals', href: '/admin/volunteer-approvals', icon: CheckBadgeIcon, current: location.pathname === '/admin/volunteer-approvals' },
    { name: 'Work Review', href: '/admin/volunteer-review', icon: ClipboardDocumentCheckIcon, current: location.pathname === '/admin/volunteer-review' },
    { name: 'Volunteer Reports', href: '/admin/volunteer-reports', icon: ShieldExclamationIcon, current: location.pathname === '/admin/volunteer-reports' },
    { name: 'ML Insights', href: '/admin/ml-insights', icon: SparklesIcon, current: location.pathname === '/admin/ml-insights' },
    { name: 'Settings', href: '/admin/settings', icon: CogIcon, current: location.pathname === '/admin/settings' },
  ];

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? 'bg-primary-100 text-primary-700 border-primary-300'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex h-16 items-center px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* Top header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <NotificationSystem />

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
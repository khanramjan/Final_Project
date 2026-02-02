import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  BanknotesIcon,
  HeartIcon,
  CogIcon,
  PowerIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  children?: NavigationItem[];
}

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar = ({ className = '' }: AdminSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

  const navigation: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: HomeIcon
    },
    {
      name: 'User Management',
      href: '/admin/users',
      icon: UsersIcon
    },
    {
      name: 'Campaign Management',
      href: '/admin/campaigns',
      icon: HeartIcon
    },
    {
      name: 'Donations',
      href: '/admin/donations',
      icon: BanknotesIcon
    },
    {
      name: 'Vouchers',
      href: '/admin/vouchers',
      icon: DocumentTextIcon
    },
    {
      name: 'Withdrawals',
      href: '/admin/withdrawals',
      icon: CurrencyDollarIcon
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon
    }
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 ${className}`}>
      <div className="flex flex-col h-full">
        {/* Logo and Collapse Button */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-primary-600 rounded-lg">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">DonationMS</span>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronLeftIcon className="w-4 h-4 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive: linkIsActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors group ${
                  isActive(item.href) || linkIsActive
                    ? 'bg-primary-100 text-primary-700 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="ml-3 truncate">{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && item.badge && (
                <span className="absolute left-8 top-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {typeof item.badge === 'string' && item.badge.length > 1 ? '•' : item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile and Logout */}
        <div className="p-4 border-t border-gray-200">
          {!isCollapsed && (
            <div className="flex items-center mb-3 p-2 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">System Admin</p>
                <p className="text-xs text-gray-500 truncate">admin@donationms.com</p>
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              // Handle logout
              console.log('Logging out...');
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className={`flex items-center w-full px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Logout' : undefined}
          >
            <PowerIcon className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
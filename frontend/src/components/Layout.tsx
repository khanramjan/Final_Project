import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  HomeIcon, 
  HeartIcon, 
  UsersIcon, 
  MegaphoneIcon, 
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  PowerIcon,
  Cog6ToothIcon,
  InboxIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  TrophyIcon,
  UserCircleIcon,
  BanknotesIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import volunteerService from '../services/volunteerService';
import VolunteerNotificationPopup from './VolunteerNotificationPopup';
import DemoBanner from './DemoBanner';

interface LayoutProps {
  children: React.ReactNode;
}

// Navigation items for regular users (donors)
const userNavigation = [
  { name: 'Dashboard', href: '/dashboard/', icon: HomeIcon },
  { name: 'My Donations', href: '/dashboard/donations', icon: HeartIcon },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: MegaphoneIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: Cog6ToothIcon },
];

// Navigation items for volunteer users
const volunteerNavigation = [
  { name: 'Dashboard', href: '/volunteer/', icon: HomeIcon },
  { name: 'Requests', href: '/volunteer/requests', icon: InboxIcon },
  { name: 'My Assignments', href: '/volunteer/assignments', icon: ClipboardDocumentCheckIcon },
  { name: 'Expense Vouchers', href: '/volunteer/vouchers', icon: DocumentTextIcon },
  { name: 'Physical Collection', href: '/volunteer/physical-donations', icon: BanknotesIcon },
  { name: 'History', href: '/volunteer/history', icon: ClockIcon },
  { name: 'Achievements', href: '/volunteer/achievements', icon: TrophyIcon },
  { name: 'Profile', href: '/volunteer/profile', icon: UserCircleIcon },
];

// Navigation items for admin users
const adminNavigation = [
  { name: 'Dashboard', href: '/dashboard/', icon: HomeIcon },
  { name: 'Donations', href: '/dashboard/donations', icon: HeartIcon },
  { name: 'Donors', href: '/dashboard/donors', icon: UsersIcon },
  { name: 'Campaigns', href: '/dashboard/campaigns', icon: MegaphoneIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
];

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [newRequests, setNewRequests] = useState<Array<{
    id: number;
    title: string;
    campaignTitle: string;
    priority: string;
    createdAt: string;
  }>>([]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => (state as { auth: { user: { firstName?: string; lastName?: string; email?: string; userType?: string } } }).auth.user);
  
  // Select navigation based on user role
  let navigation = userNavigation;
  if (user?.userType === 'admin') {
    navigation = adminNavigation;
  } else if (user?.userType === 'volunteer') {
    navigation = volunteerNavigation;
  }

  // Polling for new volunteer requests (only for volunteers)
  useEffect(() => {
    if (user?.userType !== 'volunteer') {
      return; // Only poll for volunteers
    }

    const checkForNewRequests = async () => {
      try {
        const response = await volunteerService.getNewRequestsCount();
        if (response.hasNew && response.requests.length > 0) {
          setNewRequests(response.requests);
          setShowNotificationPopup(true);
        }
      } catch {
        // Silently fail - don't show errors for background polling
      }
    };

    // Check immediately on mount
    checkForNewRequests();

    // Then poll every 15 seconds (faster for testing)
    const interval = setInterval(checkForNewRequests, 15000);

    return () => clearInterval(interval);
  }, [user?.userType]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-primary-600">DonationMS</h1>
          <button
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-3 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <PowerIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Welcome back, {user?.firstName}!
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          <DemoBanner />
          {children}
        </main>
      </div>

      {/* Volunteer Notification Popup */}
      {showNotificationPopup && newRequests.length > 0 && (
        <VolunteerNotificationPopup
          requests={newRequests}
          onClose={() => {
            setShowNotificationPopup(false);
            setNewRequests([]);
          }}
        />
      )}
    </div>
  );
};

export default Layout;

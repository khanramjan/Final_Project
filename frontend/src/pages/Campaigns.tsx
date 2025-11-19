import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import { logout } from '../store/slices/authSlice';
import DonationModal from '../components/DonationModal';
import CampaignPoster from '../components/Volunteer/CampaignPoster';
import { 
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClockIcon,
  HeartIcon,
  PowerIcon
} from '@heroicons/react/24/outline';

const Campaigns = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { campaigns, loading, error } = useAppSelector((state) => state.campaigns);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const [posterCampaign, setPosterCampaign] = useState<any>(null);
  
  // Check if we're in the dashboard (authenticated view)
  const isInDashboard = location.pathname.startsWith('/dashboard');

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    dispatch(fetchCampaigns());
  }, [dispatch]);

  // Filter campaigns based on search and filters
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || campaign.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get unique categories for filter dropdown
  const categories = [...new Set(campaigns.map(campaign => campaign.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header - Only show for public users */}
        {!isInDashboard && (
          <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                      <HeartIcon className="h-6 w-6 text-white" />
                    </div>
                    <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Donation Management System</span>
                  </Link>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                  <Link to="/campaigns" className="text-primary-600 hover:text-primary-700 px-3 py-2 text-sm font-semibold transition-colors">Campaigns</Link>
                  <a href="/#testimonials" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Impact Stories</a>
                  <a href="/#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                </div>
                <div className="flex items-center space-x-4">
                  {isAuthenticated && user ? (
                    <>
                      <div className="hidden sm:flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.firstName.charAt(0)}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <PowerIcon className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/login" 
                        className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
        )}

        <div className={isInDashboard ? '' : 'pt-16'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                <p className="text-gray-600">Explore and support active fundraising campaigns</p>
              </div>
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header - Only show for public users */}
        {!isInDashboard && (
          <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <Link to="/" className="flex items-center">
                    <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                      <HeartIcon className="h-6 w-6 text-white" />
                    </div>
                    <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Donation Management System</span>
                  </Link>
                </div>
                <div className="hidden md:flex items-center space-x-8">
                  <Link to="/campaigns" className="text-primary-600 hover:text-primary-700 px-3 py-2 text-sm font-semibold transition-colors">Campaigns</Link>
                  <a href="/#testimonials" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Impact Stories</a>
                  <a href="/#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                </div>
                <div className="flex items-center space-x-4">
                  {isAuthenticated && user ? (
                    <>
                      <div className="hidden sm:flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{user.firstName.charAt(0)}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <PowerIcon className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link 
                        to="/login" 
                        className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </nav>
        )}

        <div className={isInDashboard ? '' : 'pt-16'}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                <p className="text-gray-600">Explore and support active fundraising campaigns</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">Error loading campaigns: {error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header - Only show for public/unauthenticated users */}
      {!isInDashboard && (
        <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 fixed w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                  <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                    <HeartIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Donation Management System</span>
                </Link>
              </div>
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/campaigns" className="text-primary-600 hover:text-primary-700 px-3 py-2 text-sm font-semibold transition-colors">Campaigns</Link>
                <a href="/#testimonials" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Impact Stories</a>
                <a href="/#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Features</a>
              </div>
              <div className="flex items-center space-x-4">
                {isAuthenticated && user ? (
                  <>
                    <div className="hidden sm:flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{user.firstName.charAt(0)}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="ml-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <PowerIcon className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="text-gray-600 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link 
                      to="/login" 
                      className="bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      <div className={isInDashboard ? '' : 'pt-16'}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                <p className="text-gray-600">Explore and support active fundraising campaigns</p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <div className="lg:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="paused">Paused</option>
                    <option value="draft">Draft</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="lg:w-48">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <ChartBarIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Raised</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ৳{campaigns.reduce((sum, c) => sum + c.currentAmount, 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UsersIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Donors</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.reduce((sum, c) => sum + c.donorCount, 0)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {campaigns.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaigns Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCampaigns.map((campaign) => {
                const rawProgress = (campaign.currentAmount / campaign.goalAmount) * 100;
                const progress = Math.min(rawProgress, 100);
                const progressPercentage = rawProgress.toFixed(2);
                const daysLeft = calculateDaysLeft(campaign.endDate);
                
                return (
                  <div key={campaign.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    {campaign.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <div className="text-center text-primary-600">
                          <ChartBarIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                          <p className="text-sm font-medium">Campaign Image</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">{daysLeft} days left</span>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{campaign.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{campaign.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">
                              ৳{campaign.currentAmount.toLocaleString()}
                            </p>
                            <p className="text-gray-500">of ৳{campaign.goalAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{campaign.donorCount}</p>
                            <p className="text-gray-500">donors</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          <span>{formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}</span>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm text-gray-600">By {campaign.createdBy}</span>
                          </div>
                          
                          {/* Action Buttons */}
                          {campaign.status === 'active' ? (
                            <div className="space-y-2">
                              <button
                                onClick={() => {
                                  setSelectedCampaign(campaign);
                                  setIsDonationModalOpen(true);
                                }}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center"
                              >
                                <HeartIcon className="h-5 w-5 mr-2" />
                                Donate Now
                              </button>
                              {/* Show poster button only to volunteers */}
                              {isAuthenticated && user?.userType?.toLowerCase() === 'volunteer' && (
                                <button
                                  onClick={() => {
                                    setPosterCampaign(campaign);
                                    setIsPosterModalOpen(true);
                                  }}
                                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center text-sm"
                                >
                                  🖨️ Print Campaign Poster
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="w-full px-4 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-semibold text-center cursor-not-allowed">
                              Campaign {campaign.status}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No results message */}
            {filteredCampaigns.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filters to find campaigns.'
                    : 'Check back soon for new campaigns!'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <DonationModal
        isOpen={isDonationModalOpen}
        onClose={() => {
          setIsDonationModalOpen(false);
          setSelectedCampaign(null);
        }}
        campaign={selectedCampaign}
      />

      {/* Campaign Poster Modal */}
      {isPosterModalOpen && posterCampaign && (
        <CampaignPoster
          campaign={posterCampaign}
          onClose={() => {
            setIsPosterModalOpen(false);
            setPosterCampaign(null);
          }}
        />
      )}
    </div>
  );
};

// Explicit default export to fix module resolution issues
export default Campaigns;


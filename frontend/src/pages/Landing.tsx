import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  HeartIcon, 
  UsersIcon, 
  MegaphoneIcon, 
  ChartBarIcon,
  ArrowRightIcon,
  StarIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CogIcon,
  LightBulbIcon,
  TrophyIcon,
  DocumentTextIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  PowerIcon
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import { logout } from '../store/slices/authSlice';
import testimonialService, { Testimonial } from '../services/testimonialService';

const Landing = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const dispatchAction = useAppDispatch();
  const { campaigns, loading } = useAppSelector((state) => state.campaigns);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  const handleLogout = () => {
    dispatchAction(logout());
    navigate('/');
  };

  useEffect(() => {
    dispatch(fetchCampaigns());
    loadTestimonials();
  }, [dispatch]);

  const loadTestimonials = async () => {
    try {
      const data = await testimonialService.getPublicTestimonials(6);
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    }
  };

  // Get latest and recent campaigns
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
  const latestCampaigns = activeCampaigns
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 3);
  
  const recentlyUpdatedCampaigns = activeCampaigns
    .filter(campaign => campaign.currentAmount > 0)
    .sort((a, b) => (b.currentAmount / b.goalAmount) - (a.currentAmount / a.goalAmount))
    .slice(0, 3);

  const features = [
    {
      icon: HeartIcon,
      title: 'Smart Donation Processing',
      description: 'Secure donation processing with multiple payment options and automated receipt generation for seamless donor experience.',
      stats: 'Active'
    },
    {
      icon: UsersIcon,
      title: 'Comprehensive Donor Management',
      description: 'Advanced donor profiles, communication tracking, and engagement tools to build lasting relationships with supporters.',
      stats: 'Operational'
    },
    {
      icon: MegaphoneIcon,
      title: 'Campaign Management',
      description: 'Create and manage fundraising campaigns with goal tracking, progress monitoring, and automated communication workflows.',
      stats: 'Live'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reporting',
      description: 'Comprehensive reporting suite with custom dashboards, donation trends, and performance insights for data-driven decisions.',
      stats: 'Available'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, secure data storage, and compliance-ready infrastructure to protect sensitive donor information.',
      stats: 'Enabled'
    },
    {
      icon: GlobeAltIcon,
      title: 'Modern Architecture',
      description: 'Built with cutting-edge technology stack for scalability, reliability, and seamless integration capabilities.',
      stats: 'Optimized'
    }
  ];

  const benefits = [
    {
      icon: TrophyIcon,
      title: 'University Focused',
      description: 'Designed specifically for university donation campaigns and student initiatives',
      metric: 'Tailored solution'
    },
    {
      icon: LightBulbIcon,
      title: 'Modern Technology',
      description: 'Latest technology stack with responsive design and intuitive user experience',
      metric: 'React & .NET'
    },
    {
      icon: CogIcon,
      title: 'Easy to Use',
      description: 'Intuitive interface designed for both donors and campaign managers',
      metric: 'User-friendly'
    },
    {
      icon: DocumentTextIcon,
      title: 'Fully Secure',
      description: 'Built with security and data protection standards for safe transactions',
      metric: 'Protected data'
    }
  ];

  const stats = [
    { label: 'Active Since', value: '2025', change: 'Live Platform' },
    { label: 'Active Campaigns', value: activeCampaigns.length.toString(), change: 'Running Now' },
    { label: 'System Uptime', value: '99.9%', change: 'Reliable' },
    { label: 'Secure Donations', value: '100%', change: 'Protected' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-xl shadow-green-sm border-b border-emerald-100 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-green-md">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gradient-green">Donation Management System</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/campaigns" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-semibold transition-colors">Campaigns</Link>
              <a href="#testimonials" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-semibold transition-colors">Impact Stories</a>
              <a href="#features" className="text-gray-700 hover:text-emerald-600 px-3 py-2 text-sm font-semibold transition-colors">Features</a>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <>
                  <div className="hidden sm:flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-emerald-600">{user.email}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-green-md ring-2 ring-emerald-200">
                      <span className="text-white text-sm font-bold">{user.firstName.charAt(0)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-2 p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
                  >
                    <PowerIcon className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-emerald-700 px-4 py-2 text-sm font-semibold transition-colors rounded-lg hover:bg-emerald-50"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/login" 
                    className="btn-primary shadow-green-lg hover:shadow-green-xl"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight">
              Transform Your
              <span className="text-gradient-green block mt-2">Fundraising Impact</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              A comprehensive donation management platform for our university community, empowering students and organizations to 
              <span className="font-bold text-emerald-700"> launch campaigns, track donations,</span> and make a lasting impact on causes that matter.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                to="/campaigns" 
                className="btn-primary text-lg px-10 py-4"
              >
                Start Donating
                <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#features"
                className="group border-2 border-emerald-300 hover:border-emerald-400 text-emerald-700 hover:text-emerald-800 px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 bg-white hover:bg-emerald-50 shadow-green-md hover:shadow-green-lg transform hover:-translate-y-0.5"
              >
                Learn More
              </a>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center px-4 py-2 bg-white/80 rounded-full shadow-green-sm">
                <ShieldCheckIcon className="h-5 w-5 text-emerald-600 mr-2" />
                Secure & Compliant
              </div>
              <div className="flex items-center px-4 py-2 bg-white/80 rounded-full shadow-green-sm">
                <GlobeAltIcon className="h-5 w-5 text-teal-600 mr-2" />
                Modern Architecture
              </div>
              <div className="flex items-center px-4 py-2 bg-white/80 rounded-full shadow-green-sm">
                <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                Launch Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 gradient-green shadow-green-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-emerald-50 font-semibold mb-1">{stat.label}</div>
                <div className="text-emerald-100 text-sm">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Campaigns Section */}
      <section className="py-24 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full text-green-700 text-sm font-bold mb-6 shadow-green-md border border-green-200">
              <FireIcon className="h-5 w-5 mr-2 animate-pulse" />
              Live campaigns making impact
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Latest & Recent
              <br />
              <span className="text-gradient-green">Active Campaigns</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Discover the latest fundraising campaigns and see how communities are making a difference together.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading campaigns...</p>
            </div>
          ) : (
            <div className="space-y-16">
              {/* Latest Campaigns */}
              {latestCampaigns.length > 0 && (
                <div>
                  <div className="flex items-center mb-8">
                    <SparklesIcon className="h-6 w-6 text-emerald-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Latest Campaigns</h3>
                    <div className="ml-4 px-4 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold shadow-green-sm border border-green-200">
                      Just launched
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {latestCampaigns.map((campaign) => {
                      const rawProgress = (campaign.currentAmount / campaign.goalAmount) * 100;
                      const progress = Math.min(rawProgress, 100);
                      const progressPercentage = rawProgress.toFixed(2);
                      const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                      
                      return (
                        <div key={campaign.id} className="group card-green hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                          {campaign.imageUrl && (
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={campaign.imageUrl} 
                                alt={campaign.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute top-4 right-4">
                                <div className="bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-emerald-700 shadow-green-md border border-emerald-200">
                                  New
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center mb-3">
                              <div className="badge-green">
                                {campaign.category}
                              </div>
                              <div className="ml-auto flex items-center text-gray-600 text-sm font-medium">
                                <ClockIcon className="h-4 w-4 mr-1 text-emerald-600" />
                                {daysLeft} days left
                              </div>
                            </div>
                            <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors">
                              {campaign.title}
                            </h4>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {campaign.description}
                            </p>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600 font-medium">Progress</span>
                                <span className="font-bold text-emerald-700">{progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden shadow-inner">
                                <div
                                  className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 h-3 rounded-full transition-all duration-500 shadow-green-sm"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-lg font-extrabold text-gray-900">
                                    ৳{campaign.currentAmount.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    raised of ৳{campaign.goalAmount.toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-extrabold text-emerald-600">
                                    {campaign.donorCount}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    donors
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent Popular Campaigns */}
              {recentlyUpdatedCampaigns.length > 0 && (
                <div>
                  <div className="flex items-center mb-8">
                    <TrophyIcon className="h-6 w-6 text-yellow-500 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Trending Campaigns</h3>
                    <div className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                      Most supported
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentlyUpdatedCampaigns.map((campaign, index) => {
                      const rawProgress = (campaign.currentAmount / campaign.goalAmount) * 100;
                      const progress = Math.min(rawProgress, 100);
                      const progressPercentage = rawProgress.toFixed(2);
                      const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                      
                      return (
                        <div key={campaign.id} className="group bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-yellow-200 hover:border-yellow-300 overflow-hidden">
                          {index === 0 && (
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-center py-2 text-sm font-semibold">
                              🏆 Most Popular
                            </div>
                          )}
                          {campaign.imageUrl && (
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={campaign.imageUrl} 
                                alt={campaign.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 right-4">
                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-yellow-700">
                                  Hot
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center mb-3">
                              <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                                {campaign.category}
                              </div>
                              <div className="ml-auto flex items-center text-gray-500 text-sm">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {daysLeft} days left
                              </div>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-yellow-700 transition-colors">
                              {campaign.title}
                            </h4>
                            <p className="text-gray-600 mb-4 line-clamp-2">
                              {campaign.description}
                            </p>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium text-gray-900">{progressPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-lg font-bold text-gray-900">
                                    ৳{campaign.currentAmount.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    raised of ৳{campaign.goalAmount.toLocaleString()}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-yellow-600">
                                    {campaign.donorCount}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    donors
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* No campaigns message */}
              {latestCampaigns.length === 0 && recentlyUpdatedCampaigns.length === 0 && (
                <div className="text-center py-16">
                  <MegaphoneIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Campaigns</h3>
                  <p className="text-gray-600 mb-8">
                    Check back soon for exciting new campaigns!
                  </p>
                  <Link 
                    to="/login" 
                    className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Sign In to View More
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* View All Campaigns Button */}
          {(latestCampaigns.length > 0 || recentlyUpdatedCampaigns.length > 0) && (
            <div className="text-center mt-12">
              <Link 
                to="/campaigns" 
                className="inline-flex items-center px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                View All Campaigns
                <ArrowRightIcon className="ml-3 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-emerald-100 to-green-100 rounded-full text-emerald-700 text-sm font-bold mb-6 shadow-green-md border border-emerald-200">
              <LightBulbIcon className="h-5 w-5 mr-2" />
              Cutting-edge technology
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Complete platform for
              <br />
              <span className="text-gradient-green">university fundraising</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Comprehensive tools and analytics that help student organizations and university departments 
              manage campaigns, track donations, and engage with the community effectively.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="group card-green p-8 hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-16 w-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-green-lg">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-full shadow-green-sm">
                      <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-green-700 text-sm font-bold">{feature.stats}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 transition-all duration-300 hover:shadow-green-md group">
                <benefit.icon className="h-10 w-10 text-emerald-600 mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                <span className="text-emerald-600 font-bold text-sm">{benefit.metric}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-full text-yellow-700 text-sm font-bold mb-6 shadow-sm border border-yellow-200">
              <StarIcon className="h-5 w-5 mr-2" />
              Community testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Trusted by our
              <span className="text-gradient-green"> university community</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              See how students and organizations are making an impact through our donation platform
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.comment}"
                  </blockquote>
                  <div className="flex items-center">
                    {testimonial.avatarUrl ? (
                      <img 
                        src={testimonial.avatarUrl} 
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-4">
                        <span className="text-white font-bold text-lg">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-gray-600 text-sm">{testimonial.position}</div>
                      <div className="text-primary-600 text-sm font-medium">{testimonial.organization}</div>
                    </div>
                  </div>
                  {testimonial.badgeType && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="inline-flex items-center px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                        <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                        <span className="text-green-700 text-sm font-medium">{testimonial.badgeType}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">Loading testimonials...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-green relative overflow-hidden shadow-green-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 leading-tight drop-shadow-lg">
              Ready to make a
              <br />difference today?
            </h2>
            <p className="text-xl md:text-2xl text-emerald-50 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow">
              Join our university community in supporting meaningful causes. 
              Your donations help fund student initiatives, research projects, and community development programs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                to="/register" 
                className="group bg-white hover:bg-gray-50 text-emerald-700 px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 inline-flex items-center shadow-green-2xl hover:shadow-green-glow transform hover:-translate-y-1"
              >
                Start Contributing
                <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/campaigns"
                className="group border-3 border-white/40 hover:border-white text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:bg-white/20 backdrop-blur-sm shadow-green-lg"
              >
                View Campaigns
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-extrabold text-white mb-2">🔒 Secure</div>
                <div className="text-emerald-100 font-medium">Donations</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-extrabold text-white mb-2">✓ 100%</div>
                <div className="text-emerald-100 font-medium">Transparent</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="text-3xl font-extrabold text-white mb-2">🤝 Community</div>
                <div className="text-emerald-100 font-medium">Driven</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-green-lg">
                  <HeartIcon className="h-7 w-7 text-white" />
                </div>
                <span className="ml-3 text-xl font-extrabold">Donation Management System</span>
              </div>
              <p className="text-emerald-200 mb-6 leading-relaxed">
                A modern donation management platform for our university community. 
                Supporting student initiatives, research projects, and charitable causes through 
                secure, transparent, and efficient donation processing.
              </p>
              <div className="flex space-x-4">
                <div className="h-11 w-11 bg-emerald-800/50 rounded-xl flex items-center justify-center hover:bg-emerald-700 cursor-pointer transition-colors border border-emerald-700">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="h-11 w-11 bg-emerald-800/50 rounded-xl flex items-center justify-center hover:bg-emerald-700 cursor-pointer transition-colors border border-emerald-700">
                  <span className="text-sm font-bold">tw</span>
                </div>
                <div className="h-11 w-11 bg-emerald-800/50 rounded-xl flex items-center justify-center hover:bg-emerald-700 cursor-pointer transition-colors border border-emerald-700">
                  <span className="text-sm font-bold">fb</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-emerald-300">Platform</h3>
              <ul className="space-y-4 text-emerald-200">
                <li>
                  <a 
                    href="#features" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors hover:underline cursor-pointer"
                  >
                    Features
                  </a>
                </li>
                <li><Link to="/campaigns" className="hover:text-white transition-colors hover:underline">Campaigns</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors hover:underline">Dashboard</Link></li>
                <li>
                  <a 
                    href="#features" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors hover:underline cursor-pointer"
                  >
                    Security
                  </a>
                </li>
                <li><Link to="/terms" className="hover:text-white transition-colors hover:underline">Compliance</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-emerald-300">Quick Links</h3>
              <ul className="space-y-4 text-emerald-200">
                <li><Link to="/campaigns" className="hover:text-white transition-colors hover:underline">Browse Campaigns</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors hover:underline">Create Campaign</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors hover:underline">Donate Now</Link></li>
                <li>
                  <a 
                    href="#testimonials" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors hover:underline cursor-pointer"
                  >
                    Success Stories
                  </a>
                </li>
                <li><Link to="/register" className="hover:text-white transition-colors hover:underline">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-6 text-emerald-300">Support</h3>
              <ul className="space-y-4 text-emerald-200">
                <li>
                  <a 
                    href="mailto:khanramjan001@gmail.com" 
                    className="hover:text-white transition-colors hover:underline"
                    title="Email: khanramjan001@gmail.com"
                  >
                    📧 Help Center
                  </a>
                  <div className="text-xs mt-1 text-emerald-300">khanramjan001@gmail.com</div>
                </li>
                <li>
                  <Link 
                    to="/documentation"
                    className="hover:text-white transition-colors hover:underline"
                  >
                    📚 Documentation
                  </Link>
                </li>
                <li>
                  <a 
                    href="#testimonials" 
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors hover:underline cursor-pointer"
                  >
                    👥 Community
                  </a>
                </li>
                <li>
                  <a 
                    href="https://wa.me/8801518686883" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors hover:underline"
                    title="WhatsApp: +880 1518-686883"
                  >
                    💬 WhatsApp Support
                  </a>
                  <div className="text-xs mt-1 text-emerald-300">+880 1518-686883</div>
                </li>
                <li>
                  <a 
                    href="mailto:khanramjan001@gmail.com" 
                    className="hover:text-white transition-colors hover:underline"
                    title="Email: khanramjan001@gmail.com"
                  >
                    ✉️ Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-emerald-300 text-sm mb-4 md:mb-0">
                &copy; 2025 Donation Management System. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm text-emerald-300">
                <Link to="/privacy" className="hover:text-white transition-colors hover:underline">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors hover:underline">Terms of Service</Link>
                <Link to="/cookies" className="hover:text-white transition-colors hover:underline">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

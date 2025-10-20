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
      stats: 'Ready to deploy'
    },
    {
      icon: UsersIcon,
      title: 'Comprehensive Donor Management',
      description: 'Advanced donor profiles, communication tracking, and engagement tools to build lasting relationships with supporters.',
      stats: 'Full featured'
    },
    {
      icon: MegaphoneIcon,
      title: 'Campaign Management',
      description: 'Create and manage fundraising campaigns with goal tracking, progress monitoring, and automated communication workflows.',
      stats: 'Beta tested'
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reporting',
      description: 'Comprehensive reporting suite with custom dashboards, donation trends, and performance insights for data-driven decisions.',
      stats: 'Launch ready'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level encryption, secure data storage, and compliance-ready infrastructure to protect sensitive donor information.',
      stats: 'Security first'
    },
    {
      icon: GlobeAltIcon,
      title: 'Modern Architecture',
      description: 'Built with cutting-edge technology stack for scalability, reliability, and seamless integration capabilities.',
      stats: 'Future-proof'
    }
  ];

  const benefits = [
    {
      icon: TrophyIcon,
      title: 'Built for Success',
      description: 'Designed with industry best practices and proven fundraising methodologies',
      metric: 'Best practices'
    },
    {
      icon: LightBulbIcon,
      title: 'Modern Technology',
      description: 'Latest technology stack with responsive design and intuitive user experience',
      metric: 'Cutting-edge'
    },
    {
      icon: CogIcon,
      title: 'Easy Integration',
      description: 'Simple setup process with comprehensive documentation and support resources',
      metric: 'Plug & play'
    },
    {
      icon: DocumentTextIcon,
      title: 'Compliance Ready',
      description: 'Built with security and compliance standards from day one for peace of mind',
      metric: 'Secure by design'
    }
  ];

  const stats = [
    { label: 'Platform Launch', value: '2025', change: 'Now Available' },
    { label: 'Beta Organizations', value: '25+', change: 'Testing Phase' },
    { label: 'Features Ready', value: '95%', change: 'Launch Ready' },
    { label: 'Security Standards', value: 'A+', change: 'Enterprise Grade' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200 fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Donation Management System</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/campaigns" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Campaigns</Link>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Impact Stories</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">Features</a>
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

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 bg-gradient-to-br from-gray-50 via-white to-primary-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-sm font-medium mb-8">
              <TrophyIcon className="h-4 w-4 mr-2" />
              Now launching - Join our early adopters program
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Transform Your
              <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-600 bg-clip-text text-transparent"> Fundraising</span>
              <br />Impact
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              A brand new, modern donation management platform designed to help organizations 
              <span className="font-semibold text-gray-800"> streamline their fundraising efforts</span> and build meaningful donor relationships from day one.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                to="/campaigns" 
                className="group bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 inline-flex items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Start Donating
                <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group border-2 border-gray-300 hover:border-primary-400 text-gray-700 hover:text-primary-700 px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 bg-white hover:bg-primary-50">
                Learn More
              </button>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-5 w-5 text-green-500 mr-2" />
                Secure & Compliant
              </div>
              <div className="flex items-center">
                <GlobeAltIcon className="h-5 w-5 text-blue-500 mr-2" />
                Modern Architecture
              </div>
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
                Launch Ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100 font-medium mb-1">{stat.label}</div>
                <div className="text-primary-200 text-sm">{stat.change}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Campaigns Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
              <FireIcon className="h-4 w-4 mr-2" />
              Live campaigns making impact
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Latest & Recent
              <br />
              <span className="bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">Active Campaigns</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                    <SparklesIcon className="h-6 w-6 text-primary-600 mr-3" />
                    <h3 className="text-2xl font-bold text-gray-900">Latest Campaigns</h3>
                    <div className="ml-4 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
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
                        <div key={campaign.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 overflow-hidden">
                          {campaign.imageUrl && (
                            <div className="relative h-48 overflow-hidden">
                              <img 
                                src={campaign.imageUrl} 
                                alt={campaign.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 right-4">
                                <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                                  New
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="p-6">
                            <div className="flex items-center mb-3">
                              <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                {campaign.category}
                              </div>
                              <div className="ml-auto flex items-center text-gray-500 text-sm">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {daysLeft} days left
                              </div>
                            </div>
                            <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors">
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
                                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
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
                                  <div className="text-lg font-bold text-primary-600">
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
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full text-primary-700 text-sm font-medium mb-6">
              <LightBulbIcon className="h-4 w-4 mr-2" />
              Cutting-edge technology
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Enterprise-grade solutions
              <br />for modern fundraising
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI-powered tools and comprehensive analytics that help organizations 
              maximize their impact and build sustainable donor relationships.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <div key={index} className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <div className="ml-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {feature.description}
                    </p>
                    <div className="inline-flex items-center px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                      <div className="h-2 w-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-green-700 text-sm font-medium">{feature.stats}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                <benefit.icon className="h-8 w-8 text-primary-600 mb-4" />
                <h4 className="font-semibold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                <span className="text-primary-600 font-medium text-sm">{benefit.metric}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-yellow-100 rounded-full text-yellow-700 text-sm font-medium mb-6">
              <StarIcon className="h-4 w-4 mr-2" />
              Donor impact stories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by charitable organizations
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See how organizations are transforming their fundraising with Donation Management System
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
      <section className="py-24 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to transform your
              <br />fundraising impact?
            </h2>
            <p className="text-xl md:text-2xl text-primary-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Be among the first organizations to experience the future of donation management. 
              Join our launch program and help shape the platform that will transform fundraising.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link 
                to="/register" 
                className="group bg-white hover:bg-gray-50 text-primary-700 px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 inline-flex items-center shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
              >
                Get Involved
                <ArrowRightIcon className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="group border-2 border-white/30 hover:border-white text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm">
                Contact Us
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-white mb-2">Secure</div>
                <div className="text-primary-200">Donations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">100%</div>
                <div className="text-primary-200">Transparent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white mb-2">Community</div>
                <div className="text-primary-200">Driven</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">Donation Management System</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Empowering organizations worldwide to maximize their fundraising impact through 
                cutting-edge technology, AI-driven insights, and comprehensive donor management solutions.
              </p>
              <div className="flex space-x-4">
                <div className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <span className="text-sm font-medium">in</span>
                </div>
                <div className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <span className="text-sm font-medium">tw</span>
                </div>
                <div className="h-10 w-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer transition-colors">
                  <span className="text-sm font-medium">fb</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6">Platform</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compliance</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6">Solutions</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Nonprofits</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Healthcare</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Education</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Religious</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Enterprise</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-6">Support</h3>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                &copy; 2025 Donation Management System. All rights reserved.
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

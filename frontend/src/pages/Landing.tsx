import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  HeartIcon, 
  UsersIcon,
  SparklesIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ArrowRightIcon,
  StarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import { logout } from '../store/slices/authSlice';
import testimonialService, { Testimonial } from '../services/testimonialService';
import ReserveFundSection from '../components/ReserveFundSection';

const Landing = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { campaigns, loading } = useAppSelector((state) => state.campaigns);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  useEffect(() => {
    dispatch(fetchCampaigns());
    loadTestimonials();

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch]);

  const loadTestimonials = async () => {
    try {
      const data = await testimonialService.getPublicTestimonials(6);
      setTestimonials(data);
    } catch (error) {
      console.error('Failed to load testimonials:', error);
    }
  };

  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
  const latestCampaigns = activeCampaigns
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 3);

  const features = [
    {
      icon: HeartIcon,
      title: 'Seamless Donations',
      description: 'Secure, intuitive donation processing with multiple payment options and instant receipts.',
    },
    {
      icon: UsersIcon,
      title: 'Donor Relations',
      description: 'Build lasting relationships with comprehensive donor management and engagement tools.',
    },
    {
      icon: SparklesIcon,
      title: 'Campaign Creation',
      description: 'Launch and manage fundraising campaigns with live progress tracking and analytics.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and compliance-ready infrastructure for complete peace of mind.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Reach',
      description: 'Modern architecture built for scale, reliability, and seamless integrations.',
    },
  ];

  const stats = [
    { number: activeCampaigns.length, label: 'Active Campaigns', suffix: '' },
    { number: 99.9, label: 'Platform Uptime', suffix: '%' },
    { number: 100, label: 'Secure Donations', suffix: '%' },
  ];

  return (
    <div className="min-h-screen bg-luxury-50">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-subtle border-b border-slate-200/50' : 'bg-white'
      }`}>
        <div className="container-max">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-900 rounded-md flex items-center justify-center shadow-subtle">
                <HeartIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-900 hidden sm:block">
                Donation Platform
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/campaigns" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Campaigns
              </Link>
              <a href="/reviews" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Stories
              </a>
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">
                Features
              </a>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated && user ? (
                <>
                  <div className="hidden sm:flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-900">{user.firstName}</p>
                      <p className="text-xs text-slate-500">{user.email?.split('@')[0]}</p>
                    </div>
                    <div className="h-8 w-8 rounded-md bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-subtle">
                      <span className="text-white text-xs font-bold">{user.firstName.charAt(0)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="btn-outline btn-sm"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="btn-primary btn-sm shadow-subtle"
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
      <section className="relative pt-32 pb-24 bg-luxury-50 overflow-hidden">
        <div className="absolute inset-0 bg-subtle-gradient pointer-events-none" />
        
        <div className="container-max relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center lg:justify-items-start justify-items-center">
            {/* Content */}
            <div className="animate-fade-in max-w-2xl lg:max-w-none">
              <div className="inline-block mb-6">
                <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">
                   Transform Your Giving
                </span>
              </div>
              
              <h1 className="mb-6 text-slate-900 hero-text font-serif">
                Powerful Fundraising Made Simple
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed font-light hero-subtext">
                A thoughtfully designed donation platform for university communities. Launch campaigns, track impact, and build meaningful connections with supporters.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12 hero-cta">
                <Link 
                  to="/campaigns" 
                  className="btn-primary btn-lg gap-2 shadow-elevated hover:shadow-floating"
                >
                  Explore Campaigns
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
                <a 
                  href="#features"
                  className="btn-outline btn-lg gap-2"
                >
                  Learn More
                </a>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal-600" />
                  Secure & Encrypted
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal-600" />
                  Real-time Analytics
                </div>
                <div className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal-600" />
                  24/7 Support
                </div>
              </div>
            </div>

            {/* Illustration Area */}
            <div className="relative h-96 lg:h-auto hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-slate-900/5 rounded-2xl overflow-hidden">
                <div className="absolute top-1/4 right-0 w-72 h-72 bg-teal-400/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-slate-900/5 rounded-full blur-3xl" />
                
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-600 animate-pulse" />
                      <div className="w-3 h-3 rounded-full bg-teal-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Dynamic giving ecosystem</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-slate-200/50 bg-luxury-200">
        <div className="container-max">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-5xl md:text-6xl font-serif font-bold text-slate-900 mb-3">
                  {stat.number.toLocaleString()}{stat.suffix}
                </div>
                <div className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="section-pad bg-luxury-100">
        <div className="container-max">
          <div className="mb-16">
            <div className="inline-block mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">
                Active Now
              </span>
            </div>
            <h2 className="font-serif mb-6 text-slate-900">
              Support Meaningful Causes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl font-light">
              Discover dynamic campaigns making real impact in our community. See how your support transforms ideas into action.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-900 border-r-transparent" />
            </div>
          ) : latestCampaigns.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 stagger-container">
              {latestCampaigns.map((campaign) => {
                const progress = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
                const progressPercent = ((campaign.currentAmount / campaign.goalAmount) * 100).toFixed(1);
                
                return (
                  <Link
                    key={campaign.id}
                    to={`/campaigns/${campaign.id}`}
                    className="group card-interactive p-6"
                  >
                    {campaign.imageUrl && (
                      <div className="relative h-48 -m-6 mb-6 overflow-hidden rounded-t-lg">
                        <img 
                          src={campaign.imageUrl} 
                          alt={campaign.title}
                          className="w-full h-full object-cover image-hover"
                        />
                        <div className="absolute top-4 right-4">
                          <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-slate-900 rounded">
                            {progressPercent}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <div>
                        <span className="badge badge-primary">
                          {campaign.category}
                        </span>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-serif font-semibold text-slate-900 group-hover:text-teal-600 transition-colors mb-2">
                          {campaign.title}
                        </h3>
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between items-baseline text-sm">
                          <span className="text-slate-600">Goal</span>
                          <span className="font-semibold text-slate-900">
                            ৳{(campaign.goalAmount / 1000).toFixed(0)}K
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center pt-1">
                          <span className="text-xs text-slate-500">
                            {campaign.donorCount} supporter{campaign.donorCount !== 1 ? 's' : ''}
                          </span>
                          <span className="text-xs font-medium text-teal-600">
                            ৳{(campaign.currentAmount / 1000).toFixed(0)}K raised
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}

          <div className="text-center mt-16">
            <Link 
              to="/campaigns" 
              className="inline-flex items-center gap-2 btn-primary btn-lg shadow-elevated hover:shadow-floating"
            >
              View All Campaigns
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reserve Fund Section */}
      <section className="py-12 bg-white border-t border-slate-200/50 mb-0">
        <div className="container-max">
          <ReserveFundSection />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-pad bg-luxury-50">
        <div className="container-max">
          <div className="mb-16">
            <div className="inline-block mb-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">
                What We Offer
              </span>
            </div>
            <h2 className="font-serif text-slate-900">
              Built for Modern Fundraising
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 stagger-container">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-6 p-8 rounded-lg border border-slate-200/50 hover:border-teal-200/50 hover:shadow-subtle transition-all duration-300">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 font-serif">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="section-pad bg-luxury-100 border-t border-slate-200/50">
          <div className="container-max">
            <div className="mb-16">
              <div className="inline-block mb-4">
                <span className="text-xs uppercase tracking-wider font-semibold text-teal-600">
                  Community
                </span>
              </div>
              <h2 className="font-serif text-slate-900 mb-4">
                Trusted by Our Community
              </h2>
              <p className="text-lg text-slate-600 font-light max-w-2xl">
                See how students and organizations are creating positive change through our platform.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 stagger-container">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="card-elevated p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIcon key={i} className="h-4 w-4 text-amber-400 fill-current" />
                    ))}
                  </div>
                  
                  <blockquote className="text-slate-700 mb-6 leading-relaxed text-sm">
                    "{testimonial.comment}"
                  </blockquote>
                  
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-200">
                    {testimonial.avatarUrl ? (
                      <img 
                        src={testimonial.avatarUrl} 
                        alt={testimonial.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-xs">
                          {testimonial.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-900">{testimonial.name}</div>
                      <div className="text-xs text-slate-500">{testimonial.position}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/reviews"
                className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                View all testimonials
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-pad bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-600 rounded-full blur-3xl" />
        </div>

        <div className="container-max relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-slate-50 mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-lg text-slate-300 mb-10 font-light">
              Join our community in supporting meaningful causes. Every donation helps fund initiatives that transform lives.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="btn-primary btn-lg gap-2 shadow-elevated hover:shadow-floating"
              >
                Start Contributing
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
              <Link
                to="/campaigns"
                className="btn-primary btn-lg gap-2 border-slate-400 text-slate-50 hover:bg-slate-800"
              >
                Browse Campaigns
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-300">
        <div className="container-max py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 bg-teal-600 rounded-md flex items-center justify-center">
                  <HeartIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-white">Donation Platform</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Empowering communities through secure, transparent fundraising.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm">Platform</h3>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><Link to="/campaigns" className="hover:text-white transition-colors">Campaigns</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm">Company</h3>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><Link to="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-white mb-4 text-sm">Support</h3>
              <ul className="space-y-3 text-xs text-slate-400">
                <li><a href="mailto:support@donation.platform" className="hover:text-white transition-colors">Email Support</a></li>
                <li><a href="https://wa.me/8801518686883" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
              <div>&copy; 2025 Donation Management System. All rights reserved.</div>
              <div className="flex gap-6 mt-4 md:mt-0">
                <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
                <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
                <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDonations } from '../store/slices/donationSlice';
import { fetchCampaigns } from '../store/slices/campaignSlice';
import { fetchDonors } from '../store/slices/donorSlice';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import DonationTrendChart from '../components/DonationTrendChart';
import CategoryDistributionChart from '../components/CategoryDistributionChart';
import ImpactInsights from '../components/ImpactInsights';
import DonationHistoryTimeline from '../components/DonationHistoryTimeline';
import RecommendedCampaigns from '../components/RecommendedCampaigns';
import testimonialService from '../services/testimonialService';
import { 
  HeartIcon, 
  TrophyIcon, 
  ChartBarIcon,
  CalendarDaysIcon,
  StarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import type { RootState } from '../store';

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(true);
  const [daysUntilNextReview, setDaysUntilNextReview] = useState(0);
  
  const [userStats, setUserStats] = useState({
    totalDonated: 0,
    totalDonations: 0,
    campaignsSupported: 0,
    averageDonation: 0,
    givingStreak: 0,
    monthsActive: 0,
    peopleImpacted: 0
  });

  const [donationTrends, setDonationTrends] = useState([
    { month: 'Jan', amount: 0, count: 0 },
    { month: 'Feb', amount: 0, count: 0 },
    { month: 'Mar', amount: 0, count: 0 },
    { month: 'Apr', amount: 0, count: 0 },
    { month: 'May', amount: 0, count: 0 },
    { month: 'Jun', amount: 0, count: 0 }
  ]);

  const [categoryDistribution, setCategoryDistribution] = useState([
    { name: 'Education', value: 0, color: '#3b82f6' },
    { name: 'Healthcare', value: 0, color: '#10b981' },
    { name: 'Emergency', value: 0, color: '#ef4444' },
    { name: 'Environment', value: 0, color: '#059669' },
    { name: 'Community', value: 0, color: '#8b5cf6' }
  ]);

  const [donationHistory, setDonationHistory] = useState<Array<{
    id: number;
    amount: number;
    campaignTitle: string;
    campaignCategory: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
    impactMessage?: string;
  }>>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch user's donations
        const response = await fetch('http://localhost:5000/api/donation/my-donations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const donations = data.donations || [];
          
          // Calculate stats
          const completedDonations = donations.filter((d: any) => d.status === 'completed');
          const totalDonated = completedDonations.reduce((sum: number, d: any) => sum + d.amount, 0);
          const totalDonations = completedDonations.length;
          
          // Get unique campaigns
          const uniqueCampaigns = new Set(completedDonations.map((d: any) => d.campaignId));
          const campaignsSupported = uniqueCampaigns.size;
          
          // Calculate average
          const averageDonation = totalDonations > 0 ? Math.round(totalDonated / totalDonations) : 0;
          
          // Calculate months active (from first donation to now)
          const dates = completedDonations.map((d: any) => new Date(d.date).getTime());
          const monthsActive = dates.length > 0 
            ? Math.max(1, Math.ceil((Date.now() - Math.min(...dates)) / (1000 * 60 * 60 * 24 * 30)))
            : 0;
          
          // Calculate giving streak (consecutive months with donations)
          const monthsWithDonations = new Set(
            completedDonations.map((d: any) => {
              const date = new Date(d.date);
              return `${date.getFullYear()}-${date.getMonth()}`;
            })
          );
          const givingStreak = monthsWithDonations.size;
          
          // Estimate people impacted (rough estimate: 1 person per 1000 taka)
          const peopleImpacted = Math.floor(totalDonated / 1000);

          setUserStats({
            totalDonated,
            totalDonations,
            campaignsSupported,
            averageDonation,
            givingStreak,
            monthsActive,
            peopleImpacted
          });

          // Calculate donation trends by month
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const currentMonth = new Date().getMonth();
          const trends = [];
          
          for (let i = 5; i >= 0; i--) {
            const monthIndex = (currentMonth - i + 12) % 12;
            const monthName = monthNames[monthIndex];
            const monthDonations = completedDonations.filter((d: any) => {
              const donationMonth = new Date(d.date).getMonth();
              return donationMonth === monthIndex;
            });
            
            trends.push({
              month: monthName,
              amount: monthDonations.reduce((sum: number, d: any) => sum + d.amount, 0),
              count: monthDonations.length
            });
          }
          setDonationTrends(trends);

          // Calculate category distribution
          const categoryMap: { [key: string]: number } = {};
          completedDonations.forEach((d: any) => {
            const category = d.campaignCategory || 'Other';
            categoryMap[category] = (categoryMap[category] || 0) + d.amount;
          });

          const categoryColors: { [key: string]: string } = {
            'education': '#3b82f6',
            'healthcare': '#10b981',
            'emergency': '#ef4444',
            'environment': '#059669',
            'community': '#8b5cf6',
            'other': '#6b7280'
          };

          const categoryDist = Object.entries(categoryMap).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value,
            color: categoryColors[name.toLowerCase()] || '#6b7280'
          }));
          setCategoryDistribution(categoryDist);

          // Format donation history
          const history = completedDonations.slice(0, 10).map((d: any) => ({
            id: d.id,
            amount: d.amount,
            campaignTitle: d.campaignTitle,
            campaignCategory: d.campaignCategory,
            date: d.date,
            status: d.status,
            impactMessage: d.impactMessage
          }));
          setDonationHistory(history);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
    dispatch(fetchDonations());
    dispatch(fetchCampaigns());
    dispatch(fetchDonors());
  }, [dispatch]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.firstName || 'Donor'}! 👋
        </h1>
        <p className="text-gray-600 mt-1">Track your impact and continue making a difference</p>
      </div>

      {/* Email Verification Banner */}
      <EmailVerificationBanner />

      {/* Write Review Card - Prominent Action */}
      <div className={`rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow ${
        canReview 
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' 
          : 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${
              canReview 
                ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                : 'bg-gradient-to-br from-gray-400 to-gray-500'
            }`}>
              <StarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Share Your Experience</h3>
              <p className="text-gray-600 text-sm mt-1">
                {canReview 
                  ? 'Help others by writing a review about your experience with our platform' 
                  : `You can write another review in ${daysUntilNextReview} day(s). Reviews are limited to one per week.`
                }
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            disabled={!canReview}
            className={`px-6 py-3 rounded-lg font-medium shadow-md transform transition-all duration-200 ${
              canReview
                ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white hover:shadow-lg hover:-translate-y-0.5'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            }`}
          >
            Write Review
          </button>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Donated</p>
              <p className="text-3xl font-bold mt-2">
                ৳{loading ? '...' : userStats.totalDonated.toLocaleString()}
              </p>
              <p className="text-blue-100 text-xs mt-2">
                {userStats.totalDonations} donations
              </p>
            </div>
            <HeartIcon className="h-12 w-12 text-blue-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Campaigns Supported</p>
              <p className="text-3xl font-bold mt-2">{userStats.campaignsSupported}</p>
              <p className="text-green-100 text-xs mt-2">
                {userStats.campaignsSupported > 0 ? 'Making a difference' : 'Start supporting'}
              </p>
            </div>
            <TrophyIcon className="h-12 w-12 text-green-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Average Donation</p>
              <p className="text-3xl font-bold mt-2">
                ৳{userStats.averageDonation.toLocaleString()}
              </p>
              <p className="text-purple-100 text-xs mt-2">
                {userStats.givingStreak} month streak
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-purple-200 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">People Impacted</p>
              <p className="text-3xl font-bold mt-2">{userStats.peopleImpacted}</p>
              <p className="text-orange-100 text-xs mt-2">
                {userStats.monthsActive} months active
              </p>
            </div>
            <CalendarDaysIcon className="h-12 w-12 text-orange-200 opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DonationTrendChart data={donationTrends} />
        <CategoryDistributionChart data={categoryDistribution} />
      </div>

      {/* Impact & History Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImpactInsights
          totalDonated={userStats.totalDonated}
          campaignsSupported={userStats.campaignsSupported}
          donationCount={userStats.totalDonations}
          givingStreak={userStats.givingStreak}
          monthsActive={userStats.monthsActive}
        />
        <DonationHistoryTimeline donations={donationHistory} />
      </div>

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended For You</h3>
        <RecommendedCampaigns />
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Share Your Experience</h2>
                  <p className="text-gray-600 mt-1">Tell us about your experience with the platform</p>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              {/* Review Form */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                setSubmitting(true);
                
                const formData = new FormData(e.currentTarget);
                const data = {
                  position: formData.get('position') as string,
                  organization: formData.get('organization') as string,
                  rating: parseInt(formData.get('rating') as string),
                  comment: formData.get('comment') as string,
                  badgeType: formData.get('badgeType') as string || undefined
                };

                try {
                  await testimonialService.submitTestimonial(data);
                  alert('Thank you for your review! It has been published successfully and is now visible on the landing page.');
                  setShowReviewModal(false);
                  setCanReview(false);
                  setDaysUntilNextReview(7);
                } catch (error) {
                  const message = error instanceof Error ? error.message : 'Failed to submit review. Please try again.';
                  alert(message);
                } finally {
                  setSubmitting(false);
                }
              }}>
                <div className="space-y-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <label key={rating} className="cursor-pointer">
                          <input
                            type="radio"
                            name="rating"
                            value={rating}
                            required
                            className="sr-only peer"
                          />
                          <StarIcon className="h-10 w-10 text-gray-300 peer-checked:text-yellow-400 peer-checked:fill-current hover:text-yellow-300 transition-colors" />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="position"
                      required
                      maxLength={200}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="Executive Director"
                    />
                  </div>

                  {/* Organization */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Organization <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="organization"
                      required
                      maxLength={300}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                      placeholder="Community Health Foundation"
                    />
                  </div>

                  {/* Badge Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Badge (optional)
                    </label>
                    <select
                      name="badgeType"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                    >
                      <option value="">None</option>
                      <option value="Beta tester">Beta tester</option>
                      <option value="Early adopter">Early adopter</option>
                      <option value="Beta participant">Beta participant</option>
                      <option value="Launch partner">Launch partner</option>
                    </select>
                  </div>

                  {/* Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="comment"
                      required
                      maxLength={500}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors resize-none"
                      placeholder="Share your experience with the platform..."
                    />
                    <p className="text-sm text-gray-500 mt-1">Maximum 500 characters</p>
                  </div>

                  {/* Notice */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                      <strong>Note:</strong> Your name and email will be automatically captured from your account. 
                      Your review will be published immediately and appear on the landing page. You can submit one review per week.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                    >
                      {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

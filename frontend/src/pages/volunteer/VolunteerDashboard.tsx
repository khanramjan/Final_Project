import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  TrophyIcon,
  HeartIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  MapPinIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import volunteerService from '../../services/volunteerService';
import type { VolunteerDashboard } from '../../types/volunteer.types';

export default function VolunteerDashboardPage() {
  const [dashboard, setDashboard] = useState<VolunteerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('Error fetching dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your volunteer dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const stats = dashboard.stats;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {dashboard.profile?.userName?.split(' ')[0] || 'Volunteer'}! 👋
              </h1>
              <p className="mt-2 text-gray-600">
                Track your volunteer activities and make an impact in your community
              </p>
            </div>
            
            {/* Rank Badge */}
            {dashboard.profile && (
              <div className="flex flex-col items-end">
                <div className={`inline-flex items-center px-4 py-2 rounded-full font-bold border-2 ${volunteerService.getRankBadgeColor(dashboard.profile.rank)}`}>
                  <span className="text-2xl mr-2">{volunteerService.getRankIcon(dashboard.profile.rank)}</span>
                  <span className="text-lg">{dashboard.profile.rank}</span>
                </div>
                
                {/* Rank Progress */}
                {dashboard.profile.rank !== 'Platinum' && (
                  <div className="mt-3 w-64">
                    {(() => {
                      const nextRank = volunteerService.getNextRank(dashboard.profile.rank);
                      const progress = volunteerService.getRankProgress(
                        dashboard.profile.completedCampaigns,
                        dashboard.profile.rank
                      );
                      const remaining = nextRank.campaignsNeeded - dashboard.profile.completedCampaigns;
                      
                      return (
                        <>
                          <p className="text-xs text-gray-600 mb-1 text-right">
                            {remaining} {remaining === 1 ? 'campaign' : 'campaigns'} to {nextRank.rank}
                          </p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${volunteerService.getRankColor(dashboard.profile.rank)}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1 text-right">
                            {dashboard.profile.completedCampaigns} / {nextRank.campaignsNeeded} campaigns
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Hours */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Hours</p>
                <p className="text-3xl font-bold mt-2">{stats.totalHoursVolunteered}</p>
                <p className="text-blue-100 text-xs mt-1">Hours volunteered</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <ClockIcon className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Tasks Completed */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Tasks Completed</p>
                <p className="text-3xl font-bold mt-2">{stats.totalTasksCompleted}</p>
                <p className="text-green-100 text-xs mt-1">Successful completions</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <CheckCircleIcon className="h-8 w-8" />
              </div>
            </div>
          </div>

          {/* Campaigns Supported */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Campaigns</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCampaignsSupported}</p>
                <p className="text-purple-100 text-xs mt-1">Campaigns supported</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <TrophyIcon className="h-8 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Rating & Points */}
        {stats.totalRatings > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Your Rating</p>
                  <div className="flex items-center mt-2">
                    <StarIcon className="h-6 w-6 text-yellow-400 fill-current" />
                    <span className="text-2xl font-bold text-gray-900 ml-2">
                      {stats.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-500 ml-2">/ 5.0</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">Based on {stats.totalRatings} ratings</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Achievement Points</p>
                  <div className="flex items-center mt-2">
                    <TrophyIcon className="h-6 w-6 text-yellow-500" />
                    <span className="text-2xl font-bold text-gray-900 ml-2">{stats.totalPoints}</span>
                    <span className="text-gray-500 ml-2">points</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-1">
                    {stats.achievementsUnlocked} achievements unlocked
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Requests & Assignments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Requests */}
            {dashboard.pendingRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Pending Requests ({dashboard.pendingRequests.length})
                  </h2>
                  <Link
                    to="/volunteer/requests"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {dashboard.pendingRequests.slice(0, 3).map((request) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${volunteerService.getPriorityColor(
                                request.priority
                              )}`}
                            >
                              {request.priority.toUpperCase()}
                            </span>
                            <span className="text-gray-500 text-sm">{request.taskType}</span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{request.title}</h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {request.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              {volunteerService.formatDate(request.startDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {request.estimatedHours}h
                            </span>
                            {request.meetingPoint && (
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="h-4 w-4" />
                                {request.meetingPoint}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          to={`/volunteer/requests/${request.id}`}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Active Assignments */}
            {dashboard.activeAssignments.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Active Assignments ({dashboard.activeAssignments.length})
                  </h2>
                  <Link
                    to="/volunteer/assignments"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="space-y-4">
                  {dashboard.activeAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${volunteerService.getStatusColor(
                                assignment.status
                              )}`}
                            >
                              {volunteerService.getStatusText(assignment.status)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{assignment.campaignTitle}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{assignment.progressPercentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${assignment.progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <CalendarDaysIcon className="h-4 w-4" />
                          {volunteerService.formatDate(assignment.startDate)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClockIcon className="h-4 w-4" />
                          {assignment.estimatedHours}h
                        </span>
                      </div>

                      <Link
                        to={`/volunteer/assignments/${assignment.id}`}
                        className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center text-sm font-medium"
                      >
                        Manage Assignment
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Tasks */}
            {dashboard.upcomingTasks.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Upcoming Tasks ({dashboard.upcomingTasks.length})
                </h2>
                <div className="space-y-3">
                  {dashboard.upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <CalendarDaysIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          {volunteerService.formatDate(task.startDate)}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">{task.estimatedHours}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Achievements & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            {dashboard.recentAchievements.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Achievements</h2>
                  <Link
                    to="/volunteer/achievements"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    View All →
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {dashboard.recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="border-2 border-gray-200 rounded-lg p-3 text-center hover:border-blue-300 transition-colors"
                      style={{ borderColor: achievement.isUnlocked ? achievement.badgeColor : undefined }}
                    >
                      <div className="text-3xl mb-2">
                        {achievement.badgeIcon === 'star' && '⭐'}
                        {achievement.badgeIcon === 'clock' && '🕐'}
                        {achievement.badgeIcon === 'trophy' && '🏆'}
                      </div>
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{achievement.description}</p>
                      {achievement.points && (
                        <p className="text-xs font-medium text-blue-600 mt-1">
                          +{achievement.points} pts
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/volunteer/requests"
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <HeartIcon className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">View Requests</span>
                </Link>
                <Link
                  to="/volunteer/assignments"
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">My Assignments</span>
                </Link>
                <Link
                  to="/dashboard/campaigns"
                  className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <TrophyIcon className="h-5 w-5 text-orange-600" />
                  <span className="font-medium text-orange-900">Browse & Donate to Campaigns</span>
                </Link>
                <Link
                  to="/volunteer/history"
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <ClockIcon className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">View History</span>
                </Link>
                <Link
                  to="/volunteer/profile"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <UserGroupIcon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">Edit Profile</span>
                </Link>
              </div>
            </div>

            {/* Profile Verification Status */}
            {dashboard.profile && !dashboard.profile.isVerified && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <ExclamationCircleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-1">
                      Profile Pending Verification
                    </h3>
                    <p className="text-sm text-yellow-700">
                      Your volunteer profile is pending admin verification. You'll be able to receive
                      requests once verified.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

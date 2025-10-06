import { useState, useEffect } from 'react';
import {
  ClockIcon,
  TrophyIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  CalendarDaysIcon,
  StarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import volunteerService from '../../services/volunteerService';
import type { VolunteerHistory, VolunteerAssignment, VolunteerActivity } from '../../types/volunteer.types';

export default function VolunteerHistoryPage() {
  const [history, setHistory] = useState<VolunteerHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchHistory();
  }, [currentPage]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getHistory(currentPage, pageSize);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading History</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchHistory}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!history) return null;

  const stats = history.stats;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer History</h1>
          <p className="mt-2 text-gray-600">
            View your completed assignments, activities, and impact created
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Hours</p>
                <p className="text-3xl font-bold mt-2">{stats.totalHoursVolunteered}</p>
              </div>
              <ClockIcon className="h-10 w-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Completed</p>
                <p className="text-3xl font-bold mt-2">{stats.totalTasksCompleted}</p>
              </div>
              <CheckCircleIcon className="h-10 w-10 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Campaigns</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCampaignsSupported}</p>
              </div>
              <TrophyIcon className="h-10 w-10 opacity-80" />
            </div>
          </div>
        </div>

        {/* Rating */}
        {stats.totalRatings > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-2">Overall Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-6 w-6 ${
                          star <= Math.round(stats.averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</span>
                  <span className="text-gray-500">/ 5.0</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">Based on {stats.totalRatings} ratings</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Completed Assignments */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Completed Assignments</h2>

              {history.completedAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No completed assignments yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.completedAssignments.map((assignment: VolunteerAssignment) => (
                    <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{assignment.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{assignment.campaignTitle}</p>

                          <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                            <span className="flex items-center gap-1">
                              <CalendarDaysIcon className="h-4 w-4" />
                              {volunteerService.formatDate(assignment.completedAt || assignment.endDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <ClockIcon className="h-4 w-4" />
                              {assignment.actualHours}h
                            </span>
                            {assignment.rating && (
                              <span className="flex items-center gap-1">
                                <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
                                {assignment.rating.toFixed(1)}
                              </span>
                            )}
                          </div>

                          {assignment.certificateIssued && (
                            <div className="flex items-center gap-2 text-green-600 text-sm">
                              <CheckCircleIcon className="h-4 w-4" />
                              <span className="font-medium">Certificate Issued</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {assignment.completionNotes && (
                        <div className="bg-gray-50 rounded p-3 mt-3">
                          <p className="text-xs text-gray-500 mb-1">Completion Notes</p>
                          <p className="text-sm text-gray-700">{assignment.completionNotes}</p>
                        </div>
                      )}

                      {assignment.feedback && (
                        <div className="bg-blue-50 rounded p-3 mt-3">
                          <p className="text-xs text-blue-500 mb-1">Admin Feedback</p>
                          <p className="text-sm text-blue-900">{assignment.feedback}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {history.completedAssignments.length >= pageSize && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">Page {currentPage}</span>
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>

              {history.recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No activities yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.recentActivities.map((activity: VolunteerActivity, index: number) => (
                    <div key={activity.id} className="relative pl-6">
                      {/* Timeline line */}
                      {index < history.recentActivities.length - 1 && (
                        <div className="absolute left-2 top-8 bottom-0 w-0.5 bg-gray-200"></div>
                      )}

                      {/* Activity dot */}
                      <div
                        className={`absolute left-0 top-2 w-4 h-4 rounded-full border-2 border-white ${
                          activity.activityType === 'checked_out' || activity.activityType === 'task_completed'
                            ? 'bg-green-500'
                            : activity.activityType === 'checked_in'
                            ? 'bg-blue-500'
                            : activity.activityType === 'request_accepted'
                            ? 'bg-purple-500'
                            : 'bg-gray-400'
                        }`}
                      ></div>

                      <div>
                        <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                        {activity.description && (
                          <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                        )}
                        {activity.campaignTitle && (
                          <p className="text-xs text-gray-500 mt-1">📋 {activity.campaignTitle}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {volunteerService.formatDateTime(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Last Activity */}
            {stats.lastActivityAt && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <p className="text-sm text-gray-500">Last Activity</p>
                <p className="text-gray-900 font-medium">
                  {volunteerService.formatDateTime(stats.lastActivityAt)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

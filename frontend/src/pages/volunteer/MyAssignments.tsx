import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClockIcon,
  CalendarDaysIcon,
  // MapPinIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FunnelIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import volunteerService from '../../services/volunteerService';
import type { VolunteerAssignment, CheckIn, CheckOut, UpdateProgress } from '../../types/volunteer.types';

export default function MyAssignments() {
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<VolunteerAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAssignment, setSelectedAssignment] = useState<VolunteerAssignment | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCheckOutModal, setShowCheckOutModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkInNotes, setCheckInNotes] = useState('');
  const [checkOutNotes, setCheckOutNotes] = useState('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  // const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  useEffect(() => {
    filterAssignments();
  }, [assignments, statusFilter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getMyAssignments();
      setAssignments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAssignments = () => {
    if (statusFilter === 'all') {
      setFilteredAssignments(assignments);
    } else {
      setFilteredAssignments(assignments.filter((a) => a.status === statusFilter));
    }
  };

  const handleCheckIn = (assignment: VolunteerAssignment) => {
    setSelectedAssignment(assignment);
    setShowCheckInModal(true);
  };

  const handleCheckOut = (assignment: VolunteerAssignment) => {
    setSelectedAssignment(assignment);
    setShowCheckOutModal(true);
  };

  const handleUpdateProgress = (assignment: VolunteerAssignment) => {
    setSelectedAssignment(assignment);
    setProgressPercentage(assignment.progressPercentage);
    setProgressNotes(assignment.progressNotes || '');
    setShowProgressModal(true);
  };

  const confirmCheckIn = async () => {
    if (!selectedAssignment) return;

    try {
      setProcessing(true);
      const location = await volunteerService.getCurrentLocation();
      
      const data: CheckIn = {
        assignmentId: selectedAssignment.id,
        latitude: location.latitude,
        longitude: location.longitude,
        location: 'Current Location',
        notes: checkInNotes,
      };

      await volunteerService.checkIn(data);
      setShowCheckInModal(false);
      setCheckInNotes('');
      await fetchAssignments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to check in');
    } finally {
      setProcessing(false);
    }
  };

  const confirmCheckOut = async () => {
    if (!selectedAssignment) return;

    try {
      setProcessing(true);
      const location = await volunteerService.getCurrentLocation();
      
      const data: CheckOut = {
        assignmentId: selectedAssignment.id,
        latitude: location.latitude,
        longitude: location.longitude,
        location: 'Current Location',
        completionNotes: checkOutNotes,
      };

      await volunteerService.checkOut(data);
      setShowCheckOutModal(false);
      setCheckOutNotes('');
      await fetchAssignments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to check out');
    } finally {
      setProcessing(false);
    }
  };

  const confirmUpdateProgress = async () => {
    if (!selectedAssignment) return;

    try {
      setProcessing(true);
      const data: UpdateProgress = {
        assignmentId: selectedAssignment.id,
        progressPercentage: progressPercentage,
        progressNotes: progressNotes || undefined,
      };

      await volunteerService.updateProgress(data);
      setShowProgressModal(false);
      setProgressPercentage(0);
      setProgressNotes('');
      await fetchAssignments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update progress');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Assignments</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAssignments}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const activeCount = assignments.filter((a) => a.status === 'assigned' || a.status === 'in_progress').length;
  const completedCount = assignments.filter((a) => a.status === 'completed').length;
  const inProgressCount = assignments.filter((a) => a.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="mt-2 text-gray-600">
            Manage your active volunteer assignments and track your progress
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">Total Assignments</p>
            <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">Active</p>
            <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">In Progress</p>
            <p className="text-2xl font-bold text-purple-600">{inProgressCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">Completed</p>
            <p className="text-2xl font-bold text-green-600">{completedCount}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex items-center gap-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Assignments</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'all'
                ? "You don't have any assignments yet."
                : `No ${statusFilter} assignments found.`}
            </p>
            <Link
              to="/volunteer/requests"
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Pending Requests
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${volunteerService.getStatusColor(
                          assignment.status
                        )}`}
                      >
                        {volunteerService.getStatusText(assignment.status)}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        {assignment.taskType}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{assignment.title}</h2>
                    <p className="text-gray-600 mb-3">{assignment.description}</p>

                    {/* Campaign Info */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-blue-900">Campaign</p>
                      <p className="text-blue-700">{assignment.campaignTitle}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span className="font-medium">Progress</span>
                        <span className="font-bold">{assignment.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${assignment.progressPercentage}%` }}
                        ></div>
                      </div>
                      {assignment.progressNotes && (
                        <p className="text-sm text-gray-500 mt-1">{assignment.progressNotes}</p>
                      )}
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="font-medium">{volunteerService.formatDate(assignment.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="font-medium">{volunteerService.formatDate(assignment.endDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Hours</p>
                          <p className="font-medium">
                            {assignment.actualHours > 0 ? assignment.actualHours : assignment.estimatedHours}h
                            {assignment.actualHours > 0 && (
                              <span className="text-xs text-gray-500"> (actual)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Check-in Status */}
                    {assignment.checkInInfo && (
                      <div className="bg-green-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                          <p className="text-sm font-medium text-green-900">Checked In</p>
                        </div>
                        <p className="text-sm text-green-700">
                          {volunteerService.formatDateTime(assignment.checkInInfo.checkInTime || '')}
                        </p>
                        {assignment.checkInInfo.checkInLocation && (
                          <p className="text-xs text-green-600 mt-1">
                            📍 {assignment.checkInInfo.checkInLocation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Check-out Status */}
                    {assignment.checkOutInfo && (
                      <div className="bg-purple-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <StopIcon className="h-5 w-5 text-purple-600" />
                          <p className="text-sm font-medium text-purple-900">Checked Out</p>
                        </div>
                        <p className="text-sm text-purple-700">
                          {volunteerService.formatDateTime(assignment.checkOutInfo.checkOutTime || '')}
                        </p>
                        {assignment.checkOutInfo.checkOutLocation && (
                          <p className="text-xs text-purple-600 mt-1">
                            📍 {assignment.checkOutInfo.checkOutLocation}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Rating */}
                    {assignment.rating && (
                      <div className="bg-yellow-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-yellow-900">Admin Rating</p>
                        <p className="text-lg font-bold text-yellow-600">⭐ {assignment.rating.toFixed(1)} / 5.0</p>
                        {assignment.feedback && (
                          <p className="text-sm text-yellow-700 mt-1">{assignment.feedback}</p>
                        )}
                      </div>
                    )}

                    {/* Certificate */}
                    {assignment.certificateIssued && (
                      <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-900">🏆 Certificate Issued</p>
                            <p className="text-xs text-green-700">Congratulations on completing this task!</p>
                          </div>
                          {assignment.certificatePath && (
                            <button className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                  {assignment.status === 'assigned' && !assignment.checkInInfo && (
                    <button
                      onClick={() => handleCheckIn(assignment)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                    >
                      <PlayIcon className="h-5 w-5" />
                      Check In
                    </button>
                  )}

                  {assignment.status === 'in_progress' && assignment.checkInInfo && !assignment.checkOutInfo && (
                    <>
                      <button
                        onClick={() => handleUpdateProgress(assignment)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                      >
                        <ArrowPathIcon className="h-5 w-5" />
                        Update Progress
                      </button>
                      <button
                        onClick={() => handleCheckOut(assignment)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                      >
                        <StopIcon className="h-5 w-5" />
                        Check Out
                      </button>
                    </>
                  )}

                  {assignment.status === 'completed' && (
                    <Link
                      to="/volunteer/history"
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center font-medium"
                    >
                      View in History
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Check In Modal */}
        {showCheckInModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Check In</h3>
              <p className="text-gray-600 mb-4">
                Starting: <strong>{selectedAssignment.title}</strong>
              </p>
              <div className="bg-blue-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-900">
                  📍 Your location will be recorded for verification purposes.
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={checkInNotes}
                  onChange={(e) => setCheckInNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add any notes about your check-in..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCheckInModal(false);
                    setCheckInNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckIn}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Checking In...' : 'Confirm Check In'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Check Out Modal */}
        {showCheckOutModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Check Out</h3>
              <p className="text-gray-600 mb-4">
                Completing: <strong>{selectedAssignment.title}</strong>
              </p>
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-900">
                  📍 Your location will be recorded for verification purposes.
                </p>
              </div>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Completion Notes
                  </label>
                  <textarea
                    value={checkOutNotes}
                    onChange={(e) => setCheckOutNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe what you accomplished..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCheckOutModal(false);
                    setCheckOutNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckOut}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Checking Out...' : 'Confirm Check Out'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Progress Update Modal */}
        {showProgressModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Update Progress</h3>
              <p className="text-gray-600 mb-4">
                Task: <strong>{selectedAssignment.title}</strong>
              </p>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress: {progressPercentage}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progressPercentage}
                    onChange={(e) => setProgressPercentage(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Progress Notes (Optional)
                  </label>
                  <textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add notes about your progress..."
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setProgressPercentage(0);
                    setProgressNotes('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmUpdateProgress}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Updating...' : 'Update Progress'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

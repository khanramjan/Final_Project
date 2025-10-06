import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClockIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import volunteerService from '../../services/volunteerService';
import type { VolunteerRequest, AcceptRequest, DeclineRequest } from '../../types/volunteer.types';

export default function VolunteerRequests() {
  const [requests, setRequests] = useState<VolunteerRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VolunteerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<VolunteerRequest | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [acceptMessage, setAcceptMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getMyRequests();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    if (statusFilter === 'all') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter((r) => r.status === statusFilter));
    }
  };

  const handleAccept = (request: VolunteerRequest) => {
    setSelectedRequest(request);
    setShowAcceptModal(true);
  };

  const handleDecline = (request: VolunteerRequest) => {
    setSelectedRequest(request);
    setShowDeclineModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      const data: AcceptRequest = {
        requestId: selectedRequest.id,
        acceptanceMessage: acceptMessage,
      };
      await volunteerService.acceptRequest(data);
      setShowAcceptModal(false);
      setAcceptMessage('');
      await fetchRequests();
      // Navigate to assignments page
      navigate('/volunteer/assignments');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to accept request');
    } finally {
      setProcessing(false);
    }
  };

  const confirmDecline = async () => {
    if (!selectedRequest || !declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      setProcessing(true);
      const data: DeclineRequest = {
        requestId: selectedRequest.id,
        declineReason: declineReason,
      };
      await volunteerService.declineRequest(data);
      setShowDeclineModal(false);
      setDeclineReason('');
      await fetchRequests();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to decline request');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRequests}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const acceptedCount = requests.filter((r) => r.status === 'accepted').length;
  const declinedCount = requests.filter((r) => r.status === 'declined').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Requests</h1>
          <p className="mt-2 text-gray-600">
            View and respond to volunteer opportunities sent by campaign organizers
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{requests.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{acceptedCount}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <p className="text-gray-500 text-sm">Declined</p>
            <p className="text-2xl font-bold text-red-600">{declinedCount}</p>
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
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ExclamationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all'
                ? "You don't have any volunteer requests yet."
                : `No ${statusFilter} requests found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${volunteerService.getPriorityColor(
                          request.priority
                        )}`}
                      >
                        {request.priority.toUpperCase()}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${volunteerService.getStatusColor(
                          request.status
                        )}`}
                      >
                        {volunteerService.getStatusText(request.status)}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                        {request.taskType}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{request.title}</h2>
                    <p className="text-gray-600 mb-3">{request.description}</p>

                    {/* Campaign Info */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-medium text-blue-900">Campaign</p>
                      <p className="text-blue-700">{request.campaignTitle}</p>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="font-medium">{volunteerService.formatDate(request.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="font-medium">{volunteerService.formatDate(request.endDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <ClockIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Estimated Time</p>
                          <p className="font-medium">{request.estimatedHours} hours</p>
                        </div>
                      </div>
                    </div>

                    {/* Meeting Point */}
                    {request.meetingPoint && (
                      <div className="flex items-start gap-2 text-gray-600 mb-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500">Meeting Point</p>
                          <p className="font-medium">{request.meetingPoint}</p>
                        </div>
                      </div>
                    )}

                    {/* Required Skills */}
                    {request.requiredSkills && request.requiredSkills.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {request.requiredSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Required Equipment */}
                    {request.requiredEquipment && request.requiredEquipment.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Required Equipment</p>
                        <div className="flex flex-wrap gap-2">
                          {request.requiredEquipment.map((equipment, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium"
                            >
                              {equipment}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Team Size */}
                    {request.teamSize && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Team Size:</span> {request.teamSize} volunteers
                      </p>
                    )}

                    {/* Admin Notes */}
                    {request.adminNotes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1">Admin Notes</p>
                        <p className="text-sm text-gray-700">{request.adminNotes}</p>
                      </div>
                    )}

                    {/* Decline Reason (if declined) */}
                    {request.status === 'declined' && request.declineReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-500 mb-1">Decline Reason</p>
                        <p className="text-sm text-red-700">{request.declineReason}</p>
                      </div>
                    )}

                    {/* Responded At */}
                    {request.respondedAt && (
                      <p className="text-xs text-gray-500 mt-3">
                        Responded: {volunteerService.formatDateTime(request.respondedAt)}
                      </p>
                    )}

                    {/* Requested By */}
                    <p className="text-xs text-gray-500 mt-2">
                      Requested by: {request.requestedByName} on{' '}
                      {volunteerService.formatDate(request.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleAccept(request)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleDecline(request)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Accept Modal */}
        {showAcceptModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Accept Volunteer Request</h3>
              <p className="text-gray-600 mb-4">
                You are accepting: <strong>{selectedRequest.title}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={acceptMessage}
                  onChange={(e) => setAcceptMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Add a message for the organizer..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAcceptModal(false);
                    setAcceptMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAccept}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Accepting...' : 'Confirm Accept'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Decline Modal */}
        {showDeclineModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Decline Volunteer Request</h3>
              <p className="text-gray-600 mb-4">
                You are declining: <strong>{selectedRequest.title}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Declining <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Please explain why you cannot accept this request..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  disabled={processing}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDecline}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  disabled={processing}
                >
                  {processing ? 'Declining...' : 'Confirm Decline'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

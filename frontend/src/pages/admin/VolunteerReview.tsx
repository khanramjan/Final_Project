import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon, 
  StarIcon,
  PhotoIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface PendingReview {
  id: number;
  volunteerId: number;
  volunteerProfile: {
    id: number;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    rank: string;
    rating: number;
  };
  campaignId: number;
  campaign: {
    title: string;
  };
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  estimatedHours: number;
  actualHours: number;
  checkInTime: string | null;
  checkOutTime: string | null;
  checkInLocation: string | null;
  checkOutLocation: string | null;
  completionNotes: string | null;
  completionEvidence: string | null;
  rating: number | null;
  feedback: string | null;
}

export default function VolunteerReview() {
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        '/api/volunteer/admin/assignments/pending-review',
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingReviews(data);
      }
    } catch (error) {
      console.error('Error fetching pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (review: PendingReview) => {
    setSelectedReview(review);
    setModalType('approve');
    setRating(5);
    setFeedback('');
    setShowModal(true);
  };

  const handleReject = (review: PendingReview) => {
    setSelectedReview(review);
    setModalType('reject');
    setRating(1);
    setFeedback('');
    setShowModal(true);
  };

  const submitDecision = async () => {
    if (!selectedReview) return;
    
    if (modalType === 'reject' && !feedback.trim()) {
      alert('Please provide feedback for rejection');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/volunteer/admin/assignments/${selectedReview.id}/verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approve: modalType === 'approve',
            rating: modalType === 'approve' ? rating : undefined,
            feedback: feedback
          })
        }
      );

      if (response.ok) {
        alert(`Work ${modalType === 'approve' ? 'approved' : 'rejected'} successfully!`);
        setShowModal(false);
        setSelectedReview(null);
        setFeedback('');
        fetchPendingReviews();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to process request');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setProcessing(false);
    }
  };

  const parseEvidencePhotos = (evidence: string | null): string[] => {
    if (!evidence) return [];
    try {
      return JSON.parse(evidence);
    } catch {
      return [];
    }
  };

  const getRankBadgeColor = (rank: string) => {
    const colors: Record<string, string> = {
      'newbie': 'bg-gray-100 text-gray-800',
      'bronze': 'bg-orange-100 text-orange-800',
      'silver': 'bg-gray-100 text-gray-600',
      'gold': 'bg-yellow-100 text-yellow-800',
      'platinum': 'bg-purple-100 text-purple-800'
    };
    return colors[rank?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Work Review</h1>
        <p className="text-gray-600 mt-2">Review and verify completed volunteer assignments</p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* No Reviews */}
      {!loading && pendingReviews.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
          <p className="mt-1 text-sm text-gray-500">
            All volunteer work has been reviewed.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {!loading && pendingReviews.length > 0 && (
        <div className="space-y-6">
          {pendingReviews.map((review) => {
            const photos = parseEvidencePhotos(review.completionEvidence);
            
            return (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{review.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{review.campaign.title}</p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    Pending Review
                  </span>
                </div>

                {/* Volunteer Info */}
                <div className="flex items-center space-x-3 mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                    {review.volunteerProfile.user.firstName.charAt(0)}
                    {review.volunteerProfile.user.lastName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {review.volunteerProfile.user.firstName} {review.volunteerProfile.user.lastName}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRankBadgeColor(review.volunteerProfile.rank)}`}>
                        {review.volunteerProfile.rank}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span>{review.volunteerProfile.user.email}</span>
                      <span className="flex items-center">
                        <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                        {review.volunteerProfile.rating.toFixed(1)} rating
                      </span>
                    </div>
                  </div>
                </div>

                {/* Work Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {new Date(review.startDate).toLocaleDateString()} - {new Date(review.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center text-sm">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-600">
                      {review.actualHours} hours worked (Est: {review.estimatedHours}h)
                    </span>
                  </div>
                </div>

                {/* Check-in/out Info */}
                {review.checkInTime && review.checkOutTime && (
                  <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Check-in</p>
                      <p className="text-sm text-gray-900">{new Date(review.checkInTime).toLocaleString()}</p>
                      {review.checkInLocation && (
                        <p className="text-xs text-gray-600 flex items-center mt-1">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {review.checkInLocation}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1">Check-out</p>
                      <p className="text-sm text-gray-900">{new Date(review.checkOutTime).toLocaleString()}</p>
                      {review.checkOutLocation && (
                        <p className="text-xs text-gray-600 flex items-center mt-1">
                          <MapPinIcon className="h-3 w-3 mr-1" />
                          {review.checkOutLocation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Task Description</h4>
                  <p className="text-sm text-gray-600">{review.description}</p>
                </div>

                {/* Completion Notes */}
                {review.completionNotes && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Completion Notes</h4>
                    <p className="text-sm text-gray-900 bg-green-50 p-3 rounded-lg border border-green-200">
                      {review.completionNotes}
                    </p>
                  </div>
                )}

                {/* Evidence Photos */}
                {photos.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <PhotoIcon className="h-5 w-5 mr-2" />
                      Evidence Photos ({photos.length})
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {photos.map((photo, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={photo}
                            alt={`Evidence ${idx + 1}`}
                            className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t">
                  <button
                    onClick={() => handleApprove(review)}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Approve & Rate</span>
                  </button>
                  <button
                    onClick={() => handleReject(review)}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 font-medium"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    <span>Request Revisions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {modalType === 'approve' ? 'Approve & Rate Work' : 'Request Revisions'}
            </h3>
            
            {modalType === 'approve' ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5 stars)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <StarIcon
                        className={`h-8 w-8 ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    {rating} / 5
                  </span>
                </div>
              </div>
            ) : null}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalType === 'approve' ? 'Feedback (Optional)' : 'Revision Notes (Required)'}
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={
                  modalType === 'approve'
                    ? 'Great work! Very professional...'
                    : 'Please improve the following...'
                }
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                disabled={processing}
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 font-medium ${
                  modalType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing...' : modalType === 'approve' ? 'Approve' : 'Send Back'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, ClockIcon, MapPinIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

interface PendingVolunteer {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  skills: string[];
  interests: string[];
  experienceLevel: string;
  yearsOfExperience: number;
  location: string;
  nidPhotoPath?: string;
  volunteerPhotoPath?: string;
  utilityBillPath?: string;
  adminApprovalStatus: string;
  createdAt: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function VolunteerApprovals() {
  const [volunteers, setVolunteers] = useState<PendingVolunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [selectedVolunteer, setSelectedVolunteer] = useState<PendingVolunteer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject'>('approve');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [imageModal, setImageModal] = useState<{ show: boolean; url: string; title: string }>({
    show: false,
    url: '',
    title: ''
  });

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = statusFilter === 'pending'
        ? '/api/volunteer/admin/pending-approvals'
        : `/api/volunteer/admin/all-volunteers?status=${statusFilter === 'all' ? '' : statusFilter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setVolunteers(data);
      }
    } catch (error) {
      console.error('Error fetching volunteers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteers();
  }, [statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = (volunteer: PendingVolunteer) => {
    setSelectedVolunteer(volunteer);
    setModalType('approve');
    setApprovalNotes('');
    setShowModal(true);
  };

  const handleReject = (volunteer: PendingVolunteer) => {
    setSelectedVolunteer(volunteer);
    setModalType('reject');
    setApprovalNotes('');
    setShowModal(true);
  };

  const submitDecision = async () => {
    if (!selectedVolunteer) return;
    if (modalType === 'reject' && !approvalNotes.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/volunteer/admin/approve/${selectedVolunteer.id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            approve: modalType === 'approve',
            approvalNotes: approvalNotes
          })
        }
      );

      if (response.ok) {
        alert(`Volunteer ${modalType === 'approve' ? 'approved' : 'rejected'} successfully!`);
        setShowModal(false);
        setSelectedVolunteer(null);
        setApprovalNotes('');
        fetchVolunteers();
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

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getExperienceBadge = (level: string) => {
    const badges = {
      beginner: 'bg-blue-100 text-blue-800',
      intermediate: 'bg-purple-100 text-purple-800',
      advanced: 'bg-orange-100 text-orange-800',
      expert: 'bg-red-100 text-red-800'
    };
    return badges[level as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Approvals</h1>
        <p className="text-gray-600 mt-2">Review and approve volunteer registrations</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['pending', 'approved', 'rejected', 'all'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize
                ${statusFilter === status
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {status}
              {status === 'pending' && volunteers.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  {volunteers.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Volunteers List */}
      {!loading && volunteers.length === 0 && (
        <div className="text-center py-12">
          <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No volunteers</h3>
          <p className="mt-1 text-sm text-gray-500">
            No {statusFilter !== 'all' && statusFilter} volunteers to display.
          </p>
        </div>
      )}

      {!loading && volunteers.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          {volunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {volunteer.userName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{volunteer.userName}</h3>
                      <p className="text-sm text-gray-600">{volunteer.userEmail}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(volunteer.adminApprovalStatus)}`}>
                    {volunteer.adminApprovalStatus}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {volunteer.location || 'Not specified'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {volunteer.yearsOfExperience} years experience
                  </div>
                </div>

                {/* Experience Level */}
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getExperienceBadge(volunteer.experienceLevel)}`}>
                    {volunteer.experienceLevel}
                  </span>
                </div>

                {/* Skills */}
                {volunteer.skills.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {volunteer.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {volunteer.interests.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {volunteer.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploaded Documents */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* NID Photo */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <p className="text-xs font-medium text-gray-600 mb-2">NID/Passport Photo</p>
                      {volunteer.nidPhotoPath ? (
                        <div
                          onClick={() => setImageModal({ 
                            show: true, 
                            url: `http://localhost:5000${volunteer.nidPhotoPath}`,
                            title: 'NID/Passport Photo'
                          })}
                          className="cursor-pointer"
                        >
                          <img
                            src={`http://localhost:5000${volunteer.nidPhotoPath}`}
                            alt="NID"
                            className="w-full h-32 object-cover rounded hover:opacity-80 transition-opacity"
                          />
                          <p className="text-xs text-indigo-600 mt-1 hover:underline">Click to View</p>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <p className="text-xs text-gray-400">Not uploaded</p>
                        </div>
                      )}
                    </div>

                    {/* Volunteer Photo */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <p className="text-xs font-medium text-gray-600 mb-2">Profile Photo</p>
                      {volunteer.volunteerPhotoPath ? (
                        <div
                          onClick={() => setImageModal({ 
                            show: true, 
                            url: `http://localhost:5000${volunteer.volunteerPhotoPath}`,
                            title: 'Profile Photo'
                          })}
                          className="cursor-pointer"
                        >
                          <img
                            src={`http://localhost:5000${volunteer.volunteerPhotoPath}`}
                            alt="Profile"
                            className="w-full h-32 object-cover rounded hover:opacity-80 transition-opacity"
                          />
                          <p className="text-xs text-indigo-600 mt-1 hover:underline">Click to View</p>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <p className="text-xs text-gray-400">Not uploaded</p>
                        </div>
                      )}
                    </div>

                    {/* Utility Bill */}
                    <div className="border border-gray-200 rounded-lg p-3 bg-white">
                      <p className="text-xs font-medium text-gray-600 mb-2">Utility Bill</p>
                      {volunteer.utilityBillPath ? (
                        <div
                          onClick={() => setImageModal({ 
                            show: true, 
                            url: `http://localhost:5000${volunteer.utilityBillPath}`,
                            title: 'Utility Bill'
                          })}
                          className="cursor-pointer"
                        >
                          <img
                            src={`http://localhost:5000${volunteer.utilityBillPath}`}
                            alt="Utility Bill"
                            className="w-full h-32 object-cover rounded hover:opacity-80 transition-opacity"
                          />
                          <p className="text-xs text-indigo-600 mt-1 hover:underline">Click to View</p>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                          <p className="text-xs text-gray-400">Not uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div className="text-xs text-gray-500 mb-4">
                  Applied: {new Date(volunteer.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>

                {/* Actions */}
                {volunteer.adminApprovalStatus === 'pending' && (
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(volunteer)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(volunteer)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircleIcon className="h-5 w-5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && selectedVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {modalType === 'approve' ? 'Approve' : 'Reject'} Volunteer
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {modalType === 'approve'
                ? `You are about to approve ${selectedVolunteer.userName} as a volunteer.`
                : `You are about to reject ${selectedVolunteer.userName}'s volunteer application.`
              }
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder={
                  modalType === 'approve'
                    ? 'Add any notes about this approval...'
                    : 'Please explain why this application is being rejected...'
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
                className={`flex-1 px-4 py-2 rounded-lg text-white transition-colors disabled:opacity-50 ${
                  modalType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? 'Processing...' : modalType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {imageModal.show && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setImageModal({ show: false, url: '', title: '' })}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-t-lg p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{imageModal.title}</h3>
              <button
                onClick={() => setImageModal({ show: false, url: '', title: '' })}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="bg-white p-4">
              <img
                src={imageModal.url}
                alt={imageModal.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
            <div className="bg-white rounded-b-lg p-4 flex space-x-3">
              <a
                href={imageModal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-center"
              >
                Open in New Tab
              </a>
              <a
                href={imageModal.url}
                download
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

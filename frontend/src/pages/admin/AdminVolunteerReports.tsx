import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { VolunteerReport, ReviewVolunteerReport, VolunteerWarning } from '../../types/volunteer.types';
import api from '../../services/api';
// import { Link } from 'react-router-dom';

const AdminVolunteerReports = () => {
  const [reports, setReports] = useState<VolunteerReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<VolunteerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedReport, setSelectedReport] = useState<VolunteerReport | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [viewingVolunteer, setViewingVolunteer] = useState<any>(null);

  const [reviewData, setReviewData] = useState<ReviewVolunteerReport>({
    action: 'warn',
    adminNotes: '',
    newRank: '',
    downgradeReason: '',
    warningType: 'behavioral',
    warningDescription: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter(r => r.status === statusFilter));
    }
  }, [statusFilter, reports]);

  const fetchReports = async () => {
    try {
      const response = await api.get<VolunteerReport[]>('/volunteerreport/admin/all');
      setReports(response);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteerDetails = async (volunteerId: number) => {
    try {
      const response = await api.get(`/volunteerreport/admin/volunteer/${volunteerId}`);
      setViewingVolunteer(response);
    } catch (error) {
      console.error('Error fetching volunteer details:', error);
      toast.error('Failed to load volunteer details');
    }
  };

  const handleReview = async (report: VolunteerReport) => {
    setSelectedReport(report);
    setReviewData({
      action: 'warn',
      adminNotes: '',
      newRank: '',
      downgradeReason: '',
      warningType: 'behavioral',
      warningDescription: ''
    });
    
    // Fetch volunteer details to show in review modal
    await fetchVolunteerDetails(report.reportedVolunteerId);
    setShowReviewModal(true);
  };

  const handleViewVolunteer = async (report: VolunteerReport) => {
    await fetchVolunteerDetails(report.reportedVolunteerId);
  };

  const submitReview = async () => {
    if (!selectedReport) return;

    if (!reviewData.adminNotes.trim()) {
      toast.error('Please provide admin notes');
      return;
    }

    if (reviewData.action === 'downgrade' && !reviewData.newRank) {
      toast.error('Please select a new rank for downgrade');
      return;
    }

    if (reviewData.action === 'warn' && !reviewData.warningDescription) {
      toast.error('Please provide warning description');
      return;
    }

    try {
      await api.post(`/volunteerreport/admin/review/${selectedReport.id}`, reviewData);
      toast.success('Report reviewed successfully');
      setShowReviewModal(false);
      fetchReports();
    } catch (error) {
      console.error('Error reviewing report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to review report';
      toast.error(errorMessage);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ranks = ['Newbie', 'Bronze', 'Silver', 'Gold', 'Platinum'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Volunteer Reports</h1>
        <p className="text-gray-600 mt-2">Review and manage volunteer reports</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total Reports</div>
          <div className="text-2xl font-bold text-gray-900">{reports.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {reports.filter(r => r.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Under Review</div>
          <div className="text-2xl font-bold text-blue-600">
            {reports.filter(r => r.status === 'under_review').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Resolved</div>
          <div className="text-2xl font-bold text-green-600">
            {reports.filter(r => r.status === 'resolved').length}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'under_review', 'resolved', 'rejected'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500">No reports found</p>
          </div>
        ) : (
          filteredReports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}>
                      {report.severity.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Reported Volunteer:</span>{' '}
                      <button
                        onClick={() => handleViewVolunteer(report)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        {report.reportedVolunteerName} ({report.reportedVolunteerRank})
                      </button>
                    </div>
                    <div>
                      <span className="font-medium">Reported By:</span> {report.reportedByVolunteerName}
                    </div>
                    <div>
                      <span className="font-medium">Type:</span> {report.reportType.replace('_', ' ')}
                    </div>
                    {report.campaignTitle && (
                      <div>
                        <span className="font-medium">Campaign:</span> {report.campaignTitle}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Date:</span> {new Date(report.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4">{report.description}</p>

              {report.proofUrls && report.proofUrls.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Supporting Evidence:</div>
                  <div className="flex flex-wrap gap-2">
                    {report.proofUrls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 text-sm underline"
                      >
                        Evidence {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {report.adminAction && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Admin Review</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><span className="font-medium">Action:</span> {report.adminAction.replace('_', ' ').toUpperCase()}</div>
                    <div><span className="font-medium">Notes:</span> {report.adminNotes}</div>
                    {report.reviewedByName && (
                      <div><span className="font-medium">Reviewed By:</span> {report.reviewedByName}</div>
                    )}
                    {report.reviewedAt && (
                      <div><span className="font-medium">Reviewed At:</span> {new Date(report.reviewedAt).toLocaleString()}</div>
                    )}
                    {report.newRank && (
                      <div><span className="font-medium">Rank Changed:</span> {report.previousRank} → {report.newRank}</div>
                    )}
                  </div>
                </div>
              )}

              {report.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleReview(report)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    Review Report
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Report</h2>
              
              {/* Report Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-600 space-y-2">
                  <div><span className="font-medium">Volunteer:</span> {selectedReport.reportedVolunteerName}</div>
                  <div><span className="font-medium">Current Rank:</span> {selectedReport.reportedVolunteerRank}</div>
                  <div><span className="font-medium">Report Type:</span> {selectedReport.reportType.replace('_', ' ')}</div>
                  <div><span className="font-medium">Report:</span> {selectedReport.title}</div>
                  <div><span className="font-medium">Description:</span> {selectedReport.description}</div>
                  
                  {/* Show Proof URLs */}
                  {selectedReport.proofUrls && selectedReport.proofUrls.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="font-medium mb-2">📎 Supporting Evidence:</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedReport.proofUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-sm font-medium transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Evidence {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Volunteer History (if loaded) */}
              {viewingVolunteer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Volunteer History & Stats</h3>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded p-3">
                      <div className="text-xs text-gray-600">Rating</div>
                      <div className="text-lg font-bold text-gray-900">
                        {viewingVolunteer.volunteer.rating.toFixed(1)} ⭐
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-xs text-gray-600">Total Hours</div>
                      <div className="text-lg font-bold text-gray-900">
                        {viewingVolunteer.volunteer.totalHours}h
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-xs text-gray-600">Tasks Done</div>
                      <div className="text-lg font-bold text-gray-900">
                        {viewingVolunteer.volunteer.totalTasks}
                      </div>
                    </div>
                  </div>

                  {/* Reports & Warnings Summary */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
                      <div className="text-xs text-yellow-700">Total Reports</div>
                      <div className="text-lg font-bold text-yellow-900">
                        {viewingVolunteer.totalReports}
                      </div>
                    </div>
                    <div className="bg-orange-50 rounded p-3 border border-orange-200">
                      <div className="text-xs text-orange-700">Pending</div>
                      <div className="text-lg font-bold text-orange-900">
                        {viewingVolunteer.pendingReports}
                      </div>
                    </div>
                    <div className="bg-red-50 rounded p-3 border border-red-200">
                      <div className="text-xs text-red-700">Active Warnings</div>
                      <div className="text-lg font-bold text-red-900">
                        {viewingVolunteer.activeWarnings}
                      </div>
                    </div>
                  </div>

                  {/* Recent Reports */}
                  {viewingVolunteer.reports.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Recent Reports ({viewingVolunteer.reports.length})
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {viewingVolunteer.reports.slice(0, 3).map((report: VolunteerReport) => (
                          <div key={report.id} className="bg-white rounded p-2 text-xs">
                            <div className="flex justify-between">
                              <span className="font-medium">{report.title}</span>
                              <span className={`px-2 py-0.5 rounded ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </div>
                            <div className="text-gray-600 mt-1">{report.reportType.replace('_', ' ')}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Warnings */}
                  {viewingVolunteer.warnings.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">
                        Recent Warnings ({viewingVolunteer.warnings.length})
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {viewingVolunteer.warnings.slice(0, 3).map((warning: VolunteerWarning) => (
                          <div key={warning.id} className="bg-white rounded p-2 text-xs border-l-2 border-yellow-500">
                            <div className="font-medium">{warning.title}</div>
                            <div className="text-gray-600 mt-1">
                              {new Date(warning.issuedAt).toLocaleDateString()} - 
                              {warning.isAcknowledged ? ' ✓ Acknowledged' : ' ⚠ Pending'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {/* Action Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action *</label>
                  <select
                    value={reviewData.action}
                    onChange={(e) => setReviewData({ ...reviewData, action: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="warn">Issue Warning</option>
                    <option value="downgrade">Downgrade Badge</option>
                    <option value="suspend">Suspend Volunteer</option>
                    <option value="no_action">No Action Needed</option>
                    <option value="reject_report">Reject Report</option>
                  </select>
                </div>

                {/* Warning Type (if action is warn) */}
                {reviewData.action === 'warn' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Warning Type *</label>
                      <select
                        value={reviewData.warningType}
                        onChange={(e) => setReviewData({ ...reviewData, warningType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="behavioral">Behavioral</option>
                        <option value="performance">Performance</option>
                        <option value="attendance">Attendance</option>
                        <option value="policy_violation">Policy Violation</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Warning Description *</label>
                      <textarea
                        value={reviewData.warningDescription}
                        onChange={(e) => setReviewData({ ...reviewData, warningDescription: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Describe the warning..."
                      />
                    </div>
                  </>
                )}

                {/* Downgrade Rank Selection */}
                {reviewData.action === 'downgrade' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Rank *</label>
                      <select
                        value={reviewData.newRank}
                        onChange={(e) => setReviewData({ ...reviewData, newRank: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select new rank</option>
                        {ranks.map(rank => (
                          <option key={rank} value={rank}>{rank}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Downgrade Reason *</label>
                      <textarea
                        value={reviewData.downgradeReason}
                        onChange={(e) => setReviewData({ ...reviewData, downgradeReason: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Explain why the badge is being downgraded..."
                      />
                    </div>
                  </>
                )}

                {/* Admin Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes *</label>
                  <textarea
                    value={reviewData.adminNotes}
                    onChange={(e) => setReviewData({ ...reviewData, adminNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Add your review notes..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={submitReview}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Submit Review
                  </button>
                  <button
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Details Modal */}
      {viewingVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Volunteer Profile</h2>
                <button
                  onClick={() => setViewingVolunteer(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Volunteer Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-semibold">{viewingVolunteer.volunteer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-semibold">{viewingVolunteer.volunteer.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Rank</div>
                  <div className="font-semibold">{viewingVolunteer.volunteer.rank}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Rating</div>
                  <div className="font-semibold">{viewingVolunteer.volunteer.rating.toFixed(2)} / 5.0</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Hours</div>
                  <div className="font-semibold">{viewingVolunteer.volunteer.totalHours}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Tasks</div>
                  <div className="font-semibold">{viewingVolunteer.volunteer.totalTasks}</div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-blue-600">Total Reports</div>
                  <div className="text-2xl font-bold text-blue-900">{viewingVolunteer.totalReports}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-yellow-600">Pending Reports</div>
                  <div className="text-2xl font-bold text-yellow-900">{viewingVolunteer.pendingReports}</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-sm text-red-600">Active Warnings</div>
                  <div className="text-2xl font-bold text-red-900">{viewingVolunteer.activeWarnings}</div>
                </div>
              </div>

              {/* Reports */}
              {viewingVolunteer.reports.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Report History</h3>
                  <div className="space-y-3">
                    {viewingVolunteer.reports.slice(0, 5).map((report: VolunteerReport) => (
                      <div key={report.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{report.title}</div>
                            <div className="text-sm text-gray-600">{report.reportType.replace('_', ' ')}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {viewingVolunteer.warnings.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Warnings</h3>
                  <div className="space-y-3">
                    {viewingVolunteer.warnings.slice(0, 5).map((warning: VolunteerWarning) => (
                      <div key={warning.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{warning.title}</div>
                            <div className="text-sm text-gray-600">{warning.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Issued: {new Date(warning.issuedAt).toLocaleDateString()}
                            </div>
                          </div>
                          {warning.isAcknowledged ? (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                              Acknowledged
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                              Pending
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVolunteerReports;

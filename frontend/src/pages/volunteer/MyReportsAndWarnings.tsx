import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { VolunteerReport, VolunteerWarning } from '../../types/volunteer.types';
import api from '../../services/api';

const MyReportsAndWarnings = () => {
  const [myReports, setMyReports] = useState<VolunteerReport[]>([]);
  const [myWarnings, setMyWarnings] = useState<VolunteerWarning[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'warnings'>('reports');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsData, warningsData] = await Promise.all([
        api.get<VolunteerReport[]>('/volunteerreport/my-reports'),
        api.get<VolunteerWarning[]>('/volunteerreport/warnings/my-warnings')
      ]);
      setMyReports(reportsData);
      setMyWarnings(warningsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeWarning = async (warningId: number) => {
    try {
      await api.post(`/volunteerreport/warnings/acknowledge/${warningId}`);
      toast.success('Warning acknowledged');
      fetchData();
    } catch (error) {
      console.error('Error acknowledging warning:', error);
      toast.error('Failed to acknowledge warning');
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Reports & Warnings</h1>
        <p className="text-gray-600 mt-2">View reports you've submitted and warnings you've received</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'reports'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            My Reports ({myReports.length})
          </button>
          <button
            onClick={() => setActiveTab('warnings')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'warnings'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Warnings ({myWarnings.filter(w => w.isActive).length})
          </button>
        </div>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {myReports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">You haven't submitted any reports yet</p>
            </div>
          ) : (
            myReports.map(report => (
              <div key={report.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        <span className="font-medium">Reported Volunteer:</span> {report.reportedVolunteerName} ({report.reportedVolunteerRank})
                      </div>
                      <div>
                        <span className="font-medium">Type:</span> {report.reportType.replace('_', ' ')}
                      </div>
                      <div>
                        <span className="font-medium">Severity:</span>{' '}
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(report.severity)}`}>
                          {report.severity.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span> {new Date(report.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{report.description}</p>

                {report.adminAction && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-blue-900 mb-2">Admin Review</div>
                    <div className="text-sm text-blue-800 space-y-1">
                      <div><span className="font-medium">Action:</span> {report.adminAction.replace('_', ' ').toUpperCase()}</div>
                      <div><span className="font-medium">Notes:</span> {report.adminNotes}</div>
                      {report.reviewedAt && (
                        <div><span className="font-medium">Reviewed:</span> {new Date(report.reviewedAt).toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Warnings Tab */}
      {activeTab === 'warnings' && (
        <div className="space-y-4">
          {myWarnings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg className="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500">You have no warnings - Great work!</p>
            </div>
          ) : (
            myWarnings.map(warning => (
              <div key={warning.id} className={`rounded-lg border-2 p-6 ${getSeverityColor(warning.severity)}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <svg className="w-6 h-6 text-yellow-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">{warning.title}</h3>
                      {!warning.isAcknowledged ? (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          NOT ACKNOWLEDGED
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ACKNOWLEDGED
                        </span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-700 space-y-2">
                      <p className="font-medium">{warning.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                        <div>
                          <span className="font-medium">Type:</span> {warning.warningType.replace('_', ' ')}
                        </div>
                        <div>
                          <span className="font-medium">Severity:</span> {warning.severity.toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium">Issued:</span> {new Date(warning.issuedAt).toLocaleDateString()}
                        </div>
                        {warning.expiresAt && (
                          <div>
                            <span className="font-medium">Expires:</span> {new Date(warning.expiresAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {!warning.isAcknowledged && warning.isActive && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <button
                      onClick={() => acknowledgeWarning(warning.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Acknowledge Warning
                    </button>
                    <p className="text-xs text-gray-600 mt-2">
                      By acknowledging, you confirm that you have read and understood this warning.
                    </p>
                  </div>
                )}

                {warning.isAcknowledged && warning.acknowledgedAt && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      Acknowledged on {new Date(warning.acknowledgedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyReportsAndWarnings;

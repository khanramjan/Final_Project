import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { CreateVolunteerReport } from '../../types/volunteer.types';
import api from '../../services/api';

interface VolunteerOption {
  id: number;
  userName: string;
  email: string;
  rank: string;
  isVerified: boolean;
}

interface ReportVolunteerFormProps {
  reportedVolunteerId?: number;
  reportedVolunteerName?: string;
  campaignId?: number;
  assignmentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReportVolunteerForm = ({
  reportedVolunteerId,
  reportedVolunteerName,
  campaignId,
  assignmentId,
  onSuccess,
  onCancel
}: ReportVolunteerFormProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(true);
  const [volunteers, setVolunteers] = useState<VolunteerOption[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [formData, setFormData] = useState<CreateVolunteerReport>({
    reportedVolunteerId: reportedVolunteerId || 0,
    reportType: 'misconduct',
    title: '',
    description: '',
    proofUrls: [],
    campaignId,
    volunteerAssignmentId: assignmentId,
    severity: 'medium'
  });

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoadingVolunteers(true);
      console.log('Fetching volunteers from API...');
      const response = await api.get<VolunteerOption[]>('/volunteerreport/volunteers');
      console.log('Volunteers response:', response);
      setVolunteers(response);
      toast.success(`Loaded ${response.length} volunteers`);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      toast.error('Failed to load volunteers list. Please restart the backend server.');
    } finally {
      setLoadingVolunteers(false);
    }
  };

  const filteredVolunteers = volunteers.filter(v => 
    v.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedVolunteer = volunteers.find(v => v.id === formData.reportedVolunteerId);

  const reportTypes = [
    { value: 'misconduct', label: 'Misconduct' },
    { value: 'no_show', label: 'No Show / Absence' },
    { value: 'poor_performance', label: 'Poor Performance' },
    { value: 'inappropriate_behavior', label: 'Inappropriate Behavior' },
    { value: 'safety_violation', label: 'Safety Violation' },
    { value: 'other', label: 'Other' }
  ];

  const severityLevels = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddProofUrl = () => {
    if (proofUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        proofUrls: [...(prev.proofUrls || []), proofUrl.trim()]
      }));
      setProofUrl('');
    }
  };

  const handleRemoveProofUrl = (index: number) => {
    setFormData(prev => ({
      ...prev,
      proofUrls: prev.proofUrls?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reportedVolunteerId) {
      toast.error('Please select a volunteer to report');
      return;
    }
    
    if (!formData.title.trim()) {
      toast.error('Please enter a report title');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please provide a detailed description');
      return;
    }

    setLoading(true);
    
    try {
      // Upload proof files if any
      const reportData = {
        ...formData,
        proofUrls: formData.proofUrls && formData.proofUrls.length > 0 ? formData.proofUrls : undefined
      };

      await api.post('/volunteerreport/create', reportData);
      
      toast.success('Report submitted successfully. Admin will review it.');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/volunteer/dashboard');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit report';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Report Volunteer</h2>
        {reportedVolunteerName ? (
          <p className="text-sm text-gray-600 mt-2">
            Reporting: <span className="font-semibold text-indigo-600">{reportedVolunteerName}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-600 mt-2">
            Please select a volunteer and provide detailed information about the issue.
          </p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Your report will be reviewed by an admin.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Volunteer Selection */}
        {!reportedVolunteerId && (
          <div>
            <label htmlFor="reportedVolunteerId" className="block text-sm font-medium text-gray-700 mb-2">
              Select Volunteer to Report *
            </label>
            {loadingVolunteers ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading volunteers...</p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 mb-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <select
                  id="reportedVolunteerId"
                  name="reportedVolunteerId"
                  value={formData.reportedVolunteerId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportedVolunteerId: Number(e.target.value) }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">-- Select a volunteer --</option>
                  {filteredVolunteers.map(volunteer => (
                    <option key={volunteer.id} value={volunteer.id}>
                      {volunteer.userName} ({volunteer.email}) - {volunteer.rank}
                      {volunteer.isVerified ? ' ✓' : ' (Unverified)'}
                    </option>
                  ))}
                </select>
                {filteredVolunteers.length === 0 && searchTerm && (
                  <p className="text-sm text-gray-500 mt-1">No volunteers found matching "{searchTerm}"</p>
                )}
                {selectedVolunteer && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">{selectedVolunteer.userName}</p>
                    <p className="text-xs text-blue-700">{selectedVolunteer.email} • {selectedVolunteer.rank}</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Report Type */}
        <div>
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
            Report Type *
          </label>
          <select
            id="reportType"
            name="reportType"
            value={formData.reportType}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            {reportTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severity */}
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
            Severity *
          </label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          >
            {severityLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Report Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief summary of the issue"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide as much detail as possible about what happened, when it happened, and any relevant context..."
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">Minimum 50 characters</p>
        </div>

        {/* Proof URLs */}
        <div>
          <label htmlFor="proofUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Supporting Evidence (Optional)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              id="proofUrl"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="Paste link to image/document (Google Drive, Imgur, etc.)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAddProofUrl}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload your evidence to Google Drive, Imgur, or any image hosting service and paste the link here
          </p>
          {formData.proofUrls && formData.proofUrls.length > 0 && (
            <div className="mt-3 space-y-2">
              <div className="text-sm font-medium text-gray-700">Added Evidence:</div>
              {formData.proofUrls.map((url, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded p-2">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-indigo-600 hover:text-indigo-800 truncate flex-1"
                  >
                    {url}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveProofUrl(index)}
                    className="ml-2 text-red-600 hover:text-red-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800">
              <p className="font-semibold mb-1">Please note:</p>
              <ul className="list-disc ml-5 space-y-1">
                <li>False reports may result in consequences to your account</li>
                <li>All reports are reviewed by admins and may take 24-48 hours</li>
                <li>You will be notified of the outcome via email</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReportVolunteerForm;

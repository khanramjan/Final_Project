import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import ReportVolunteerForm from '../../components/Volunteer/ReportVolunteerForm';

export default function ReportVolunteerPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/volunteer/reports-warnings');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Report a Volunteer</h1>
          <p className="mt-2 text-gray-600">
            Submit a report about volunteer conduct or performance issues
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <ReportVolunteerForm onSuccess={handleSuccess} />
        </div>
      </div>
    </div>
  );
}

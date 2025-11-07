import { useEffect, useState } from 'react';
import { XMarkIcon, BellAlertIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface NewRequest {
  id: number;
  title: string;
  campaignTitle: string;
  priority: string;
  createdAt: string;
}

interface VolunteerNotificationPopupProps {
  requests: NewRequest[];
  onClose: () => void;
}

const VolunteerNotificationPopup = ({ requests, onClose }: VolunteerNotificationPopupProps) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setIsVisible(true);

    // Play notification sound (optional)
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore if sound doesn't play (e.g., user hasn't interacted with page yet)
      });
    } catch {
      // Ignore sound errors
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleViewRequests = () => {
    handleClose();
    navigate('/volunteer/requests');
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${priorityStyles[priority.toLowerCase()] || priorityStyles.medium}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 120) return '1 minute ago';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    return 'recently';
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 ${
          isVisible ? 'bg-opacity-50' : 'bg-opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Popup */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mx-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-full animate-pulse">
                  <BellAlertIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">New Volunteer Request{requests.length > 1 ? 's' : ''}!</h3>
                  <p className="text-blue-100 text-sm">
                    {requests.length} new {requests.length === 1 ? 'opportunity' : 'opportunities'} available
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-blue-100 transition-colors"
                aria-label="Close"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 flex-1 pr-2">
                      {request.campaignTitle}
                    </h4>
                    {getPriorityBadge(request.priority)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.title}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatTimeAgo(request.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={handleViewRequests}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-md hover:shadow-lg"
            >
              View All Requests
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VolunteerNotificationPopup;

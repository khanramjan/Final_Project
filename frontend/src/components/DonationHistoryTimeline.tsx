import { CalendarDaysIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from '@heroicons/react/24/solid';

interface DonationHistoryItem {
  id: number;
  amount: number;
  campaignTitle: string;
  campaignCategory: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  impactMessage?: string;
}

interface DonationHistoryTimelineProps {
  donations: DonationHistoryItem[];
}

const DonationHistoryTimeline: React.FC<DonationHistoryTimelineProps> = ({ donations }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Education': 'bg-blue-100 text-blue-700',
      'Healthcare': 'bg-green-100 text-green-700',
      'Emergency': 'bg-red-100 text-red-700',
      'Environment': 'bg-emerald-100 text-emerald-700',
      'Community': 'bg-purple-100 text-purple-700',
      'default': 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors['default'];
  };

  if (donations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
          <p className="text-sm text-gray-500 mt-1">Your contribution timeline</p>
        </div>
        <div className="text-center py-12">
          <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No donations yet</p>
          <p className="text-sm text-gray-400 mt-1">Start making a difference today!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
        <p className="text-sm text-gray-500 mt-1">Your contribution timeline</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200" />

        <div className="space-y-6">
          {donations.map((donation) => (
            <div key={donation.id} className="relative pl-10">
              {/* Timeline dot */}
              <div className="absolute left-0 top-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border-4 border-white shadow-sm">
                  {donation.status === 'completed' ? (
                    <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                  ) : (
                    <HeartIcon className="h-4 w-4 text-blue-600" />
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">
                      {donation.campaignTitle}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded ${getCategoryColor(donation.campaignCategory)}`}>
                        {donation.campaignCategory}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center">
                        <CalendarDaysIcon className="h-3 w-3 mr-1" />
                        {formatDate(donation.date)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-blue-600">
                      ৳{donation.amount.toLocaleString()}
                    </p>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      donation.status === 'completed' ? 'bg-green-100 text-green-700' : 
                      donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                    </span>
                  </div>
                </div>

                {donation.impactMessage && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 italic">
                      💡 {donation.impactMessage}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {donations.length > 5 && (
        <div className="mt-6 text-center">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View All Donations →
          </button>
        </div>
      )}
    </div>
  );
};

export default DonationHistoryTimeline;

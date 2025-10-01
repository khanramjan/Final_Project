import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import campaignService, { Campaign } from '../services/campaignService';
import { HeartIcon, ClockIcon } from '@heroicons/react/24/outline';

const RecommendedCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const data = await campaignService.getAllCampaigns({
          page: 1,
          pageSize: 3,
          status: 'approved'
        });
        setCampaigns(data.campaigns);
      } catch (error) {
        console.error('Failed to fetch campaigns:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, []);

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recommended Campaigns</h3>
        <Link 
          to="/dashboard/campaigns" 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View All →
        </Link>
      </div>
      
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const progress = Math.min((campaign.raisedAmount / campaign.targetAmount) * 100, 100);
            const daysLeft = getDaysLeft(campaign.endDate);
            
            return (
              <div key={campaign.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">{campaign.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                  </div>
                  {campaign.imagePath && (
                    <img 
                      src={campaign.imagePath} 
                      alt={campaign.title}
                      className="w-16 h-16 object-cover rounded-lg ml-3"
                    />
                  )}
                </div>

                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      ${campaign.raisedAmount.toLocaleString()} raised
                    </span>
                    <span className="text-gray-500">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <ClockIcon className="h-3.5 w-3.5" />
                      <span>{daysLeft} days left</span>
                    </div>
                    <span>Goal: ${campaign.targetAmount.toLocaleString()}</span>
                  </div>

                  <button className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors">
                    <HeartIcon className="h-4 w-4" />
                    Donate Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No campaigns available</p>
          <Link 
            to="/dashboard/campaigns" 
            className="text-sm text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block"
          >
            Browse all campaigns
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecommendedCampaigns;

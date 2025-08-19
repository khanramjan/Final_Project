import { useAppSelector } from '../store/hooks';

const CampaignProgress = () => {
  const campaigns = useAppSelector((state) => (state as any).campaigns);

  const activeCampaigns = campaigns.campaigns?.filter((c: any) => c.status === 'active') || [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Active Campaigns</h3>
      
      {campaigns.loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      ) : activeCampaigns.length > 0 ? (
        <div className="space-y-4">
          {activeCampaigns.slice(0, 3).map((campaign: any) => {
            const progress = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);
            
            return (
              <div key={campaign.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">{campaign.title}</h4>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>${campaign.currentAmount.toLocaleString()}</span>
                  <span>Goal: ${campaign.goalAmount.toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">No active campaigns</p>
      )}
    </div>
  );
};

export default CampaignProgress;

import { 
  TrophyIcon, 
  FireIcon, 
  StarIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  achieved: boolean;
  progress?: number;
  maxProgress?: number;
}

interface ImpactInsightsProps {
  totalDonated: number;
  campaignsSupported: number;
  donationCount: number;
  givingStreak: number;
  monthsActive: number;
}

const ImpactInsights: React.FC<ImpactInsightsProps> = ({
  totalDonated,
  campaignsSupported,
  donationCount,
  givingStreak,
  monthsActive
}) => {
  // Calculate achievements based on user data
  const achievements: Achievement[] = [
    {
      id: 'first-donation',
      title: 'First Step',
      description: 'Made your first donation',
      icon: HeartIcon,
      achieved: donationCount > 0,
    },
    {
      id: 'generous-donor',
      title: 'Generous Donor',
      description: 'Donated over $100',
      icon: StarIcon,
      achieved: totalDonated >= 100,
      progress: Math.min(totalDonated, 100),
      maxProgress: 100,
    },
    {
      id: 'campaign-supporter',
      title: 'Campaign Supporter',
      description: 'Supported 5 different campaigns',
      icon: TrophyIcon,
      achieved: campaignsSupported >= 5,
      progress: Math.min(campaignsSupported, 5),
      maxProgress: 5,
    },
    {
      id: 'consistent-giver',
      title: 'Consistent Giver',
      description: '3 months giving streak',
      icon: FireIcon,
      achieved: givingStreak >= 3,
      progress: Math.min(givingStreak, 3),
      maxProgress: 3,
    },
    {
      id: 'community-hero',
      title: 'Community Hero',
      description: 'Donated over $500',
      icon: TrophyIcon,
      achieved: totalDonated >= 500,
      progress: Math.min(totalDonated, 500),
      maxProgress: 500,
    },
  ];

  const achievedCount = achievements.filter(a => a.achieved).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Your Impact Journey</h3>
          <span className="text-sm font-medium text-blue-600">
            {achievedCount}/{achievements.length} Achievements
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Milestones and achievements</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{donationCount}</p>
          <p className="text-xs text-gray-600 mt-1">Total Donations</p>
        </div>
        <div className="text-center border-x border-blue-200">
          <p className="text-2xl font-bold text-blue-600">{monthsActive}</p>
          <p className="text-xs text-gray-600 mt-1">Months Active</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{givingStreak}</p>
          <p className="text-xs text-gray-600 mt-1">Month Streak</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="space-y-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon;
          return (
            <div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                achievement.achieved
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`p-2 rounded-lg ${
                    achievement.achieved
                      ? 'bg-green-100'
                      : 'bg-gray-200'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      achievement.achieved
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-900">
                      {achievement.title}
                    </h4>
                    {achievement.achieved && (
                      <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                        ✓ Achieved
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {achievement.description}
                  </p>

                  {/* Progress bar for unachieved */}
                  {!achievement.achieved && achievement.progress !== undefined && achievement.maxProgress && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivational Message */}
      {achievedCount > 0 && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-gray-900">
            🎉 Amazing work! You've unlocked {achievedCount} achievement{achievedCount > 1 ? 's' : ''}.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Keep making a difference in your community!
          </p>
        </div>
      )}
    </div>
  );
};

export default ImpactInsights;

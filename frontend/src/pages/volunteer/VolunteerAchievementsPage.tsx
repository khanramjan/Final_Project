import { useState, useEffect } from 'react';
import {
  TrophyIcon,
  StarIcon,
  FireIcon,
  HeartIcon,
  SparklesIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import volunteerService from '../../services/volunteerService';
import type { VolunteerAchievement } from '../../types/volunteer.types';

export default function VolunteerAchievementsPage() {
  const [achievements, setAchievements] = useState<VolunteerAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'rank' | 'milestone' | 'special'>('all');

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await volunteerService.getAchievements();
      setAchievements(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
      console.error('Error fetching achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return TrophyIcon;
      case 'star':
        return StarIcon;
      case 'fire':
        return FireIcon;
      case 'heart':
        return HeartIcon;
      case 'sparkles':
        return SparklesIcon;
      default:
        return TrophyIcon;
    }
  };

  const getBadgeColorClasses = (color: string, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: 'bg-gray-200',
        border: 'border-gray-300',
        icon: 'text-gray-400',
        text: 'text-gray-500',
      };
    }

    switch (color) {
      case 'gold':
        return {
          bg: 'bg-gradient-to-br from-yellow-400 to-yellow-600',
          border: 'border-yellow-500',
          icon: 'text-white',
          text: 'text-yellow-900',
        };
      case 'silver':
        return {
          bg: 'bg-gradient-to-br from-gray-300 to-gray-500',
          border: 'border-gray-400',
          icon: 'text-white',
          text: 'text-gray-900',
        };
      case 'bronze':
        return {
          bg: 'bg-gradient-to-br from-orange-400 to-orange-700',
          border: 'border-orange-500',
          icon: 'text-white',
          text: 'text-orange-900',
        };
      case 'blue':
        return {
          bg: 'bg-gradient-to-br from-blue-400 to-blue-600',
          border: 'border-blue-500',
          icon: 'text-white',
          text: 'text-blue-900',
        };
      case 'purple':
        return {
          bg: 'bg-gradient-to-br from-purple-400 to-purple-600',
          border: 'border-purple-500',
          icon: 'text-white',
          text: 'text-purple-900',
        };
      case 'green':
        return {
          bg: 'bg-gradient-to-br from-green-400 to-green-600',
          border: 'border-green-500',
          icon: 'text-white',
          text: 'text-green-900',
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-gray-400 to-gray-600',
          border: 'border-gray-500',
          icon: 'text-white',
          text: 'text-gray-900',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Achievements</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAchievements}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'rank') return a.achievementType === 'rank_upgrade';
    if (filter === 'milestone') return a.achievementType === 'milestone';
    if (filter === 'special') return a.achievementType === 'special';
    return true;
  });

  const totalPoints = achievements
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + (a.points || 0), 0);

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const rankAchievements = achievements.filter((a) => a.achievementType === 'rank_upgrade').length;
  const milestoneAchievements = achievements.filter((a) => a.achievementType === 'milestone').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Achievements</h1>
          <p className="mt-2 text-gray-600">
            Track your volunteer milestones and unlock rewards
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-medium">Total Points</p>
                <p className="text-4xl font-bold mt-2">{totalPoints}</p>
              </div>
              <StarIcon className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Rank Achievements</p>
                <p className="text-4xl font-bold mt-2">
                  {rankAchievements}
                </p>
              </div>
              <TrophyIcon className="h-12 w-12 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Completion</p>
                <p className="text-4xl font-bold mt-2">
                  {achievements.length > 0 ? Math.round((unlockedCount / achievements.length) * 100) : 0}%
                </p>
              </div>
              <SparklesIcon className="h-12 w-12 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({achievements.length})
              </button>
              <button
                onClick={() => setFilter('rank')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'rank'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🏆 Rank ({rankAchievements})
              </button>
              <button
                onClick={() => setFilter('milestone')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'milestone'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎯 Milestone ({milestoneAchievements})
              </button>
              <button
                onClick={() => setFilter('special')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'special'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                ⭐ Special ({achievements.filter((a) => a.achievementType === 'special').length})
              </button>
            </div>
          </div>
        </div>

        {/* Achievements Grid */}
        {filteredAchievements.length === 0 ? (
          <div className="text-center py-12">
            <TrophyIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No achievements found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => {
              const BadgeIcon = getBadgeIcon(achievement.badgeIcon);
              const colors = getBadgeColorClasses(achievement.badgeColor, achievement.isUnlocked);
              const progressPercent = (achievement.currentProgress / achievement.requiredProgress) * 100;

              return (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-xl shadow-md p-6 border-2 ${colors.border} relative overflow-hidden transition-transform hover:scale-105`}
                >
                  {/* Badge Icon Circle */}
                  <div className={`w-20 h-20 rounded-full ${colors.bg} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                    {achievement.isUnlocked ? (
                      <BadgeIcon className={`h-10 w-10 ${colors.icon}`} />
                    ) : (
                      <LockClosedIcon className={`h-10 w-10 ${colors.icon}`} />
                    )}
                  </div>

                  {/* Achievement Info */}
                  <div className="text-center">
                    <h3 className={`text-xl font-bold mb-2 ${colors.text}`}>
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>

                    {/* Progress */}
                    {!achievement.isUnlocked && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>
                            {achievement.currentProgress} / {achievement.requiredProgress}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors.bg}`}
                            style={{ width: `${Math.min(progressPercent, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Points */}
                    {achievement.points && achievement.points > 0 && (
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <StarIcon className={`h-5 w-5 ${achievement.isUnlocked ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                        <span className={`font-bold ${achievement.isUnlocked ? 'text-yellow-600' : 'text-gray-500'}`}>
                          {achievement.points} Points
                        </span>
                      </div>
                    )}

                    {/* Unlocked Date */}
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <div className="bg-green-50 rounded-lg p-2 mb-3">
                        <p className="text-xs text-green-700">
                          ✓ Unlocked {volunteerService.formatDate(achievement.unlockedAt)}
                        </p>
                      </div>
                    )}

                    {/* Reward Description */}
                    {achievement.rewardDescription && (
                      <div className={`rounded-lg p-3 ${achievement.isUnlocked ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <p className={`text-xs font-medium ${achievement.isUnlocked ? 'text-blue-900' : 'text-gray-600'}`}>
                          🎁 {achievement.rewardDescription}
                        </p>
                      </div>
                    )}

                    {/* Achievement Type Badge */}
                    <div className="mt-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${achievement.isUnlocked ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {achievement.achievementType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Locked Overlay */}
                  {!achievement.isUnlocked && (
                    <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <LockClosedIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Achievement Categories Info */}
        <div className="mt-12 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Achievement Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                <TrophyIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Milestone</h3>
                <p className="text-sm text-gray-600">Complete specific volunteer milestones</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <FireIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Streak</h3>
                <p className="text-sm text-gray-600">Maintain consistency in volunteering</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <HeartIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Impact</h3>
                <p className="text-sm text-gray-600">Create positive impact in the community</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Special</h3>
                <p className="text-sm text-gray-600">Unlock special event achievements</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <StarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Excellence</h3>
                <p className="text-sm text-gray-600">Achieve high ratings and quality work</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

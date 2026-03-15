import React, { useState, useEffect } from 'react';
import mlService, { VolunteerRecommendation } from '../services/mlService';
import { Loader, AlertCircle, Star, TrendingUp, CheckCircle } from 'lucide-react';

interface Props {
  campaignId: number;
  topN?: number;
  minimumScore?: number;
  onRecommendationSelect?: (volunteer: VolunteerRecommendation) => void;
}

const VolunteerRecommendations: React.FC<Props> = ({
  campaignId,
  topN = 10,
  minimumScore = 0.5,
  onRecommendationSelect,
}) => {
  const [recommendations, setRecommendations] = useState<VolunteerRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchRecommendations();
  }, [campaignId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await mlService.getVolunteerRecommendations(
        campaignId,
        topN,
        minimumScore
      );
      setRecommendations(response.recommendations || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(`Error loading volunteer recommendations: ${message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleVolunteerSelection = (volunteerId: number) => {
    const newSelected = new Set(selectedVolunteers);
    if (newSelected.has(volunteerId)) {
      newSelected.delete(volunteerId);
    } else {
      newSelected.add(volunteerId);
    }
    setSelectedVolunteers(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedVolunteers.size === recommendations.length) {
      // Deselect all
      setSelectedVolunteers(new Set());
    } else {
      // Select all
      const allVolunteerIds = new Set(
        recommendations.map(rec => rec.volunteerId)
      );
      setSelectedVolunteers(allVolunteerIds);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-200';
    if (score >= 40) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getReasonIcon = () => {
    return <TrendingUp className="w-4 h-4 text-indigo-600" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 text-indigo-600 animate-spin mr-2" />
        <span className="text-gray-600">Loading volunteer recommendations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Recommendations</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <button
            onClick={fetchRecommendations}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800">
          No volunteer recommendations available for this campaign yet.
        </p>
        <p className="text-blue-600 text-sm mt-1">Try adjusting campaign details or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-start gap-3 flex-1">
          <TrendingUp className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-indigo-900">AI-Powered Recommendations</h3>
            <p className="text-indigo-700 text-sm mt-1">
              {recommendations.length} volunteer(s) matched based on skills, availability, experience, and past performance.
            </p>
          </div>
        </div>
        <button
          onClick={toggleSelectAll}
          className="ml-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm whitespace-nowrap transition"
        >
          {selectedVolunteers.size === recommendations.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div
            key={rec.volunteerId}
            className={`border-2 rounded-lg p-4 transition ${
              selectedVolunteers.has(rec.volunteerId)
                ? 'border-indigo-600 bg-indigo-50'
                : `border-gray-200 ${getBgColor(rec.suitabilityScore)}`
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                {/* Header with name and rank */}
                <div className="flex items-center gap-3 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedVolunteers.has(rec.volunteerId)}
                    onChange={() => {
                      toggleVolunteerSelection(rec.volunteerId);
                      onRecommendationSelect?.(rec);
                    }}
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 cursor-pointer"
                  />
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">{rec.volunteerName}</h4>
                    <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded-full font-medium">
                      {rec.rank}
                    </span>
                    {rec.isRecommended && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>

                {/* Suitability Score */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-2xl font-bold ${getScoreColor(rec.suitabilityScore)}`}>
                    {rec.suitabilityScore.toFixed(1)}%
                  </span>
                  <span className="text-gray-600 text-sm">Suitability Score</span>
                </div>

                {/* Reason */}
                <div className="flex items-start gap-2 mb-3 bg-white bg-opacity-50 rounded p-2">
                  {getReasonIcon()}
                  <p className="text-sm text-gray-700">{rec.reason}</p>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-600">Skills</div>
                    <div className="font-semibold text-gray-900">{rec.scoreBreakdown.skillsMatch.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Interests</div>
                    <div className="font-semibold text-gray-900">{rec.scoreBreakdown.interestsMatch.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Availability</div>
                    <div className="font-semibold text-gray-900">{rec.scoreBreakdown.availabilityMatch.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Experience</div>
                    <div className="font-semibold text-gray-900">{rec.scoreBreakdown.experienceScore.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Location</div>
                    <div className="font-semibold text-gray-900">{rec.scoreBreakdown.locationScore.toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600 flex items-center gap-1">
                      <Star className="w-3 h-3" /> Rating
                    </div>
                    <div className="font-semibold text-gray-900">{rec.scoreBreakdown.ratingScore.toFixed(1)}/5</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedVolunteers.size > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">
            {selectedVolunteers.size} volunteer(s) selected for requests
          </p>
        </div>
      )}
    </div>
  );
};

export default VolunteerRecommendations;

import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Send, TrendingUp, ChevronDown } from 'lucide-react';
import VolunteerRecommendations from '../components/VolunteerRecommendations';

interface CampaignFilter {
  category: string;
  status: string;
  searchTerm: string;
  minScore: number;
}

const RecommendationsPage: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<CampaignFilter>({
    category: '',
    status: 'active',
    searchTerm: '',
    minScore: 50,
  });

  // Mock data - in real app, this would come from API
  const mockCampaigns = [
    {
      id: 1,
      title: 'Emergency Relief Fund',
      category: 'Disaster',
      status: 'active',
      target: 100000,
      raised: 65000,
      volunteersNeeded: {
        gold: 5,
        silver: 8,
        bronze: 10,
      },
      createdAt: new Date('2026-03-10'),
    },
    {
      id: 2,
      title: 'Education Initiative',
      category: 'Education',
      status: 'active',
      target: 50000,
      raised: 35000,
      volunteersNeeded: {
        gold: 3,
        silver: 5,
        bronze: 7,
      },
      createdAt: new Date('2026-03-08'),
    },
    {
      id: 3,
      title: 'Health Camp Series',
      category: 'Health',
      status: 'active',
      target: 75000,
      raised: 45000,
      volunteersNeeded: {
        gold: 4,
        silver: 6,
        bronze: 8,
      },
      createdAt: new Date('2026-03-05'),
    },
  ];

  const filteredCampaigns = useMemo(() => {
    return mockCampaigns.filter((campaign) => {
      if (filters.category && campaign.category !== filters.category) return false;
      if (filters.status && campaign.status !== filters.status) return false;
      if (
        filters.searchTerm &&
        !campaign.title.toLowerCase().includes(filters.searchTerm.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [filters]);

  const categories = ['Disaster', 'Education', 'Health', 'Environment', 'Food'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Volunteer Recommendations</h1>
          </div>
          <p className="text-gray-600">
            AI-powered recommendations to help you select the best volunteers for your campaigns
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              {/* Search and Filter */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filters</span>
                  <ChevronDown className={`w-4 h-4 transition ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                {showFilters && (
                  <div className="space-y-3 pt-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={filters.category}
                        onChange={(e) =>
                          setFilters({ ...filters, category: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={filters.status}
                        onChange={(e) =>
                          setFilters({ ...filters, status: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Minimum Score: {filters.minScore}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="10"
                        value={filters.minScore}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            minScore: parseInt(e.target.value),
                          })
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Campaign List */}
              <div className="max-h-96 overflow-y-auto">
                {filteredCampaigns.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No campaigns found
                  </div>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <button
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign.id)}
                      className={`w-full text-left p-4 border-b border-gray-100 transition ${
                        selectedCampaign === campaign.id
                          ? 'bg-indigo-50 border-l-4 border-l-indigo-600'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <h3 className="font-semibold text-sm text-gray-900">
                        {campaign.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">{campaign.category}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-grow">
                          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 transition"
                              style={{
                                width: `${(campaign.raised / campaign.target) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {Math.round((campaign.raised / campaign.target) * 100)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Needs:{' '}
                        {Object.entries(campaign.volunteersNeeded)
                          .map(([rank, count]) => `${count} ${rank}`)
                          .join(', ')}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recommendations View */}
          <div className="lg:col-span-2">
            {selectedCampaign ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {
                      mockCampaigns.find((c) => c.id === selectedCampaign)
                        ?.title
                    }
                  </h2>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium transition">
                      <Download className="w-4 h-4" />
                      Export
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 text-sm font-medium transition">
                      <Send className="w-4 h-4" />
                      Send Requests
                    </button>
                  </div>
                </div>

                <VolunteerRecommendations
                  campaignId={selectedCampaign}
                  topN={15}
                  minimumScore={filters.minScore / 100}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Select a Campaign
                </h3>
                <p className="text-gray-600">
                  Choose a campaign from the list to view volunteer recommendations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsPage;

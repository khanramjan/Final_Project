import { useState, useEffect } from 'react';
import { BanknotesIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ReserveFundEntry {
  amount: number;
  campaignTitle: string;
  donorName: string;
  sourceDescription: string;
  createdAt: string;
}

const ReserveFundSection = () => {
  const [reserveData, setReserveData] = useState<{
    totalAmount: number;
    entryCount: number;
    description: string;
    recentEntries: ReserveFundEntry[];
  } | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchReserveFund();
  }, []);

  const fetchReserveFund = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/financial/reserve-fund/public');
      const data = await response.json();
      setReserveData(data);
    } catch (error) {
      console.error('Error fetching reserve fund:', error);
    }
  };

  if (!reserveData || reserveData.totalAmount === 0) return null;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl p-8 border border-purple-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-4 rounded-2xl shadow-lg">
            <BanknotesIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              Reserve Fund
              <SparklesIcon className="h-5 w-5 text-purple-500 ml-2" />
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {reserveData.entryCount} overflow donations
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-purple-600 font-semibold">Total Available</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            ৳{reserveData.totalAmount.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-6 border border-purple-200">
        <div className="flex items-start space-x-3">
          <HeartIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {reserveData.description}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Details Button */}
      <div className="text-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {showDetails ? '▲ Hide Details' : '▼ View Recent Contributions'}
        </button>
      </div>

      {/* Recent Entries */}
      {showDetails && (
        <div className="mt-6 space-y-3 animate-fadeIn">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Overflow Donations</h3>
          {reserveData.recentEntries.map((entry, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-purple-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {entry.campaignTitle}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">{entry.donorName}</span>
                  </p>
                  <p className="text-xs text-gray-500 italic">
                    {entry.sourceDescription}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xl font-bold text-purple-600">
                    ৳{entry.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* How It Works */}
      {showDetails && (
        <div className="mt-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl p-4">
          <h4 className="font-semibold text-gray-900 mb-3">💡 How Reserve Fund Works</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>When a campaign reaches its goal but receives more donations, the extra amount goes to the Reserve Fund</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>Reserve funds are used for emergency relief, future campaigns, and helping those in urgent need</span>
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              <span>100% transparency - every donation is tracked and publicly visible</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReserveFundSection;

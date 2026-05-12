import { useState, useEffect } from 'react';
import { BanknotesIcon, HeartIcon } from '@heroicons/react/24/outline';

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
      const response = await fetch('/api/financial/reserve-fund/public');
      const data = await response.json();
      setReserveData(data);
    } catch (error) {
      console.error('Error fetching reserve fund:', error);
    }
  };

  if (!reserveData || reserveData.totalAmount === 0) return null;

  return (
    <div className="card-elevated p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 p-2.5 rounded-lg">
            <BanknotesIcon className="h-5 w-5 text-teal-600" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-semibold text-slate-900 flex items-center gap-2">
              Reserve Fund
              {/* <SparklesIcon className="h-4 w-4 text-teal-500" /> */}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {reserveData.entryCount} overflow donations
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest font-semibold text-teal-600">Total Available</p>
          <p className="text-3xl font-serif font-bold text-slate-900 mt-1">
            ৳{(reserveData.totalAmount / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="bg-teal-50/50 rounded-lg p-3 mb-6 border border-teal-200/50">
        <div className="flex items-start gap-2">
          <HeartIcon className="h-4 w-4 text-teal-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-700 leading-relaxed">
            {reserveData.description}
          </p>
        </div>
      </div>

      {/* Toggle Details Button */}
      <div className="text-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="btn-primary btn-sm gap-2"
        >
          {showDetails ? '▲ Hide Details' : '▼ View Recent Contributions'}
        </button>
      </div>

      {/* Recent Entries */}
      {showDetails && (
        <div className="mt-6 space-y-3 animate-fade-in">
          <h4 className="text-sm font-serif font-semibold text-slate-900 mb-3">Recent Overflow Donations</h4>
          {reserveData.recentEntries.map((entry, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 border border-slate-200/50 hover:border-teal-200/50 hover:shadow-subtle transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-medium rounded">
                      {entry.campaignTitle}
                    </span>
                    <span className="text-xs text-slate-500">
                      • {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mb-0.5">
                    <span className="font-semibold">{entry.donorName}</span>
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    {entry.sourceDescription}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <p className="text-sm font-serif font-bold text-teal-600">
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
        <div className="mt-6 bg-slate-50 rounded-lg p-4 border border-slate-200/50">
          <h4 className="font-serif text-sm font-semibold text-slate-900 mb-2">How Reserve Fund Works</h4>
          <ul className="space-y-1.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold mt-0.5">•</span>
              <span>When a campaign reaches its goal but receives more donations, the extra amount goes to the Reserve Fund</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold mt-0.5">•</span>
              <span>Reserve funds are used for emergency relief, future campaigns, and helping those in urgent need</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-teal-600 font-semibold mt-0.5">•</span>
              <span>100% transparency - every donation is tracked and publicly visible</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ReserveFundSection;



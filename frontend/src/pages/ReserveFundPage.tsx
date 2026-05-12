import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BanknotesIcon, ArrowLeftIcon, HeartIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ReserveFundEntry {
  id: number;
  amount: number;
  campaignTitle: string;
  donorName: string;
  sourceDescription: string;
  createdAt: string;
}

interface ReserveFundData {
  totalAmount: number;
  totalEntries: number;
  page: number;
  pageSize: number;
  totalPages: number;
  entries: ReserveFundEntry[];
}

const ReserveFundPage = () => {
  const [data, setData] = useState<ReserveFundData | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    fetchEntries(page);
  }, [page]);

  const fetchEntries = async (p: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/financial/reserve-fund/all?page=${p}&pageSize=${pageSize}`
      );
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Error fetching reserve fund entries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-purple-700 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            to="/campaigns"
            className="inline-flex items-center text-purple-200 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Campaigns
          </Link>

          <div className="flex items-center space-x-5">
            <div className="bg-white/10 p-4 rounded-lg">
              <BanknotesIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold flex items-center">
                Community Reserve Fund
              </h1>
              <p className="text-purple-200 mt-1 text-sm">
                Overflow donations collected from completed campaigns
              </p>
            </div>
          </div>

          {data && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <p className="text-purple-200 text-xs mb-1">Total Available</p>
                <p className="text-2xl font-bold">৳{data.totalAmount.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20">
                <p className="text-purple-200 text-xs mb-1">Total Contributions</p>
                <p className="text-2xl font-bold">{data.totalEntries}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 border border-white/20 col-span-2 sm:col-span-1">
                <p className="text-purple-200 text-xs mb-1">Source</p>
                <p className="text-lg font-bold">Campaign Overflow</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-purple-200 shadow-sm p-6 mb-8">
          <div className="flex items-start space-x-3">
            <HeartIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">💡 How Reserve Fund Works</h2>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• When a campaign reaches its goal but keeps receiving donations, the extra amount goes to the Reserve Fund.</li>
                <li>• Reserve funds are used for emergency relief, future campaigns, and urgent community needs.</li>
                <li>• 100% transparency — every contribution is publicly visible below.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Entries Table */}
        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Contributions</h2>
            {data && (
              <span className="text-sm text-gray-500">
                {data.totalEntries} total
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
            </div>
          ) : data && data.entries.length > 0 ? (
            <>
              <div className="divide-y divide-gray-50">
                {data.entries.map((entry) => (
                  <div key={entry.id} className="px-6 py-4 hover:bg-purple-50/40 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 text-sm">{entry.donorName}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 truncate max-w-xs">
                            {entry.campaignTitle}
                          </span>
                        </div>
                        {entry.sourceDescription && (
                          <p className="text-xs text-gray-500 italic truncate">{entry.sourceDescription}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(entry.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-purple-600 flex-shrink-0">
                        ৳{entry.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {data.page} of {data.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeftIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    {Array.from({ length: data.totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === data.totalPages || Math.abs(p - page) <= 1)
                      .reduce<(number | string)[]>((acc, p, i, arr) => {
                        if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === '…' ? (
                          <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setPage(p as number)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                              page === p
                                ? 'bg-purple-600 text-white'
                                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      )}
                    <button
                      onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                      disabled={page === data.totalPages}
                      className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <BanknotesIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No reserve fund entries yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReserveFundPage;

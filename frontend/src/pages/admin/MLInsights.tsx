import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ArrowTrendingUpIcon,
  HomeIcon,
  ChevronRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import mlService, {
  DonationForecastResponse,
  SentimentResponse,
  ChurnPredictionResponse,
  CampaignSuccessPredictionResponse,
  AnomalyDetectionResponse,
} from '../../services/mlService';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard = ({
  title,
  icon: Icon,
  accent,
  children,
}: {
  title: string;
  icon: React.ElementType;
  accent: string;
  children: React.ReactNode;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className={`flex items-center gap-3 px-6 py-4 border-b border-gray-100 ${accent}`}>
      <Icon className="w-5 h-5" />
      <h2 className="font-semibold text-sm tracking-wide uppercase">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Pill = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-semibold text-gray-900">{value}</span>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const MLInsights = () => {
  // Forecast
  const [forecast, setForecast] = useState<DonationForecastResponse | null>(null);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastPeriods, setForecastPeriods] = useState(4);

  // Sentiment
  const [sentimentText, setSentimentText] = useState('');
  const [sentiment, setSentiment] = useState<SentimentResponse | null>(null);
  const [sentimentLoading, setSentimentLoading] = useState(false);

  // Churn
  const [churnUserId, setChurnUserId] = useState('');
  const [churn, setChurn] = useState<ChurnPredictionResponse | null>(null);
  const [churnLoading, setChurnLoading] = useState(false);

  // Campaign success
  const [campaignId, setCampaignId] = useState('');
  const [campaignPred, setCampaignPred] = useState<CampaignSuccessPredictionResponse | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(false);

  // Anomaly
  const [anomalyCampaignId, setAnomalyCampaignId] = useState('');
  const [anomalies, setAnomalies] = useState<AnomalyDetectionResponse | null>(null);
  const [anomalyLoading, setAnomalyLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Load forecast on mount
  const loadForecast = useCallback(async () => {
    setForecastLoading(true);
    setError(null);
    try {
      const data = await mlService.forecastDonations(forecastPeriods);
      setForecast(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Forecast failed');
    } finally {
      setForecastLoading(false);
    }
  }, [forecastPeriods]);

  useEffect(() => {
    loadForecast();
  }, [loadForecast]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSentiment = async () => {
    if (!sentimentText.trim()) return;
    setSentimentLoading(true);
    setSentiment(null);
    try {
      setSentiment(await mlService.analyzeSentiment(sentimentText));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sentiment analysis failed');
    } finally {
      setSentimentLoading(false);
    }
  };

  const handleChurn = async () => {
    const id = parseInt(churnUserId);
    if (!id) return;
    setChurnLoading(true);
    setChurn(null);
    try {
      setChurn(await mlService.predictDonorChurn(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Churn prediction failed');
    } finally {
      setChurnLoading(false);
    }
  };

  const handleCampaignSuccess = async () => {
    const id = parseInt(campaignId);
    if (!id) return;
    setCampaignLoading(true);
    setCampaignPred(null);
    try {
      setCampaignPred(await mlService.predictCampaignSuccess(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Campaign prediction failed');
    } finally {
      setCampaignLoading(false);
    }
  };

  const handleAnomalyDetection = async () => {
    const id = parseInt(anomalyCampaignId);
    if (!id) return;
    setAnomalyLoading(true);
    setAnomalies(null);
    try {
      setAnomalies(await mlService.detectAnomalies(id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Anomaly detection failed');
    } finally {
      setAnomalyLoading(false);
    }
  };

  // ── Forecast chart data ──────────────────────────────────────────────────────
  const chartData = forecast?.forecasts.map((f) => ({
    period: f.period,
    forecast: Math.round(f.forecastedAmount),
    lower: Math.round(f.lowerBound),
    upper: Math.round(f.upperBound),
  })) ?? [];

  const riskColor: Record<string, string> = {
    High: 'text-red-600 bg-red-50',
    Medium: 'text-amber-600 bg-amber-50',
    Low: 'text-emerald-600 bg-emerald-50',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Top Navbar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        {/* Breadcrumb */}
        <div className="px-6 pt-4 pb-1 flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/admin/dashboard" className="flex items-center gap-1 hover:text-gray-600 transition-colors">
            <HomeIcon className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <ChevronRightIcon className="w-3 h-3" />
          <span className="text-gray-600 font-medium">ML Insights</span>
        </div>

        {/* Title + meta row */}
        <div className="px-6 pb-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-violet-100">
              <SparklesIcon className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">ML Insights</h1>
              <p className="text-xs text-gray-500">AI-powered predictions · ML.NET</p>
            </div>
          </div>

          {/* Model pills */}
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {[
              { label: 'Forecasting', color: 'bg-violet-100 text-violet-700' },
              { label: 'Sentiment', color: 'bg-blue-100 text-blue-700' },
              { label: 'Churn', color: 'bg-amber-100 text-amber-700' },
              { label: 'Campaign Success', color: 'bg-emerald-100 text-emerald-700' },
              { label: 'Anomaly Detection', color: 'bg-red-100 text-red-700' },
            ].map(({ label, color }) => (
              <span key={label} className={`text-xs font-medium px-2.5 py-1 rounded-full ${color}`}>
                {label}
              </span>
            ))}
          </div>

          {/* Info hint */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
            <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
            Models train lazily on first call; subsequent calls are instant.
          </div>
        </div>
      </div>

      {/* ── Page body ───────────────────────────────────────────────────────── */}
      <div className="space-y-6 p-6">

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <ExclamationTriangleIcon className="w-4 h-4 flex-shrink-0" />
          {error}
          <button className="ml-auto underline" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* ── 1. Donation Forecasting ─────────────────────────────────────────── */}
      <SectionCard
        title="Donation Forecasting — SSA Time Series"
        icon={ArrowTrendingUpIcon}
        accent="bg-violet-50 text-violet-700"
      >
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm text-gray-600">Weeks to forecast:</label>
          <select
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-violet-300 outline-none"
            value={forecastPeriods}
            onChange={(e) => setForecastPeriods(Number(e.target.value))}
          >
            {[2, 4, 6, 8, 12].map((n) => (
              <option key={n} value={n}>{n} weeks</option>
            ))}
          </select>
          <button
            onClick={loadForecast}
            disabled={forecastLoading}
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
          >
            <ArrowPathIcon className={`w-4 h-4 ${forecastLoading ? 'animate-spin' : ''}`} />
            {forecastLoading ? 'Forecasting…' : 'Run Forecast'}
          </button>
        </div>

        {chartData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [`৳${v.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#gradBand)" name="Upper bound" />
                <Area type="monotone" dataKey="forecast" stroke="#7c3aed" strokeWidth={2.5}
                  fill="url(#gradForecast)" name="Forecast" />
                <ReferenceLine y={0} stroke="#e5e7eb" />
              </AreaChart>
            </ResponsiveContainer>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {forecast!.forecasts.map((f) => (
                <div key={f.period} className="bg-violet-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-violet-500 font-medium">{f.period}</p>
                  <p className="text-lg font-bold text-violet-800 mt-0.5">
                    ৳{Math.round(f.forecastedAmount).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    ৳{Math.round(f.lowerBound).toLocaleString()} – ৳{Math.round(f.upperBound).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Model: {forecast!.model} · Generated {new Date(forecast!.generatedAt).toLocaleString()}
            </p>
          </>
        ) : !forecastLoading ? (
          <p className="text-sm text-gray-400 text-center py-8">No forecast data available. Ensure there are completed donations in the database.</p>
        ) : (
          <div className="flex items-center justify-center py-12">
            <ArrowPathIcon className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        )}
      </SectionCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── 2. Sentiment Analysis ─────────────────────────────────────────── */}
        <SectionCard
          title="Sentiment Analysis"
          icon={SparklesIcon}
          accent="bg-blue-50 text-blue-700"
        >
          <p className="text-xs text-gray-400 mb-3">
            TF-IDF + SDCA Logistic Regression · trained on testimonials & donation messages
          </p>
          <textarea
            rows={3}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:ring-2 focus:ring-blue-300 outline-none"
            placeholder="Paste a testimonial or donation message to analyse…"
            value={sentimentText}
            onChange={(e) => setSentimentText(e.target.value)}
          />
          <button
            onClick={handleSentiment}
            disabled={sentimentLoading || !sentimentText.trim()}
            className="mt-3 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
          >
            <MagnifyingGlassIcon className={`w-4 h-4 ${sentimentLoading ? 'animate-spin' : ''}`} />
            {sentimentLoading ? 'Analysing…' : 'Analyse'}
          </button>

          {sentiment && (
            <div className={`mt-4 rounded-xl p-4 border ${sentiment.sentiment === 'Positive'
              ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {sentiment.sentiment === 'Positive'
                  ? <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                  : <XCircleIcon className="w-5 h-5 text-red-600" />}
                <span className={`font-semibold text-sm ${sentiment.sentiment === 'Positive' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {sentiment.sentiment}
                </span>
                <span className="ml-auto text-xs text-gray-500">
                  {(sentiment.confidence * 100).toFixed(1)}% confidence
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${sentiment.sentiment === 'Positive' ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${(sentiment.confidence * 100).toFixed(0)}%` }}
                />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 3. Donor Churn Prediction ─────────────────────────────────────── */}
        <SectionCard
          title="Donor Churn Prediction"
          icon={UserGroupIcon}
          accent="bg-amber-50 text-amber-700"
        >
          <p className="text-xs text-gray-400 mb-3">
            SDCA Logistic Regression · features: days since last donation, frequency, average amount
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-amber-300 outline-none"
              placeholder="User ID"
              value={churnUserId}
              onChange={(e) => setChurnUserId(e.target.value)}
            />
            <button
              onClick={handleChurn}
              disabled={churnLoading || !churnUserId}
              className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              <ChartBarIcon className={`w-4 h-4 ${churnLoading ? 'animate-spin' : ''}`} />
              {churnLoading ? 'Predicting…' : 'Predict'}
            </button>
          </div>

          {churn && (
            <div className="mt-4 space-y-2">
              <Pill label="User ID" value={churn.userId} />
              <Pill label="Will Churn" value={churn.willChurn ? 'Yes' : 'No'} />
              <Pill label="Churn Probability" value={`${(churn.churnProbability * 100).toFixed(1)}%`} />
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-500">Risk Level</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColor[churn.riskLevel] ?? 'bg-gray-100 text-gray-600'}`}>
                  {churn.riskLevel}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full transition-all ${
                    churn.riskLevel === 'High' ? 'bg-red-500' :
                    churn.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(churn.churnProbability * 100).toFixed(0)}%` }}
                />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 4. Campaign Success Prediction ────────────────────────────────── */}
        <SectionCard
          title="Campaign Success Prediction"
          icon={CheckCircleIcon}
          accent="bg-emerald-50 text-emerald-700"
        >
          <p className="text-xs text-gray-400 mb-3">
            SDCA · features: target, duration, urgency, featured, category, current raised ratio
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-300 outline-none"
              placeholder="Campaign ID"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
            />
            <button
              onClick={handleCampaignSuccess}
              disabled={campaignLoading || !campaignId}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              <SparklesIcon className={`w-4 h-4 ${campaignLoading ? 'animate-spin' : ''}`} />
              {campaignLoading ? 'Predicting…' : 'Predict'}
            </button>
          </div>

          {campaignPred && (
            <div className="mt-4 space-y-2">
              <Pill label="Campaign ID" value={campaignPred.campaignId} />
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Prediction</span>
                <span className={`flex items-center gap-1 text-sm font-semibold ${campaignPred.willSucceed ? 'text-emerald-600' : 'text-red-600'}`}>
                  {campaignPred.willSucceed
                    ? <><CheckCircleIcon className="w-4 h-4" /> Will Succeed</>
                    : <><XCircleIcon className="w-4 h-4" /> May Fall Short</>}
                </span>
              </div>
              <Pill label="Success Probability" value={`${(campaignPred.successProbability * 100).toFixed(1)}%`} />
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${campaignPred.willSucceed ? 'bg-emerald-500' : 'bg-red-500'}`}
                  style={{ width: `${(campaignPred.successProbability * 100).toFixed(0)}%` }}
                />
              </div>
              <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs text-gray-600 leading-relaxed">
                💡 {campaignPred.recommendation}
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── 5. Anomaly Detection ──────────────────────────────────────────── */}
        <SectionCard
          title="Donation Anomaly Detection"
          icon={ExclamationTriangleIcon}
          accent="bg-red-50 text-red-700"
        >
          <p className="text-xs text-gray-400 mb-3">
            IID Spike Detection (95% confidence) · requires ≥10 completed donations
          </p>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 outline-none"
              placeholder="Campaign ID"
              value={anomalyCampaignId}
              onChange={(e) => setAnomalyCampaignId(e.target.value)}
            />
            <button
              onClick={handleAnomalyDetection}
              disabled={anomalyLoading || !anomalyCampaignId}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
            >
              <MagnifyingGlassIcon className={`w-4 h-4 ${anomalyLoading ? 'animate-spin' : ''}`} />
              {anomalyLoading ? 'Scanning…' : 'Scan'}
            </button>
          </div>

          {anomalies && (
            <div className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400">Analysed</p>
                  <p className="text-xl font-bold text-gray-800">{anomalies.totalDonationsAnalyzed}</p>
                </div>
                <div className={`rounded-xl p-3 text-center ${anomalies.anomaliesFound > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  <p className="text-xs text-gray-400">Anomalies</p>
                  <p className={`text-xl font-bold ${anomalies.anomaliesFound > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {anomalies.anomaliesFound}
                  </p>
                </div>
              </div>

              {anomalies.anomalies.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">ID</th>
                        <th className="px-3 py-2 text-right text-gray-500 font-medium">Amount</th>
                        <th className="px-3 py-2 text-right text-gray-500 font-medium">Score</th>
                        <th className="px-3 py-2 text-left text-gray-500 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {anomalies.anomalies.map((a) => (
                        <tr key={a.donationId} className="bg-red-50">
                          <td className="px-3 py-2 text-red-700 font-medium">#{a.donationId}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-800">
                            ৳{a.amount.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">
                            {a.anomalyScore.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-gray-500">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-xl px-4 py-3 text-sm">
                  <CheckCircleIcon className="w-4 h-4" />
                  No anomalies detected in this campaign's donations.
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>
      </div>
    </div>
  );
};

export default MLInsights;

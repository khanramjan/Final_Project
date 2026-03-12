import api from './api';

// ─── Response Types ───────────────────────────────────────────────────────────

export interface PeriodForecast {
  period: string;
  forecastedAmount: number;
  lowerBound: number;
  upperBound: number;
}

export interface DonationForecastResponse {
  forecasts: PeriodForecast[];
  model: string;
  generatedAt: string;
}

export interface SentimentResponse {
  text: string;
  sentiment: 'Positive' | 'Negative';
  confidence: number;
  score: number;
}

export interface ChurnPredictionResponse {
  userId: number;
  willChurn: boolean;
  churnProbability: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface CampaignSuccessPredictionResponse {
  campaignId: number;
  willSucceed: boolean;
  successProbability: number;
  recommendation: string;
}

export interface DonationAnomaly {
  donationId: number;
  amount: number;
  anomalyScore: number;
  isAnomaly: boolean;
  createdAt: string;
}

export interface AnomalyDetectionResponse {
  totalDonationsAnalyzed: number;
  anomaliesFound: number;
  anomalies: DonationAnomaly[];
}

// ─── Service ──────────────────────────────────────────────────────────────────

const mlService = {
  forecastDonations(periods = 4): Promise<DonationForecastResponse> {
    return api.get<DonationForecastResponse>(`/ml/forecast/donations?periods=${periods}`);
  },

  analyzeSentiment(text: string): Promise<SentimentResponse> {
    return api.post<SentimentResponse>('/ml/sentiment/analyze', { text });
  },

  predictDonorChurn(userId: number): Promise<ChurnPredictionResponse> {
    return api.get<ChurnPredictionResponse>(`/ml/predict/donor-churn/${userId}`);
  },

  predictCampaignSuccess(campaignId: number): Promise<CampaignSuccessPredictionResponse> {
    return api.get<CampaignSuccessPredictionResponse>(`/ml/predict/campaign-success/${campaignId}`);
  },

  detectAnomalies(campaignId: number): Promise<AnomalyDetectionResponse> {
    return api.get<AnomalyDetectionResponse>(`/ml/anomaly/donations/${campaignId}`);
  },
};

export default mlService;

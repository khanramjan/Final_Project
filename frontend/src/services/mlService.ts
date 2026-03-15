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
  donorName: string;
  donorEmail: string;
  donorPhone?: string;
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

export interface CampaignOption {
  id: number;
  title: string;
  donationCount: number;
}

// ─── Volunteer Recommendation Types ───────────────────────────────────────────

export interface VolunteerScoreBreakdown {
  skillsMatch: number;
  interestsMatch: number;
  availabilityMatch: number;
  experienceScore: number;
  locationScore: number;
  ratingScore: number;
}

export interface VolunteerRecommendation {
  volunteerId: number;
  volunteerName: string;
  rank: string;
  suitabilityScore: number;
  isRecommended: boolean;
  reason: string;
  scoreBreakdown: VolunteerScoreBreakdown;
}

export interface VolunteerRecommendationResponse {
  campaignId: number;
  totalRecommendations: number;
  minimumScoreFilter: number;
  recommendations: VolunteerRecommendation[];
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

  getCampaignsForDropdown(): Promise<CampaignOption[]> {
    return api.get<CampaignOption[]>('/ml/campaigns/options');
  },

  // ─── Volunteer Recommendations ───────────────────────────────────────────────

  getVolunteerRecommendations(
    campaignId: number,
    topN = 10,
    minimumScore = 0.5
  ): Promise<VolunteerRecommendationResponse> {
    return api.get<VolunteerRecommendationResponse>(
      `/ml/recommend/volunteers/${campaignId}?topN=${topN}&minimumScore=${minimumScore}`
    );
  },

  async recommendVolunteers(req: {
    campaignId: number;
    volunteerIds?: number[];
    topN?: number;
    minimumScore?: number;
  }): Promise<VolunteerRecommendationResponse> {
    return api.post<VolunteerRecommendationResponse>('/ml/recommend/volunteers', {
      campaignId: req.campaignId,
      volunteerIds: req.volunteerIds || null,
      topN: req.topN || 10,
      minimumScore: req.minimumScore || 0.5,
    });
  },
};

export default mlService;

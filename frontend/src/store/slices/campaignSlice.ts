import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  goalAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'paused' | 'cancelled';
  category: string;
  imageUrl?: string;
  donorCount: number;
  createdBy: string;
  createdDate: string;
}

interface CampaignState {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  currentCampaign: Campaign | null;
}

const initialState: CampaignState = {
  campaigns: [], // Start with empty array, fetch from API
  loading: false,
  error: null,
  currentCampaign: null,
};

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async () => {
    try {
      console.log('Fetching campaigns from API...');
      // Add timestamp to bypass cache
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:5000/api/campaign/public?t=${timestamp}`);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`Failed to fetch campaigns: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response data:', data);
      console.log('Campaigns array:', data.campaigns);
      
      // Log campaign details for debugging
      if (data.campaigns && data.campaigns.length > 0) {
        data.campaigns.forEach((campaign: Campaign) => {
          console.log(`Campaign ${campaign.id}: "${campaign.title}" - ৳${campaign.currentAmount}/${campaign.goalAmount} (${Math.round((campaign.currentAmount/campaign.goalAmount)*100)}%)`);
        });
      }
      
      return data.campaigns; // Return the campaigns array from the response
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      throw error;
    }
  }
);

export const createCampaign = createAsyncThunk(
  'campaigns/createCampaign',
  async (campaignData: Omit<Campaign, 'id' | 'currentAmount' | 'donorCount' | 'createdDate'>) => {
    const response = await fetch('/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(campaignData),
    });
    if (!response.ok) {
      throw new Error('Failed to create campaign');
    }
    return await response.json();
  }
);

export const updateCampaign = createAsyncThunk(
  'campaigns/updateCampaign',
  async ({ id, data }: { id: number; data: Partial<Campaign> }) => {
    const response = await fetch(`/api/campaigns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update campaign');
    }
    return await response.json();
  }
);

const campaignSlice = createSlice({
  name: 'campaigns',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentCampaign: (state, action: PayloadAction<Campaign | null>) => {
      state.currentCampaign = action.payload;
    },
    updateCampaignAmount: (state, action: PayloadAction<{ id: number; amount: number }>) => {
      const campaign = state.campaigns.find(c => c.id === action.payload.id);
      if (campaign) {
        campaign.currentAmount += action.payload.amount;
        campaign.donorCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch campaigns';
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.campaigns.push(action.payload);
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const index = state.campaigns.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentCampaign, updateCampaignAmount } = campaignSlice.actions;
export default campaignSlice.reducer;

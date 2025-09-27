import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { mockCampaigns } from '../../data/mockCampaigns';

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
  campaigns: mockCampaigns, // Load mock data initially
  loading: false,
  error: null,
  currentCampaign: null,
};

export const fetchCampaigns = createAsyncThunk(
  'campaigns/fetchCampaigns',
  async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real app, this would be an actual API call
    // const response = await fetch('/api/campaigns');
    // if (!response.ok) {
    //   throw new Error('Failed to fetch campaigns');
    // }
    // return await response.json();
    
    // For now, return mock data
    return mockCampaigns;
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

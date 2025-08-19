import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Donation {
  id: number;
  donorId: number;
  campaignId?: number;
  amount: number;
  currency: string;
  donationDate: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'paypal' | 'cash';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  isAnonymous: boolean;
  message?: string;
  donor?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  campaign?: {
    id: number;
    title: string;
  };
}

interface DonationState {
  donations: Donation[];
  loading: boolean;
  error: string | null;
  totalAmount: number;
  todaysTotal: number;
  monthlyTotal: number;
}

const initialState: DonationState = {
  donations: [],
  loading: false,
  error: null,
  totalAmount: 0,
  todaysTotal: 0,
  monthlyTotal: 0,
};

// Async thunks
export const fetchDonations = createAsyncThunk(
  'donations/fetchDonations',
  async () => {
    const response = await fetch('/api/donations');
    if (!response.ok) {
      throw new Error('Failed to fetch donations');
    }
    return await response.json();
  }
);

export const createDonation = createAsyncThunk(
  'donations/createDonation',
  async (donationData: Omit<Donation, 'id' | 'donationDate' | 'status'>) => {
    const response = await fetch('/api/donations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donationData),
    });
    if (!response.ok) {
      throw new Error('Failed to create donation');
    }
    return await response.json();
  }
);

const donationSlice = createSlice({
  name: 'donations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateDonationStatus: (state, action: PayloadAction<{ id: number; status: Donation['status'] }>) => {
      const donation = state.donations.find(d => d.id === action.payload.id);
      if (donation) {
        donation.status = action.payload.status;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonations.fulfilled, (state, action) => {
        state.loading = false;
        state.donations = action.payload.donations || [];
        state.totalAmount = action.payload.totalAmount || 0;
        state.todaysTotal = action.payload.todaysTotal || 0;
        state.monthlyTotal = action.payload.monthlyTotal || 0;
      })
      .addCase(fetchDonations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch donations';
      })
      .addCase(createDonation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDonation.fulfilled, (state, action) => {
        state.loading = false;
        state.donations.unshift(action.payload);
        state.totalAmount += action.payload.amount;
      })
      .addCase(createDonation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create donation';
      });
  },
});

export const { clearError, updateDonationStatus } = donationSlice.actions;
export default donationSlice.reducer;

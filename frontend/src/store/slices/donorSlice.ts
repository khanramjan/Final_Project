import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface Donor {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  registrationDate: string;
  totalDonated: number;
  donationCount: number;
  isAnonymous: boolean;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    mail: boolean;
  };
}

interface DonorState {
  donors: Donor[];
  loading: boolean;
  error: string | null;
  currentDonor: Donor | null;
}

const initialState: DonorState = {
  donors: [],
  loading: false,
  error: null,
  currentDonor: null,
};

export const fetchDonors = createAsyncThunk(
  'donors/fetchDonors',
  async () => {
    const response = await fetch('/api/donors');
    if (!response.ok) {
      throw new Error('Failed to fetch donors');
    }
    return await response.json();
  }
);

export const createDonor = createAsyncThunk(
  'donors/createDonor',
  async (donorData: Omit<Donor, 'id' | 'registrationDate' | 'totalDonated' | 'donationCount'>) => {
    const response = await fetch('/api/donors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donorData),
    });
    if (!response.ok) {
      throw new Error('Failed to create donor');
    }
    return await response.json();
  }
);

export const updateDonor = createAsyncThunk(
  'donors/updateDonor',
  async ({ id, data }: { id: number; data: Partial<Donor> }) => {
    const response = await fetch(`/api/donors/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update donor');
    }
    return await response.json();
  }
);

const donorSlice = createSlice({
  name: 'donors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDonor: (state, action: PayloadAction<Donor | null>) => {
      state.currentDonor = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDonors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDonors.fulfilled, (state, action) => {
        state.loading = false;
        state.donors = action.payload;
      })
      .addCase(fetchDonors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch donors';
      })
      .addCase(createDonor.fulfilled, (state, action) => {
        state.donors.push(action.payload);
      })
      .addCase(updateDonor.fulfilled, (state, action) => {
        const index = state.donors.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.donors[index] = action.payload;
        }
      });
  },
});

export const { clearError, setCurrentDonor } = donorSlice.actions;
export default donorSlice.reducer;

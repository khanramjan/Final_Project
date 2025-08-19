import { configureStore } from '@reduxjs/toolkit';
import donationSlice from './slices/donationSlice';
import donorSlice from './slices/donorSlice';
import campaignSlice from './slices/campaignSlice';
import authSlice from './slices/authSlice';

export const store = configureStore({
  reducer: {
    donations: donationSlice,
    donors: donorSlice,
    campaigns: campaignSlice,
    auth: authSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

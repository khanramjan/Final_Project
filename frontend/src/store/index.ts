import { configureStore } from '@reduxjs/toolkit';
import donationSlice from './slices/donationSlice';
import donorSlice from './slices/donorSlice';
import campaignSlice from './slices/campaignSlice';
import authSlice from './slices/authSlice';
import { authMiddleware } from './middleware/authMiddleware';

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
        ignoredActionsPaths: ['payload.nidPhoto', 'payload.volunteerPhoto', 'payload.utilityBill'],
      },
    }).prepend(authMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import leadsReducer from './slices/leadsSlice';
import contactsReducer from './slices/contactsSlice';
import accountsReducer from './slices/accountsSlice';
import opportunitiesReducer from './slices/opportunitiesSlice';
import activitiesReducer from './slices/activitiesSlice';
import campaignsReducer from './slices/campaignsSlice';
import documentsReducer from './slices/documentsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadsReducer,
    contacts: contactsReducer,
    accounts: accountsReducer,
    opportunities: opportunitiesReducer,
    activities: activitiesReducer,
    campaigns: campaignsReducer,
    documents: documentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export default store;

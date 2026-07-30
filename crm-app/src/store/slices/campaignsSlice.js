import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import campaignsService from '../../services/campaignsService';

const mockCampaigns = [
  { id: '1', name: 'Q1 Product Launch Email', type: 'email', status: 'active', subject: 'Exciting New Features in Q1 2024', targetCount: 1500, sent: 1500, opened: 675, clicked: 234, bounced: 45, unsubscribed: 12, conversions: 28, scheduledAt: '2024-01-15T09:00:00', createdAt: '2024-01-10', createdBy: 'Meera Joshi', template: 'product_launch', tags: ['product', 'q1'] },
  { id: '2', name: 'Festival Offer SMS', type: 'sms', status: 'completed', message: 'Special 20% discount this festival season! Use code FEST20. Valid till Jan 31.', targetCount: 2000, sent: 1987, delivered: 1890, clicked: 445, conversions: 67, scheduledAt: '2024-01-12T10:00:00', createdAt: '2024-01-08', createdBy: 'Ravi Kumar', tags: ['offer', 'festival'] },
  { id: '3', name: 'New Year WhatsApp Greetings', type: 'whatsapp', status: 'completed', message: 'Happy New Year! Wishing you prosperity and success in 2024. - CRM Team', targetCount: 800, sent: 795, delivered: 780, read: 620, replied: 145, conversions: 23, scheduledAt: '2024-01-01T08:00:00', createdAt: '2023-12-28', createdBy: 'Sneha Rao', tags: ['greetings', 'new-year'] },
  { id: '4', name: 'Facebook Lead Generation', type: 'facebook', status: 'active', headline: 'Transform Your Business with Our CRM', targetAudience: 'Business owners 25-55', budget: 50000, spent: 23400, impressions: 125000, clicks: 3750, leads: 89, conversions: 15, startDate: '2024-01-01', endDate: '2024-01-31', createdAt: '2023-12-30', createdBy: 'Ravi Kumar', tags: ['paid', 'social'] },
  { id: '5', name: 'Google Search Ads Q1', type: 'google', status: 'active', headline: 'Best CRM Software India', keywords: ['crm software', 'sales crm', 'customer management'], budget: 75000, spent: 31500, impressions: 45000, clicks: 2250, leads: 112, conversions: 24, startDate: '2024-01-01', endDate: '2024-03-31', createdAt: '2023-12-29', createdBy: 'Meera Joshi', tags: ['paid', 'search'] },
  { id: '6', name: 'App Update Push Notification', type: 'push', status: 'completed', title: 'New Feature Alert!', body: 'Check out our new AI-powered lead scoring feature.', targetCount: 5000, sent: 4850, delivered: 4600, opened: 1840, clicks: 920, conversions: 45, scheduledAt: '2024-01-18T11:00:00', createdAt: '2024-01-17', createdBy: 'Sneha Rao', tags: ['product', 'update'] },
  { id: '7', name: 'Re-engagement Email Series', type: 'email', status: 'draft', subject: 'We Miss You! Come Back for Exclusive Offers', targetCount: 500, sent: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0, conversions: 0, scheduledAt: '2024-02-01T09:00:00', createdAt: '2024-01-23', createdBy: 'Meera Joshi', template: 're_engagement', tags: ['retention'] },
];

export const fetchCampaigns = createAsyncThunk('campaigns/fetchAll', async (params) => {
  try { return await campaignsService.getAll(params); }
  catch { return { data: mockCampaigns, total: mockCampaigns.length }; }
});

export const fetchCampaignById = createAsyncThunk('campaigns/fetchById', async (id) => {
  try { return await campaignsService.getById(id); }
  catch { return mockCampaigns.find(c => c.id === id) || null; }
});

export const createCampaign = createAsyncThunk('campaigns/create', async (data) => {
  try { return await campaignsService.create(data); }
  catch { return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), sent: 0, opened: 0, clicked: 0, conversions: 0 }; }
});

export const updateCampaign = createAsyncThunk('campaigns/update', async ({ id, data }) => {
  try { return await campaignsService.update(id, data); }
  catch { return { id, ...data }; }
});

export const deleteCampaign = createAsyncThunk('campaigns/delete', async (id) => {
  try { await campaignsService.delete(id); return id; }
  catch { return id; }
});

export const launchCampaign = createAsyncThunk('campaigns/launch', async (id) => {
  try { return await campaignsService.launch(id); }
  catch { return { id, status: 'active' }; }
});

const campaignsSlice = createSlice({
  name: 'campaigns',
  initialState: {
    items: mockCampaigns,
    selectedCampaign: null,
    loading: false,
    error: null,
    total: mockCampaigns.length,
    filters: { type: '', status: '', search: '' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setSelectedCampaign: (state, action) => { state.selectedCampaign = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCampaigns.pending, (state) => { state.loading = true; })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        state.total = action.payload.total || state.items.length;
      })
      .addCase(fetchCampaigns.rejected, (state) => { state.loading = false; })
      .addCase(fetchCampaignById.fulfilled, (state, action) => { state.selectedCampaign = action.payload; })
      .addCase(createCampaign.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total += 1; })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      })
      .addCase(launchCampaign.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.items[idx].status = 'active';
      });
  },
});

export const { setFilters, setSelectedCampaign } = campaignsSlice.actions;
export default campaignsSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import opportunitiesService from '../../services/opportunitiesService';

const mockOpportunities = [
  { id: '1', title: 'TechCorp ERP Implementation', accountId: '1', accountName: 'TechCorp India', contactId: '1', contactName: 'Arjun Sharma', stage: 'proposal', value: 1200000, probability: 70, expectedClose: '2024-03-15', assignedTo: 'Ravi Kumar', source: 'Website Lead', description: 'Full ERP implementation project', activities: 12, createdAt: '2024-01-05', updatedAt: '2024-01-22', tags: ['enterprise', 'erp'], aiPrediction: { winProbability: 72, expectedRevenue: 840000, recommendation: 'Schedule executive presentation' } },
  { id: '2', title: 'Retail POS System Upgrade', accountId: '4', accountName: 'Retail Solutions', contactId: '2', contactName: 'Priya Patel', stage: 'negotiation', value: 350000, probability: 85, expectedClose: '2024-02-28', assignedTo: 'Sneha Rao', source: 'Facebook Lead', description: 'POS system for 5 stores', activities: 8, createdAt: '2024-01-08', updatedAt: '2024-01-23', tags: ['retail', 'pos'], aiPrediction: { winProbability: 85, expectedRevenue: 297500, recommendation: 'Close deal this week' } },
  { id: '3', title: 'FinServ CRM Integration', accountId: '5', accountName: 'FinServ Ltd', contactId: '4', contactName: 'Ananya Singh', stage: 'qualified', value: 750000, probability: 45, expectedClose: '2024-04-30', assignedTo: 'Meera Joshi', source: 'WhatsApp', description: 'CRM integration with existing systems', activities: 5, createdAt: '2024-01-10', updatedAt: '2024-01-20', tags: ['finance', 'integration'], aiPrediction: { winProbability: 48, expectedRevenue: 337500, recommendation: 'Address budget concerns' } },
  { id: '4', title: 'Manufacturing MES Software', accountId: '1', accountName: 'Manufacturing Co', contactId: '3', contactName: 'Rohit Verma', stage: 'closed_won', value: 2500000, probability: 100, expectedClose: '2024-01-20', assignedTo: 'Ravi Kumar', source: 'Google Ads', description: 'MES software for production line', activities: 25, createdAt: '2023-11-01', updatedAt: '2024-01-20', tags: ['manufacturing', 'mes'], aiPrediction: { winProbability: 100, expectedRevenue: 2500000, recommendation: 'Deal closed' } },
  { id: '5', title: 'Startup Analytics Dashboard', accountId: '1', accountName: 'StartupXYZ', contactId: '5', contactName: 'Vikram Nair', stage: 'lead', value: 150000, probability: 20, expectedClose: '2024-05-31', assignedTo: 'Sneha Rao', source: 'Instagram', description: 'Custom analytics dashboard', activities: 2, createdAt: '2024-01-15', updatedAt: '2024-01-15', tags: ['startup', 'analytics'], aiPrediction: { winProbability: 22, expectedRevenue: 33000, recommendation: 'Nurture with content' } },
  { id: '6', title: 'HealthCare HIMS System', accountId: '1', accountName: 'HealthCare Plus', contactId: '1', contactName: 'Kavitha Menon', stage: 'proposal', value: 1800000, probability: 60, expectedClose: '2024-04-15', assignedTo: 'Meera Joshi', source: 'Email', description: 'Hospital information management system', activities: 7, createdAt: '2024-01-12', updatedAt: '2024-01-21', tags: ['healthcare', 'hims'], aiPrediction: { winProbability: 63, expectedRevenue: 1080000, recommendation: 'Send detailed proposal' } },
];

export const fetchOpportunities = createAsyncThunk('opportunities/fetchAll', async (params) => {
  try { return await opportunitiesService.getAll(params); }
  catch { return { data: mockOpportunities, total: mockOpportunities.length }; }
});

export const fetchOpportunityById = createAsyncThunk('opportunities/fetchById', async (id) => {
  try { return await opportunitiesService.getById(id); }
  catch { return mockOpportunities.find(o => o.id === id) || null; }
});

export const createOpportunity = createAsyncThunk('opportunities/create', async (data) => {
  try { return await opportunitiesService.create(data); }
  catch { return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }; }
});

export const updateOpportunity = createAsyncThunk('opportunities/update', async ({ id, data }) => {
  try { return await opportunitiesService.update(id, data); }
  catch { return { id, ...data }; }
});

export const deleteOpportunity = createAsyncThunk('opportunities/delete', async (id) => {
  try { await opportunitiesService.delete(id); return id; }
  catch { return id; }
});

export const moveOpportunityStage = createAsyncThunk('opportunities/moveStage', async ({ id, stage }) => {
  try { return await opportunitiesService.updateStage(id, stage); }
  catch { return { id, stage }; }
});

const opportunitiesSlice = createSlice({
  name: 'opportunities',
  initialState: {
    items: mockOpportunities,
    selectedOpportunity: null,
    loading: false,
    error: null,
    total: mockOpportunities.length,
    filters: { stage: '', assignedTo: '', search: '' },
    pipelineView: 'kanban',
    stages: ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'],
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setPipelineView: (state, action) => { state.pipelineView = action.payload; },
    setSelectedOpportunity: (state, action) => { state.selectedOpportunity = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOpportunities.pending, (state) => { state.loading = true; })
      .addCase(fetchOpportunities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        state.total = action.payload.total || state.items.length;
      })
      .addCase(fetchOpportunities.rejected, (state) => { state.loading = false; })
      .addCase(fetchOpportunityById.fulfilled, (state, action) => { state.selectedOpportunity = action.payload; })
      .addCase(createOpportunity.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total += 1; })
      .addCase(updateOpportunity.fulfilled, (state, action) => {
        const idx = state.items.findIndex(o => o.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteOpportunity.fulfilled, (state, action) => {
        state.items = state.items.filter(o => o.id !== action.payload);
      })
      .addCase(moveOpportunityStage.fulfilled, (state, action) => {
        const idx = state.items.findIndex(o => o.id === action.payload.id);
        if (idx !== -1) state.items[idx].stage = action.payload.stage;
      });
  },
});

export const { setFilters, setPipelineView, setSelectedOpportunity } = opportunitiesSlice.actions;
export default opportunitiesSlice.reducer;

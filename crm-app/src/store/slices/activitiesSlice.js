import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import activitiesService from '../../services/activitiesService';

const mockActivities = [
  { id: '1', type: 'call', subject: 'Initial Discovery Call', description: 'Discussed requirements and budget', contactId: '1', contactName: 'Arjun Sharma', accountId: '1', accountName: 'TechCorp India', leadId: '1', status: 'completed', priority: 'high', scheduledAt: '2024-01-20T10:00:00', completedAt: '2024-01-20T10:45:00', duration: 45, outcome: 'positive', assignedTo: 'Ravi Kumar', notes: 'Very interested, request for proposal', createdAt: '2024-01-20' },
  { id: '2', type: 'meeting', subject: 'Product Demo Meeting', description: 'Full product demonstration', contactId: '2', contactName: 'Priya Patel', accountId: '4', accountName: 'Retail Solutions', leadId: '2', status: 'scheduled', priority: 'high', scheduledAt: '2024-01-25T14:00:00', completedAt: null, duration: 90, outcome: null, assignedTo: 'Sneha Rao', notes: 'Prepare retail-specific demo', createdAt: '2024-01-22', location: 'Client Office, Mumbai', attendees: ['Sneha Rao', 'Priya Patel', 'IT Manager'] },
  { id: '3', type: 'email', subject: 'Proposal Follow-up', description: 'Following up on the proposal sent', contactId: '3', contactName: 'Rohit Verma', accountId: '1', accountName: 'Manufacturing Co', leadId: '3', status: 'sent', priority: 'medium', scheduledAt: '2024-01-22T09:00:00', completedAt: '2024-01-22T09:05:00', duration: null, outcome: 'awaiting_reply', assignedTo: 'Ravi Kumar', notes: 'Proposal attached', createdAt: '2024-01-22' },
  { id: '4', type: 'followup', subject: 'Contract Review Follow-up', description: 'Check on contract review status', contactId: '4', contactName: 'Ananya Singh', accountId: '5', accountName: 'FinServ Ltd', leadId: '4', status: 'pending', priority: 'urgent', scheduledAt: '2024-01-26T11:00:00', completedAt: null, duration: null, outcome: null, assignedTo: 'Meera Joshi', notes: 'Legal team reviewing', reminder: '2024-01-25T09:00:00', createdAt: '2024-01-23' },
  { id: '5', type: 'call', subject: 'Pricing Discussion', description: 'Discussed pricing and discount options', contactId: '5', contactName: 'Vikram Nair', accountId: '1', accountName: 'StartupXYZ', leadId: '5', status: 'completed', priority: 'medium', scheduledAt: '2024-01-18T16:00:00', completedAt: '2024-01-18T16:30:00', duration: 30, outcome: 'neutral', assignedTo: 'Sneha Rao', notes: 'Budget is tight, exploring options', createdAt: '2024-01-18' },
  { id: '6', type: 'meeting', subject: 'Quarterly Business Review', description: 'QBR with TechCorp leadership', contactId: '1', contactName: 'Arjun Sharma', accountId: '1', accountName: 'TechCorp India', leadId: null, status: 'completed', priority: 'high', scheduledAt: '2024-01-15T10:00:00', completedAt: '2024-01-15T12:00:00', duration: 120, outcome: 'positive', assignedTo: 'Ravi Kumar', notes: 'Excellent relationship building session', location: 'Conference Room A', attendees: ['Ravi Kumar', 'Arjun Sharma', 'Board Members'], createdAt: '2024-01-10' },
  { id: '7', type: 'email', subject: 'Welcome Email', description: 'Welcome to our services', contactId: '1', contactName: 'Kavitha Menon', accountId: '1', accountName: 'HealthCare Plus', leadId: '6', status: 'sent', priority: 'low', scheduledAt: '2024-01-18T08:00:00', completedAt: '2024-01-18T08:01:00', duration: null, outcome: 'opened', assignedTo: 'Meera Joshi', notes: 'Introductory email sent', createdAt: '2024-01-18' },
  { id: '8', type: 'followup', subject: 'Demo Confirmation', description: 'Confirm demo attendance', contactId: '2', contactName: 'Priya Patel', accountId: '4', accountName: 'Retail Solutions', leadId: '2', status: 'pending', priority: 'high', scheduledAt: '2024-01-24T10:00:00', completedAt: null, duration: null, outcome: null, assignedTo: 'Sneha Rao', notes: 'Send calendar invite', reminder: '2024-01-23T17:00:00', createdAt: '2024-01-22' },
];

export const fetchActivities = createAsyncThunk('activities/fetchAll', async (params) => {
  try { return await activitiesService.getAll(params); }
  catch { return { data: mockActivities, total: mockActivities.length }; }
});

export const createActivity = createAsyncThunk('activities/create', async (data) => {
  try { return await activitiesService.create(data); }
  catch { return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }; }
});

export const updateActivity = createAsyncThunk('activities/update', async ({ id, data }) => {
  try { return await activitiesService.update(id, data); }
  catch { return { id, ...data }; }
});

export const deleteActivity = createAsyncThunk('activities/delete', async (id) => {
  try { await activitiesService.delete(id); return id; }
  catch { return id; }
});

export const completeActivity = createAsyncThunk('activities/complete', async ({ id, outcome, notes }) => {
  try { return await activitiesService.complete(id, { outcome, notes }); }
  catch { return { id, status: 'completed', outcome, notes, completedAt: new Date().toISOString() }; }
});

const activitiesSlice = createSlice({
  name: 'activities',
  initialState: {
    items: mockActivities,
    loading: false,
    error: null,
    total: mockActivities.length,
    filters: { type: '', status: '', assignedTo: '', dateRange: null },
    activeType: 'all',
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setActiveType: (state, action) => { state.activeType = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => { state.loading = true; })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        state.total = action.payload.total || state.items.length;
      })
      .addCase(fetchActivities.rejected, (state) => { state.loading = false; })
      .addCase(createActivity.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total += 1; })
      .addCase(updateActivity.fulfilled, (state, action) => {
        const idx = state.items.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a.id !== action.payload);
      })
      .addCase(completeActivity.fulfilled, (state, action) => {
        const idx = state.items.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload };
      });
  },
});

export const { setFilters, setActiveType } = activitiesSlice.actions;
export default activitiesSlice.reducer;

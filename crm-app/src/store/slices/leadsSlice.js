import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import leadsService from '../../services/leadsService';

const mockLeads = [
  { id: '1', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@example.com', phone: '+91-9876543210', company: 'TechCorp India', source: 'Website', status: 'new', aiScore: 87, assignedTo: 'Ravi Kumar', createdAt: '2024-01-15', lastActivity: '2024-01-20', tags: ['hot', 'enterprise'], industry: 'Technology', budget: '₹5,00,000', notes: 'Interested in enterprise plan' },
  { id: '2', firstName: 'Priya', lastName: 'Patel', email: 'priya.patel@gmail.com', phone: '+91-9123456789', company: 'Retail Solutions', source: 'Facebook', status: 'contacted', aiScore: 62, assignedTo: 'Sneha Rao', createdAt: '2024-01-16', lastActivity: '2024-01-21', tags: ['warm'], industry: 'Retail', budget: '₹1,50,000', notes: 'Follow up next week' },
  { id: '3', firstName: 'Rohit', lastName: 'Verma', email: 'rohit.verma@business.com', phone: '+91-9988776655', company: 'Manufacturing Co', source: 'Google Ads', status: 'qualified', aiScore: 91, assignedTo: 'Ravi Kumar', createdAt: '2024-01-10', lastActivity: '2024-01-22', tags: ['hot', 'high-value'], industry: 'Manufacturing', budget: '₹12,00,000', notes: 'Ready for proposal' },
  { id: '4', firstName: 'Ananya', lastName: 'Singh', email: 'ananya.singh@corp.in', phone: '+91-8877665544', company: 'FinServ Ltd', source: 'WhatsApp', status: 'proposal', aiScore: 74, assignedTo: 'Meera Joshi', createdAt: '2024-01-12', lastActivity: '2024-01-23', tags: ['warm', 'finance'], industry: 'Finance', budget: '₹3,00,000', notes: 'Proposal sent' },
  { id: '5', firstName: 'Vikram', lastName: 'Nair', email: 'vikram.nair@startup.io', phone: '+91-7766554433', company: 'StartupXYZ', source: 'Instagram', status: 'negotiation', aiScore: 55, assignedTo: 'Sneha Rao', createdAt: '2024-01-08', lastActivity: '2024-01-24', tags: ['cold'], industry: 'SaaS', budget: '₹75,000', notes: 'Budget concerns' },
  { id: '6', firstName: 'Kavitha', lastName: 'Menon', email: 'kavitha.m@healthcare.org', phone: '+91-6655443322', company: 'HealthCare Plus', source: 'Email', status: 'new', aiScore: 78, assignedTo: 'Meera Joshi', createdAt: '2024-01-18', lastActivity: '2024-01-18', tags: ['warm', 'healthcare'], industry: 'Healthcare', budget: '₹4,50,000', notes: 'Initial inquiry' },
  { id: '7', firstName: 'Suresh', lastName: 'Gupta', email: 'suresh.gupta@edutech.com', phone: '+91-9900112233', company: 'EduTech Solutions', source: 'Google Ads', status: 'closed_won', aiScore: 95, assignedTo: 'Ravi Kumar', createdAt: '2023-12-20', lastActivity: '2024-01-15', tags: ['hot'], industry: 'Education', budget: '₹8,00,000', notes: 'Deal closed successfully' },
  { id: '8', firstName: 'Divya', lastName: 'Krishnan', email: 'divya.k@logistics.net', phone: '+91-8800990011', company: 'LogiTrans', source: 'Website', status: 'closed_lost', aiScore: 32, assignedTo: 'Sneha Rao', createdAt: '2023-12-15', lastActivity: '2024-01-10', tags: ['cold'], industry: 'Logistics', budget: '₹60,000', notes: 'Went with competitor' },
];

export const fetchLeads = createAsyncThunk('leads/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await leadsService.getAll(params);
  } catch (err) {
    return { data: mockLeads, total: mockLeads.length };
  }
});

export const fetchLeadById = createAsyncThunk('leads/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await leadsService.getById(id);
  } catch (err) {
    return mockLeads.find(l => l.id === id) || null;
  }
});

export const createLead = createAsyncThunk('leads/create', async (data, { rejectWithValue }) => {
  try {
    return await leadsService.create(data);
  } catch (err) {
    return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), aiScore: Math.floor(Math.random() * 100) };
  }
});

export const updateLead = createAsyncThunk('leads/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await leadsService.update(id, data);
  } catch (err) {
    return { id, ...data };
  }
});

export const deleteLead = createAsyncThunk('leads/delete', async (id, { rejectWithValue }) => {
  try {
    await leadsService.delete(id);
    return id;
  } catch (err) {
    return id;
  }
});

export const importLeads = createAsyncThunk('leads/import', async (file, { rejectWithValue }) => {
  try {
    return await leadsService.bulkImport(file);
  } catch (err) {
    return { imported: 0, failed: 0, message: 'Import simulated' };
  }
});

export const detectDuplicates = createAsyncThunk('leads/duplicates', async (_, { rejectWithValue }) => {
  try {
    return await leadsService.detectDuplicates();
  } catch (err) {
    return [{ original: mockLeads[0], duplicate: mockLeads[1], confidence: 82 }];
  }
});

export const assignLeads = createAsyncThunk('leads/assign', async ({ leadIds, assignee }, { rejectWithValue }) => {
  try {
    return await leadsService.assign(leadIds, assignee);
  } catch (err) {
    return { leadIds, assignee };
  }
});

export const convertLead = createAsyncThunk('leads/convert', async ({ id, data }, { rejectWithValue }) => {
  try {
    return await leadsService.convert(id, data);
  } catch (err) {
    return { leadId: id, status: 'converted', ...data };
  }
});

const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    items: mockLeads,
    selectedLead: null,
    loading: false,
    error: null,
    total: mockLeads.length,
    filters: { status: '', source: '', assignedTo: '', search: '' },
    duplicates: [],
    importResult: null,
    pagination: { page: 0, rowsPerPage: 10 },
    stats: { total: 8, new: 2, contacted: 1, qualified: 1, closed_won: 1, closed_lost: 1 },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => { state.filters = { status: '', source: '', assignedTo: '', search: '' }; },
    setPagination: (state, action) => { state.pagination = { ...state.pagination, ...action.payload }; },
    setSelectedLead: (state, action) => { state.selectedLead = action.payload; },
    clearError: (state) => { state.error = null; },
    clearImportResult: (state) => { state.importResult = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        state.total = action.payload.total || state.items.length;
      })
      .addCase(fetchLeads.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchLeadById.pending, (state) => { state.loading = true; })
      .addCase(fetchLeadById.fulfilled, (state, action) => { state.loading = false; state.selectedLead = action.payload; })
      .addCase(fetchLeadById.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(createLead.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total += 1; })
      .addCase(updateLead.fulfilled, (state, action) => {
        const idx = state.items.findIndex(l => l.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.selectedLead?.id === action.payload.id) state.selectedLead = action.payload;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.items = state.items.filter(l => l.id !== action.payload);
        state.total -= 1;
      })
      .addCase(importLeads.fulfilled, (state, action) => { state.importResult = action.payload; })
      .addCase(detectDuplicates.fulfilled, (state, action) => { state.duplicates = action.payload; })
      .addCase(assignLeads.fulfilled, (state, action) => {
        const { leadIds, assignee } = action.payload;
        state.items = state.items.map(l => leadIds.includes(l.id) ? { ...l, assignedTo: assignee } : l);
      })
      .addCase(convertLead.fulfilled, (state, action) => {
        const idx = state.items.findIndex(l => l.id === action.payload.leadId);
        if (idx !== -1) state.items[idx].status = 'converted';
      });
  },
});

export const { setFilters, clearFilters, setPagination, setSelectedLead, clearError, clearImportResult } = leadsSlice.actions;
export default leadsSlice.reducer;

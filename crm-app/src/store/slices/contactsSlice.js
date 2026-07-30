import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import contactsService from '../../services/contactsService';

const mockContacts = [
  { id: '1', type: 'individual', firstName: 'Arjun', lastName: 'Sharma', email: 'arjun.sharma@example.com', phone: '+91-9876543210', company: 'TechCorp India', jobTitle: 'CTO', group: 'VIP Clients', status: 'active', createdAt: '2024-01-10', avatar: '', tags: ['enterprise', 'decision-maker'], address: { street: '123 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' } },
  { id: '2', type: 'business', firstName: 'Priya', lastName: 'Patel', email: 'priya@retailsolutions.com', phone: '+91-9123456789', company: 'Retail Solutions', jobTitle: 'Director', group: 'Regular Clients', status: 'active', createdAt: '2024-01-12', avatar: '', tags: ['retail'], address: { street: '45 Commercial St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' } },
  { id: '3', type: 'individual', firstName: 'Rohit', lastName: 'Verma', email: 'rohit@manufacturing.com', phone: '+91-9988776655', company: 'Manufacturing Co', jobTitle: 'Purchase Manager', group: 'High Value', status: 'active', createdAt: '2024-01-08', avatar: '', tags: ['manufacturing'], address: { street: 'MIDC Industrial Area', city: 'Pune', state: 'Maharashtra', pincode: '411001', country: 'India' } },
  { id: '4', type: 'business', firstName: 'Ananya', lastName: 'Singh', email: 'ananya@finserv.in', phone: '+91-8877665544', company: 'FinServ Ltd', jobTitle: 'CEO', group: 'VIP Clients', status: 'inactive', createdAt: '2024-01-05', avatar: '', tags: ['finance', 'enterprise'], address: { street: 'DLF Cyber City', city: 'Gurugram', state: 'Haryana', pincode: '122001', country: 'India' } },
  { id: '5', type: 'individual', firstName: 'Vikram', lastName: 'Nair', email: 'vikram@startup.io', phone: '+91-7766554433', company: 'StartupXYZ', jobTitle: 'Founder', group: 'Prospects', status: 'active', createdAt: '2024-01-14', avatar: '', tags: ['startup', 'tech'], address: { street: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', country: 'India' } },
];

const mockGroups = [
  { id: '1', name: 'VIP Clients', description: 'Top tier clients with high value', count: 12, color: '#1976d2' },
  { id: '2', name: 'Regular Clients', description: 'Standard client category', count: 45, color: '#388e3c' },
  { id: '3', name: 'High Value', description: 'High revenue potential clients', count: 8, color: '#f57c00' },
  { id: '4', name: 'Prospects', description: 'Potential future clients', count: 23, color: '#9c27b0' },
  { id: '5', name: 'Inactive', description: 'Currently inactive contacts', count: 15, color: '#9e9e9e' },
];

export const fetchContacts = createAsyncThunk('contacts/fetchAll', async (params) => {
  try { return await contactsService.getAll(params); }
  catch { return { data: mockContacts, total: mockContacts.length }; }
});

export const fetchContactById = createAsyncThunk('contacts/fetchById', async (id) => {
  try { return await contactsService.getById(id); }
  catch { return mockContacts.find(c => c.id === id) || null; }
});

export const createContact = createAsyncThunk('contacts/create', async (data) => {
  try { return await contactsService.create(data); }
  catch { return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }; }
});

export const updateContact = createAsyncThunk('contacts/update', async ({ id, data }) => {
  try { return await contactsService.update(id, data); }
  catch { return { id, ...data }; }
});

export const deleteContact = createAsyncThunk('contacts/delete', async (id) => {
  try { await contactsService.delete(id); return id; }
  catch { return id; }
});

export const fetchGroups = createAsyncThunk('contacts/fetchGroups', async () => {
  try { return await contactsService.getGroups(); }
  catch { return mockGroups; }
});

export const createGroup = createAsyncThunk('contacts/createGroup', async (data) => {
  try { return await contactsService.createGroup(data); }
  catch { return { ...data, id: Date.now().toString(), count: 0 }; }
});

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    items: mockContacts,
    selectedContact: null,
    groups: mockGroups,
    loading: false,
    error: null,
    total: mockContacts.length,
    filters: { type: '', group: '', status: '', search: '' },
    activeTab: 0,
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setActiveTab: (state, action) => { state.activeTab = action.payload; },
    setSelectedContact: (state, action) => { state.selectedContact = action.payload; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => { state.loading = true; })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        state.total = action.payload.total || state.items.length;
      })
      .addCase(fetchContacts.rejected, (state) => { state.loading = false; })
      .addCase(fetchContactById.fulfilled, (state, action) => { state.selectedContact = action.payload; })
      .addCase(createContact.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total += 1; })
      .addCase(updateContact.fulfilled, (state, action) => {
        const idx = state.items.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.items = state.items.filter(c => c.id !== action.payload);
      })
      .addCase(fetchGroups.fulfilled, (state, action) => { state.groups = action.payload; })
      .addCase(createGroup.fulfilled, (state, action) => { state.groups.push(action.payload); });
  },
});

export const { setFilters, setActiveTab, setSelectedContact, clearError } = contactsSlice.actions;
export default contactsSlice.reducer;

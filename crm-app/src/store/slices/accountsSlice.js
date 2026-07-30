import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import accountsService from '../../services/accountsService';

const mockAccounts = [
  {
    id: '1', name: 'TechCorp India Pvt Ltd', type: 'company', parentId: null,
    industry: 'Technology', website: 'www.techcorp.in', phone: '+91-80-12345678',
    email: 'info@techcorp.in', employeeCount: 250, annualRevenue: '₹50 Cr',
    creditLimit: 500000, creditUsed: 125000,
    gst: { number: '29ABCDE1234F1Z5', state: 'Karnataka', registered: true },
    billingAddress: { street: '123 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' },
    shippingAddress: { street: '123 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', country: 'India' },
    category: 'enterprise', status: 'active', createdAt: '2023-06-15',
    primaryContact: 'Arjun Sharma', tags: ['enterprise', 'technology'],
    branches: ['2', '3'], description: 'Leading technology company',
  },
  {
    id: '2', name: 'TechCorp Bangalore Branch', type: 'branch', parentId: '1',
    industry: 'Technology', website: 'www.techcorp.in/bangalore', phone: '+91-80-98765432',
    email: 'blr@techcorp.in', employeeCount: 80, annualRevenue: '₹15 Cr',
    creditLimit: 100000, creditUsed: 30000,
    gst: { number: '29ABCDE1234F1Z5', state: 'Karnataka', registered: true },
    billingAddress: { street: '456 Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', country: 'India' },
    shippingAddress: { street: '456 Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', country: 'India' },
    category: 'enterprise', status: 'active', createdAt: '2023-08-01', primaryContact: 'Ravi Kumar', tags: [],
  },
  {
    id: '3', name: 'TechCorp Mumbai Branch', type: 'branch', parentId: '1',
    industry: 'Technology', website: '', phone: '+91-22-11223344',
    email: 'mum@techcorp.in', employeeCount: 60, annualRevenue: '₹12 Cr',
    creditLimit: 80000, creditUsed: 20000,
    gst: { number: '27ABCDE1234F1Z5', state: 'Maharashtra', registered: true },
    billingAddress: { street: 'BKC Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', country: 'India' },
    shippingAddress: { street: 'BKC Complex', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', country: 'India' },
    category: 'enterprise', status: 'active', createdAt: '2023-09-01', primaryContact: 'Sneha Rao', tags: [],
  },
  {
    id: '4', name: 'Retail Solutions Ltd', type: 'company', parentId: null,
    industry: 'Retail', website: 'www.retailsolutions.in', phone: '+91-22-55667788',
    email: 'contact@retailsolutions.in', employeeCount: 45, annualRevenue: '₹8 Cr',
    creditLimit: 200000, creditUsed: 80000,
    gst: { number: '27XYZPQ5678G1Z3', state: 'Maharashtra', registered: true },
    billingAddress: { street: '45 Commercial St', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', country: 'India' },
    shippingAddress: { street: 'Warehouse, Bhiwandi', city: 'Mumbai', state: 'Maharashtra', pincode: '421302', country: 'India' },
    category: 'mid-market', status: 'active', createdAt: '2023-07-20', primaryContact: 'Priya Patel', tags: ['retail'],
  },
  {
    id: '5', name: 'FinServ Ltd', type: 'company', parentId: null,
    industry: 'Finance', website: 'www.finserv.in', phone: '+91-124-9876543',
    email: 'info@finserv.in', employeeCount: 120, annualRevenue: '₹25 Cr',
    creditLimit: 300000, creditUsed: 50000,
    gst: { number: '06LMNOP4321H1Z8', state: 'Haryana', registered: true },
    billingAddress: { street: 'DLF Cyber City', city: 'Gurugram', state: 'Haryana', pincode: '122001', country: 'India' },
    shippingAddress: { street: 'DLF Cyber City', city: 'Gurugram', state: 'Haryana', pincode: '122001', country: 'India' },
    category: 'enterprise', status: 'inactive', createdAt: '2023-05-10', primaryContact: 'Ananya Singh', tags: ['finance'],
  },
];

export const fetchAccounts = createAsyncThunk('accounts/fetchAll', async (params) => {
  try { return await accountsService.getAll(params); }
  catch { return { data: mockAccounts, total: mockAccounts.length }; }
});

export const fetchAccountById = createAsyncThunk('accounts/fetchById', async (id) => {
  try { return await accountsService.getById(id); }
  catch { return mockAccounts.find(a => a.id === id) || null; }
});

export const createAccount = createAsyncThunk('accounts/create', async (data) => {
  try { return await accountsService.create(data); }
  catch { return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }; }
});

export const updateAccount = createAsyncThunk('accounts/update', async ({ id, data }) => {
  try { return await accountsService.update(id, data); }
  catch { return { id, ...data }; }
});

export const deleteAccount = createAsyncThunk('accounts/delete', async (id) => {
  try { await accountsService.delete(id); return id; }
  catch { return id; }
});

const accountsSlice = createSlice({
  name: 'accounts',
  initialState: {
    items: mockAccounts,
    selectedAccount: null,
    loading: false,
    error: null,
    total: mockAccounts.length,
    filters: { type: '', category: '', status: '', search: '' },
    hierarchy: null,
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setSelectedAccount: (state, action) => { state.selectedAccount = action.payload; },
    clearError: (state) => { state.error = null; },
    buildHierarchy: (state) => {
      const roots = state.items.filter(a => !a.parentId);
      state.hierarchy = roots.map(root => ({
        ...root,
        children: state.items.filter(a => a.parentId === root.id),
      }));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.pending, (state) => { state.loading = true; })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        state.total = action.payload.total || state.items.length;
      })
      .addCase(fetchAccounts.rejected, (state) => { state.loading = false; })
      .addCase(fetchAccountById.fulfilled, (state, action) => { state.selectedAccount = action.payload; })
      .addCase(createAccount.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total += 1; })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const idx = state.items.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.items = state.items.filter(a => a.id !== action.payload);
      });
  },
});

export const { setFilters, setSelectedAccount, clearError, buildHierarchy } = accountsSlice.actions;
export default accountsSlice.reducer;

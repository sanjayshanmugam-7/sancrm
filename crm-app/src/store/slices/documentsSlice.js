import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import documentsService from '../../services/documentsService';

const mockDocuments = [
  { id: '1', type: 'proposal', title: 'ERP Implementation Proposal - TechCorp', accountId: '1', accountName: 'TechCorp India', contactId: '1', contactName: 'Arjun Sharma', opportunityId: '1', status: 'sent', version: '2.0', createdBy: 'Ravi Kumar', createdAt: '2024-01-20', sentAt: '2024-01-21', viewedAt: '2024-01-22', amount: 1200000, validTill: '2024-02-21', fileUrl: '/docs/proposal-techcorp.pdf', fileSize: '2.4 MB', tags: ['enterprise', 'erp'], notes: 'Includes 3 months of free support' },
  { id: '2', type: 'quotation', title: 'POS System Quote - Retail Solutions', accountId: '4', accountName: 'Retail Solutions', contactId: '2', contactName: 'Priya Patel', opportunityId: '2', status: 'approved', version: '1.0', createdBy: 'Sneha Rao', createdAt: '2024-01-18', sentAt: '2024-01-18', viewedAt: '2024-01-19', amount: 350000, validTill: '2024-02-18', fileUrl: '/docs/quote-retail.pdf', fileSize: '1.1 MB', tags: ['retail', 'pos'], notes: 'Standard package' },
  { id: '3', type: 'agreement', title: 'Service Agreement - Manufacturing Co', accountId: '1', accountName: 'Manufacturing Co', contactId: '3', contactName: 'Rohit Verma', opportunityId: '4', status: 'signed', version: '1.0', createdBy: 'Ravi Kumar', createdAt: '2024-01-10', sentAt: '2024-01-11', signedAt: '2024-01-15', amount: 2500000, fileUrl: '/docs/agreement-manufacturing.pdf', fileSize: '3.2 MB', tags: ['manufacturing', 'agreement'], digitalSignature: { signed: true, signedBy: 'Rohit Verma', signedAt: '2024-01-15T14:30:00', ipAddress: '192.168.1.1' }, notes: 'Annual maintenance included' },
  { id: '4', type: 'ocr', title: 'Business Card - Kavitha Menon', accountId: '1', accountName: 'HealthCare Plus', contactId: '1', contactName: 'Kavitha Menon', opportunityId: null, status: 'processed', version: '1.0', createdBy: 'Meera Joshi', createdAt: '2024-01-18', fileUrl: '/docs/business-card-kavitha.jpg', fileSize: '0.3 MB', ocrData: { name: 'Kavitha Menon', title: 'COO', company: 'HealthCare Plus', email: 'kavitha.m@healthcare.org', phone: '+91-6655443322' }, tags: ['ocr', 'contact'], notes: 'Scanned business card' },
  { id: '5', type: 'proposal', title: 'HIMS Proposal - HealthCare Plus', accountId: '1', accountName: 'HealthCare Plus', contactId: '1', contactName: 'Kavitha Menon', opportunityId: '6', status: 'draft', version: '1.0', createdBy: 'Meera Joshi', createdAt: '2024-01-22', sentAt: null, amount: 1800000, validTill: '2024-02-22', fileUrl: null, fileSize: null, tags: ['healthcare', 'hims'], notes: 'Pending review' },
  { id: '6', type: 'agreement', title: 'NDA - FinServ Ltd', accountId: '5', accountName: 'FinServ Ltd', contactId: '4', contactName: 'Ananya Singh', opportunityId: '3', status: 'pending_signature', version: '1.0', createdBy: 'Meera Joshi', createdAt: '2024-01-20', sentAt: '2024-01-21', amount: null, fileUrl: '/docs/nda-finserv.pdf', fileSize: '0.8 MB', digitalSignature: { signed: false, sentTo: 'ananya.singh@corp.in', sentAt: '2024-01-21' }, tags: ['nda', 'legal'], notes: 'Awaiting signature' },
];

export const fetchDocuments = createAsyncThunk('documents/fetchAll', async (params) => {
  try { return await documentsService.getAll(params); }
  catch { return { data: mockDocuments, total: mockDocuments.length }; }
});

export const fetchDocumentById = createAsyncThunk('documents/fetchById', async (id) => {
  try { return await documentsService.getById(id); }
  catch { return mockDocuments.find(d => d.id === id) || null; }
});

export const createDocument = createAsyncThunk('documents/create', async (data) => {
  try { return await documentsService.create(data); }
  catch { return { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }; }
});

export const updateDocument = createAsyncThunk('documents/update', async ({ id, data }) => {
  try { return await documentsService.update(id, data); }
  catch { return { id, ...data }; }
});

export const deleteDocument = createAsyncThunk('documents/delete', async (id) => {
  try { await documentsService.delete(id); return id; }
  catch { return id; }
});

export const sendForSignature = createAsyncThunk('documents/sendForSignature', async ({ id, email }) => {
  try { return await documentsService.sendForSignature(id, email); }
  catch { return { id, status: 'pending_signature', sentTo: email }; }
});

export const processOCR = createAsyncThunk('documents/processOCR', async (formData) => {
  try { return await documentsService.processOCR(formData); }
  catch { return { id: Date.now().toString(), type: 'ocr', status: 'processed', ocrData: { name: 'Sample Name', company: 'Sample Company', email: 'sample@email.com', phone: '9999999999' } }; }
});

const documentsSlice = createSlice({
  name: 'documents',
  initialState: {
    items: mockDocuments,
    selectedDocument: null,
    loading: false,
    error: null,
    total: mockDocuments.length,
    filters: { type: '', status: '', search: '' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    setSelectedDocument: (state, action) => { state.selectedDocument = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => { state.loading = true; })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || action.payload;
        state.total = action.payload.total || state.items.length;
      })
      .addCase(fetchDocuments.rejected, (state) => { state.loading = false; })
      .addCase(fetchDocumentById.fulfilled, (state, action) => { state.selectedDocument = action.payload; })
      .addCase(createDocument.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total += 1; })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const idx = state.items.findIndex(d => d.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.items = state.items.filter(d => d.id !== action.payload);
      })
      .addCase(sendForSignature.fulfilled, (state, action) => {
        const idx = state.items.findIndex(d => d.id === action.payload.id);
        if (idx !== -1) state.items[idx].status = 'pending_signature';
      })
      .addCase(processOCR.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total += 1; });
  },
});

export const { setFilters, setSelectedDocument } = documentsSlice.actions;
export default documentsSlice.reducer;

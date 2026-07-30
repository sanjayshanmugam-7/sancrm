import api, { buildQueryString } from './api';

const accountsService = {
  getAll: (params = {}) => api.get(`/accounts?${buildQueryString(params)}`),
  getById: (id) => api.get(`/accounts/${id}`),
  create: (data) => api.post('/accounts', data),
  update: (id, data) => api.put(`/accounts/${id}`, data),
  delete: (id) => api.delete(`/accounts/${id}`),
  getBranches: (id) => api.get(`/accounts/${id}/branches`),
  createBranch: (parentId, data) => api.post(`/accounts/${parentId}/branches`, data),
  getHierarchy: () => api.get('/accounts/hierarchy'),
  getContacts: (id) => api.get(`/accounts/${id}/contacts`),
  getOpportunities: (id) => api.get(`/accounts/${id}/opportunities`),
  getDocuments: (id) => api.get(`/accounts/${id}/documents`),
  getActivities: (id) => api.get(`/accounts/${id}/activities`),
  getNotes: (id) => api.get(`/accounts/${id}/notes`),
  addNote: (id, note) => api.post(`/accounts/${id}/notes`, note),
  updateCreditLimit: (id, limit) => api.put(`/accounts/${id}/credit-limit`, { limit }),
  validateGST: (gstNumber) => api.post('/accounts/validate-gst', { gstNumber }),
  getCategories: () => api.get('/accounts/categories'),
  getStats: () => api.get('/accounts/stats'),
  export: (params = {}) => api.get(`/accounts/export?${buildQueryString(params)}`, { responseType: 'blob' }),
};

export default accountsService;

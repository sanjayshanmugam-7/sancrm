import api, { buildQueryString } from './api';

const leadsService = {
  getAll: (params = {}) => api.get(`/leads?${buildQueryString(params)}`),
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
  bulkDelete: (ids) => api.post('/leads/bulk-delete', { ids }),
  bulkImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/leads/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  exportLeads: (params = {}) => api.get(`/leads/export?${buildQueryString(params)}`, { responseType: 'blob' }),
  detectDuplicates: () => api.get('/leads/duplicates'),
  mergeDuplicates: (primaryId, duplicateId) => api.post(`/leads/${primaryId}/merge`, { duplicateId }),
  assign: (leadIds, assignee) => api.post('/leads/assign', { leadIds, assignee }),
  convert: (id, data) => api.post(`/leads/${id}/convert`, data),
  addNote: (id, note) => api.post(`/leads/${id}/notes`, note),
  getNotes: (id) => api.get(`/leads/${id}/notes`),
  addAttachment: (id, formData) => api.post(`/leads/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAttachments: (id) => api.get(`/leads/${id}/attachments`),
  getActivities: (id) => api.get(`/leads/${id}/activities`),
  getCommunicationHistory: (id) => api.get(`/leads/${id}/communication-history`),
  updateScore: (id) => api.post(`/leads/${id}/update-score`),
  setReminder: (id, reminder) => api.post(`/leads/${id}/reminder`, reminder),
  getStats: () => api.get('/leads/stats'),
  getSourceBreakdown: () => api.get('/leads/source-breakdown'),
  getAssignmentRules: () => api.get('/leads/assignment-rules'),
  createAssignmentRule: (rule) => api.post('/leads/assignment-rules', rule),
  updateAssignmentRule: (ruleId, rule) => api.put(`/leads/assignment-rules/${ruleId}`, rule),
  deleteAssignmentRule: (ruleId) => api.delete(`/leads/assignment-rules/${ruleId}`),
};

export default leadsService;

import api, { buildQueryString } from './api';

const campaignsService = {
  getAll: (params = {}) => api.get(`/campaigns?${buildQueryString(params)}`),
  getById: (id) => api.get(`/campaigns/${id}`),
  create: (data) => api.post('/campaigns', data),
  update: (id, data) => api.put(`/campaigns/${id}`, data),
  delete: (id) => api.delete(`/campaigns/${id}`),
  launch: (id) => api.post(`/campaigns/${id}/launch`),
  pause: (id) => api.post(`/campaigns/${id}/pause`),
  resume: (id) => api.post(`/campaigns/${id}/resume`),
  stop: (id) => api.post(`/campaigns/${id}/stop`),
  duplicate: (id) => api.post(`/campaigns/${id}/duplicate`),
  getStats: (id) => api.get(`/campaigns/${id}/stats`),
  getRecipients: (id, params = {}) => api.get(`/campaigns/${id}/recipients?${buildQueryString(params)}`),
  addRecipients: (id, data) => api.post(`/campaigns/${id}/recipients`, data),
  getTemplates: (type) => api.get(`/campaigns/templates?type=${type}`),
  createTemplate: (data) => api.post('/campaigns/templates', data),
  sendTestEmail: (data) => api.post('/campaigns/test-email', data),
  sendTestSMS: (data) => api.post('/campaigns/test-sms', data),
  getEmailMetrics: (id) => api.get(`/campaigns/${id}/email-metrics`),
  getSMSMetrics: (id) => api.get(`/campaigns/${id}/sms-metrics`),
  getOverallStats: () => api.get('/campaigns/stats'),
};

export default campaignsService;

import api, { buildQueryString } from './api';

const documentsService = {
  getAll: (params = {}) => api.get(`/documents?${buildQueryString(params)}`),
  getById: (id) => api.get(`/documents/${id}`),
  create: (data) => api.post('/documents', data),
  update: (id, data) => api.put(`/documents/${id}`, data),
  delete: (id) => api.delete(`/documents/${id}`),
  download: (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' }),
  upload: (formData) => api.post('/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  sendForSignature: (id, email) => api.post(`/documents/${id}/send-signature`, { email }),
  checkSignatureStatus: (id) => api.get(`/documents/${id}/signature-status`),
  processOCR: (formData) => api.post('/documents/ocr', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getVersions: (id) => api.get(`/documents/${id}/versions`),
  createVersion: (id, formData) => api.post(`/documents/${id}/versions`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getTemplates: (type) => api.get(`/documents/templates?type=${type}`),
  createTemplate: (data) => api.post('/documents/templates', data),
  generatePDF: (id) => api.post(`/documents/${id}/generate-pdf`, {}, { responseType: 'blob' }),
  share: (id, emails) => api.post(`/documents/${id}/share`, { emails }),
  getStats: () => api.get('/documents/stats'),
};

export default documentsService;

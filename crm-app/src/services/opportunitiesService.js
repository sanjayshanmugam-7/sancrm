import api, { buildQueryString } from './api';

const opportunitiesService = {
  getAll: (params = {}) => api.get(`/opportunities?${buildQueryString(params)}`),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
  updateStage: (id, stage) => api.put(`/opportunities/${id}/stage`, { stage }),
  getActivities: (id) => api.get(`/opportunities/${id}/activities`),
  getNotes: (id) => api.get(`/opportunities/${id}/notes`),
  addNote: (id, note) => api.post(`/opportunities/${id}/notes`, note),
  getDocuments: (id) => api.get(`/opportunities/${id}/documents`),
  getTimeline: (id) => api.get(`/opportunities/${id}/timeline`),
  getPipelineStats: () => api.get('/opportunities/pipeline-stats'),
  getAIPrediction: (id) => api.get(`/opportunities/${id}/ai-prediction`),
  getForecast: (params = {}) => api.get(`/opportunities/forecast?${buildQueryString(params)}`),
  export: (params = {}) => api.get(`/opportunities/export?${buildQueryString(params)}`, { responseType: 'blob' }),
  getStats: () => api.get('/opportunities/stats'),
  getStageHistory: (id) => api.get(`/opportunities/${id}/stage-history`),
};

export default opportunitiesService;

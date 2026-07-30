import api, { buildQueryString } from './api';

const activitiesService = {
  getAll: (params = {}) => api.get(`/activities?${buildQueryString(params)}`),
  getById: (id) => api.get(`/activities/${id}`),
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
  complete: (id, data) => api.post(`/activities/${id}/complete`, data),
  reschedule: (id, data) => api.put(`/activities/${id}/reschedule`, data),
  getCalls: (params = {}) => api.get(`/activities/calls?${buildQueryString(params)}`),
  getMeetings: (params = {}) => api.get(`/activities/meetings?${buildQueryString(params)}`),
  getEmails: (params = {}) => api.get(`/activities/emails?${buildQueryString(params)}`),
  getFollowUps: (params = {}) => api.get(`/activities/follow-ups?${buildQueryString(params)}`),
  getPendingReminders: () => api.get('/activities/reminders/pending'),
  setReminder: (id, reminder) => api.post(`/activities/${id}/reminder`, reminder),
  getCalendar: (params = {}) => api.get(`/activities/calendar?${buildQueryString(params)}`),
  getStats: () => api.get('/activities/stats'),
  sendEmail: (data) => api.post('/activities/send-email', data),
  logCall: (data) => api.post('/activities/log-call', data),
};

export default activitiesService;

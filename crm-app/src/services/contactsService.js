import api, { buildQueryString } from './api';

const contactsService = {
  getAll: (params = {}) => api.get(`/contacts?${buildQueryString(params)}`),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
  bulkDelete: (ids) => api.post('/contacts/bulk-delete', { ids }),
  import: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/contacts/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  export: (params = {}) => api.get(`/contacts/export?${buildQueryString(params)}`, { responseType: 'blob' }),
  getGroups: () => api.get('/contacts/groups'),
  getGroupById: (id) => api.get(`/contacts/groups/${id}`),
  createGroup: (data) => api.post('/contacts/groups', data),
  updateGroup: (id, data) => api.put(`/contacts/groups/${id}`, data),
  deleteGroup: (id) => api.delete(`/contacts/groups/${id}`),
  addToGroup: (groupId, contactIds) => api.post(`/contacts/groups/${groupId}/members`, { contactIds }),
  removeFromGroup: (groupId, contactId) => api.delete(`/contacts/groups/${groupId}/members/${contactId}`),
  getActivities: (id) => api.get(`/contacts/${id}/activities`),
  getNotes: (id) => api.get(`/contacts/${id}/notes`),
  addNote: (id, note) => api.post(`/contacts/${id}/notes`, note),
  getAttachments: (id) => api.get(`/contacts/${id}/attachments`),
  addAttachment: (id, formData) => api.post(`/contacts/${id}/attachments`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getCommunicationHistory: (id) => api.get(`/contacts/${id}/communication-history`),
  getRelationshipMap: (id) => api.get(`/contacts/${id}/relationships`),
  getStats: () => api.get('/contacts/stats'),
};

export default contactsService;

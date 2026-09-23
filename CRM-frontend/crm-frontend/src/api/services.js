import api from './client';

// ---- Auth ----
export const authApi = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data.data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me').then((r) => r.data.data.user),
  updateProfile: (payload) => api.patch('/auth/me', payload).then((r) => r.data.data.user),
  changePassword: (payload) => api.post('/auth/change-password', payload).then((r) => r.data),
  listUsers: () => api.get('/auth/users').then((r) => r.data.data),
};

// ---- Dashboard ----
export const dashboardApi = {
  stats: () => api.get('/dashboard/stats').then((r) => r.data.data),
};

// ---- Leads ----
export const leadsApi = {
  list: (params) => api.get('/leads', { params }).then((r) => r.data),
  get: (id) => api.get(`/leads/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/leads', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/leads/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/leads/${id}`),
  assign: (id, assignedTo) => api.put(`/leads/${id}/assign`, { assignedTo }).then((r) => r.data.data),
};

// ---- Deals ----
export const dealsApi = {
  list: (params) => api.get('/deals', { params }).then((r) => r.data),
  get: (id) => api.get(`/deals/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/deals', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/deals/${id}`, payload).then((r) => r.data.data),
  updateStage: (id, stage) => api.patch(`/deals/${id}/stage`, { stage }).then((r) => r.data.data),
  remove: (id) => api.delete(`/deals/${id}`),
};

// ---- Followups ----
export const followupsApi = {
  list: (params) => api.get('/followups', { params }).then((r) => r.data),
  create: (payload) => api.post('/followups', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/followups/${id}`, payload).then((r) => r.data.data),
  complete: (id) => api.patch(`/followups/${id}/complete`).then((r) => r.data.data),
};

// ---- Activities ----
export const activitiesApi = {
  timeline: (leadId, params) => api.get(`/activities/${leadId}`, { params }).then((r) => r.data),
  create: (payload) => api.post('/activities', payload).then((r) => r.data.data),
};

// ---- Audit logs ----
export const auditApi = {
  list: (params) => api.get('/audit-logs', { params }).then((r) => r.data),
};

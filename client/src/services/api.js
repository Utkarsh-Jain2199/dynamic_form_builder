import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

const withAuth = (token) => ({ headers: { 'x-admin-token': token } });

export const adminAPI = {
  login: (username, password) => api.post('/admin/login', { username, password }),
  getForms: (token) => api.get('/admin/forms', withAuth(token)),
  getForm: (id, token) => api.get(`/admin/forms/${id}`, withAuth(token)),
  createForm: (data, token) => api.post('/admin/forms', data, withAuth(token)),
  updateForm: (id, data, token) => api.put(`/admin/forms/${id}`, data, withAuth(token)),
  deleteForm: (id, token) => api.delete(`/admin/forms/${id}`, withAuth(token)),
  addField: (formId, data, token) => api.post(`/admin/forms/${formId}/fields`, data, withAuth(token)),
  updateField: (formId, fieldId, data, token) => api.put(`/admin/forms/${formId}/fields/${fieldId}`, data, withAuth(token)),
  deleteField: (formId, fieldId, token) => api.delete(`/admin/forms/${formId}/fields/${fieldId}`, withAuth(token)),
  reorderFields: (formId, fieldOrders, token) => api.put(`/admin/forms/${formId}/fields/reorder`, { fieldOrders }, withAuth(token)),
  getSubmissions: (token, params = {}) => api.get('/submissions', { ...withAuth(token), params }),
  getFormSubmissions: (formId, token, params = {}) => api.get(`/submissions/form/${formId}`, { ...withAuth(token), params })
};

export const publicAPI = {
  getForms: () => api.get('/forms'),
  getForm: (id) => api.get(`/forms/${id}`),
  submitForm: (data) => api.post('/submissions', data)
};


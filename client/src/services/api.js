import axios from 'axios';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me')
};

export const reportAPI = {
  getAll: () => api.get('/reports'),
  getOne: (id) => api.get(`/reports/${id}`),
  create: (data) => api.post('/reports', data),
  update: (id, data) => api.put(`/reports/${id}`, data),
  submit: (id) => api.post(`/reports/${id}/submit`),
  uploadFiles: (id, formData) => api.post(`/reports/${id}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  reanalyze: (id) => api.post(`/reports/${id}/reanalyze`)
};

export const advisorAPI = {
  getReports: () => api.get('/advisor/reports'),
  approve: (id) => api.post(`/advisor/reports/${id}/approve`),
  revise: (id, mesaj) => api.post(`/advisor/reports/${id}/revise`, { mesaj }),
  comment: (id, yorum) => api.post(`/advisor/reports/${id}/comment`, { yorum })
};

export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count')
};

export const statsAPI = {
  getOverview: () => api.get('/stats/overview'),
  getWeekly: () => api.get('/stats/weekly'),
  getTechnologies: () => api.get('/stats/technologies'),
  getAiDistribution: () => api.get('/stats/ai-distribution')
};

export default api;

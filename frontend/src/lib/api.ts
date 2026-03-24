import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
            const { accessToken, refreshToken: newRefreshToken } = response.data.data;

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
    role: string;
    entrepriseId?: string;
  }) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: Partial<{ nom: string; prenom: string; avatar: string }>) =>
    api.put('/auth/profile', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// Sessions API
export const sessionsApi = {
  getAll: (params?: Record<string, string | number>) => api.get('/sessions', { params }),
  getById: (id: string) => api.get(`/sessions/${id}`),
  create: (data: {
    apprenantId: string;
    moduleId: string;
    dateDebut: string;
    dateFin: string;
    type?: string;
    notes?: string;
  }) => api.post('/sessions', data),
  update: (id: string, data: Partial<{
    dateDebut: string;
    dateFin: string;
    type: string;
    notes: string;
    statut: string;
  }>) => api.put(`/sessions/${id}`, data),
  delete: (id: string) => api.delete(`/sessions/${id}`),
};

// Modules API
export const modulesApi = {
  getAll: () => api.get('/modules'),
  getById: (id: string) => api.get(`/modules/${id}`),
  create: (data: { nom: string; description?: string }) => api.post('/modules', data),
  update: (id: string, data: { nom?: string; description?: string }) =>
    api.put(`/modules/${id}`, data),
  delete: (id: string) => api.delete(`/modules/${id}`),
};

// Users API
export const usersApi = {
  getAll: (params?: { role?: string; search?: string }) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: { limit?: number; unreadOnly?: boolean }) =>
    api.get('/notifications', { params }),
  markRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Signatures API
export const signaturesApi = {
  signSession: (sessionId: string, signatureData: string) =>
    api.post('/signatures/session', { sessionId, signatureData }),
  signRapport: (rapportId: string, signatureData: string) =>
    api.post('/signatures/rapport', { rapportId, signatureData }),
};

// Rapports API
export const rapportsApi = {
  getAll: (params?: { statut?: string; apprenantId?: string }) =>
    api.get('/rapports', { params }),
  getById: (id: string) => api.get(`/rapports/${id}`),
  generate: (data: {
    apprenantId: string;
    periodeDebut: string;
    periodeFin: string;
  }) => api.post('/rapports/generate', data),
  getPdf: (id: string) => api.get(`/rapports/${id}/pdf`),
};

// Dashboard API
export const dashboardApi = {
  formateur: () => api.get('/dashboard/formateur'),
  apprenant: () => api.get('/dashboard/apprenant'),
  manager: () => api.get('/dashboard/manager'),
  responsable: () => api.get('/dashboard/responsable'),
};

// Assignments API
export const assignmentsApi = {
  getManagerAssignments: (params?: { managerId?: string }) =>
    api.get('/assignments/manager', { params }),
  createManagerAssignment: (data: { managerId?: string; apprenantId: string }) =>
    api.post('/assignments/manager', data),
  deleteManagerAssignment: (data: { managerId?: string; apprenantId: string }) =>
    api.delete('/assignments/manager', { data }),
  getCentreAssignments: () => api.get('/assignments/centre'),
  createCentreAssignment: (data: { formateurId: string }) =>
    api.post('/assignments/centre', data),
  deleteCentreAssignment: (data: { formateurId: string }) =>
    api.delete('/assignments/centre', { data }),
};

// Entreprises API
export const entreprisesApi = {
  getAll: () => api.get('/entreprises'),
  create: (data: { nom: string; type: string; adresse?: string; siret?: string }) =>
    api.post('/entreprises', data),
  update: (id: string, data: { nom?: string; type?: string; adresse?: string; siret?: string }) =>
    api.put(`/entreprises/${id}`, data),
};

// Export API
export const exportApi = {
  csv: (params: { type: 'sessions' | 'formateurs'; from?: string; to?: string }) =>
    api.get('/export/csv', { params, responseType: 'blob' }),
};

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('knousso_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('knousso_token');
      localStorage.removeItem('knousso_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders/my'),
  getAll: () => api.get('/orders'),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const settingsAPI = {
  getSlideshow: () => api.get('/settings/slideshow'),
  updateSlideshow: (images) => api.put('/settings/slideshow', { images }),
};

export default api;

import axios from 'axios';

const base = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(
  /\/+$/,
  ''
);

const api = axios.create({
  baseURL: `${base}/api`,
});

// Interceptor para añadir el token JWT a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;


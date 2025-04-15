// 📄 src/services/api.js
import axios from 'axios'

const mode = import.meta.env.MODE;

const baseURL =
  mode === 'production'
    ? import.meta.env.VITE_API_URL_PROD
    : import.meta.env.VITE_API_URL_DEV;

const api = axios.create({
  baseURL, // ✅ 드디어 실제 분기된 baseURL 사용!
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken'); // 또는 Redux에서 가져올 수도 있음
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;

import axios from 'axios';
const APP_BASE = "/geo-map-game/#";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // baseURL: 'http://localhost:5000',
  // baseURL: 'https://geo-map-game.onrender.com',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 if (token) {
  config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

/* Global response handler */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;

    if (originalRequest?.url?.includes('/refresh-token')) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`http://localhost:5000/refresh-token`,{},{ withCredentials: true });
        return api(originalRequest);
      } catch (err) {
        console.log({err});
        return Promise.reject(err);
      }
      // Unauthorized → token expired / invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => window.location.replace(`${window.location.origin}${APP_BASE}/login`), 3000);
    }

    if (status === 403) {
      // Forbidden → no permission
      setTimeout(() => window.location.replace(`${window.location.origin}${APP_BASE}/`), 3000);
    }

    return Promise.reject(error);
  }
);

export default api;
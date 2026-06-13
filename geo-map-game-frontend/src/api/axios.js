import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL,
  // baseURL: 'http://localhost:5000',
  baseURL: 'https://geo-map-game.onrender.com',
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
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized → token expired / invalid
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setTimeout(() => window.location.replace("/login"), 3000);
    }

    if (status === 403) {
      // Forbidden → no permission
      setTimeout(() => window.location.replace("/"), 3000);
    }

    return Promise.reject(error);
  }
);

export default api;
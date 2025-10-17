import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  // **IMPORTANT**: Update this to your actual backend URL
  baseURL: 'http://127.0.0.1:5000/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to attach the JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

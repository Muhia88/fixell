import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', 
});

/**
 * Axios Request Interceptor
 * * This function is attached to the Axios instance and will run BEFORE every
 * single request is sent. Its purpose is to check if an authentication token
 * exists in localStorage and, if it does, add it to the request's Authorization header.
 * This is how your backend will identify and authenticate the logged-in user.
 */
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from local storage
    const token = localStorage.getItem('accessToken');
    
    // If the token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle any errors during the request setup
    return Promise.reject(error);
  }
);

export default api;

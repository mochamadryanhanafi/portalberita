import axios from 'axios';
import userState from '@/utils/user-state';

const BASE_URL = import.meta.env.VITE_API_PATH;

const axiosInstance = axios.create();
axiosInstance.defaults.baseURL = BASE_URL;
axiosInstance.defaults.withCredentials = true;

// Add a request interceptor to include the auth token in all requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Try to get the token from localStorage
    const token = localStorage.getItem('authToken');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;

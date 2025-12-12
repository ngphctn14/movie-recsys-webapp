import axios from 'axios';

const API_URL = import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api/v1';

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

axiosClient.interceptors.request.use(async (config) => {
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }
    return response;
  },
  (error) => {
    if (error.response) {
       console.error(`API Error: ${error.response.status} - ${error.response.data.message || error.message}`);
    } else {
       console.error(`Network Error: ${error.message}`);
    }
    throw error;
  }
);

export default axiosClient;
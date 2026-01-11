import axios from 'axios';

import { getAccessToken } from '@/services/CookiesServices';

const API = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Use an interceptor to dynamically add the access token
API.interceptors.request.use(
  (config) => {
    const token = getAccessToken(); // Fetch the latest access token from cookies
    if (token) {

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default API;

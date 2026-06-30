import axios from 'axios';

// API Base URL - Read from environment variable, fallback to localhost
let apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.5:8000';

// Ensure the URL has a protocol (http/https), otherwise browsers treat it as a relative path
if (apiBaseUrl && !apiBaseUrl.startsWith('http://') && !apiBaseUrl.startsWith('https://')) {
  apiBaseUrl = `https://${apiBaseUrl}`;
}

export const API_BASE_URL = apiBaseUrl;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log the full URL being called
    console.log('🔵 API Request:', config.baseURL + config.url);
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.config.url, response.status);
    console.log('Response Data:', response.data);
    return response.data;
  },
  (error) => {
    console.error('❌ API Error Full:', error);
    console.error('❌ API Error Response:', error.response);
    console.error('❌ API Error Data:', error.response?.data);
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized access - redirecting to login');
      removeToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.warn('⚠️ Access forbidden');
    }
    
    // Extract error message from response
    let errorMessage = 'Something went wrong';
    
    if (error.response?.data) {
      const data = error.response.data;
      errorMessage = data.message || data.error || data.msg || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Create error object with message
    const errorObj = {
      message: errorMessage,
      error: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    };
    
    return Promise.reject(errorObj);
  }
);

// Token management functions
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

export const setToken = (token) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// User data management
export const getUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// Export axios instance
export default axiosInstance;

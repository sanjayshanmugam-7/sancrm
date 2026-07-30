import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crm_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    const duration = new Date() - response.config.metadata?.startTime;
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${duration}ms)`);
    }
    return response.data;
  },
  (error) => {
    const { response, config } = error;
    const duration = config?.metadata ? new Date() - config.metadata.startTime : 0;

    if (process.env.NODE_ENV === 'development') {
      console.error(`[API Error] ${config?.method?.toUpperCase()} ${config?.url} - ${response?.status} (${duration}ms)`, error.message);
    }

    if (response) {
      switch (response.status) {
        case 401:
          localStorage.removeItem('crm_token');
          window.location.href = '/login';
          break;
        case 403:
          console.error('Forbidden: You do not have permission to perform this action.');
          break;
        case 404:
          console.error('Resource not found.');
          break;
        case 422:
          console.error('Validation error:', response.data?.errors);
          break;
        case 500:
          console.error('Server error. Please try again later.');
          break;
        default:
          break;
      }
    } else if (error.code === 'ECONNABORTED') {
      console.error('Request timeout. Please check your connection.');
    } else {
      console.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('crm_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('crm_token');
    delete api.defaults.headers.common['Authorization'];
  }
};

export const buildQueryString = (params) => {
  const filteredParams = Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return new URLSearchParams(filteredParams).toString();
};

export default api;

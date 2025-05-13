// API service for communicating with the backend
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth services
export const authService = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string) => 
    api.post('/auth/register', { email, password }),
  getCurrentUser: () => 
    api.get('/auth/me'),
};

// Profile services
export const profileService = {
  getProfile: () => 
    api.get('/profile'),
  updateProfile: (profileData: any) => 
    api.put('/profile', profileData),
};

// AI services
export const aiService = {
  generateDietPlan: () => 
    api.get('/ai/diet-plan'),
  generateWorkoutPlan: () => 
    api.get('/ai/workout-plan'),
  askQuestion: (question: string) => 
    api.post('/ai/ask', { question }),
  getProgressPrediction: () => 
    api.get('/ai/progress-prediction'),
};
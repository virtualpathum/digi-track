import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';

// Replace with your actual API base URL
const API_BASE_URL = 'https://n9ay6cj0ch.execute-api.ap-southeast-1.amazonaws.com/digi-track-dev';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Get IdToken for authentication
      const idToken = await AsyncStorage.getItem('idToken');
      
      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`;
      }
      
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    } catch (error) {
      console.error('Error getting token:', error);
    }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Unauthorized - clearing auth data');
      await AsyncStorage.multiRemove(['idToken', 'accessToken', 'refreshToken', 'user']);
      
      // Dispatch logout action
      store.dispatch({ type: 'auth/logoutUser/fulfilled' });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// API endpoints for other services
export const api = {
  // User endpoints
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: any) => apiClient.put('/user/profile', data),
  
  // Attendance endpoints
  checkIn: (data: any) => apiClient.post('/attendance/check-in', data),
  checkOut: (data: any) => apiClient.post('/attendance/check-out', data),
  getAttendanceHistory: () => apiClient.get('/attendance/history'),
  
  // Document endpoints
  uploadDocument: (formData: FormData) => 
    apiClient.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getDocuments: () => apiClient.get('/documents'),
  deleteDocument: (type: string) => apiClient.delete(`/documents/${type}`),
};
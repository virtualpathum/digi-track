import axios from 'axios';
import { store } from '../store';
import { cognitoAuth } from '../services/cognitoAuth';

// Replace with your actual API Gateway URL
const API_BASE_URL = 'https://4w1qw37wkf.execute-api.ap-southeast-1.amazonaws.com/digi-count-devr';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Try to get token from Redux store first
      const state = store.getState();
      const idToken = state.auth.idToken;
      
      if (idToken) {
        config.headers.Authorization = `Bearer ${idToken}`;
      } else {
        // Fallback to getting fresh token from Cognito
        const currentUser = cognitoAuth.getCurrentUser();
        
        if (currentUser) {
          await new Promise((resolve, reject) => {
            currentUser.getSession((err: any, session: any) => {
              if (err) {
                reject(err);
                return;
              }
              
              if (session && session.isValid()) {
                config.headers.Authorization = `Bearer ${session.getIdToken().getJwtToken()}`;
              }
              resolve(null);
            });
          });
        }
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const currentUser = cognitoAuth.getCurrentUser();
        
        if (currentUser) {
          const refreshToken = store.getState().auth.refreshToken;
          
          if (refreshToken) {
            // Cognito automatically handles token refresh when calling getSession
            await new Promise((resolve, reject) => {
              currentUser.getSession((err: any, session: any) => {
                if (err) {
                  reject(err);
                  return;
                }
                
                if (session && session.isValid()) {
                  // Update token in Redux
                  store.dispatch({
                    type: 'auth/updateAuthState',
                    payload: {
                      idToken: session.getIdToken().getJwtToken(),
                    },
                  });
                  
                  // Retry original request with new token
                  originalRequest.headers.Authorization = `Bearer ${session.getIdToken().getJwtToken()}`;
                  resolve(null);
                } else {
                  reject(new Error('Session invalid'));
                }
              });
            });
            
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        console.error('Token refresh failed:', refreshError);
        store.dispatch({ type: 'auth/logoutUser/fulfilled' });
      }
    }
    
    // Handle other errors
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    
    // Format error message
    let errorMessage = 'An error occurred';
    
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default apiClient;

// API endpoints
export const authAPI = {
  // These might not be needed if using Cognito directly
  // But keeping them for backward compatibility
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },
  
  register: async (email: string, password: string, fullName: string) => {
    const response = await apiClient.post('/auth/register', { email, password, fullName });
    return response.data;
  },
  
  // Protected endpoints
  getProfile: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },
  
  updateProfile: async (data: any) => {
    const response = await apiClient.put('/user/profile', data);
    return response.data;
  },
};

// Other API endpoints
export const attendanceAPI = {
  checkIn: async (data: any) => {
    const response = await apiClient.post('/attendance/check-in', data);
    return response.data;
  },
  
  checkOut: async (data: any) => {
    const response = await apiClient.post('/attendance/check-out', data);
    return response.data;
  },
  
  getHistory: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/attendance/history?${params}`);
    return response.data;
  },
};

export const documentsAPI = {
  upload: async (documentType: string, file: any) => {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    
    const response = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  getAll: async () => {
    const response = await apiClient.get('/documents');
    return response.data;
  },
  
  delete: async (documentType: string) => {
    const response = await apiClient.delete(`/documents/${documentType}`);
    return response.data;
  },
};
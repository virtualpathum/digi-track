import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual API endpoint
const API_URL = 'https://n9ay6cj0ch.execute-api.ap-southeast-1.amazonaws.com/auth';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await axios.post(API_URL, {
        action: 'login',
        email,
        password,
      });
      
      const { tokens } = response.data;
      
      // Save all tokens
      await AsyncStorage.setItem('idToken', tokens.IdToken);
      await AsyncStorage.setItem('accessToken', tokens.AccessToken);
      await AsyncStorage.setItem('refreshToken', tokens.RefreshToken);
      
      // Decode the IdToken to get user info
      const payload = JSON.parse(atob(tokens.IdToken.split('.')[1]));
      
      return {
        success: true,
        message: response.data.message,
        tokens,
        user: {
          userId: payload.sub,
          email: payload.email,
          username: payload['cognito:username'],
        }
      };
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    try {
      const response = await axios.post(API_URL, {
        action: 'signup',
        email,
        password,
      });
      
      console.log('Signup response:', response.data);
      
      return {
        success: true,
        message: response.data.message,
        userSub: response.data.result.UserSub,
        userConfirmed: response.data.result.UserConfirmed,
        codeDeliveryDetails: response.data.result.CodeDeliveryDetails,
      };
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Sign up failed');
    }
  },

  confirmSignUp: async (email: string, confirmationCode: string) => {
    try {
      const response = await axios.post(API_URL, {
        action: 'confirm',
        email,
        confirmationCode,
      });
      
      console.log('Confirmation response:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'Email confirmed successfully',
      };
    } catch (error: any) {
      console.error('Confirmation error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Confirmation failed');
    }
  },

  resendConfirmationCode: async (email: string) => {
    try {
      const response = await axios.post(API_URL, {
        action: 'resend',
        email,
      });
      
      return {
        success: true,
        message: response.data.message || 'Code resent successfully',
      };
    } catch (error: any) {
      console.error('Resend code error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to resend code');
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['idToken', 'accessToken', 'refreshToken', 'user']);
  },

  getStoredToken: async () => {
    return await AsyncStorage.getItem('idToken');
  },
};
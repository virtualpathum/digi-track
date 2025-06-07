// src/store/slices/authSlice.ts
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  userId: string;
  email: string;
  username?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  needsConfirmation: boolean;
  confirmationEmail: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  needsConfirmation: false,
  confirmationEmail: null,
};

// Login thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await authService.login(email, password);
    await AsyncStorage.setItem('user', JSON.stringify(response.user));
    return response;
  }
);

// Sign up thunk
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
    const response = await authService.signUp(email, password, fullName);
    
    console.log('SignUp response in thunk:', response);
    
    // Check if user needs confirmation
    // Based on your API response structure: response.userConfirmed is false when needs confirmation
    const needsConfirmation = response.userConfirmed === false;
    
    return {
      ...response,
      needsConfirmation,
      email,
    };
  }
);

// Confirm sign up thunk
export const confirmUserSignUp = createAsyncThunk(
  'auth/confirmSignUp',
  async ({ email, code }: { email: string; code: string }) => {
    const response = await authService.confirmSignUp(email, code);
    return { ...response, email };
  }
);

// Resend confirmation code
export const resendCode = createAsyncThunk(
  'auth/resendCode',
  async (email: string) => {
    const response = await authService.resendConfirmationCode(email);
    return response;
  }
);

// Check auth status
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    const token = await authService.getStoredToken();
    const userStr = await AsyncStorage.getItem('user');
    
    if (token && userStr) {
      const user = JSON.parse(userStr);
      
      // Verify token is still valid
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        
        if (Date.now() < expirationTime) {
          return { user, isValid: true };
        }
      } catch (e) {
        console.error('Token validation error:', e);
      }
    }
    
    throw new Error('No valid auth session');
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    await authService.logout();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearConfirmation: (state) => {
      state.needsConfirmation = false;
      state.confirmationEmail = null;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
        state.needsConfirmation = false;
        state.confirmationEmail = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Login failed';
        state.isAuthenticated = false;
      });

    // Sign up
    builder
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action: any) => {
        state.isLoading = false;
        
        console.log('SignUp fulfilled, payload:', action.payload);
        
        if (action.payload.needsConfirmation) {
          console.log('Setting needsConfirmation to true');
          state.needsConfirmation = true;
          state.confirmationEmail = action.payload.email;
          state.error = null;
        } else {
          // Auto-confirmed (rare case)
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
        }
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign up failed';
      });

    // Confirm sign up
    builder
      .addCase(confirmUserSignUp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmUserSignUp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.needsConfirmation = false;
        state.error = null;
        // Don't clear email yet, might need it for auto-login
      })
      .addCase(confirmUserSignUp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Confirmation failed';
      });

    // Resend code
    builder
      .addCase(resendCode.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resendCode.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resendCode.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to resend code';
      });

    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.needsConfirmation = false;
      state.confirmationEmail = null;
    });
  },
});

export const { clearError, clearConfirmation } = authSlice.actions;
export default authSlice.reducer;
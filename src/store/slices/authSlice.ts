import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { cognitoAuth } from '../../services/cognitoAuth';

export interface User {
  userId: string;
  email: string;
  fullName: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  idToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  idToken: null,
  refreshToken: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const result = await cognitoAuth.signIn(email, password);
    
    // Fetch user details from your backend if needed
    // For now, using data from Cognito
    return {
      user: {
        userId: result.user.userId,
        email: result.user.email,
        fullName: result.user.email.split('@')[0], // Temporary, should come from backend
      },
      idToken: result.idToken,
      refreshToken: result.refreshToken,
    };
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, fullName }: { email: string; password: string; fullName: string }) => {
    // Sign up with Cognito
    await cognitoAuth.signUp(email, password, fullName);
    
    // Auto sign in after successful signup
    const result = await cognitoAuth.signIn(email, password);
    
    return {
      user: {
        userId: result.user.userId,
        email: result.user.email,
        fullName: fullName,
      },
      idToken: result.idToken,
      refreshToken: result.refreshToken,
    };
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async () => {
    cognitoAuth.signOut();
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    const currentUser = cognitoAuth.getCurrentUser();
    
    if (currentUser) {
      return new Promise((resolve, reject) => {
        currentUser.getSession((err: any, session: any) => {
          if (err || !session.isValid()) {
            reject('Session invalid');
            return;
          }
          
          const idToken = session.getIdToken();
          resolve({
            user: {
              userId: idToken.payload.sub,
              email: idToken.payload.email,
              fullName: idToken.payload.name || idToken.payload.email,
            },
            idToken: idToken.getJwtToken(),
            refreshToken: session.getRefreshToken().getToken(),
          });
        });
      });
    }
    
    throw new Error('No current user');
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateAuthState: (state, action: PayloadAction<Partial<AuthState>>) => {
      return { ...state, ...action.payload };
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
        state.idToken = action.payload.idToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Login failed';
      });

    // Sign Up
    builder
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.idToken = action.payload.idToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.error.message || 'Sign up failed';
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.idToken = null;
        state.refreshToken = null;
        state.error = null;
      });

    // Check Auth Status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action: any) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.idToken = action.payload.idToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.idToken = null;
        state.refreshToken = null;
      });
  },
});

export const { clearError, updateAuthState } = authSlice.actions;
export default authSlice.reducer;
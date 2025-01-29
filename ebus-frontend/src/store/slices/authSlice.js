import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Helper function to manage localStorage
const tokenStorage = {
  get: () => localStorage.getItem('accessToken'),
  set: (token) => localStorage.setItem('accessToken', token),
  clear: () => localStorage.removeItem('accessToken'),
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/token/', credentials);
      tokenStorage.set(response.data.access);
      return { accessToken: response.data.access };
    } catch (err) {
      tokenStorage.clear();
      return rejectWithValue(err.response?.data || { detail: 'Login failed' });
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { accessToken } = getState().auth;
      if (!accessToken) throw new Error('No access token');
      
      const response = await api.get('/users/profile/', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Failed to fetch profile' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      await api.post('/users/register/', userData);
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || { detail: 'Registration failed' });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: tokenStorage.get(),
    status: 'idle',
    error: null,
    profileStatus: 'idle'
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    // Add clearUser reducer
    clearUser: (state) => {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('accessToken');
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accessToken = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.detail;
        state.accessToken = null;
      })

      // User profile cases
      .addCase(fetchUserProfile.pending, (state) => {
        state.profileStatus = 'loading';
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.profileStatus = 'succeeded';
        state.user = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.profileStatus = 'failed';
        state.error = action.payload.detail;
        state.user = null;
        state.accessToken = null;
        tokenStorage.clear();
      })

      // Registration cases
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.status = 'succeeded';
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload.detail;
      });
  },
});


export const { logout, setCredentials,setUser, resetAuthState, clearUser } = authSlice.actions

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthStatus = (state) => state.auth.status;
export const selectAuthError = (state) => state.auth.error;
export const selectIsAuthenticated = (state) => !!state.auth.accessToken;

export default authSlice.reducer;
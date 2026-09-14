import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login, register, getOwnProfile } from '../../utils/api';

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await login({ email, password });
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const response = await register({ name, email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const fetchOwnProfile = createAsyncThunk(
  'auth/fetchOwnProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getOwnProfile();
      return response.data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  },
);

export const restoreAuthSession = createAsyncThunk(
  'auth/restoreAuthSession',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await getOwnProfile();
      if (localStorage.getItem('token') !== token) return null;
      return response.data.user;
    } catch (error) {
      if (localStorage.getItem('token') === token) {
        localStorage.removeItem('token');
      }
      return rejectWithValue(error.message);
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    isRestoringSession: false,
    hasCheckedSession: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isRestoringSession = false;
      state.hasCheckedSession = true;
      state.loading = false;
      localStorage.removeItem('token');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
        state.isAuthenticated = true;
        state.user = action.payload.user || state.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
        state.user = action.payload.user || state.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
        state.error = action.payload;
      })
      // Restore persisted session
      .addCase(restoreAuthSession.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isRestoringSession = true;
        state.hasCheckedSession = false;
      })
      .addCase(restoreAuthSession.fulfilled, (state, action) => {
        state.loading = false;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else if (!state.isAuthenticated) {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(restoreAuthSession.rejected, (state, action) => {
        state.loading = false;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
        if (!state.isAuthenticated) {
          state.user = null;
          state.isAuthenticated = false;
          state.error = action.payload;
        }
      })
      // Fetch Profile
      .addCase(fetchOwnProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isRestoringSession = false;
      })
      .addCase(fetchOwnProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchOwnProfile.rejected, (state, action) => {
        state.loading = false;
        state.isRestoringSession = false;
        state.hasCheckedSession = true;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload;
        localStorage.removeItem('token');
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

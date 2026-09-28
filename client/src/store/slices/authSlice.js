import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { registerRequest, loginRequest, fetchCurrentUserRequest } from '../../services/authService';
import { saveAuth, getStoredAuth, clearAuth } from '../../utils/tokenStorage';
import { getErrorMessage } from '../../utils/errorMessage';

const stored = getStoredAuth();

const initialState = {
  user: stored.user,
  token: stored.token,
  isAuthenticated: Boolean(stored.token),
  status: 'idle',
  error: null,
};

export const registerUser = createAsyncThunk('auth/register', async (formData, { rejectWithValue }) => {
  try {
    const result = await registerRequest(formData);
    saveAuth({ token: result.token, user: result.user, rememberMe: false });
    return result;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (formData, { rejectWithValue }) => {
  try {
    const result = await loginRequest(formData);
    saveAuth({ token: result.token, user: result.user, rememberMe: Boolean(formData.rememberMe) });
    return result;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    return await fetchCurrentUserRequest();
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearAuth();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.status = 'idle';
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;

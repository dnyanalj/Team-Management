import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchUsersRequest } from '../../services/userService';
import { getErrorMessage } from '../../utils/errorMessage';

const initialState = {
  list: [],
  status: 'idle',
  error: null,
};

export const fetchUsers = createAsyncThunk('users/fetchAll', async (_, { rejectWithValue }) => {
  try {
    return await fetchUsersRequest();
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default usersSlice.reducer;

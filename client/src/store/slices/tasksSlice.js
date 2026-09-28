import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  fetchTasksRequest,
  fetchTaskStatsRequest,
  fetchTaskByIdRequest,
  createTaskRequest,
  updateTaskRequest,
  deleteTaskRequest,
} from '../../services/taskService';
import { getErrorMessage } from '../../utils/errorMessage';
import { RECENT_TASKS_COUNT } from '../../utils/constants';

const initialState = {
  items: [],
  pagination: { page: 1, limit: 0, total: 0, totalPages: 1 },
  recent: [],
  recentStatus: 'idle',
  currentTask: null,
  filters: {
    search: '',
    status: '',
    priority: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
  },
  stats: null,
  status: 'idle',
  statsStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
};

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (filters, { rejectWithValue }) => {
  try {
    return await fetchTasksRequest(filters);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchRecentTasks = createAsyncThunk('tasks/fetchRecent', async (_, { rejectWithValue }) => {
  try {
    const { items } = await fetchTasksRequest({ sortBy: 'createdAt', order: 'desc', page: 1, limit: RECENT_TASKS_COUNT });
    return items;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchTaskStats = createAsyncThunk('tasks/fetchStats', async (_, { rejectWithValue }) => {
  try {
    return await fetchTaskStatsRequest();
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const fetchTaskById = createAsyncThunk('tasks/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await fetchTaskByIdRequest(id);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const createTask = createAsyncThunk('tasks/create', async (payload, { rejectWithValue }) => {
  try {
    return await createTaskRequest(payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, payload }, { rejectWithValue }) => {
  try {
    return await updateTaskRequest(id, payload);
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await deleteTaskRequest(id);
    return id;
  } catch (err) {
    return rejectWithValue(getErrorMessage(err));
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilters(state, action) {
      // Any filter change other than an explicit page change sends the user back to page 1.
      const page = action.payload.page ?? 1;
      state.filters = { ...state.filters, ...action.payload, page };
    },
    // Optimistic status change for the board; the caller reverts it if the API call fails.
    setTaskStatusLocally(state, action) {
      const task = state.items.find((t) => t._id === action.payload.id);
      if (task) task.status = action.payload.status;
    },
    resetFilters(state) {
      state.filters = initialState.filters;
    },
    clearCurrentTask(state) {
      state.currentTask = null;
    },
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.items;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchRecentTasks.pending, (state) => {
        state.recentStatus = 'loading';
      })
      .addCase(fetchRecentTasks.fulfilled, (state, action) => {
        state.recentStatus = 'succeeded';
        state.recent = action.payload;
      })
      .addCase(fetchRecentTasks.rejected, (state) => {
        state.recentStatus = 'failed';
      })
      .addCase(fetchTaskStats.pending, (state) => {
        state.statsStatus = 'loading';
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.statsStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(fetchTaskById.pending, (state) => {
        state.status = 'loading';
        state.currentTask = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items.unshift(action.payload);
        state.pagination.total += 1;
      })
      .addCase(createTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
        const recentIndex = state.recent.findIndex((t) => t._id === action.payload._id);
        if (recentIndex !== -1) state.recent[recentIndex] = action.payload;
        if (state.currentTask?._id === action.payload._id) state.currentTask = action.payload;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteTask.pending, (state) => {
        state.mutationStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((t) => t._id !== action.payload);
        state.recent = state.recent.filter((t) => t._id !== action.payload);
        state.pagination.total = Math.max(state.pagination.total - 1, 0);
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, setTaskStatusLocally, clearCurrentTask, clearTaskError } = tasksSlice.actions;
export default tasksSlice.reducer;

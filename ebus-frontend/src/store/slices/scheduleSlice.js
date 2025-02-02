// src/store/slices/scheduleSlice.js
import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import api from '../../services/api';

// Validate and transform the schedules data
const validateScheduleData = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Expected schedules data to be an array');
  }

  return data
    .map((schedule) => {
      if (!schedule || typeof schedule !== 'object') return null;

      return {
        id: schedule.id?.toString() || '',
        route: schedule.route !== undefined ? schedule.route.toString() : '',
        bus: schedule.bus?.toString() || '',
        departure_time: schedule.departure_time || '',
        arrival_time: schedule.arrival_time || '',
        fare: parseFloat(schedule.fare) || 0,
        available_seats_count: parseInt(schedule.available_seats_count) || 0,
        duration: schedule.duration || 0,
        // Preserve nested details
        route_details: schedule.route_details || {},
        bus_details: schedule.bus_details || {},
        seats: schedule.seats || [],
      };
    })
    .filter(Boolean);
};

// Async thunk to fetch schedules from the API
export const fetchSchedules = createAsyncThunk(
  'schedules/fetchSchedules',
  async (_, { rejectWithValue }) => {
    try {
      // Using relative path because your api instance is configured with baseURL 'http://localhost:8000/api/'
      const response = await api.get('buses/schedules/');
      try {
        return validateScheduleData(response.data);
      } catch (validationError) {
        return rejectWithValue(`Data validation error: ${validationError.message}`);
      }
    } catch (err) {
      if (!err.response) {
        return rejectWithValue('Network error: Could not connect to server');
      }
      return rejectWithValue(
        err.response.data?.detail ||
          err.response.data?.message ||
          'An error occurred while fetching schedules'
      );
    }
  }
);

const scheduleSlice = createSlice({
  name: 'schedules',
  initialState: {
    list: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearSchedules: (state) => {
      state.list = [];
      state.status = 'idle';
      state.error = null;
    },
    clearScheduleError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedules.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Failed to fetch schedules';
      });
  },
});

export const { clearSchedules, clearScheduleError } = scheduleSlice.actions;

// Regular (non-memoized) selector (if needed)
// export const selectAllSchedules = (state) => state.schedules.list;

// Memoized selector to filter schedules by a specific route ID
export const selectSchedulesByRouteId = createSelector(
  // Input selectors:
  [(state) => state.schedules.list, (_, routeId) => routeId],
  // Result function:
  (list, routeId) =>
    list.filter(
      (schedule) =>
        // Ensure schedule.route is defined; if not, use empty string.
        (schedule.route ? schedule.route.toString() : '') === routeId.toString()
    )
);

export const selectSchedulesStatus = (state) => state.schedules.status;
export const selectSchedulesError = (state) => state.schedules.error;

export default scheduleSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSchedule = createAsyncThunk(
  'bookings/fetchSchedule',
  async ({ routeId, date }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/buses/schedules/?route=${routeId}&date=${date}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bookings/bookings/', bookingData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    schedule: null,
    selectedSeats: [],
    status: 'idle',
    error: null
  },
  reducers: {
    setSelectedSeats: (state, action) => {
      state.selectedSeats = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedule.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.schedule = action.payload;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.detail || 'Failed to load schedule';
      })
      .addCase(createBooking.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createBooking.fulfilled, (state) => {
        state.status = 'succeeded';
        state.selectedSeats = [];
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.detail || 'Booking failed';
      });
  }
});

export const { setSelectedSeats } = bookingSlice.actions;
export default bookingSlice.reducer;
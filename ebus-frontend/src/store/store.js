import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import routeReducer from './slices/routeSlice';
import bookingReducer from './slices/bookingSlice';
import scheduleReducer from './slices/scheduleSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    routes: routeReducer,
    bookings: bookingReducer,
    schedules: scheduleReducer
  },
});
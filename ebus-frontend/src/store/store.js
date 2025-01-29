import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import routeReducer from './slices/routeSlice';
import bookingReducer from './slices/bookingSlice';

export default configureStore({
  reducer: {
    auth: authReducer,
    routes: routeReducer,
    bookings: bookingReducer
  },
});
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Define a function to validate and transform route data
const validateRouteData = (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Expected routes data to be an array');
  }

  return data.map(route => {
    if (!route || typeof route !== 'object') {
      return null;
    }

    // Ensure all required fields exist and are the correct type
    return {
      id: route.id?.toString() || '',
      origin: route.origin?.toString() || '',
      destination: route.destination?.toString() || '',
      departure_time: route.departure_time || '',
      arrival_time: route.arrival_time || '',
      price: parseFloat(route.price) || 0,
      available_seats: parseInt(route.available_seats) || 0,
      // Add any other fields your routes have
      ...route
    };
  }).filter(Boolean);
};

export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/buses/routes/');
      try {
        return validateRouteData(response.data);
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
        'An error occurred while fetching routes'
      );
    }
  }
);

// New thunk for fetching a single route
export const fetchRouteById = createAsyncThunk(
  'routes/fetchRouteById',
  async (routeId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/buses/routes/${routeId}/`);
      return response.data;
    } catch (err) {
      if (!err.response) {
        return rejectWithValue('Network error: Could not connect to server');
      }
      return rejectWithValue(
        err.response.data?.detail || 
        err.response.data?.message || 
        'An error occurred while fetching route details'
      );
    }
  }
);

const routeSlice = createSlice({
  name: 'routes',
  initialState: {
    list: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    lastFetched: null,
    selectedRoute: null,
    selectedRouteStatus: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    selectedRouteError: null
  },
  reducers: {
    clearRoutes: (state) => {
      state.list = [];
      state.status = 'idle';
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setSelectedRoute: (state, action) => {
      state.selectedRoute = action.payload;
    },
    clearSelectedRoute: (state) => {
      state.selectedRoute = null;
      state.selectedRouteStatus = 'idle';
      state.selectedRouteError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchRoutes cases
      .addCase(fetchRoutes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload;
        state.lastFetched = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : 'Failed to fetch routes';
        state.list = [];
      })
      // Handle fetchRouteById cases
      .addCase(fetchRouteById.pending, (state) => {
        state.selectedRouteStatus = 'loading';
        state.selectedRouteError = null;
      })
      .addCase(fetchRouteById.fulfilled, (state, action) => {
        state.selectedRouteStatus = 'succeeded';
        state.selectedRoute = action.payload;
        state.selectedRouteError = null;
      })
      .addCase(fetchRouteById.rejected, (state, action) => {
        state.selectedRouteStatus = 'failed';
        state.selectedRouteError = typeof action.payload === 'string'
          ? action.payload
          : 'Failed to fetch route details';
      });
  }
});

export const { 
  clearRoutes, 
  clearError, 
  setSelectedRoute, 
  clearSelectedRoute 
} = routeSlice.actions;

// Selectors
export const selectAllRoutes = (state) => state.routes.list;
export const selectRouteById = (state, routeId) => 
  state.routes.list.find(route => route.id.toString() === routeId.toString());
export const selectRoutesStatus = (state) => state.routes.status;
export const selectRoutesError = (state) => state.routes.error;
export const selectSelectedRoute = (state) => state.routes.selectedRoute;
export const selectSelectedRouteStatus = (state) => state.routes.selectedRouteStatus;
export const selectSelectedRouteError = (state) => state.routes.selectedRouteError;

export default routeSlice.reducer;
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const processPayment = createAsyncThunk(
  'payment/process',
  async ({ paymentMethodId, amount }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payments/initiate/', {
        payment_method_id: paymentMethodId,
        amount: amount * 100 // Convert to cents
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    status: 'idle',
    error: null,
    transactionId: null
  },
  reducers: {
    resetPayment: (state) => {
      state.status = 'idle';
      state.error = null;
      state.transactionId = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.transactionId = action.payload.transactionId;
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || 'Payment processing failed';
      });
  }
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
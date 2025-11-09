import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const createSubscription = createAsyncThunk('subscription/create', async (plan) => {
  const response = await axios.post('/api/payment/create-subscription', { plan });
  return response.data;
});

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState: {
    plan: null,
    status: 'inactive',
    loading: false,
    error: null
  },
  reducers: {
    clearSubscription: (state) => {
      state.plan = null;
      state.status = 'inactive';
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.plan = action.payload;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  }
});

export const { clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

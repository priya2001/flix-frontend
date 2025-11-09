import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchContent = createAsyncThunk('content/fetchContent', async () => {
  const response = await axios.get('/api/content');
  return response.data;
});

const contentSlice = createSlice({
  name: 'content',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    clearContent: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  }
});

export const { clearContent } = contentSlice.actions;
export default contentSlice.reducer;

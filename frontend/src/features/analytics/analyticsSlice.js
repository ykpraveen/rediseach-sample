import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './analyticsApi';

export const loadGenreCounts  = createAsyncThunk('analytics/genres',   async () => (await api.fetchGenreCounts()).data);
export const loadAvgRatings   = createAsyncThunk('analytics/ratings',  async () => (await api.fetchAvgRatings()).data);
export const loadDecadeCounts = createAsyncThunk('analytics/decades',  async () => (await api.fetchDecadeCounts()).data);
export const loadTopRated     = createAsyncThunk('analytics/topRated', async () => (await api.fetchTopRated()).data);

function isAnalytics(action) {
  return action.type.startsWith('analytics/');
}

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState: {
    genreCounts: [],
    avgRatings: [],
    decadeCounts: [],
    topRated: [],
    loading: false,
    pendingCount: 0,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadGenreCounts.fulfilled, (state, action) => {
        state.genreCounts = action.payload;
      })
      .addCase(loadAvgRatings.fulfilled, (state, action) => {
        state.avgRatings = action.payload;
      })
      .addCase(loadDecadeCounts.fulfilled, (state, action) => {
        state.decadeCounts = action.payload;
      })
      .addCase(loadTopRated.fulfilled, (state, action) => {
        state.topRated = action.payload;
      })
      .addMatcher(
        (action) => isAnalytics(action) && action.type.endsWith('/pending'),
        (state) => { state.pendingCount++; state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => isAnalytics(action) && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')),
        (state) => {
          state.pendingCount = Math.max(0, state.pendingCount - 1);
          if (state.pendingCount === 0) state.loading = false;
        }
      )
      .addMatcher(
        (action) => isAnalytics(action) && action.type.endsWith('/rejected'),
        (state, action) => { state.error = action.error.message; }
      );
  },
});

export default analyticsSlice.reducer;

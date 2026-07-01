import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './timeseriesApi';

export const loadMovieViews  = createAsyncThunk('timeseries/movieViews', async ({ id, params }) => (await api.fetchMovieViews(id, params)).data);
export const loadSearchVolume = createAsyncThunk('timeseries/searchVolume', async (params) => (await api.fetchSearchVolume(params)).data);
export const loadActivity     = createAsyncThunk('timeseries/activity', async (params) => (await api.fetchActivity(params)).data);

function isTimeseries(action) {
  return action.type.startsWith('timeseries/');
}

const timeseriesSlice = createSlice({
  name: 'timeseries',
  initialState: {
    movieViews: [],
    searchVolume: [],
    activity: [],
    loading: false,
    pendingCount: 0,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadMovieViews.fulfilled, (state, action) => {
        state.movieViews = action.payload;
      })
      .addCase(loadSearchVolume.fulfilled, (state, action) => {
        state.searchVolume = action.payload;
      })
      .addCase(loadActivity.fulfilled, (state, action) => {
        state.activity = action.payload;
      })
      .addMatcher(
        (action) => isTimeseries(action) && action.type.endsWith('/pending'),
        (state) => { state.pendingCount++; state.loading = true; state.error = null; }
      )
      .addMatcher(
        (action) => isTimeseries(action) && (action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected')),
        (state) => {
          state.pendingCount = Math.max(0, state.pendingCount - 1);
          if (state.pendingCount === 0) state.loading = false;
        }
      )
      .addMatcher(
        (action) => isTimeseries(action) && action.type.endsWith('/rejected'),
        (state, action) => { state.error = action.error.message; }
      );
  },
});

export default timeseriesSlice.reducer;

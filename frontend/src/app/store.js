import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from '../features/movies/moviesSlice';
import filtersReducer from '../features/filters/filtersSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import timeseriesReducer from '../features/timeseries/timeseriesSlice';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    filters: filtersReducer,
    analytics: analyticsReducer,
    timeseries: timeseriesReducer,
  },
});

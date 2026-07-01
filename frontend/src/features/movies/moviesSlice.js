import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from './moviesApi';

export const searchMovies = createAsyncThunk('movies/search', async (params) => {
  const res = await api.fetchMovies(params);
  return res.data;
});

export const searchMoviesMore = createAsyncThunk('movies/searchMore', async (params) => {
  const res = await api.fetchMovies(params);
  return res.data;
});

export const loadMovie = createAsyncThunk('movies/load', async (id) => {
  const res = await api.fetchMovie(id);
  return res.data;
});

export const addMovie = createAsyncThunk('movies/add', async (data) => {
  const res = await api.createMovie(data);
  return res.data;
});

export const editMovie = createAsyncThunk('movies/edit', async ({ id, data }) => {
  const res = await api.updateMovie(id, data);
  return res.data;
});

export const removeMovie = createAsyncThunk('movies/remove', async (id) => {
  await api.deleteMovie(id);
  return id;
});

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    list: [],
    total: 0,
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
    clearError(state)   { state.error = null; },
  },
  extraReducers: (builder) => {
    const pending  = (state)        => { state.loading = true;  state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.error.message; };

    builder
      .addCase(searchMovies.pending,  (state) => { state.loading = true; state.error = null; })
      .addCase(searchMovies.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload.movies;
        state.total   = action.payload.total;
      })
      .addCase(searchMoviesMore.pending,  (state) => { state.loading = true; })
      .addCase(searchMoviesMore.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(searchMoviesMore.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = [...state.list, ...action.payload.movies];
        state.total   = action.payload.total;
      })
      .addCase(loadMovie.pending,  pending)
      .addCase(loadMovie.rejected, rejected)
      .addCase(loadMovie.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(addMovie.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
        state.total += 1;
      })
      .addCase(editMovie.fulfilled, (state, action) => {
        const idx = state.list.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        state.current = action.payload;
      })
      .addCase(removeMovie.fulfilled, (state, action) => {
        state.list  = state.list.filter((m) => m.id !== action.payload);
        state.total = Math.max(0, state.total - 1);
        state.current = null;
      });
  },
});

export const { clearCurrent, clearError } = moviesSlice.actions;
export default moviesSlice.reducer;

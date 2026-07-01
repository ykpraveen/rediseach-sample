import { createSlice } from '@reduxjs/toolkit';

const filtersSlice = createSlice({
  name: 'filters',
  initialState: {
    q: '',
    genre: '',
    tag: '',
    language: '',
    yearFrom: '',
    yearTo: '',
    minRating: '',
    maxRating: '',
    sortBy: 'rating',
    sortOrder: 'DESC',
    offset: 0,
    limit: 20,
  },
  reducers: {
    setFilter(state, action) {
      const isPagination = 'offset' in action.payload || 'limit' in action.payload;
      Object.assign(state, action.payload);
      if (!isPagination) {
        state.offset = 0;
      }
    },
    resetFilters(state) {
      Object.assign(state, {
        q: '', genre: '', tag: '', language: '',
        yearFrom: '', yearTo: '', minRating: '', maxRating: '',
        sortBy: 'rating', sortOrder: 'DESC',
        offset: 0, limit: 20,
      });
    },
  },
});

export const { setFilter, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;

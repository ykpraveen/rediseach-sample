import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

export const fetchMovieViews  = (id, params) => api.get(`/movies/${id}/views`, { params });
export const fetchSearchVolume = (params) => api.get('/timeseries/searches', { params });
export const fetchActivity     = (params) => api.get('/timeseries/activity', { params });

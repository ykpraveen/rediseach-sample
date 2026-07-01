import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

export const fetchGenreCounts   = () => api.get('/analytics/genres');
export const fetchAvgRatings    = () => api.get('/analytics/ratings');
export const fetchDecadeCounts  = () => api.get('/analytics/decades');
export const fetchTopRated      = () => api.get('/analytics/top-rated');

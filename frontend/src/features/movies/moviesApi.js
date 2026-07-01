import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
});

function cleanParams(params) {
  const cleaned = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== '' && v != null) cleaned[k] = v;
  }
  return cleaned;
}

export const fetchMovies = (params) => api.get('/movies/search', { params: cleanParams(params) });
export const fetchMovie  = (id)     => api.get(`/movies/${id}`);
export const createMovie = (data)   => api.post('/movies', data);
export const updateMovie = (id, data) => api.put(`/movies/${id}`, data);
export const deleteMovie = (id)     => api.delete(`/movies/${id}`);

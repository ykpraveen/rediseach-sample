import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import SearchPage from '@/pages/SearchPage';
import AddMoviePage from '@/pages/AddMoviePage';
import MovieDetailPage from '@/pages/MovieDetailPage';
import EditMoviePage from '@/pages/EditMoviePage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import TimeseriesPage from '@/pages/TimeseriesPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/"                element={<SearchPage />} />
            <Route path="/movies/new"      element={<AddMoviePage />} />
            <Route path="/movies/:id"      element={<MovieDetailPage />} />
            <Route path="/movies/:id/edit" element={<EditMoviePage />} />
            <Route path="/analytics"       element={<AnalyticsPage />} />
            <Route path="/timeseries"     element={<TimeseriesPage />} />
            <Route path="*"               element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

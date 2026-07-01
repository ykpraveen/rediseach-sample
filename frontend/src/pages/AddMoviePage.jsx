import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addMovie } from '@/features/movies/moviesSlice';
import MovieForm from '@/components/MovieForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AddMoviePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector((s) => s.movies.loading);

  async function handleSubmit(data) {
    const result = await dispatch(addMovie(data));
    if (result.payload?.id) {
      navigate(`/movies/${result.payload.id}`);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/"><ArrowLeft className="size-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Add Movie</h1>
      </div>
      <MovieForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}

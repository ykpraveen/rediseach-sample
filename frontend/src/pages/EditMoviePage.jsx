import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadMovie, editMovie, clearCurrent } from '@/features/movies/moviesSlice';
import MovieForm from '@/components/MovieForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditMoviePage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: movie, loading } = useSelector((s) => s.movies);

  useEffect(() => {
    dispatch(loadMovie(id));
    return () => dispatch(clearCurrent());
  }, [id, dispatch]);

  async function handleSubmit(data) {
    const result = await dispatch(editMovie({ id, data }));
    if (result.payload?.id) {
      navigate(`/movies/${result.payload.id}`);
    }
  }

  const defaultValues = movie
    ? {
        ...movie,
        genres: Array.isArray(movie.genres) ? movie.genres.join(', ') : movie.genres || '',
        cast:   Array.isArray(movie.cast)   ? movie.cast.join(', ')   : movie.cast   || '',
        tags:   Array.isArray(movie.tags)   ? movie.tags.join(', ')   : movie.tags   || '',
      }
    : undefined;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/movies/${id}`}><ArrowLeft className="size-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold">Edit Movie</h1>
      </div>

      {loading && !movie ? (
        <div className="flex justify-center py-10">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <MovieForm defaultValues={defaultValues} onSubmit={handleSubmit} loading={loading} />
      )}
    </div>
  );
}

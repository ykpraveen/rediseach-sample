import { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadMovie, removeMovie, clearCurrent } from '@/features/movies/moviesSlice';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Star, Clock, Globe, Users, ArrowLeft, Pencil, Trash2, Loader2, Film } from 'lucide-react';
import useImage from '@/lib/useImage';

export default function MovieDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: movie, loading, error } = useSelector((s) => s.movies);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const posterStatus = useImage(movie?.poster);

  useEffect(() => {
    dispatch(loadMovie(id));
    return () => dispatch(clearCurrent());
  }, [id, dispatch]);

  async function confirmDelete() {
    await dispatch(removeMovie(id));
    navigate('/');
  }

  if (loading) return (
    <div className="flex justify-center py-20 animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Loading...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="text-center py-20 text-destructive animate-in fade-in duration-300">
      <p className="text-lg font-medium">Something went wrong</p>
      <p className="text-sm mt-1 text-muted-foreground">{error}</p>
    </div>
  );

  if (!movie) return null;

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" asChild className="shrink-0 -ml-1">
          <Link to="/"><ArrowLeft className="size-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1 min-w-0 truncate">{movie.title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="transition-all duration-200">
            <Link to={`/movies/${id}/edit`}><Pencil className="size-3.5 mr-1" />Edit</Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)} className="transition-all duration-200">
            <Trash2 className="size-3.5 mr-1" />Delete
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-[220px,1fr] gap-8">
        {/* Poster */}
        <div className="aspect-[2/3] bg-muted rounded-xl overflow-hidden shadow-md">
          {posterStatus === 'loaded' ? (
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="size-12 text-muted-foreground/40" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {movie.genres?.map((g) => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
            {movie.tags?.map((t) => (
              <Badge key={t} variant="outline">{t}</Badge>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <strong>{movie.rating?.toFixed(1)}</strong>
              <span className="text-muted-foreground">/ 10 ({movie.votes?.toLocaleString()} votes)</span>
            </span>
            {movie.runtime && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Clock className="size-4" />{movie.runtime} min
              </span>
            )}
            {movie.language && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Globe className="size-4" />{movie.language}
              </span>
            )}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <div><span className="font-medium">Year:</span> {movie.year}</div>
            <div><span className="font-medium">Director:</span> {movie.director}</div>
            {movie.cast?.length > 0 && (
              <div className="flex items-start gap-1">
                <span className="font-medium flex items-center gap-1"><Users className="size-3.5" />Cast:</span>
                <span className="text-muted-foreground">{movie.cast.join(', ')}</span>
              </div>
            )}
          </div>

          {movie.plot && (
            <>
              <Separator />
              <p className="text-sm text-muted-foreground leading-relaxed">{movie.plot}</p>
            </>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete "{movie.title}"?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

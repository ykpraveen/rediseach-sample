import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { searchMovies, searchMoviesMore } from '@/features/movies/moviesSlice';
import FilterPanel from '@/components/FilterPanel';
import MovieCard from '@/components/MovieCard';
import { Loader2 } from 'lucide-react';

const LIMIT = 20;

export default function SearchPage() {
  const dispatch = useDispatch();
  const { list, total, loading, error } = useSelector((s) => s.movies);
  const {
    q, genre, tag, language,
    yearFrom, yearTo, minRating, maxRating,
    sortBy, sortOrder,
  } = useSelector((s) => s.filters);
  const sentinelRef = useRef(null);
  const offsetRef = useRef(0);

  const fetchParams = { q, genre, tag, language, yearFrom, yearTo, minRating, maxRating, sortBy, sortOrder, limit: LIMIT };

  useEffect(() => {
    offsetRef.current = 0;
    dispatch(searchMovies({ ...fetchParams, offset: 0 }));
  }, [q, genre, tag, language, yearFrom, yearTo, minRating, maxRating, sortBy, sortOrder, dispatch]);

  const loadMore = useCallback(() => {
    if (loading || list.length >= total) return;
    offsetRef.current += LIMIT;
    dispatch(searchMoviesMore({ ...fetchParams, offset: offsetRef.current }));
  }, [loading, list.length, total, fetchParams, dispatch]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadMore();
    }, { rootMargin: '400px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <FilterPanel />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground animate-in fade-in duration-500">
        <span className="font-medium">{total} movie{total !== 1 ? 's' : ''} found</span>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm animate-in fade-in duration-300">
          Error: {error}
        </div>
      )}

      {!loading && list.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground animate-in fade-in duration-300">
          <p className="text-5xl mb-4 opacity-50">🎬</p>
          <p className="text-lg font-medium">No movies found</p>
          <p className="text-sm mt-1">Try a different search or clear your filters</p>
        </div>
      ) : list.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {list.map((movie, i) => (
              <div key={movie.id} className="animate-in fade-in duration-300" style={{ animationDelay: `${(i % 15) * 30}ms` }}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>
          {list.length < total && (
            <div ref={sentinelRef} className="flex justify-center py-8 text-muted-foreground">
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  <span className="text-sm">Loading more...</span>
                </div>
              ) : (
                <span className="text-sm">Scroll for more</span>
              )}
            </div>
          )}
        </>
      ) : loading ? (
        <div className="flex justify-center py-20 animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="size-8 animate-spin" />
            <p className="text-sm">Searching...</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

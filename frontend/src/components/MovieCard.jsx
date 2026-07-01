import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Film } from 'lucide-react';
import { Link } from 'react-router-dom';
import useImage from '@/lib/useImage';

export default function MovieCard({ movie }) {
  const posterStatus = useImage(movie.poster);

  return (
    <Link to={`/movies/${movie.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5 cursor-pointer border-border/50 group-hover:border-primary/30">
        <div className="aspect-[2/3] bg-muted overflow-hidden flex items-center justify-center relative">
          {posterStatus === 'loaded' ? (
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            />
          ) : (
            <Film className="size-12 text-muted-foreground/40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <CardContent className="p-3 space-y-1.5">
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">{movie.title}</h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{movie.year}</span>
            <span className="flex items-center gap-1">
              <Star className="size-3 fill-yellow-400 text-yellow-400" />
              <span className="font-medium text-foreground/80">{movie.rating?.toFixed(1)}</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {movie.genres?.slice(0, 2).map((g) => (
              <Badge key={g} variant="secondary" className="text-xs px-1.5 py-0 font-normal">{g}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

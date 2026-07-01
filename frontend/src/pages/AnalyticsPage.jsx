import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadGenreCounts, loadAvgRatings, loadDecadeCounts, loadTopRated } from '@/features/analytics/analyticsSlice';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Loader2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from '@/components/ui/carousel';

const radar = ['hsl(217 91% 60%)', 'hsl(142 76% 36%)', 'hsl(271 91% 65%)', 'hsl(48 96% 53%)'];

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { genreCounts, avgRatings, decadeCounts, topRated, loading, error } = useSelector((s) => s.analytics);

  useEffect(() => {
    dispatch(loadGenreCounts());
    dispatch(loadAvgRatings());
    dispatch(loadDecadeCounts());
    dispatch(loadTopRated());
  }, [dispatch]);

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
        Error: {error}
      </div>
    );
  }

  const genreData = genreCounts.map((g) => ({ name: g.genres, count: Number(g.count) }));
  const ratingData = avgRatings.map((g) => ({ name: g.genres, rating: Number(Number(g.avg_rating)?.toFixed(1)) || 0 }));
  const decadeData = decadeCounts.map((d) => ({ name: `${d.decade}s`, count: Number(d.count) }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Carousel className="mx-10">
          <CarouselContent>
            <CarouselItem>
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Movie Count by Genre</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={genreData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--foreground)' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: 13,
                          color: 'var(--card-foreground)',
                        }}
                      />
                      <Bar dataKey="count" fill={radar[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem>
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Average Rating by Genre</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={ratingData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} axisLine={{ stroke: 'var(--border)', strokeWidth: 1 }} tickLine={false} tick={{ fontSize: 12, fill: 'var(--foreground)' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: 13,
                          color: 'var(--card-foreground)',
                        }}
                        formatter={(value) => [Number(value)?.toFixed(1) || '0.0', 'Rating']}
                      />
                      <Bar dataKey="rating" fill={radar[3]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem>
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Movies by Decade</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={decadeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--foreground)' }} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: 13,
                          color: 'var(--card-foreground)',
                        }}
                      />
                      <Bar dataKey="count" fill={radar[0]} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem>
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Top 10 Highest Rated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topRated.map((movie, i) => (
                      <div key={movie.id} className="flex items-center gap-3">
                        <span className="text-sm font-mono text-muted-foreground w-5 shrink-0">
                          {i + 1}.
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{movie.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {movie.director} · {movie.year}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">{movie.rating?.toFixed(1)}</span>
                        </div>
                        <div className="flex gap-1">
                          {movie.genres?.slice(0, 2).map((g) => (
                            <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
          <CarouselDots />
        </Carousel>
      )}
    </div>
  );
}

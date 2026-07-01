import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadMovieViews, loadSearchVolume, loadActivity } from '@/features/timeseries/timeseriesSlice';
import { fetchMovies } from '@/features/movies/moviesApi';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from '@/components/ui/carousel';

const RANGES = [
  { label: '24h', from: 86_400_000, bucket: 3_600_000, format: 'hour' },
  { label: '7d',  from: 604_800_000, bucket: 86_400_000, format: 'date' },
  { label: '30d', from: 2_592_000_000, bucket: 86_400_000, format: 'date' },
];

function fmtTime(ts, rangeType) {
  const d = new Date(ts);
  if (rangeType === 'hour') {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function TimeseriesPage() {
  const dispatch = useDispatch();
  const { movieViews, searchVolume, activity, loading, error } = useSelector((s) => s.timeseries);
  const [movies, setMovies] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [rangeIdx, setRangeIdx] = useState(2);

  const range = RANGES[rangeIdx];

  // Fetch movie list once
  useEffect(() => {
    fetchMovies({ q: '', limit: 100 }).then((res) => {
      setMovies(res.data.movies || []);
      if (res.data.movies?.length > 0) {
        setSelectedId(res.data.movies[0].id);
      }
    });
  }, []);

  const loadAll = useCallback(() => {
    const from = Date.now() - range.from;
    const params = { from, bucket: range.bucket };
    dispatch(loadSearchVolume(params));
    dispatch(loadActivity(params));
    if (selectedId) {
      dispatch(loadMovieViews({ id: selectedId, params }));
    }
  }, [range.from, range.bucket, selectedId, dispatch]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const viewsData = movieViews.map(({ timestamp, value }) => ({
    time: fmtTime(timestamp, range.format),
    views: value,
  }));

  const searchData = searchVolume.map(({ timestamp, value }) => ({
    time: fmtTime(timestamp, range.format),
    searches: value,
  }));

  const activityData = activity.map(({ timestamp, value }) => ({
    time: fmtTime(timestamp, range.format),
    requests: value,
  }));

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 text-destructive px-4 py-3 text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Time Series</h1>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          {RANGES.map((r, i) => (
            <Button
              key={r.label}
              variant={i === rangeIdx ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setRangeIdx(i)}
              className="px-3"
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {loading && movies.length === 0 ? (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <Carousel className="mx-10">
          <CarouselContent>
            <CarouselItem>
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Movie View Trend</CardTitle>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">Movie</Label>
                      <Select value={selectedId} onValueChange={setSelectedId}>
                        <SelectTrigger className="h-8 text-sm w-[180px]" aria-label="Select movie">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {movies.map((m) => (
                            <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={viewsData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--foreground)' }} width={50} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: 13,
                          color: 'var(--card-foreground)',
                        }}
                      />
                      <Area type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={2} fill="url(#viewsGradient)" dot={{ r: 3, fill: 'var(--primary)' }} connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem>
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>Search Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={searchData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="searchGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(142 76% 36%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(142 76% 36%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--foreground)' }} width={50} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: 13,
                          color: 'var(--card-foreground)',
                        }}
                      />
                      <Area type="monotone" dataKey="searches" stroke="hsl(142 76% 36%)" strokeWidth={2} fill="url(#searchGradient)" dot={{ r: 3, fill: 'hsl(142 76% 36%)' }} connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </CarouselItem>

            <CarouselItem>
              <Card className="max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle>API Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <AreaChart data={activityData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(271 91% 65%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(271 91% 65%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.4} />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--foreground)' }} width={50} />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          fontSize: 13,
                          color: 'var(--card-foreground)',
                        }}
                      />
                      <Area type="monotone" dataKey="requests" stroke="hsl(271 91% 65%)" strokeWidth={2} fill="url(#activityGradient)" dot={{ r: 3, fill: 'hsl(271 91% 65%)' }} connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
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

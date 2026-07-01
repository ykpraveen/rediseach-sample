import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, resetFilters } from '@/features/filters/filtersSlice';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

const GENRES = ['Action','Adventure','Animation','Biography','Comedy','Crime','Drama',
  'Fantasy','History','Horror','Romance','Sci-Fi','Thriller'];
const LANGUAGES = ['English','Korean','French','Spanish','Japanese','Italian','German'];
const TAGS = ['dark','inspiring','feel-good','mind-bending','epic','classic','cult',
  'emotional','twist','adventure','friendship','love'];

export default function FilterPanel() {
  const dispatch = useDispatch();
  const filters  = useSelector((s) => s.filters);
  const [localQ, setLocalQ] = useState(filters.q);

  useEffect(() => {
    setLocalQ(filters.q);
  }, [filters.q]);

  const debounceRef = useRef(null);

  function handleSearch(e) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    dispatch(setFilter({ q: localQ }));
  }

  function handleFilter(key, value) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      dispatch(setFilter({ [key]: value === 'all' ? '' : value }));
    }, 300);
  }

  function handleReset() {
    setLocalQ('');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    dispatch(resetFilters());
  }

  return (
    <form onSubmit={handleSearch} className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Search title, plot, director, cast…"
            className="pl-9 transition-shadow duration-200 focus-visible:ring-2 focus-visible:ring-primary/20"
            aria-label="Search movies"
          />
        </div>
        <Button type="submit" className="shadow-xs">Search</Button>
        {(localQ || filters.genre || filters.tag || filters.language || filters.yearFrom || filters.minRating) && (
          <Button type="button" variant="ghost" size="icon" onClick={handleReset} aria-label="Clear filters"
            className="text-muted-foreground hover:text-destructive transition-colors">
            <X className="size-4" />
          </Button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3">
        <FilterSelect label="Genre" value={filters.genre || 'all'} items={GENRES}
          onChange={(v) => handleFilter('genre', v)} />
        <FilterSelect label="Language" value={filters.language || 'all'} items={LANGUAGES}
          onChange={(v) => handleFilter('language', v)} />
        <FilterSelect label="Tag" value={filters.tag || 'all'} items={TAGS}
          onChange={(v) => handleFilter('tag', v)} />

        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Year from</Label>
          <Input type="number" min="1900" max="2030" placeholder="1990"
            value={filters.yearFrom}
            onChange={(e) => handleFilter('yearFrom', e.target.value)}
            className="w-24 h-8 text-sm" aria-label="Year from" />
          <span className="text-muted-foreground text-xs">–</span>
          <Input type="number" min="1900" max="2030" placeholder="2024"
            value={filters.yearTo}
            onChange={(e) => handleFilter('yearTo', e.target.value)}
            className="w-24 h-8 text-sm" aria-label="Year to" />
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Min rating</Label>
          <Input type="number" min="0" max="10" step="0.1" placeholder="7.0"
            value={filters.minRating}
            onChange={(e) => handleFilter('minRating', e.target.value)}
            className="w-20 h-8 text-sm" aria-label="Minimum rating" />
        </div>

        <FilterSelect label="Sort by" value={filters.sortBy}
          items={['rating','year','votes']}
          onChange={(v) => handleFilter('sortBy', v)} noAll />
        <FilterSelect label="Order" value={filters.sortOrder}
          items={['DESC','ASC']}
          onChange={(v) => handleFilter('sortOrder', v)} noAll />
      </div>
    </form>
  );
}

function FilterSelect({ label, value, items, onChange, noAll = false }) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-xs whitespace-nowrap">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-8 text-sm w-[130px]" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {!noAll && <SelectItem value="all">All</SelectItem>}
          {items.map((item) => (
            <SelectItem key={item} value={item}>{item}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const FIELDS = [
  { name: 'title',    label: 'Title *',    required: true },
  { name: 'director', label: 'Director *', required: true },
  { name: 'year',     label: 'Year *',     required: true, type: 'number' },
  { name: 'rating',   label: 'Rating (0–10)', type: 'number', step: '0.1' },
  { name: 'votes',    label: 'Votes',      type: 'number' },
  { name: 'runtime',  label: 'Runtime (min)', type: 'number' },
  { name: 'language', label: 'Language',   placeholder: 'English' },
  { name: 'poster',   label: 'Poster URL', placeholder: 'https://...' },
];

export default function MovieForm({ defaultValues, onSubmit, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: defaultValues || {},
  });

  useEffect(() => { reset(defaultValues || {}); }, [defaultValues, reset]);

  function processAndSubmit(data) {
    onSubmit({
      ...data,
      year:    data.year    ? Number(data.year)    : undefined,
      rating:  data.rating  ? Number(data.rating)  : undefined,
      votes:   data.votes   ? Number(data.votes)   : undefined,
      runtime: data.runtime ? Number(data.runtime) : undefined,
      genres:  data.genres  ? data.genres.split(',').map((s) => s.trim()).filter(Boolean)  : [],
      cast:    data.cast    ? data.cast.split(',').map((s) => s.trim()).filter(Boolean)    : [],
      tags:    data.tags    ? data.tags.split(',').map((s) => s.trim()).filter(Boolean)    : [],
    });
  }

  return (
    <form onSubmit={handleSubmit(processAndSubmit)} className="space-y-4">
      {FIELDS.map(({ name, label, required, type = 'text', ...rest }) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name}>{label}</Label>
          <Input
            id={name}
            type={type}
            {...rest}
            {...register(name, { required: required ? `${label.replace(' *', '')} is required` : false })}
          />
          {errors[name] && (
            <p className="text-destructive text-xs">{errors[name].message}</p>
          )}
        </div>
      ))}

      <Separator />

      <div className="space-y-1.5">
        <Label htmlFor="plot">Plot</Label>
        <Textarea id="plot" rows={3} placeholder="Short plot summary…" {...register('plot')} />
      </div>

      {[
        { name: 'genres', label: 'Genres', placeholder: 'Drama, Crime, Thriller' },
        { name: 'cast',   label: 'Cast',   placeholder: 'Tom Hanks, Robin Wright' },
        { name: 'tags',   label: 'Tags',   placeholder: 'dark, inspiring, feel-good' },
      ].map(({ name, label, placeholder }) => (
        <div key={name} className="space-y-1.5">
          <Label htmlFor={name}>{label} <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
          <Input id={name} placeholder={placeholder} {...register(name)} />
        </div>
      ))}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Saving…' : 'Save Movie'}
      </Button>
    </form>
  );
}

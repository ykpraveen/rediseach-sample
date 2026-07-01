import { z } from 'zod';

export const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  director: z.string().min(1, 'Director is required'),
  year: z.coerce.number().int().min(1888).max(2030),
  rating: z.coerce.number().min(0).max(10).optional(),
  votes: z.coerce.number().int().min(0).optional(),
  runtime: z.coerce.number().int().min(1).optional(),
  language: z.string().optional().default('English'),
  poster: z.string().url('Invalid poster URL').or(z.literal('')).optional(),
  plot: z.string().optional(),
  genres: z.array(z.string()).optional().default([]),
  cast: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
});

export const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  genre: z.string().optional(),
  tag: z.string().optional(),
  language: z.string().optional(),
  yearFrom: z.coerce.number().int().min(1888).optional(),
  yearTo: z.coerce.number().int().max(2030).optional(),
  minRating: z.coerce.number().min(0).max(10).optional(),
  maxRating: z.coerce.number().min(0).max(10).optional(),
  sortBy: z.enum(['rating', 'year', 'votes']).optional().default('rating'),
  sortOrder: z.enum(['ASC', 'DESC']).optional().default('DESC'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const err = new Error('Validation failed');
      err.status = 400;
      err.errors = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(err);
    }
    req.validated = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const err = new Error('Invalid query parameters');
      err.status = 400;
      err.errors = result.error.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      }));
      return next(err);
    }
    req.validatedQuery = result.data;
    next();
  };
}

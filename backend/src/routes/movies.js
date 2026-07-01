import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import client from '../redis.js';
import { movieSchema, searchQuerySchema, validate, validateQuery } from '../middleware/validate.js';

const router = Router();

// GET /movies/search  — must be before /:id to avoid route conflict
router.get('/search', validateQuery(searchQuerySchema), async (req, res, next) => {
  try {
    const {
      q, genre, tag, language,
      yearFrom, yearTo, minRating, maxRating,
      sortBy, sortOrder, limit, offset,
    } = req.validatedQuery;

    let query = q ? q.trim() : '*';

    const filters = [];
    if (genre)    filters.push(`@genres:{${escapeTag(genre)}}`);
    if (tag)      filters.push(`@tags:{${escapeTag(tag)}}`);
    if (language) filters.push(`@language:{${escapeTag(language)}}`);

    if (yearFrom != null || yearTo != null) {
      filters.push(`@year:[${yearFrom ?? '-inf'} ${yearTo ?? '+inf'}]`);
    }
    if (minRating != null || maxRating != null) {
      filters.push(`@rating:[${minRating ?? '-inf'} ${maxRating ?? '+inf'}]`);
    }

    if (filters.length > 0) {
      query = query === '*'
        ? filters.join(' ')
        : `(${query}) ${filters.join(' ')}`;
    }

    const results = await client.ft.search('idx:movies', query, {
      LIMIT: { from: offset, size: limit },
      SORTBY: { BY: sortBy, DIRECTION: sortOrder },
      RETURN: ['$'],
    });

    const movies = results.documents
      .map((doc) => doc.value)
      .filter(Boolean);
    client.ts.add('ts:searches', '*', 1).catch(() => {});
    res.json({ total: results.total, movies });
  } catch (err) {
    next(err);
  }
});

// POST /movies/:id/view — record a view event
router.post('/:id/view', async (req, res, next) => {
  try {
    await client.ts.add(`ts:movie:views:${req.params.id}`, '*', 1);
    res.status(201).json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

// GET /movies/:id/views — view trend for a movie
router.get('/:id/views', async (req, res, next) => {
  try {
    const key = `ts:movie:views:${req.params.id}`;
    const from = req.query.from || '-';
    const to = req.query.to || '+';
    const bucket = Number(req.query.bucket) || 3600000;
    const data = await client.ts.range(key, from, to, {
      AGGREGATION: { type: 'SUM', timeBucket: bucket },
    });
    res.json(data);
  } catch (err) {
    if (err.message?.includes('key does not exist') || err.message?.includes('ERR TSDB')) {
      return res.json([]);
    }
    next(err);
  }
});

// GET /movies/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await client.json.get(`movie:${req.params.id}`);
    if (!data) return res.status(404).json({ error: 'Movie not found' });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// POST /movies
router.post('/', validate(movieSchema), async (req, res, next) => {
  try {
    const id = `tt${uuidv4().replace(/-/g, '').substring(0, 7)}`;
    const movie = { id, ...req.validated };
    await client.json.set(`movie:${id}`, '$', movie);
    res.status(201).json(movie);
  } catch (err) {
    next(err);
  }
});

// PUT /movies/:id
router.put('/:id', validate(movieSchema), async (req, res, next) => {
  try {
    const key = `movie:${req.params.id}`;
    const exists = await client.exists(key);
    if (!exists) return res.status(404).json({ error: 'Movie not found' });
    const movie = { id: req.params.id, ...req.validated };
    await client.json.set(key, '$', movie);
    res.json(movie);
  } catch (err) {
    next(err);
  }
});

// DELETE /movies/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await client.del(`movie:${req.params.id}`);
    if (!deleted) return res.status(404).json({ error: 'Movie not found' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

function escapeTag(value) {
  return value.replace(/[,.<>{}\[\]"':;!@#$%^&*()\-+=~|\\/?]/g, '\\$&');
}

export default router;

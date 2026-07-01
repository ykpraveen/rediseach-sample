import { Router } from 'express';
import client from '../redis.js';

const router = Router();

// GET /analytics/genres — movie count by genre
router.get('/genres', async (_req, res, next) => {
  try {
    const raw = await client.ft.aggregate('idx:movies', '*', {
      STEPS: [
        { type: 'GROUPBY', properties: ['@genres'], REDUCE: { type: 'COUNT', AS: 'count' } },
        { type: 'SORTBY', BY: '@genres' },
      ],
    });
    res.json(raw.results);
  } catch (err) {
    next(err);
  }
});

// GET /analytics/ratings — average rating per genre
router.get('/ratings', async (_req, res, next) => {
  try {
    const raw = await client.ft.aggregate('idx:movies', '*', {
      STEPS: [
        {
          type: 'GROUPBY', properties: ['@genres'],
          REDUCE: [
            { type: 'COUNT', AS: 'count' },
            { type: 'AVG', property: '@rating', AS: 'avg_rating' },
          ],
        },
        { type: 'SORTBY', BY: '@genres' },
      ],
    });
    res.json(raw.results);
  } catch (err) {
    next(err);
  }
});

// GET /analytics/decades — movies grouped by decade
router.get('/decades', async (_req, res, next) => {
  try {
    const raw = await client.ft.aggregate('idx:movies', '*', {
      LOAD: [{ identifier: '@year', AS: 'year' }],
      STEPS: [
        { type: 'APPLY', expression: 'floor(@year / 10) * 10', AS: 'decade' },
        { type: 'GROUPBY', properties: ['@decade'], REDUCE: { type: 'COUNT', AS: 'count' } },
        { type: 'SORTBY', BY: '@decade' },
      ],
    });
    res.json(raw.results);
  } catch (err) {
    next(err);
  }
});

// GET /analytics/top-rated — top 10 highest rated movies
router.get('/top-rated', async (_req, res, next) => {
  try {
    const { documents } = await client.ft.search('idx:movies', '*', {
      SORTBY: { BY: 'rating', DIRECTION: 'DESC' },
      LIMIT: { from: 0, size: 10 },
      RETURN: ['$'],
    });
    const movies = documents.map((doc) => doc.value).filter(Boolean);
    res.json(movies);
  } catch (err) {
    next(err);
  }
});

export default router;

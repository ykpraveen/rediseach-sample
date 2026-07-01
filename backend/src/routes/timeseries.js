import { Router } from 'express';
import client from '../redis.js';

const router = Router();

async function range(key, from, to, bucket) {
  try {
    return await client.ts.range(key, from || '-', to || '+', {
      AGGREGATION: { type: 'SUM', timeBucket: Number(bucket) || 3600000 },
    });
  } catch (err) {
    if (err.message?.includes('key does not exist') || err.message?.includes('ERR TSDB')) {
      return [];
    }
    throw err;
  }
}

router.get('/searches', async (req, res, next) => {
  try {
    const data = await range('ts:searches', req.query.from, req.query.to, req.query.bucket);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/activity', async (req, res, next) => {
  try {
    const data = await range('ts:activity', req.query.from, req.query.to, req.query.bucket);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import client, { connectRedis } from './redis.js';
import moviesRouter from './routes/movies.js';
import analyticsRouter from './routes/analytics.js';
import timeseriesRouter from './routes/timeseries.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.json());
app.use(morgan('dev'));

app.use(rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

app.use((req, _res, next) => {
  if (req.path !== '/health') {
    client.ts.add('ts:activity', '*', 1).catch(() => {});
  }
  next();
});

app.use('/movies', moviesRouter);
app.use('/analytics', analyticsRouter);
app.use('/timeseries', timeseriesRouter);

app.get('/health', async (_req, res, next) => {
  try {
    await client.ping();
    res.json({ status: 'ok', redis: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', redis: 'disconnected' });
  }
});

app.use(errorHandler);

async function start() {
  await connectRedis();
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

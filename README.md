# Redisearch Movie Catalog

A full-stack movie catalog with search, analytics, and time-series data, powered by [Redis 8](https://redis.io/open-source/) (Search, JSON, TimeSeries).

Published article: [Redis 8 in Practice: Building a Full-Stack Movie Library with Search, JSON, Time Series, and Real API Workloads
](https://dev.to/ykpraveen/redis-8-in-practice-building-a-full-stack-movie-library-with-search-json-time-series-and-real-3ano)

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Database**: Redis Stack 8 (RedisJSON, RediSearch, RedisTimeSeries)
- **Data Source**: TMDB API

## Prerequisites

- Docker + Docker Compose
- Node.js 18+
- TMDB API Read Access Token (free via https://www.themoviedb.org/settings/api)

## Setup

### 1. Clone & configure

```bash
cp backend/.env.example backend/.env
# Edit backend/.env and set TMDB_API_TOKEN
```

### 2. Start Redis + backend

```bash
docker compose up -d
```

Redis runs on `localhost:6379` (no auth). The backend starts on `localhost:3000` and seeds 500 movies from TMDB on first launch (skips if already seeded).

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend opens at `http://localhost:5173`.

## Pages

| Route | Description |
|---|---|
| `/` | Search movies with filters |
| `/movie/:id` | Movie detail page |
| `/analytics` | Charts: genres, ratings, decades, top rated |
| `/timeseries` | Time series charts: views, search volume, API activity |
| `/movie/new` | Add a new movie |
| `/movie/:id/edit` | Edit a movie |

## Features

- Full-text search with RediSearch (title, plot, cast, director)
- Faceted filters by genre, year, rating, language
- Paginated results via infinite scroll
- Movie detail with poster, cast, ratings, metadata
- CRUD operations (add / edit / delete movies)
- Analytics with genre distribution, average ratings, decade counts
- Time-series views tracking per movie
- Search volume and API request monitoring
- Light / dark / system theme toggle

## Redis Modules Used

- **RedisJSON** (`JSON.SET`, `JSON.GET`) — store and query movie documents
- **RediSearch** (`FT.CREATE`, `FT.SEARCH`, `FT.AGGREGATE`) — full-text search and analytics queries
- **RedisTimeSeries** (`TS.CREATE`, `TS.MADD`, `TS.RANGE`) — views, search volume, API activity tracking

## Notes

- `TS.MADD` does not auto-create time-series keys; `TS.CREATE` must be called first
- `FT.SEARCH` with `RETURN: ['$']` returns parsed JSON directly at `doc.value` (not as string under `doc.value['$']`)
- `FT.AGGREGATE` returns results as objects with string values (not arrays of key-value pairs)
- The frontend Vite dev server may experience OOM crashes on resource-constrained systems; start with `node --max-old-space-size=512 node_modules/vite/bin/vite.js`
- CSS color tokens use `oklch()` values — use `var(--x)` directly, never `hsl(var(--x))`
- All JSX files must use `.jsx` extension (Vite/rolldown requirement)
- TMDB SSL cert chain may fail inside Docker Alpine; `NODE_TLS_REJECT_UNAUTHORIZED=0` works around it for development

import 'dotenv/config';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import client, { connectRedis } from './redis.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const curated = JSON.parse(readFileSync(join(__dirname, 'data/movies.json'), 'utf-8'));
const TMDB_TOKEN = process.env.TMDB_TOKEN;
const TMDB_BASE = 'https://api.themoviedb.org/3';

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[rand(0, arr.length - 1)];
}

const GENRE_TAG_MAP = {
  Action: ['action-packed', 'thrilling', 'explosive'],
  Adventure: ['epic', 'adventure', 'journey'],
  Animation: ['colorful', 'whimsical', 'imaginative'],
  Comedy: ['funny', 'quirky', 'feel-good'],
  Crime: ['dark', 'suspense', 'gritty'],
  Documentary: ['educational', 'eye-opening', 'informative'],
  Drama: ['emotional', 'thought-provoking', 'moving'],
  Family: ['heartfelt', 'feel-good', 'wholesome'],
  Fantasy: ['magical', 'epic', 'enchanting'],
  History: ['historical', 'epic', 'educational'],
  Horror: ['scary', 'dark', 'suspense'],
  Music: ['musical', 'inspiring', 'energetic'],
  Mystery: ['suspense', 'mind-bending', 'twist'],
  Romance: ['romantic', 'emotional', 'love'],
  'Science Fiction': ['mind-bending', 'futuristic', 'sci-fi'],
  Thriller: ['suspense', 'intense', 'twist'],
  War: ['war', 'gritty', 'intense'],
  Western: ['western', 'gritty', 'classic'],
};

const LANG_MAP = {
  en: 'English', es: 'Spanish', fr: 'French', de: 'German',
  ja: 'Japanese', ko: 'Korean', zh: 'Mandarin', it: 'Italian',
  pt: 'Portuguese', hi: 'Hindi', ru: 'Russian', sv: 'Swedish',
  da: 'Danish', no: 'Norwegian', fi: 'Finnish', nl: 'Dutch',
  pl: 'Polish', tr: 'Turkish', ar: 'Arabic', th: 'Thai',
  cs: 'Czech', el: 'Greek', he: 'Hebrew', ro: 'Romanian',
  hu: 'Hungarian', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam',
  bn: 'Bengali', mr: 'Marathi',
};

function tagsFromGenres(genres) {
  const tags = [];
  const used = new Set();
  for (const g of genres) {
    const pool = GENRE_TAG_MAP[g] || [];
    for (const t of pool) {
      if (!used.has(t) && tags.length < 4) {
        tags.push(t);
        used.add(t);
      }
    }
  }
  while (tags.length < 2) tags.push(pick(['classic', 'underrated', 'must-watch', 'critically-acclaimed']));
  return tags;
}

function tmdbMovieToOurSchema(movie, credits) {
  const genres = (movie.genres || []).map((g) => g.name);
  const director = (credits?.crew || []).find((c) => c.job === 'Director');
  const cast = (credits?.cast || []).slice(0, 4).map((c) => c.name);

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;

  return {
    id: `tmdb-${movie.id}`,
    title: movie.title,
    plot: movie.overview || 'No overview available.',
    genres,
    year: year || 2000,
    rating: movie.vote_average || 0,
    votes: movie.vote_count || 0,
    director: director?.name || 'Unknown',
    cast: cast.length ? cast : ['Unknown'],
    runtime: movie.runtime || 0,
    language: LANG_MAP[movie.original_language] || movie.original_language || 'English',
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : `https://placehold.co/300x450?text=${encodeURIComponent(movie.title)}`,
    tags: tagsFromGenres(genres),
  };
}

async function fetchTmdb(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
  });
  if (!res.ok) {
    console.error(`  TMDB API error: ${res.status} for ${url}`);
    return null;
  }
  return res.json();
}

async function fetchMovieBatch(page) {
  const data = await fetchTmdb(`${TMDB_BASE}/movie/popular?page=${page}&language=en-US`);
  return data?.results || [];
}

async function fetchMovieWithCredits(tmdbId) {
  const data = await fetchTmdb(`${TMDB_BASE}/movie/${tmdbId}?language=en-US&append_to_response=credits`);
  return data;
}

let apiCallsThisWindow = 0;
let apiWindowStart = Date.now();
const API_WINDOW_MS = 10000;
const API_MAX_CALLS = 38;

async function rateLimitedFetch(url) {
  const now = Date.now();
  if (now - apiWindowStart > API_WINDOW_MS) {
    apiCallsThisWindow = 0;
    apiWindowStart = now;
  }
  apiCallsThisWindow++;
  if (apiCallsThisWindow > API_MAX_CALLS) {
    await new Promise((r) => setTimeout(r, API_WINDOW_MS - (now - apiWindowStart) + 200));
    apiCallsThisWindow = 0;
    apiWindowStart = Date.now();
  }
  return fetchTmdb(url);
}

async function fetchMovieWithCreditsRl(tmdbId) {
  const data = await rateLimitedFetch(`${TMDB_BASE}/movie/${tmdbId}?language=en-US&append_to_response=credits`);
  return data;
}

const FALLBACK_TITLES = [
  { t: 'The Dark Horizon', y: 1972 }, { t: 'Midnight Run', y: 1988 },
  { t: 'Iron Eagle', y: 1986 }, { t: 'Blood Diamond', y: 2006 },
  { t: 'The Last Samurai', y: 2003 }, { t: 'Eastern Promises', y: 2007 },
  { t: 'Children of Men', y: 2006 }, { t: 'City of God', y: 2002 },
  { t: 'The Prestige', y: 2006 }, { t: 'The Departed', y: 2006 },
  { t: 'No Country for Old Men', y: 2007 }, { t: 'There Will Be Blood', y: 2007 },
  { t: 'The Lives of Others', y: 2006 }, { t: 'The Pianist', y: 2002 },
  { t: 'Million Dollar Baby', y: 2004 }, { t: 'Memento', y: 2000 },
  { t: 'Requiem for a Dream', y: 2000 }, { t: 'Donnie Darko', y: 2001 },
  { t: 'The Royal Tenenbaums', y: 2001 }, { t: 'A Beautiful Mind', y: 2001 },
  { t: 'Black Hawk Down', y: 2001 }, { t: 'Training Day', y: 2001 },
  { t: 'The Bourne Identity', y: 2002 }, { t: 'Catch Me If You Can', y: 2002 },
  { t: 'Gangs of New York', y: 2002 }, { t: 'Oldboy', y: 2003 },
  { t: 'Memories of Murder', y: 2003 }, { t: 'Seven Samurai', y: 1954 },
  { t: 'Rashomon', y: 1950 }, { t: 'Yojimbo', y: 1961 },
  { t: 'The Seventh Seal', y: 1957 }, { t: 'Persona', y: 1966 },
  { t: 'Bicycle Thieves', y: 1948 }, { t: 'La Dolce Vita', y: 1960 },
  { t: 'The 400 Blows', y: 1959 }, { t: 'Breathless', y: 1960 },
  { t: 'Vertigo', y: 1958 }, { t: 'Rear Window', y: 1954 },
  { t: 'Psycho', y: 1960 }, { t: 'Lawrence of Arabia', y: 1962 },
  { t: 'Dr Strangelove', y: 1964 }, { t: 'A Clockwork Orange', y: 1971 },
  { t: 'Apocalypse Now', y: 1979 }, { t: 'Taxi Driver', y: 1976 },
  { t: 'Raging Bull', y: 1980 }, { t: 'Alien', y: 1979 },
  { t: 'Blade Runner', y: 1982 }, { t: 'Die Hard', y: 1988 },
  { t: 'Terminator 2', y: 1991 }, { t: 'Seven', y: 1995 },
  { t: 'Heat', y: 1995 }, { t: 'The Big Lebowski', y: 1998 },
  { t: 'Saving Private Ryan', y: 1998 }, { t: 'The Green Mile', y: 1999 },
  { t: 'American Beauty', y: 1999 }, { t: 'Gladiator', y: 2000 },
  { t: 'Snatch', y: 2000 }, { t: 'Spirited Away', y: 2001 },
  { t: 'The Incredibles', y: 2004 }, { t: 'Eternal Sunshine', y: 2004 },
  { t: 'Hotel Rwanda', y: 2004 }, { t: 'Batman Begins', y: 2005 },
  { t: 'V for Vendetta', y: 2005 }, { t: 'Into the Wild', y: 2007 },
  { t: 'Zodiac', y: 2007 }, { t: 'Inglourious Basterds', y: 2009 },
  { t: 'District 9', y: 2009 }, { t: 'Slumdog Millionaire', y: 2008 },
  { t: 'Up', y: 2009 }, { t: 'Singin\' in the Rain', y: 1952 },
];

const GENRES = ['Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'History', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller', 'War', 'Western'];
const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Mandarin', 'Italian', 'Portuguese', 'Hindi'];
const NAMES = [
  'Morgan Freeman', 'Tom Hanks', 'Robert De Niro', 'Al Pacino', 'Leonardo DiCaprio',
  'Brad Pitt', 'Christian Bale', 'Matt Damon', 'Jake Gyllenhaal', 'Cate Blanchett',
  'Meryl Streep', 'Natalie Portman', 'Kate Winslet', 'Viola Davis', 'Joaquin Phoenix',
  'Denzel Washington', 'Samuel L. Jackson', 'Scarlett Johansson', 'Amy Adams', 'Ryan Gosling',
];
const DIRECTORS = [
  'Steven Spielberg', 'Christopher Nolan', 'Martin Scorsese', 'Quentin Tarantino', 'David Fincher',
  'Denis Villeneuve', 'Ridley Scott', 'James Cameron', 'Peter Jackson', 'Coen Brothers',
  'Wes Anderson', 'Paul Thomas Anderson', 'Spike Lee', 'Guillermo del Toro', 'Akira Kurosawa',
];

function generateFallbackMovie(index, seed) {
  const genreCount = rand(1, 3);
  const genres = [];
  const available = [...GENRES];
  for (let i = 0; i < genreCount; i++) {
    const g = pick(available);
    genres.push(g);
    available.splice(available.indexOf(g), 1);
  }
  const castCount = rand(2, 4);
  const cast = [];
  for (let i = 0; i < castCount; i++) cast.push(pick(NAMES));

  return {
    id: `fil-${String(index).padStart(4, '0')}`,
    title: seed.t,
    plot: pick([
      'A story of courage and survival against overwhelming odds.',
      'An unlikely hero emerges when their community needs them most.',
      'A journey of self-discovery that changes everything.',
      'A gripping tale of betrayal and redemption.',
      'The pursuit of justice leads down a dangerous and unexpected path.',
    ]),
    genres,
    year: seed.y,
    rating: +(Math.random() * 2.5 + 6.5).toFixed(1),
    votes: rand(50000, 2000000),
    director: pick(DIRECTORS),
    cast,
    runtime: rand(85, 200),
    language: pick(LANGUAGES),
    poster: `https://placehold.co/300x450?text=${encodeURIComponent(seed.t)}`,
    tags: tagsFromGenres(genres),
  };
}

const TARGET = 500;

async function seed() {
  await connectRedis();

  const existing = await client.keys('movie:*');
  if (existing.length >= TARGET) {
    console.log(`Found ${existing.length} movies — seed already done, skipping.`);
    await client.quit();
    return;
  }

  let movies = [...curated];
  const seenTitles = new Set(movies.map((m) => m.title.toLowerCase()));

  if (TMDB_TOKEN) {
    try {
      console.log('Fetching movies from TMDB...\n');

      const first = await fetchMovieBatch(1);
      const totalPages = first.length ? Math.min(first.length > 0 ? 25 : 5, 25) : 0;
      let tmdbMovies = [...first];

      for (let page = 2; page <= totalPages; page++) {
        const batch = await fetchMovieBatch(page);
        if (!batch.length) break;
        console.log(`  Page ${page}: ${batch.length} movies`);
        tmdbMovies = tmdbMovies.concat(batch);
      }

      console.log(`\nFetching details for ${tmdbMovies.length} movies...\n`);
      let fetched = 0;
      for (const tmdb of tmdbMovies) {
        if (seenTitles.has(tmdb.title.toLowerCase()) || movies.length >= TARGET) continue;
        if (!tmdb.release_date || !tmdb.poster_path) continue;

        const detail = await fetchMovieWithCreditsRl(tmdb.id);
        if (!detail) continue;

        const movie = tmdbMovieToOurSchema(detail, detail.credits);
        if (!movie.title || !movie.plot || movie.plot === 'No overview available.') continue;

        movies.push(movie);
        seenTitles.add(movie.title.toLowerCase());
        fetched++;
        process.stdout.write(fetched % 20 === 0 ? `  [${fetched}]\n` : '.');
      }
      console.log(`\nFetched ${fetched} movies from TMDB.`);
    } catch (err) {
      console.warn(`  TMDB request failed: ${err.message}. Using fallback data.`);
    }
  } else {
    console.log('No TMDB_TOKEN set, using fallback data.\n');
  }

  for (let i = 0; i < FALLBACK_TITLES.length && movies.length < TARGET; i++) {
    const titleLower = FALLBACK_TITLES[i].t.toLowerCase();
    if (!seenTitles.has(titleLower)) {
      movies.push(generateFallbackMovie(movies.length + 1, FALLBACK_TITLES[i]));
    }
  }

  console.log('Cleaning old data...');
  const oldMovieKeys = await client.keys('movie:*');
  if (oldMovieKeys.length) await client.del(oldMovieKeys);
  const oldTsKeys = await client.keys('ts:movie:views:*');
  if (oldTsKeys.length) await client.del(oldTsKeys);

  console.log(`\nSeeding ${movies.length} movies into Redis...\n`);

  for (const movie of movies) {
    await client.json.set(`movie:${movie.id}`, '$', movie);
  }
  console.log(`\u2713 Done \u2014 seeded ${movies.length} movies`);

  console.log('\nSeeding time series data...\n');
  const now = Date.now();
  const day = 86_400_000;
  const viewEntries = [];
  const searchEntries = [];
  const activityEntries = [];

  for (let i = 29; i >= 0; i--) {
    const ts = now - i * day;
    searchEntries.push({ key: 'ts:searches', timestamp: ts, value: rand(0, 20) });
    activityEntries.push({ key: 'ts:activity', timestamp: ts, value: rand(5, 50) });
    for (const movie of movies) {
      if (Math.random() > 0.3) {
        viewEntries.push({ key: `ts:movie:views:${movie.id}`, timestamp: ts, value: rand(1, 10) });
      }
    }
  }

  if (searchEntries.length) {
    await client.ts.mAdd(searchEntries);
    console.log(`  \u2713 ${searchEntries.length} search data points`);
  }
  if (activityEntries.length) {
    await client.ts.mAdd(activityEntries);
    console.log(`  \u2713 ${activityEntries.length} activity data points`);
  }
  if (viewEntries.length) {
    const movieIds = [...new Set(viewEntries.map((e) => e.key))];
    for (const key of movieIds) {
      try { await client.ts.create(key); } catch (_) { /* already exists */ }
    }
    for (let i = 0; i < viewEntries.length; i += 500) {
      await client.ts.mAdd(viewEntries.slice(i, i + 500));
    }
    console.log(`  \u2713 ${viewEntries.length} view data points across ${movieIds.length} movies`);
  }

  console.log('\n\u2713 Time series seeding complete');
  await client.quit();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

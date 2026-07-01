import { createClient, SchemaFieldTypes } from 'redis';

const client = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

client.on('error', (err) => console.error('Redis error:', err));

export async function connectRedis(retries = 15, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await client.connect();
      await createSearchIndex();
      console.log('✅ Redis connected');
      return;
    } catch (err) {
      if (i < retries - 1) {
        console.log(`⏳ Waiting for Redis (attempt ${i + 1}/${retries})...`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

async function createSearchIndex() {
  try {
    await client.ft.create(
      'idx:movies',
      {
        '$.title':     { type: SchemaFieldTypes.TEXT,    AS: 'title',    WEIGHT: 2 },
        '$.plot':      { type: SchemaFieldTypes.TEXT,    AS: 'plot' },
        '$.director':  { type: SchemaFieldTypes.TEXT,    AS: 'director' },
        '$.cast[*]':   { type: SchemaFieldTypes.TEXT,    AS: 'cast' },
        '$.genres[*]': { type: SchemaFieldTypes.TAG,     AS: 'genres' },
        '$.tags[*]':   { type: SchemaFieldTypes.TAG,     AS: 'tags' },
        '$.language':  { type: SchemaFieldTypes.TAG,     AS: 'language' },
        '$.year':      { type: SchemaFieldTypes.NUMERIC, AS: 'year',   SORTABLE: true },
        '$.rating':    { type: SchemaFieldTypes.NUMERIC, AS: 'rating', SORTABLE: true },
        '$.votes':     { type: SchemaFieldTypes.NUMERIC, AS: 'votes',  SORTABLE: true },
      },
      { ON: 'JSON', PREFIX: 'movie:' }
    );
    console.log('✅ Search index created');
  } catch (err) {
    if (err.message.includes('Index already exists')) {
      console.log('ℹ️  Search index already exists');
    } else {
      throw err;
    }
  }
}

export default client;

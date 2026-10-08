import { drizzle } from 'drizzle-orm/netlify-db';
import { getDatabase } from '@netlify/database';
import * as schema from './schema';
export function database() {
  const client = getDatabase();
  return { db: drizzle({ client, schema }), close: () => client.pool.end() };
}

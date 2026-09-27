import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import path from 'path';

import fs from 'fs';

// Safely locate elgammal.db regardless of whether cwd is root or /server
let dbPath = path.resolve(process.cwd(), 'elgammal.db');
if (!fs.existsSync(dbPath)) {
  const parentDb = path.resolve(process.cwd(), '../elgammal.db');
  if (fs.existsSync(parentDb)) {
    dbPath = parentDb;
  }
}
import dotenv from 'dotenv';
dotenv.config();

// If TURSO_DATABASE_URL is provided, use it. Otherwise fallback to local.
const url = process.env.TURSO_DATABASE_URL || `libsql://dummy-fallback.turso.io`;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('Connecting to database:', url.startsWith('libsql') ? '☁️ TURSO CLOUD' : '💻 LOCAL SQLITE');

let client;
try {
  client = createClient({ url, authToken });
} catch (e) {
  console.log('CRITICAL DB ERROR ON BOOT:', e.name, e.message);
  // Create a dummy client so the app doesn't crash on boot, but fails later gracefully
  client = createClient({ url: 'libsql://dummy.turso.io', authToken: 'dummy' });
}
export const db = drizzle(client, { schema: {} });

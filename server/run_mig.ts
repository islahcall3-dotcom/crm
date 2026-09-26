import fs from 'fs';
import path from 'path';
import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
});

async function runAll() {
  const files = fs.readdirSync('./src/db/migrations').filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    console.log('Running ' + f);
    const sql = fs.readFileSync(path.resolve('./src/db/migrations', f), 'utf-8');
    await client.executeMultiple(sql);
  }
  console.log('All migrations applied!');
  process.exit(0);
}

runAll().catch(console.error);

import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();
const client = createClient({url: process.env.TURSO_DATABASE_URL!, authToken: process.env.TURSO_AUTH_TOKEN!});
client.execute("SELECT name FROM sqlite_master WHERE type='table';").then(res => { console.log(res.rows); process.exit(0); });

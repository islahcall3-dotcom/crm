import { db } from './src/db/db';
import { sql } from 'drizzle-orm';

async function clear() {
  await db.run(sql`DELETE FROM visits`);
  await db.run(sql`DELETE FROM installments`);
  await db.run(sql`DELETE FROM expenses`);
  await db.run(sql`DELETE FROM customers`);
  console.log('Cleared successfully!');
  process.exit(0);
}

clear();

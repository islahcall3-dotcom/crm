import { db } from './src/db/db.js';
import { sql } from 'drizzle-orm';

async function dropCol() {
  try {
    await db.run(sql`ALTER TABLE users DROP COLUMN plain_password`);
    console.log('Column dropped');
  } catch (e) {
    console.log('Error dropping column:', e.message);
  }
  process.exit(0);
}
dropCol();

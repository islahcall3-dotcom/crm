import { db } from './src/db/db.js';
import { sql } from 'drizzle-orm';

async function addCol() {
  try {
    await db.run(sql`ALTER TABLE users ADD COLUMN plain_password TEXT`);
    console.log('Column added');
  } catch (e) {
    console.log('Error or already exists:', e.message);
  }
  process.exit(0);
}
addCol();

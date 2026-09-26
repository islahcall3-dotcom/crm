import { db } from './src/db/db';
import { sql } from 'drizzle-orm';

async function clearAll() {
  await db.run(sql`DELETE FROM visits`);
  await db.run(sql`DELETE FROM installments`);
  await db.run(sql`DELETE FROM expenses`);
  await db.run(sql`DELETE FROM customers`);
  await db.run(sql`DELETE FROM inventory_transactions`);
  await db.run(sql`DELETE FROM inventory_items`);
  // Not deleting governorates, filter_types, or users.
  console.log('Cleared everything successfully!');
  process.exit(0);
}

clearAll();

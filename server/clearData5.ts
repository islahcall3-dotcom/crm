import { db } from './src/db/db';
import { sql } from 'drizzle-orm';

async function clearAll() {
  try { await db.run(sql`DELETE FROM visits`); } catch(e){}
  try { await db.run(sql`DELETE FROM installments`); } catch(e){}
  try { await db.run(sql`DELETE FROM expenses`); } catch(e){}
  try { await db.run(sql`DELETE FROM customers`); } catch(e){}
  try { await db.run(sql`DELETE FROM inventory`); } catch(e){}
  try { await db.run(sql`DELETE FROM audit_logs`); } catch(e){}
  console.log('Cleared everything successfully!');
  process.exit(0);
}

clearAll();

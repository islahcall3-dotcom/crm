import { createClient } from '@libsql/client';
import path from 'path';

async function run() {
  const client = createClient({ url: `file:${path.resolve(process.cwd(), '../elgammal.db')}` });
  await client.execute(`
    CREATE TABLE IF NOT EXISTS expenses (
      id text PRIMARY KEY NOT NULL,
      amount real NOT NULL,
      category text NOT NULL,
      description text NOT NULL,
      expense_date text NOT NULL,
      created_at integer NOT NULL
    );
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS installments (
      id text PRIMARY KEY NOT NULL,
      customer_id text NOT NULL,
      amount real NOT NULL,
      due_date text NOT NULL,
      is_paid integer DEFAULT false NOT NULL,
      paid_date text,
      notes text,
      created_at integer NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON UPDATE no action ON DELETE cascade
    );
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS inventory (
      id text PRIMARY KEY NOT NULL,
      item_name text NOT NULL,
      quantity integer DEFAULT 0 NOT NULL,
      unit_price real DEFAULT 0 NOT NULL
    );
  `);
  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS inventory_item_name_unique ON inventory (item_name);
  `);
  console.log('Tables created!');
}
run();

import { db } from './db.js';
import { inventory } from './schema.js';
import { createClient } from '@libsql/client';
import path from 'path';
import crypto from 'crypto';

async function initInventoryTable() {
  const dbPath = path.resolve(process.cwd(), 'elgammal.db');
  console.log('Connecting to db at:', dbPath);
  const client = createClient({ url: `file:${dbPath}` });

  // 1. Create table if not exists
  await client.execute(`
    CREATE TABLE IF NOT EXISTS inventory (
      id TEXT PRIMARY KEY NOT NULL,
      item_name TEXT NOT NULL UNIQUE,
      quantity INTEGER DEFAULT 0 NOT NULL,
      unit_price REAL DEFAULT 0 NOT NULL
    );
  `);
  console.log('Table inventory verified/created.');

  // 2. Check existing items
  const res = await client.execute('SELECT COUNT(*) as cnt FROM inventory;');
  const count = Number(res.rows[0]?.cnt || 0);
  
  if (count > 0) {
    console.log(`Inventory already has ${count} items.`);
    return;
  }

  const items = [
    { itemName: 'شمعة مرحلة 1 (بولي بروبلين 5 ميكرون)', quantity: 120, unitPrice: 45 },
    { itemName: 'شمعة مرحلة 2 (كربون نشط حبيبي GAC)', quantity: 95, unitPrice: 65 },
    { itemName: 'شمعة مرحلة 3 (كربون صلب كتلوي CTO)', quantity: 85, unitPrice: 65 },
    { itemName: 'شمعة مرحلة 4 (ممبرين تحلية 75 جالون)', quantity: 35, unitPrice: 350 },
    { itemName: 'شمعة مرحلة 5 (بوست كربون نشط)', quantity: 50, unitPrice: 85 },
    { itemName: 'شمعة مرحلة 6 (كالسيت / كالسيوم)', quantity: 40, unitPrice: 95 },
    { itemName: 'شمعة مرحلة 7 (إنفراريد الأشعة تحت الحمراء)', quantity: 30, unitPrice: 110 },
    { itemName: 'طقم شمع اقتصادي (1 + 2 + 3)', quantity: 60, unitPrice: 160 },
    { itemName: 'طقم شمع كامل (7 مراحل)', quantity: 25, unitPrice: 750 },
    { itemName: 'موتور / مضخة فلتر تايواني كوانتك', quantity: 12, unitPrice: 850 },
    { itemName: 'خزان فلتر فايبر جلاس 12 لتر', quantity: 8, unitPrice: 650 },
    { itemName: 'صنبور / حنفية فلتر استانلس تركي', quantity: 20, unitPrice: 220 },
    { itemName: 'هاوسنج شمع شفاف أصلي مرحلة 1', quantity: 15, unitPrice: 180 },
    { itemName: 'محبس تغذية مياه نحاس 1/2 إلى 1/4', quantity: 35, unitPrice: 75 },
    { itemName: 'محول كهرباء (ترانس أصلي 24V)', quantity: 14, unitPrice: 280 }
  ];

  for (const item of items) {
    await client.execute({
      sql: 'INSERT INTO inventory (id, item_name, quantity, unit_price) VALUES (?, ?, ?, ?)',
      args: [crypto.randomUUID(), item.itemName, item.quantity, item.unitPrice]
    });
  }

  console.log(`Seeded ${items.length} inventory items successfully!`);
}

initInventoryTable().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });

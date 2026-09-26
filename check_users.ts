import { db } from './server/src/db/db.js';
import { users } from './server/src/db/schema.js';

async function check() {
  const u = await db.select().from(users);
  console.log(u);
  process.exit(0);
}
check();

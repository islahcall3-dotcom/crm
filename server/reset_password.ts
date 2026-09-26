import { db } from './src/db/db.js';
import { users } from './src/db/schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function reset() {
  const hash = await bcrypt.hash('123456', 10);
  await db.update(users).set({ passwordHash: hash }).where(eq(users.username, 'admin'));
  console.log('Password for admin reset to 123456');
  process.exit(0);
}
reset();

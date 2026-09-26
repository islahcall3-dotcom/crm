import { db } from './server/src/db/db.js';
import { users } from './server/src/db/schema.js';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function updatePassword() {
  const hash = await bcrypt.hash('Admin@2026!', 10);
  await db.update(users).set({ passwordHash: hash }).where(eq(users.username, 'admin'));
  console.log('Password updated to Admin@2026!');
  process.exit(0);
}
updatePassword();

import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';
import path from 'path';

async function run() {
  const hash = await bcrypt.hash('Admin@2026!', 10);
  const client = createClient({ url: `file:${path.resolve(process.cwd(), '../elgammal.db')}` });
  await client.execute({ sql: "UPDATE users SET password_hash = ? WHERE username = 'admin'", args: [hash] });
  console.log('Done!');
}
run();

import { createClient } from '@libsql/client';
import path from 'path';

async function run() {
  const client = createClient({ url: `file:${path.resolve(process.cwd(), '../elgammal.db')}` });
  const govs = await client.execute('SELECT count(*) as count FROM governorates');
  console.log('Governorates:', govs.rows[0].count);
}
run();

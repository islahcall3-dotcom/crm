import { db } from './src/db/db.js';
import { users } from './src/db/schema.js';

async function main() {
  const allUsers = await db.select().from(users);
  console.log(allUsers);
}
main();

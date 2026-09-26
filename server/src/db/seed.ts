import { db } from './db.js';
import { governorates, cities, filterTypes, maintenanceIntervals, users } from './schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

function uuidv4() {
  return crypto.randomUUID();
}

async function runSeeds() {
  console.log('Running seeds...');

  const intervals = [3, 4, 6];
  for (const months of intervals) {
    const existing = await db.select().from(maintenanceIntervals).where(eq(maintenanceIntervals.months, months));
    if (existing.length === 0) {
      await db.insert(maintenanceIntervals).values({ id: uuidv4(), months });
    }
  }

  const filters = ['فلتر 7 مراحل', 'فلتر 5 مراحل', 'فلتر 3 مراحل'];
  for (const name of filters) {
    const existing = await db.select().from(filterTypes).where(eq(filterTypes.name, name));
    if (existing.length === 0) {
      await db.insert(filterTypes).values({ id: uuidv4(), name });
    }
  }

  const geoData = [
    { gov: 'القاهرة', cities: ['مدينة نصر', 'المعادي', 'مصر الجديدة'] },
    { gov: 'الجيزة', cities: ['المهندسين', 'الدقي', '6 أكتوبر'] },
    { gov: 'الإسكندرية', cities: ['سموحة', 'ميامي', 'سيدي بشر'] }
  ];

  for (const item of geoData) {
    let govResult = await db.select().from(governorates).where(eq(governorates.name, item.gov));
    let gov = govResult[0];
    if (!gov) {
      const govId = uuidv4();
      await db.insert(governorates).values({ id: govId, name: item.gov });
      gov = { id: govId, name: item.gov, isActive: true } as any;
    }

    for (const cityName of item.cities) {
      const cityExists = await db.select().from(cities).where(eq(cities.name, cityName));
      if (cityExists.length === 0) {
        await db.insert(cities).values({ id: uuidv4(), governorateId: gov.id, name: cityName });
      }
    }
  }

  // 4. Admin User
  const bcrypt = await import('bcryptjs');
  const existingAdmin = await db.select().from(users).where(eq(users.username, 'admin'));
  if (existingAdmin.length === 0) {
    const passwordHash = await bcrypt.default.hash('123456', 10);
    await db.insert(users).values({
      id: uuidv4(),
      username: 'admin',
      passwordHash,
      role: 'ADMIN',
      createdAt: new Date(),
    });
    console.log('Created default admin user (admin / 123456)');
  }

  console.log('Seeds complete!');
}

runSeeds().then(() => {
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

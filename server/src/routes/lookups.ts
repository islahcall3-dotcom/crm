import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { governorates, cities, filterTypes, maintenanceIntervals } from '../db/schema.js';
import { verifyAuth } from '../utils/auth.js';

export default async function lookupRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  fastify.get('/', async (request, reply) => {
    let govs = await db.select().from(governorates);
    let cits = await db.select().from(cities);
    const filters = await db.select().from(filterTypes);
    const intervals = await db.select().from(maintenanceIntervals);

    // Sort Governorates: الغربية first, then الدقهلية, then others
    govs = govs.sort((a, b) => {
      if (a.name === 'الغربية') return -1;
      if (b.name === 'الغربية') return 1;
      if (a.name === 'الدقهلية') return -1;
      if (b.name === 'الدقهلية') return 1;
      return a.name.localeCompare(b.name, 'ar');
    });

    // Sort Cities: سمنود first, then المنصورة, then others
    cits = cits.sort((a, b) => {
      if (a.name === 'سمنود') return -1;
      if (b.name === 'سمنود') return 1;
      if (a.name === 'المنصورة') return -1;
      if (b.name === 'المنصورة') return 1;
      return a.name.localeCompare(b.name, 'ar');
    });

    return {
      governorates: govs,
      cities: cits,
      filterTypes: filters,
      maintenanceIntervals: intervals
    };
  });
}

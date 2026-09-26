import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { customers, maintenanceIntervals, governorates, cities, filterTypes, visits, employees } from '../db/schema.js';
import { eq, like, or, and, desc, sql } from 'drizzle-orm';
import { verifyAuth } from '../utils/auth.js';
import { hasPermission } from '../utils/rbac.js';
import z from 'zod';
import crypto from 'crypto';
import { getArabicSearchVariants } from '../utils/textUtils.js';

const customerSchema = z.object({
  name: z.string().min(2),
  phone1: z.string().min(5),
  phone2: z.string().optional().nullable(),
  landline: z.string().optional().nullable(),
  governorateId: z.string().min(1),
  cityId: z.string().min(1),
  village: z.string().optional().nullable(),
  addressDetails: z.string().optional().nullable(),
  filterTypeId: z.string().optional().nullable(),
  maintenanceIntervalId: z.string().min(1),
  lastMaintenanceDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

function uuidv4() {
  return crypto.randomUUID();
}

function calculateNextMaintenance(lastDateStr: string | null, intervalMonths: number): string | null {
  if (!lastDateStr) return null;
  const date = new Date(lastDateStr);
  if (isNaN(date.getTime())) return null;
  date.setMonth(date.getMonth() + intervalMonths);
  return date.toISOString().split('T')[0];
}

export default async function customerRoutes(fastify: FastifyInstance) {
  // Protect all routes in this plugin
  fastify.addHook('preHandler', verifyAuth);

  // Helper to check RBAC
  const requirePermission = (permission: string) => async (request: any, reply: any) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: 'ليس لديك صلاحية لإجراء هذه العملية' });
    }
  };

  // 1. Get Customers (List / Search)
  fastify.get('/', {
    preHandler: [requirePermission('customers.view')]
  }, async (request, reply) => {
    const query = (request.query as any).q || '';
    const govId = (request.query as any).govId || '';
    const cityId = (request.query as any).cityId || '';
    const filterTypeId = (request.query as any).filterTypeId || '';
    const status = (request.query as any).status || ''; // 'overdue', 'regular'
    const fromDate = (request.query as any).from || '';
    const toDate = (request.query as any).to || '';
    const dateType = (request.query as any).dateType || 'nextMaintenance';
    const isArchived = (request.query as any).isArchived === 'true';
    const page = parseInt((request.query as any).page) || 1;
    const limit = 500; // Increased significantly for client-side column customization and sorting
    const offset = (page - 1) * limit;

    let conditions: any[] = isArchived 
      ? [eq(customers.isDeleted, true)]
      : [or(eq(customers.isDeleted, false), sql`${customers.isDeleted} IS NULL`)];
    
    if (query) {
      const isNumber = !isNaN(Number(query));
      const variants = getArabicSearchVariants(query);
      const orClauses: any[] = [];
      for (const v of variants) {
        orClauses.push(like(customers.name, `%${v}%`));
        orClauses.push(like(customers.phone1, `%${v}%`));
        orClauses.push(like(customers.phone2, `%${v}%`));
        orClauses.push(like(customers.village, `%${v}%`));
        orClauses.push(like(customers.notes, `%${v}%`));
      }
      if (isNumber) {
        orClauses.push(eq(customers.customerCode, Number(query)));
      }
      conditions.push(or(...orClauses));
    }
    
    if (govId) conditions.push(eq(customers.governorateId, govId));
    if (cityId) conditions.push(eq(customers.cityId, cityId));
    if (filterTypeId) conditions.push(eq(customers.filterTypeId, filterTypeId));
    
    if (status === 'overdue') {
      conditions.push(sql`${customers.nextMaintenanceDate} < date('now', 'localtime')`);
    } else if (status === 'today') {
      conditions.push(sql`${customers.nextMaintenanceDate} = date('now', 'localtime')`);
    } else if (status === 'upcoming') {
      conditions.push(sql`${customers.nextMaintenanceDate} > date('now', 'localtime') AND ${customers.nextMaintenanceDate} <= date('now', '+7 days', 'localtime')`);
    } else if (status === 'valid') {
      conditions.push(sql`${customers.nextMaintenanceDate} > date('now', '+7 days', 'localtime')`);
    }

    if (fromDate) {
      if (dateType === 'created') {
        conditions.push(sql`date(${customers.createdAt} / 1000, 'unixepoch', 'localtime') >= ${fromDate}`);
      } else if (dateType === 'lastMaintenance') {
        conditions.push(sql`${customers.lastMaintenanceDate} >= ${fromDate}`);
      } else {
        conditions.push(sql`${customers.nextMaintenanceDate} >= ${fromDate}`);
      }
    }

    if (toDate) {
      if (dateType === 'created') {
        conditions.push(sql`date(${customers.createdAt} / 1000, 'unixepoch', 'localtime') <= ${toDate}`);
      } else if (dateType === 'lastMaintenance') {
        conditions.push(sql`${customers.lastMaintenanceDate} <= ${toDate}`);
      } else {
        conditions.push(sql`${customers.nextMaintenanceDate} <= ${toDate}`);
      }
    }

    const results = await db.select().from(customers)
      .where(and(...conditions))
      .limit(limit).offset(offset).orderBy(desc(customers.createdAt));

    const activeCountRes = await db.select({ count: sql`COUNT(*)` }).from(customers).where(eq(customers.isDeleted, false));
    const archivedCountRes = await db.select({ count: sql`COUNT(*)` }).from(customers).where(eq(customers.isDeleted, true));
      
    return { 
      data: results,
      stats: {
        active: Number(activeCountRes[0]?.count || 0),
        archived: Number(archivedCountRes[0]?.count || 0)
      }
    };
  });

  // 2. Create Customer
  fastify.post('/', {
    preHandler: [requirePermission('customers.create')]
  }, async (request, reply) => {
    try {
      const data = customerSchema.parse(request.body);
      
      // Get interval months for calculation
      const intervalRow = await db.select().from(maintenanceIntervals).where(eq(maintenanceIntervals.id, data.maintenanceIntervalId));
      if (!intervalRow[0]) throw new Error('فترة الصيانة غير صالحة');
      
      const nextDate = data.lastMaintenanceDate ? 
        calculateNextMaintenance(data.lastMaintenanceDate, intervalRow[0].months) : null;

      // Auto-increment customer code
      const maxCodeResult = await db.select({ maxCode: sql`MAX(customer_code)` }).from(customers);
      const nextCode = (maxCodeResult[0]?.maxCode as number || 0) + 1;

      const customerId = uuidv4();
      
      await db.insert(customers).values({
        id: customerId,
        customerCode: nextCode,
        name: data.name,
        phone1: data.phone1,
        phone2: data.phone2,
        landline: data.landline,
        governorateId: data.governorateId,
        cityId: data.cityId,
        village: data.village,
        addressDetails: data.addressDetails,
        filterTypeId: data.filterTypeId,
        maintenanceIntervalId: data.maintenanceIntervalId,
        lastMaintenanceDate: data.lastMaintenanceDate,
        nextMaintenanceDate: nextDate,
        notes: data.notes,
        createdAt: new Date(),
      });

      return { success: true, id: customerId, customerCode: nextCode };
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'بيانات غير صالحة' });
    }
  });

  // 3. Update Customer
  fastify.put('/:id', {
    preHandler: [requirePermission('customers.update')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    try {
      const data = customerSchema.parse(request.body);
      
      const intervalRow = await db.select().from(maintenanceIntervals).where(eq(maintenanceIntervals.id, data.maintenanceIntervalId));
      if (!intervalRow[0]) throw new Error('فترة الصيانة غير صالحة');
      
      const nextDate = data.lastMaintenanceDate ? 
        calculateNextMaintenance(data.lastMaintenanceDate, intervalRow[0].months) : null;

      await db.update(customers).set({
        name: data.name,
        phone1: data.phone1,
        phone2: data.phone2,
        landline: data.landline,
        governorateId: data.governorateId,
        cityId: data.cityId,
        village: data.village,
        addressDetails: data.addressDetails,
        filterTypeId: data.filterTypeId,
        maintenanceIntervalId: data.maintenanceIntervalId,
        lastMaintenanceDate: data.lastMaintenanceDate,
        nextMaintenanceDate: nextDate,
        notes: data.notes,
        version: sql`version + 1`
      }).where(eq(customers.id, id));

      return { success: true };
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'بيانات غير صالحة' });
    }
  });

  // 4. Get Single Customer Profile
  fastify.get('/:id', {
    preHandler: [requirePermission('customers.view')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    
    // Get Customer
    const custRes = await db.select().from(customers).where(eq(customers.id, id));
    if (!custRes[0]) return reply.status(404).send({ error: 'العميل غير موجود' });
    const customer = custRes[0];

    // Get Lookups (Gov, City, Interval, FilterType) to return nice names
    const govs = await db.select().from(governorates).where(eq(governorates.id, customer.governorateId));
    const cits = await db.select().from(cities).where(eq(cities.id, customer.cityId));
    const filters = customer.filterTypeId ? await db.select().from(filterTypes).where(eq(filterTypes.id, customer.filterTypeId)) : [];
    const intervals = await db.select().from(maintenanceIntervals).where(eq(maintenanceIntervals.id, customer.maintenanceIntervalId));

    // Get Visits History
    const visitsList = await db.select({
      id: visits.id,
      employeeId: visits.employeeId,
      visitDate: visits.visitDate,
      employeeName: employees.name,
      item1: visits.item1,
      item2: visits.item2,
      item3: visits.item3,
      itemPost: visits.itemPost,
      itemCalcium: visits.itemCalcium,
      itemInfrared: visits.itemInfrared,
      itemSalts: visits.itemSalts,
      notes: visits.notes
    })
    .from(visits)
    .leftJoin(employees, eq(visits.employeeId, employees.id))
    .where(eq(visits.customerId, id))
    .orderBy(desc(visits.visitDate));

    return {
      data: {
        ...customer,
        governorateName: govs[0]?.name || '',
        cityName: cits[0]?.name || '',
        filterTypeName: filters[0]?.name || 'غير محدد',
        maintenanceIntervalMonths: intervals[0]?.months || 0,
        visits: visitsList
      }
    };
  });

  // 5. Archive Customer (Soft Delete)
  fastify.put('/:id/archive', {
    preHandler: [requirePermission('customers.delete')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    await db.update(customers).set({ isDeleted: true }).where(eq(customers.id, id));
    return { success: true };
  });

  // 5.5 Restore Customer
  fastify.put('/:id/restore', {
    preHandler: [requirePermission('customers.delete')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    await db.update(customers).set({ isDeleted: false }).where(eq(customers.id, id));
    return { success: true };
  });

  // 6. Delete Customer (Hard Delete)
  fastify.delete('/:id', {
    preHandler: [requirePermission('customers.delete')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    await db.delete(customers).where(eq(customers.id, id));
    return { success: true };
  });
}

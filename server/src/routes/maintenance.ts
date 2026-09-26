import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { customers, maintenanceIntervals, visits, employees, inventory } from '../db/schema.js';
import { eq, and, lte, gte, isNotNull, sql, desc } from 'drizzle-orm';
import { verifyAuth } from '../utils/auth.js';
import { hasPermission } from '../utils/rbac.js';
import crypto from 'crypto';

export default async function maintenanceRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  const requirePermission = (permission: string) => async (request: any, reply: any) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: 'ليس لديك صلاحية لإجراء هذه العملية' });
    }
  };

  // 1. Get Maintenance Tasks (Type: 'today', 'overdue', 'upcoming')
  fastify.get('/', {
    preHandler: [requirePermission('visits.view')]
  }, async (request, reply) => {
    const type = (request.query as any).type || 'today';
    const today = new Date().toISOString().split('T')[0];
    
    let condition;
    if (type === 'today') {
      condition = eq(customers.nextMaintenanceDate, today);
    } else if (type === 'overdue') {
      condition = and(isNotNull(customers.nextMaintenanceDate), lte(customers.nextMaintenanceDate, today)); 
    }
    
    const allCustomers = await db.select().from(customers).where(
      and(isNotNull(customers.nextMaintenanceDate), eq(customers.isDeleted, false))
    );
    
    const in3DaysDate = new Date();
    in3DaysDate.setDate(in3DaysDate.getDate() + 3);
    const in3Days = in3DaysDate.toISOString().split('T')[0];

    const todayTasks = allCustomers.filter(c => c.nextMaintenanceDate === today);
    const overdueTasks = allCustomers.filter(c => c.nextMaintenanceDate! < today);
    const upcomingTasks = allCustomers
      .filter(c => c.nextMaintenanceDate! > today && c.nextMaintenanceDate! <= in3Days)
      .sort((a, b) => a.nextMaintenanceDate!.localeCompare(b.nextMaintenanceDate!));
    
    // Also fetch history count
    const historyRes = await db.select({ count: sql`COUNT(*)` }).from(visits);
    const historyCount = Number(historyRes[0]?.count || 0);

    const stats = { 
      today: todayTasks.length, 
      overdue: overdueTasks.length, 
      upcoming: upcomingTasks.length,
      history: historyCount
    };

    let dataToReturn = [];
    if (type === 'today') dataToReturn = todayTasks;
    else if (type === 'overdue') dataToReturn = overdueTasks;
    else if (type === 'upcoming') dataToReturn = upcomingTasks;

    if (type === 'history') {
      const allVisits = await db.select({
        id: visits.id,
        customerId: customers.id,
        customerCode: customers.customerCode,
        name: customers.name,
        phone1: customers.phone1,
        visitDate: visits.visitDate,
        notes: visits.notes,
        isBaseline: visits.isBaseline
      })
      .from(visits)
      .leftJoin(customers, eq(visits.customerId, customers.id))
      .orderBy(desc(visits.visitDate))
      .limit(100);
      dataToReturn = allVisits as any;
    }

    return { data: dataToReturn, stats };
  });

  // 2. Mark Maintenance as Done
  fastify.put('/:customerId/done', {
    preHandler: [requirePermission('visits.create')]
  }, async (request, reply) => {
    const { customerId } = request.params as any;
    
    const custRes = await db.select().from(customers).where(eq(customers.id, customerId));
    const cust = custRes[0];
    if (!cust) throw new Error('العميل غير موجود');

    const intervalRes = await db.select().from(maintenanceIntervals).where(eq(maintenanceIntervals.id, cust.maintenanceIntervalId));
    const interval = intervalRes[0];
    if (!interval) throw new Error('فترة الصيانة غير صالحة');

    const todayStr = new Date().toISOString().split('T')[0];
    const dateObj = new Date(todayStr);
    dateObj.setMonth(dateObj.getMonth() + interval.months);
    const nextDateStr = dateObj.toISOString().split('T')[0];

    await db.update(customers).set({
      lastMaintenanceDate: todayStr,
      nextMaintenanceDate: nextDateStr
    }).where(eq(customers.id, customerId));

    return { success: true, nextMaintenanceDate: nextDateStr };
  });

  // 3. Log a detailed Maintenance Visit (from the new Form)
  fastify.post('/', {
    preHandler: [requirePermission('visits.create')]
  }, async (request, reply) => {
    const data = request.body as any;
    
    let finalEmployeeId = data.employeeId;
    if (!finalEmployeeId) {
      // Find or create a default "Unspecified" technician
      const defaultEmp = await db.select().from(employees).where(eq(employees.name, 'غير محدد'));
      if (defaultEmp[0]) {
        finalEmployeeId = defaultEmp[0].id;
      } else {
        finalEmployeeId = crypto.randomUUID();
        await db.insert(employees).values({
          id: finalEmployeeId,
          name: 'غير محدد',
          isTechnician: true
        });
      }
    }

    // Create the visit record
    const visitId = crypto.randomUUID();
    
    await db.insert(visits).values({
      id: visitId,
      customerId: data.customerId,
      employeeId: finalEmployeeId,
      visitDate: data.visitDate,
      workflowStatus: 'COMPLETED',
      isBaseline: false,
      item1: data.item1 || false,
      item2: data.item2 || false,
      item3: data.item3 || false,
      itemPost: data.itemPost || false,
      itemCalcium: data.itemCalcium || false,
      itemInfrared: data.itemInfrared || false,
      itemSalts: data.itemSalts || false,
      notes: data.notes || '',
      createdAt: new Date(),
    });

    // Auto-deduct changed candles & spare parts from Inventory
    try {
      const allInv = await db.select().from(inventory);

      // 1. Candles Mapping
      const candleKeywords: Record<string, string[]> = {
        item1: ['مرحلة 1', 'مرحلة أولى', 'أولى'],
        item2: ['مرحلة 2', 'مرحلة ثانية', 'ثانية'],
        item3: ['مرحلة 3', 'مرحلة ثالثة', 'ثالثة'],
        itemSalts: ['مرحلة 4', 'ممبرين', 'أملاح'],
        itemPost: ['مرحلة 5', 'بوست كربون', 'بوست'],
        itemCalcium: ['مرحلة 6', 'كالسيت', 'كالسيوم'],
        itemInfrared: ['مرحلة 7', 'إنفراريد', 'انفراريد']
      };

      for (const [key, keywords] of Object.entries(candleKeywords)) {
        if (data[key]) {
          const matched = allInv.find(inv => 
            (inv.category === 'candle' || !inv.category) && 
            keywords.some(kw => inv.itemName.includes(kw))
          );
          if (matched) {
            console.log(`[INVENTORY DEDUCTION] Candle ${key} matched '${matched.itemName}'. Deducting 1 from stock.`);
            await db.update(inventory).set({
              quantity: sql`MAX(0, quantity - 1)`
            }).where(eq(inventory.id, matched.id));
          }
        }
      }

      // 2. Spare parts deduction (if provided as an array of { id, quantity })
      if (Array.isArray(data.spareParts)) {
        for (const sp of data.spareParts) {
          const partId = sp.id || sp.inventoryId;
          const qty = Number(sp.quantity) || 1;
          if (partId && qty > 0) {
            const matchedPart = allInv.find(inv => inv.id === partId);
            if (matchedPart) {
              console.log(`[INVENTORY DEDUCTION] Spare part '${matchedPart.itemName}' used. Deducting ${qty} from stock.`);
              await db.update(inventory).set({
                quantity: sql`MAX(0, quantity - ${qty})`
              }).where(eq(inventory.id, matchedPart.id));
            }
          }
        }
      }
    } catch (invErr) {
      console.error('Error auto-deducting inventory for visit:', invErr);
    }

    // Update customer's next maintenance date
    const custRes = await db.select().from(customers).where(eq(customers.id, data.customerId));
    const cust = custRes[0];
    if (!cust) throw new Error('العميل غير موجود');

    const intervalRes = await db.select().from(maintenanceIntervals).where(eq(maintenanceIntervals.id, cust.maintenanceIntervalId));
    const interval = intervalRes[0];
    
    if (interval) {
      const dateObj = new Date(data.visitDate);
      dateObj.setMonth(dateObj.getMonth() + interval.months);
      const nextDateStr = dateObj.toISOString().split('T')[0];
  
      await db.update(customers).set({
        lastMaintenanceDate: data.visitDate,
        nextMaintenanceDate: nextDateStr
      }).where(eq(customers.id, data.customerId));
    }

    return { success: true, visitId };
  });

  // 4. Update an existing Maintenance Visit
  fastify.put('/:id', {
    preHandler: [requirePermission('visits.create')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const data = request.body as any;

    const visitRes = await db.select().from(visits).where(eq(visits.id, id));
    const visit = visitRes[0];
    if (!visit) {
      return reply.status(404).send({ error: 'الزيارة غير موجودة' });
    }

    const updateFields: any = {};
    if (data.visitDate !== undefined) updateFields.visitDate = data.visitDate;
    if (data.employeeId !== undefined) updateFields.employeeId = data.employeeId || null;
    if (data.item1 !== undefined) updateFields.item1 = Boolean(data.item1);
    if (data.item2 !== undefined) updateFields.item2 = Boolean(data.item2);
    if (data.item3 !== undefined) updateFields.item3 = Boolean(data.item3);
    if (data.itemPost !== undefined) updateFields.itemPost = Boolean(data.itemPost);
    if (data.itemCalcium !== undefined) updateFields.itemCalcium = Boolean(data.itemCalcium);
    if (data.itemInfrared !== undefined) updateFields.itemInfrared = Boolean(data.itemInfrared);
    if (data.itemSalts !== undefined) updateFields.itemSalts = Boolean(data.itemSalts);
    if (data.notes !== undefined) updateFields.notes = data.notes;

    await db.update(visits).set(updateFields).where(eq(visits.id, id));

    // Recalculate customer's last and next maintenance dates based on latest visit
    const customerId = visit.customerId;
    if (customerId) {
      const allVisits = await db.select()
        .from(visits)
        .where(eq(visits.customerId, customerId))
        .orderBy(desc(visits.visitDate));

      const custRes = await db.select().from(customers).where(eq(customers.id, customerId));
      const cust = custRes[0];

      if (cust && allVisits.length > 0) {
        const intervalRes = await db.select().from(maintenanceIntervals).where(eq(maintenanceIntervals.id, cust.maintenanceIntervalId));
        const interval = intervalRes[0];
        const months = interval?.months || 3;

        const latestVisitDate = allVisits[0].visitDate;
        const dateObj = new Date(latestVisitDate);
        dateObj.setMonth(dateObj.getMonth() + months);
        const nextDateStr = dateObj.toISOString().split('T')[0];

        await db.update(customers).set({
          lastMaintenanceDate: latestVisitDate,
          nextMaintenanceDate: nextDateStr
        }).where(eq(customers.id, customerId));
      }
    }

    return { success: true, message: 'تم تحديث بيانات الزيارة بنجاح' };
  });

  // 5. Delete a Maintenance Visit
  fastify.delete('/:id', {
    preHandler: [requirePermission('visits.create')]
  }, async (request, reply) => {
    const { id } = request.params as any;

    const visitRes = await db.select().from(visits).where(eq(visits.id, id));
    const visit = visitRes[0];
    if (!visit) {
      return reply.status(404).send({ error: 'الزيارة غير موجودة' });
    }

    const customerId = visit.customerId;

    // Delete the visit
    await db.delete(visits).where(eq(visits.id, id));

    // Recalculate customer's last and next maintenance dates
    if (customerId) {
      const remainingVisits = await db.select()
        .from(visits)
        .where(eq(visits.customerId, customerId))
        .orderBy(desc(visits.visitDate));

      const custRes = await db.select().from(customers).where(eq(customers.id, customerId));
      const cust = custRes[0];

      if (cust) {
        const intervalRes = await db.select().from(maintenanceIntervals).where(eq(maintenanceIntervals.id, cust.maintenanceIntervalId));
        const interval = intervalRes[0];
        const months = interval?.months || 3;

        if (remainingVisits.length > 0) {
          const latestVisitDate = remainingVisits[0].visitDate;
          const dateObj = new Date(latestVisitDate);
          dateObj.setMonth(dateObj.getMonth() + months);
          const nextDateStr = dateObj.toISOString().split('T')[0];

          await db.update(customers).set({
            lastMaintenanceDate: latestVisitDate,
            nextMaintenanceDate: nextDateStr
          }).where(eq(customers.id, customerId));
        } else {
          // No visits left
          await db.update(customers).set({
            lastMaintenanceDate: null,
            nextMaintenanceDate: null
          }).where(eq(customers.id, customerId));
        }
      }
    }

    return { success: true, message: 'تم حذف الزيارة بنجاح' };
  });
}

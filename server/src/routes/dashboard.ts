import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { customers, visits, auditLogs, governorates, filterTypes, inventory } from '../db/schema.js';
import { eq, isNotNull, desc, sql } from 'drizzle-orm';
import { verifyAuth } from '../utils/auth.js';

export default async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  fastify.get('/', async (request, reply) => {
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

    // 1. Total Customers & Maintenance Status via SQL Aggregation
    const totalCustomersRes = await db.select({ count: sql<number>`COUNT(*)` }).from(customers);
    const totalCustomers = Number(totalCustomersRes[0]?.count || 0);

    const todayCountRes = await db.select({ count: sql<number>`COUNT(*)` }).from(customers).where(eq(customers.nextMaintenanceDate, today));
    const todayCount = Number(todayCountRes[0]?.count || 0);

    const overdueCountRes = await db.select({ count: sql<number>`COUNT(*)` }).from(customers).where(sql`${customers.nextMaintenanceDate} < ${today}`);
    const overdueCount = Number(overdueCountRes[0]?.count || 0);

    const upcomingCountRes = await db.select({ count: sql<number>`COUNT(*)` }).from(customers).where(sql`${customers.nextMaintenanceDate} > ${today}`);
    const upcomingCount = Number(upcomingCountRes[0]?.count || 0);

    // 2. Customers by Filter Type (Group By)
    const filterStatsRes = await db.select({
      id: filterTypes.id,
      name: filterTypes.name,
      count: sql<number>`COUNT(${customers.id})`
    })
    .from(filterTypes)
    .leftJoin(customers, eq(filterTypes.id, customers.filterTypeId))
    .groupBy(filterTypes.id, filterTypes.name);

    // 3. Customers by Governorate (Group By)
    const govStatsRes = await db.select({
      name: governorates.name,
      value: sql<number>`COUNT(${customers.id})`
    })
    .from(governorates)
    .innerJoin(customers, eq(governorates.id, customers.governorateId))
    .groupBy(governorates.name)
    .orderBy(desc(sql`COUNT(${customers.id})`));

    // 4. Visits & Real Candle Consumption Calculation
    const totalVisitsRes = await db.select({ count: sql<number>`COUNT(*)` }).from(visits);
    const totalVisits = Number(totalVisitsRes[0]?.count || 0);

    const monthlyVisitsRes = await db.select({ count: sql<number>`COUNT(*)` }).from(visits).where(sql`${visits.visitDate} >= ${thirtyDaysAgo}`);
    const monthlyVisits = Number(monthlyVisitsRes[0]?.count || 0);

    // Aggregating candle consumption using SQL SUM
    const candleStatsRes = await db.select({
      item1: sql<number>`SUM(CASE WHEN ${visits.item1} = 1 THEN 1 ELSE 0 END)`,
      item2: sql<number>`SUM(CASE WHEN ${visits.item2} = 1 THEN 1 ELSE 0 END)`,
      item3: sql<number>`SUM(CASE WHEN ${visits.item3} = 1 THEN 1 ELSE 0 END)`,
      itemPost: sql<number>`SUM(CASE WHEN ${visits.itemPost} = 1 THEN 1 ELSE 0 END)`,
      itemCalcium: sql<number>`SUM(CASE WHEN ${visits.itemCalcium} = 1 THEN 1 ELSE 0 END)`,
      itemInfrared: sql<number>`SUM(CASE WHEN ${visits.itemInfrared} = 1 THEN 1 ELSE 0 END)`,
      itemSalts: sql<number>`SUM(CASE WHEN ${visits.itemSalts} = 1 THEN 1 ELSE 0 END)`,
    }).from(visits);

    const stats = candleStatsRes[0] || {};
    const item1 = Number(stats.item1 || 0);
    const item2 = Number(stats.item2 || 0);
    const item3 = Number(stats.item3 || 0);
    const itemPost = Number(stats.itemPost || 0);
    const itemCalcium = Number(stats.itemCalcium || 0);
    const itemInfrared = Number(stats.itemInfrared || 0);
    const itemSalts = Number(stats.itemSalts || 0);

    const consumedCandles = item1 + item2 + item3 + itemPost + itemCalcium + itemInfrared + itemSalts;

    const filterConsumptionData = [
      { name: 'شمعة أولى', value: item1 },
      { name: 'شمعة ثانية', value: item2 },
      { name: 'شمعة ثالثة', value: item3 },
      { name: 'أملاح (ممبرين)', value: itemSalts },
      { name: 'بوست كربون', value: itemPost },
      { name: 'كالسيوم (كالسيت)', value: itemCalcium },
      { name: 'انفراريد', value: itemInfrared },
    ];

    // 5. Inventory Summary
    const invAggRes = await db.select({
      totalItems: sql<number>`COUNT(*)`,
      totalUnits: sql<number>`SUM(${inventory.quantity})`,
      totalCapital: sql<number>`SUM(${inventory.quantity} * ${inventory.unitPrice})`,
      lowStockCount: sql<number>`SUM(CASE WHEN ${inventory.quantity} <= 5 THEN 1 ELSE 0 END)`
    }).from(inventory);
    
    const invAgg = invAggRes[0] || {};

    // 6. Recent Activity (Audit Logs)
    const recentLogs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(5);

    // 7. Today's Maintenance List
    const todaysList = await db.select().from(customers).where(eq(customers.nextMaintenanceDate, today)).limit(10);

    return {
      data: {
        totalCustomers,
        maintenance: {
          today: todayCount,
          overdue: overdueCount,
          upcoming: upcomingCount
        },
        monthlyVisits,
        totalVisits,
        consumedFilters: consumedCandles,
        filterStats: filterStatsRes.map(f => ({ ...f, count: Number(f.count) })),
        govStats: govStatsRes.map(g => ({ ...g, value: Number(g.value) })),
        filterConsumptionData,
        inventorySummary: {
          totalItems: Number(invAgg.totalItems || 0),
          totalUnits: Number(invAgg.totalUnits || 0),
          totalCapital: Math.round(Number(invAgg.totalCapital || 0)),
          lowStockCount: Number(invAgg.lowStockCount || 0)
        },
        recentLogs,
        todaysList
      }
    };
  });
}


import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { customers, visits, employees, inventory, governorates, cities, filterTypes } from '../db/schema.js';
import { verifyAuth } from '../utils/auth.js';
import { hasPermission } from '../utils/rbac.js';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import { matchesAnyField } from '../utils/textUtils.js';

export default async function reportsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  fastify.get('/', {
    preHandler: async (request: any, reply: any) => {
      if (!hasPermission(request.user.role, 'reports.view')) {
        return reply.status(403).send({ error: 'ليس لديك صلاحية لعرض التقارير' });
      }
    }
  }, async (request, reply) => {
    const query = request.query as any || {};
    const { from, to, period, search, technicianId, governorateId, filterTypeId } = query;

    // 1. Fetch base tables
    const allCustomers = await db.select().from(customers);
    const allVisits = await db.select().from(visits).orderBy(desc(visits.visitDate));
    const allEmployees = await db.select().from(employees);
    const allInventory = await db.select().from(inventory);
    const allGovs = await db.select().from(governorates);
    const allCities = await db.select().from(cities);
    const allFilterTypes = await db.select().from(filterTypes);

    const govMap = new Map(allGovs.map(g => [g.id, g.name]));
    const cityMap = new Map(allCities.map(c => [c.id, c.name]));
    const filterTypeMap = new Map(allFilterTypes.map(f => [f.id, f.name]));
    const employeeMap = new Map(allEmployees.map(e => [e.id, e.name]));
    const customerMap = new Map(allCustomers.map(c => [c.id, c]));

    // 2. Date Filtering Calculation
    const today = new Date().toISOString().split('T')[0];
    let startDate = from || '';
    let endDate = to || '';

    if (period && !from && !to) {
      const now = new Date();
      if (period === 'today') {
        startDate = today;
        endDate = today;
      } else if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 86400000);
        startDate = weekAgo.toISOString().split('T')[0];
        endDate = today;
      } else if (period === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 86400000);
        startDate = monthAgo.toISOString().split('T')[0];
        endDate = today;
      } else if (period === 'quarter') {
        const quarterAgo = new Date(now.getTime() - 90 * 86400000);
        startDate = quarterAgo.toISOString().split('T')[0];
        endDate = today;
      } else if (period === 'year') {
        const yearAgo = new Date(now.getTime() - 365 * 86400000);
        startDate = yearAgo.toISOString().split('T')[0];
        endDate = today;
      }
    }

    // Filter visits based on date range, technician, customer search, governorate, filter type
    const filteredVisits = allVisits.filter(v => {
      if (startDate && v.visitDate < startDate) return false;
      if (endDate && v.visitDate > endDate) return false;
      if (technicianId && v.employeeId !== technicianId) return false;

      const cust = customerMap.get(v.customerId);
      if (!cust) return false;

      if (governorateId && cust.governorateId !== governorateId) return false;
      if (filterTypeId && cust.filterTypeId !== filterTypeId) return false;

      if (search) {
        if (!matchesAnyField([cust.name, cust.phone1, cust.phone2, cust.customerCode, cust.village], search)) {
          return false;
        }
      }

      return true;
    });

    // Filter customers matching filters
    const filteredCustomers = allCustomers.filter(c => {
      if (governorateId && c.governorateId !== governorateId) return false;
      if (filterTypeId && c.filterTypeId !== filterTypeId) return false;
      if (search) {
        if (!matchesAnyField([c.name, c.phone1, c.phone2, c.customerCode, c.village], search)) {
          return false;
        }
      }
      return true;
    });

    // 3. Candles & Stages Consumption Analysis
    // Price dictionary from inventory or standard pricing
    const getInventoryPrice = (keyword: string, fallback: number) => {
      const found = allInventory.find(i => i.itemName.includes(keyword));
      return found ? found.unitPrice : fallback;
    };

    const stagesConfig = [
      { key: 'item1', name: 'شمعة أولى', fallbackPrice: 45, interval: '3 أشهر', stageNum: 1 },
      { key: 'item2', name: 'شمعة ثانية', fallbackPrice: 55, interval: '6 أشهر', stageNum: 2 },
      { key: 'item3', name: 'شمعة ثالثة', fallbackPrice: 55, interval: '6 أشهر', stageNum: 3 },
      { key: 'itemSalts', name: 'أملاح (ممبرين)', fallbackPrice: 350, interval: '12 - 24 شهر', stageNum: 4 },
      { key: 'itemPost', name: 'بوست كربون', fallbackPrice: 75, interval: '12 شهر', stageNum: 5 },
      { key: 'itemCalcium', name: 'كالسيوم (كالسيت)', fallbackPrice: 75, interval: '12 شهر', stageNum: 6 },
      { key: 'itemInfrared', name: 'انفراريد', fallbackPrice: 95, interval: '12 - 24 شهر', stageNum: 7 },
    ];

    let totalCandlesConsumed = 0;
    let totalCandlesCost = 0;

    const candleStats = stagesConfig.map(cfg => {
      let count = 0;
      filteredVisits.forEach(v => {
        if ((v as any)[cfg.key]) count += 1;
      });

      const unitPrice = getInventoryPrice(cfg.name.split('(')[0].trim(), cfg.fallbackPrice);
      const totalCost = count * unitPrice;
      totalCandlesConsumed += count;
      totalCandlesCost += totalCost;

      return {
        stageNum: cfg.stageNum,
        name: cfg.name,
        interval: cfg.interval,
        count,
        unitPrice,
        totalCost,
        percentage: filteredVisits.length > 0 ? Math.round((count / filteredVisits.length) * 100) : 0
      };
    });

    // 4. Maintenance Operations Statistics
    const overdueCount = allCustomers.filter(c => c.nextMaintenanceDate && c.nextMaintenanceDate < today).length;
    const todayCount = allCustomers.filter(c => c.nextMaintenanceDate === today).length;
    const upcomingCount = allCustomers.filter(c => c.nextMaintenanceDate && c.nextMaintenanceDate > today).length;
    const onTimeRate = allCustomers.length > 0 ? Math.round(((allCustomers.length - overdueCount) / allCustomers.length) * 100) : 100;

    const maintenanceByFilterType = allFilterTypes.map(ft => {
      const custCount = allCustomers.filter(c => c.filterTypeId === ft.id).length;
      const visitsCount = filteredVisits.filter(v => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.filterTypeId === ft.id;
      }).length;
      return {
        id: ft.id,
        name: ft.name,
        customerCount: custCount,
        visitsCount
      };
    });

    // 5. Technician Performance Statistics
    const technicianStats = allEmployees.filter(e => e.isTechnician).map(tech => {
      const techVisits = filteredVisits.filter(v => v.employeeId === tech.id);
      let candlesInstalled = 0;
      techVisits.forEach(v => {
        if (v.item1) candlesInstalled++;
        if (v.item2) candlesInstalled++;
        if (v.item3) candlesInstalled++;
        if (v.itemSalts) candlesInstalled++;
        if (v.itemPost) candlesInstalled++;
        if (v.itemCalcium) candlesInstalled++;
        if (v.itemInfrared) candlesInstalled++;
      });

      const lastVisit = techVisits.length > 0 ? techVisits[0].visitDate : '-';
      const score = techVisits.length >= 6 ? 'ممتاز' : (techVisits.length >= 3 ? 'جيد جداً' : 'نشط');

      return {
        id: tech.id,
        name: tech.name,
        visitsCount: techVisits.length,
        candlesInstalled,
        lastVisitDate: lastVisit,
        score,
        isActive: tech.isActive
      };
    }).sort((a, b) => b.visitsCount - a.visitsCount);

    // 6. Geographic Distribution Statistics (Active & All 27 Governorates)
    const all27GovernoratesStats = allGovs.map(g => {
      const custs = filteredCustomers.filter(c => c.governorateId === g.id);
      const visitsInGov = filteredVisits.filter(v => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.governorateId === g.id;
      });
      return {
        id: g.id,
        name: g.name,
        customerCount: custs.length,
        visitsCount: visitsInGov.length,
        percentage: filteredCustomers.length > 0 ? Math.round((custs.length / filteredCustomers.length) * 100) : 0,
        coverageStatus: custs.length > 0 ? 'مغطاة بنشاط ميداني' : 'جاهزة للتشغيل والتوسع'
      };
    }).sort((a, b) => b.customerCount - a.customerCount);

    const governorateStats = all27GovernoratesStats.filter(g => g.customerCount > 0 || g.visitsCount > 0);

    const cityStats = allCities.map(ct => {
      const custs = filteredCustomers.filter(c => c.cityId === ct.id);
      const visitsInCity = filteredVisits.filter(v => {
        const cust = customerMap.get(v.customerId);
        return cust && cust.cityId === ct.id;
      });
      return {
        id: ct.id,
        name: ct.name,
        governorateName: govMap.get(ct.governorateId) || '',
        customerCount: custs.length,
        visitsCount: visitsInCity.length,
      };
    }).filter(ct => ct.customerCount > 0).sort((a, b) => b.customerCount - a.customerCount);

    // 7. Comprehensive Warehouse & Inventory Intelligence Report
    const totalInventoryValue = allInventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const totalInventoryUnits = allInventory.reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Inventory Categorization
    const categorizeItem = (name: string, cat?: string | null) => {
      const n = name.toLowerCase();
      if (cat === 'candle' || n.includes('شمع') || n.includes('ممبرين')) return 'شمع وممبرين الفلاتر';
      if (n.includes('موتور') || n.includes('مضخة') || n.includes('محول') || n.includes('ترانس')) return 'مواتير ومحولات كهربائية';
      if (n.includes('محبس') || n.includes('خرطوم') || n.includes('كوع') || n.includes('وصلة')) return 'محابس وخراطيم وسباكة';
      if (n.includes('خزان') || n.includes('صنبور') || n.includes('حنقية') || n.includes('هاوسنج')) return 'قطع غيار وهياكل التشغيل';
      if (n.includes('طقم') || n.includes('محطة') || n.includes('فلتر كامل')) return 'أطقم وفلاتر متكاملة';
      return 'مستلزمات عامة';
    };

    const categoriesMap: Record<string, { name: string, count: number, units: number, value: number }> = {};
    allInventory.forEach(item => {
      const cat = categorizeItem(item.itemName, item.category);
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { name: cat, count: 0, units: 0, value: 0 };
      }
      categoriesMap[cat].count += 1;
      categoriesMap[cat].units += item.quantity;
      categoriesMap[cat].value += item.quantity * item.unitPrice;
    });

    const categoryBreakdown = Object.values(categoriesMap).map(c => ({
      ...c,
      value: Math.round(c.value),
      percentage: totalInventoryValue > 0 ? Math.round((c.value / totalInventoryValue) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    // Maintenance Consumption Linkage
    // Map item names to how many times consumed in filteredVisits
    const itemConsumptionMap: Record<string, number> = {};
    filteredVisits.forEach(v => {
      if (v.item1) itemConsumptionMap['شمعة مرحلة 1'] = (itemConsumptionMap['شمعة مرحلة 1'] || 0) + 1;
      if (v.item2) itemConsumptionMap['شمعة مرحلة 2'] = (itemConsumptionMap['شمعة مرحلة 2'] || 0) + 1;
      if (v.item3) itemConsumptionMap['شمعة مرحلة 3'] = (itemConsumptionMap['شمعة مرحلة 3'] || 0) + 1;
      if (v.itemSalts) itemConsumptionMap['شمعة مرحلة 4'] = (itemConsumptionMap['شمعة مرحلة 4'] || 0) + 1;
      if (v.itemPost) itemConsumptionMap['شمعة مرحلة 5'] = (itemConsumptionMap['شمعة مرحلة 5'] || 0) + 1;
      if (v.itemCalcium) itemConsumptionMap['شمعة مرحلة 6'] = (itemConsumptionMap['شمعة مرحلة 6'] || 0) + 1;
      if (v.itemInfrared) itemConsumptionMap['شمعة مرحلة 7'] = (itemConsumptionMap['شمعة مرحلة 7'] || 0) + 1;
    });

    const detailedInventoryTable = allInventory.map(item => {
      // Find matches in consumption
      let consumed = 0;
      for (const [k, v] of Object.entries(itemConsumptionMap)) {
        if (item.itemName.includes(k) || k.includes(item.itemName.substring(0, 10))) {
          consumed = v;
          break;
        }
      }

      let status = 'آمن ومتوفر';
      let statusColor = 'emerald';
      if (item.quantity === 0) {
        status = 'نفد بالكامل';
        statusColor = 'red';
      } else if (item.quantity <= 5) {
        status = 'حرج - يلزم التوريد';
        statusColor = 'amber';
      } else if (item.quantity <= 15) {
        status = 'متوسط';
        statusColor = 'sky';
      }

      // Coverage months estimation (based on monthly run rate)
      const monthlyRunRate = Math.max(0.5, consumed / (filteredVisits.length > 0 ? 3 : 1));
      const coverageMonths = (item.quantity / monthlyRunRate).toFixed(1);

      return {
        id: item.id,
        name: item.itemName,
        category: categorizeItem(item.itemName, item.category),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        retailPrice: Math.round(item.unitPrice * 1.35),
        totalCostValue: Math.round(item.quantity * item.unitPrice),
        totalRetailValue: Math.round(item.quantity * item.unitPrice * 1.35),
        consumedInVisits: consumed,
        coverageMonths: Number(coverageMonths),
        status,
        statusColor
      };
    }).sort((a, b) => b.totalCostValue - a.totalCostValue);

    const lowStockItems = detailedInventoryTable.filter(i => i.quantity <= 5);
    const fastMovingItems = [...detailedInventoryTable].sort((a, b) => b.consumedInVisits - a.consumedInVisits).slice(0, 5);
    const slowMovingItems = detailedInventoryTable.filter(i => i.consumedInVisits === 0).slice(0, 5);

    const warehouseReport = {
      summary: {
        totalItemTypes: allInventory.length,
        totalUnitsInStock: totalInventoryUnits,
        totalCapitalCost: Math.round(totalInventoryValue),
        totalEstimatedRetailValue: Math.round(totalInventoryValue * 1.35),
        expectedGrossProfit: Math.round(totalInventoryValue * 0.35),
        lowStockCount: lowStockItems.length,
        outOfStockCount: detailedInventoryTable.filter(i => i.quantity === 0).length,
        healthyStockCount: detailedInventoryTable.filter(i => i.quantity > 5).length,
        totalCandlesConsumedInVisits: totalCandlesConsumed,
        totalCandlesCostInVisits: totalCandlesCost
      },
      categoryBreakdown,
      fastMovingItems,
      slowMovingItems,
      lowStockItems,
      detailedItems: detailedInventoryTable
    };

    // 8. Detailed Visits List
    const detailedVisits = filteredVisits.slice(0, 100).map(v => {
      const cust = customerMap.get(v.customerId);
      const changedCandles: string[] = [];
      if (v.item1) changedCandles.push('شمعة أولى');
      if (v.item2) changedCandles.push('شمعة ثانية');
      if (v.item3) changedCandles.push('شمعة ثالثة');
      if (v.itemPost) changedCandles.push('بوست كربون');
      if (v.itemCalcium) changedCandles.push('كالسيوم (كالسيت)');
      if (v.itemInfrared) changedCandles.push('انفراريد');
      if (v.itemSalts) changedCandles.push('أملاح (ممبرين)');

      return {
        id: v.id,
        visitDate: v.visitDate,
        customerName: cust ? cust.name : 'عميل غير مسجل',
        customerCode: cust ? cust.customerCode : '-',
        phone: cust ? cust.phone1 : '-',
        technicianName: v.employeeId ? (employeeMap.get(v.employeeId) || 'غير محدد') : 'غير محدد',
        governorateName: cust ? (govMap.get(cust.governorateId) || '') : '',
        cityName: cust ? (cityMap.get(cust.cityId) || '') : '',
        filterTypeName: cust ? (filterTypeMap.get(cust.filterTypeId || '') || 'فلتر منزلي') : '',
        candlesSummary: changedCandles.join(' + ') || 'فحص وصيانة عامة',
        candlesCount: changedCandles.length,
        notes: v.notes || ''
      };
    });

    return {
      data: {
        filtersApplied: {
          from: startDate,
          to: endDate,
          period: period || 'all',
          search: search || '',
          technicianId: technicianId || '',
          governorateId: governorateId || '',
          filterTypeId: filterTypeId || ''
        },
        overview: {
          totalCustomers: allCustomers.length,
          filteredCustomersCount: filteredCustomers.length,
          totalVisits: filteredVisits.length,
          onTimeRate,
          overdueCount,
          todayCount,
          upcomingCount,
          totalCandlesConsumed,
          totalCandlesCost,
          totalInventoryValue: Math.round(totalInventoryValue),
          totalInventoryUnits,
          totalEstimatedRetailValue: Math.round(totalInventoryValue * 1.35),
          lowStockCount: lowStockItems.length,
          activeTechniciansCount: technicianStats.length,
          totalGovernoratesCount: allGovs.length,
          activeGovernoratesCount: governorateStats.length
        },
        candleStats,
        maintenanceByFilterType,
        technicianStats,
        governorateStats,
        all27GovernoratesStats,
        cityStats,
        warehouseReport,
        lowStockItems: lowStockItems.map(i => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          category: i.category
        })),
        detailedVisits,
        lookups: {
          technicians: allEmployees.filter(e => e.isTechnician).map(e => ({ id: e.id, name: e.name })),
          governorates: allGovs.map(g => ({ id: g.id, name: g.name })),
          filterTypes: allFilterTypes.map(f => ({ id: f.id, name: f.name }))
        }
      }
    };
  });
}

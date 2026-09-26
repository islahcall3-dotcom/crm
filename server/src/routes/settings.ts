import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { 
  systemSettings, auditLogs, users, customers, visits, 
  inventory, employees, installments, expenses, 
  governorates, cities, filterTypes, maintenanceIntervals 
} from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { verifyAuth } from '../utils/auth.js';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';

// Default Company Profile
const DEFAULT_COMPANY_PROFILE = {
  companyName: 'مؤسسة فلاتر الجمال لأنظمة معالجة وتحلية المياه',
  slogan: 'صيانة فورية وتوريد شمعات ومحطات تحلية معتمدة بأعلى معايير النقاء',
  phone1: '01012345678',
  phone2: '01123456789',
  hotline: '19000',
  whatsapp: '01012345678',
  email: 'info@elgammal-filters.com',
  address: 'الجمهورية المصرية - مركز سمنود / المنصورة',
  commercialRegister: '104523/غربية',
  taxNumber: '482-901-332',
  warrantyNotice: 'الضمان سارٍ بشرط الالتزام بتغيير الشمعات والمراحل في مواعيدها الدورية المحددة من قِبل فني المؤسسة المعتمد.'
};

// Default Alert Preferences
const DEFAULT_ALERT_PREFERENCES = {
  alertDaysBefore: 7,
  overdueThresholdDays: 1,
  defaultWarrantyMonths: 12,
  standardTdsLimit: 150,
  enableSmsReminders: true
};

export default async function settingsRoutes(fastify: FastifyInstance) {
  // Ensure system_settings table exists
  try {
    await db.run(sql`CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )`);
  } catch (e) {
    // Already created
  }

  // Apply verifyAuth to all routes in this plugin
  fastify.addHook('preHandler', verifyAuth);

  // 1. GET Settings (Company Profile + Alert Preferences)
  fastify.get('/', async (request, reply) => {
    try {
      const allSettings = await db.select().from(systemSettings);
      const settingsMap: Record<string, any> = {};
      allSettings.forEach(s => {
        settingsMap[s.key] = s.value;
      });

      return {
        companyProfile: settingsMap['companyProfile'] || DEFAULT_COMPANY_PROFILE,
        alertPreferences: settingsMap['alertPreferences'] || DEFAULT_ALERT_PREFERENCES
      };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'فشل استرجاع الإعدادات' });
    }
  });

  // 2. PUT Settings (Save Company Profile or Alerts)
  fastify.put('/', async (request, reply) => {
    const currentUser = (request as any).user;
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'MANAGER') {
      return reply.status(403).send({ error: 'تعديل إعدادات المؤسسة يتطلب صلاحية إدارية' });
    }

    try {
      const body = request.body as any;
      const now = new Date();

      if (body.companyProfile) {
        const merged = { ...DEFAULT_COMPANY_PROFILE, ...body.companyProfile };
        await db.run(sql`INSERT INTO system_settings (key, value, updated_at) 
          VALUES ('companyProfile', ${JSON.stringify(merged)}, ${now.getTime()})
          ON CONFLICT(key) DO UPDATE SET value = ${JSON.stringify(merged)}, updated_at = ${now.getTime()}`);
      }

      if (body.alertPreferences) {
        const merged = { ...DEFAULT_ALERT_PREFERENCES, ...body.alertPreferences };
        await db.run(sql`INSERT INTO system_settings (key, value, updated_at) 
          VALUES ('alertPreferences', ${JSON.stringify(merged)}, ${now.getTime()})
          ON CONFLICT(key) DO UPDATE SET value = ${JSON.stringify(merged)}, updated_at = ${now.getTime()}`);
      }

      // Audit log
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId: currentUser.id,
        entityName: 'system_settings',
        entityId: 'global',
        action: 'UPDATE_SETTINGS',
        newValues: body,
        createdAt: now
      });

      return { success: true, message: 'تم حفظ وتطبيق الإعدادات بنجاح' };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'فشل حفظ الإعدادات' });
    }
  });

  // 3. GET Comprehensive Database Snapshot Backup Download
  fastify.get('/backup', async (request, reply) => {
    const currentUser = (request as any).user;
    if (currentUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'تنزيل النسخة الاحتياطية مقتصر على مدير النظام' });
    }

    try {
      // Gather all data
      const [
        allCustomers,
        allVisits,
        allInventory,
        allEmployees,
        allInstallments,
        allExpenses,
        allGovs,
        allCities,
        allFilters,
        allIntervals,
        allUsers,
        allSettings
      ] = await Promise.all([
        db.select().from(customers),
        db.select().from(visits),
        db.select().from(inventory),
        db.select().from(employees),
        db.select().from(installments),
        db.select().from(expenses),
        db.select().from(governorates),
        db.select().from(cities),
        db.select().from(filterTypes),
        db.select().from(maintenanceIntervals),
        db.select({ id: users.id, username: users.username, role: users.role, isActive: users.isActive, createdAt: users.createdAt }).from(users),
        db.select().from(systemSettings)
      ]);

      const backupData = {
        system: 'منظومة فلاتر الجمال لإدارة العملاء والصيانة',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser.username,
        stats: {
          totalCustomers: allCustomers.length,
          totalVisits: allVisits.length,
          totalInventoryItems: allInventory.length,
          totalEmployees: allEmployees.length,
          totalInstallments: allInstallments.length,
          totalExpenses: allExpenses.length,
        },
        data: {
          customers: allCustomers,
          visits: allVisits,
          inventory: allInventory,
          employees: allEmployees,
          installments: allInstallments,
          expenses: allExpenses,
          governorates: allGovs,
          cities: allCities,
          filterTypes: allFilters,
          maintenanceIntervals: allIntervals,
          users: allUsers,
          settings: allSettings
        }
      };

      const filename = `elgammal_backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      
      reply.header('Content-Type', 'application/json; charset=utf-8');
      reply.header('Content-Disposition', `attachment; filename="${filename}"`);
      return backupData;
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'فشل إنشاء النسخة الاحتياطية' });
    }
  });

  // 3b. POST Restore Database from Backup JSON
  fastify.post('/restore', async (request, reply) => {
    const currentUser = (request as any).user;
    if (currentUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'استعادة النسخة الاحتياطية مقتصرة حصرياً على مدير النظام' });
    }

    try {
      const payload = request.body as any;
      if (!payload || !payload.data) {
        return reply.status(400).send({ error: 'ملف النسخة الاحتياطية غير صالح أو تالف' });
      }

      const { data } = payload;
      let restoredCounts = {
        customers: 0,
        visits: 0,
        inventory: 0,
        employees: 0,
        installments: 0,
        expenses: 0
      };

      // Restore system settings if present
      if (data.settings && Array.isArray(data.settings)) {
        for (const s of data.settings) {
          const val = typeof s.value === 'string' ? s.value : JSON.stringify(s.value);
          await db.run(sql`INSERT INTO system_settings (key, value, updated_at) 
            VALUES (${s.key}, ${val}, ${Date.now()})
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`);
        }
      }

      // Restore customers if present
      if (data.customers && Array.isArray(data.customers)) {
        for (const c of data.customers) {
          const exists = await db.select().from(customers).where(eq(customers.id, c.id));
          if (exists.length === 0) {
            await db.insert(customers).values(c);
            restoredCounts.customers++;
          }
        }
      }

      // Restore visits if present
      if (data.visits && Array.isArray(data.visits)) {
        for (const v of data.visits) {
          const exists = await db.select().from(visits).where(eq(visits.id, v.id));
          if (exists.length === 0) {
            await db.insert(visits).values(v);
            restoredCounts.visits++;
          }
        }
      }

      // Restore inventory if present
      if (data.inventory && Array.isArray(data.inventory)) {
        for (const i of data.inventory) {
          const exists = await db.select().from(inventory).where(eq(inventory.id, i.id));
          if (exists.length === 0) {
            await db.insert(inventory).values(i);
            restoredCounts.inventory++;
          }
        }
      }

      // Restore employees if present
      if (data.employees && Array.isArray(data.employees)) {
        for (const e of data.employees) {
          const exists = await db.select().from(employees).where(eq(employees.id, e.id));
          if (exists.length === 0) {
            await db.insert(employees).values(e);
            restoredCounts.employees++;
          }
        }
      }

      // Restore installments if present
      if (data.installments && Array.isArray(data.installments)) {
        for (const inst of data.installments) {
          const exists = await db.select().from(installments).where(eq(installments.id, inst.id));
          if (exists.length === 0) {
            await db.insert(installments).values(inst);
            restoredCounts.installments++;
          }
        }
      }

      // Restore expenses if present
      if (data.expenses && Array.isArray(data.expenses)) {
        for (const exp of data.expenses) {
          const exists = await db.select().from(expenses).where(eq(expenses.id, exp.id));
          if (exists.length === 0) {
            await db.insert(expenses).values(exp);
            restoredCounts.expenses++;
          }
        }
      }

      // Audit log
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId: currentUser.id,
        entityName: 'database',
        entityId: 'backup_restore',
        action: 'RESTORE_BACKUP',
        newValues: restoredCounts,
        createdAt: new Date()
      });

      return { 
        success: true, 
        message: 'تمت مراجعة واستعادة البيانات بنجاح من النسخة الاحتياطية!',
        restoredCounts 
      };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'فشل استعادة النسخة الاحتياطية: ' + (e.message || '') });
    }
  });

  // 4. GET System Statistics & Database Health
  fastify.get('/system-stats', async (request, reply) => {
    try {
      let dbSizeMb = 0;
      let dbPath = path.resolve(process.cwd(), 'elgammal.db');
      if (!fs.existsSync(dbPath)) {
        dbPath = path.resolve(process.cwd(), '../elgammal.db');
      }
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        dbSizeMb = Math.round((stats.size / (1024 * 1024)) * 100) / 100;
      }

      const [cCount, vCount, iCount, eCount, uCount] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(customers),
        db.select({ count: sql`count(*)` }).from(visits),
        db.select({ count: sql`count(*)` }).from(inventory),
        db.select({ count: sql`count(*)` }).from(employees),
        db.select({ count: sql`count(*)` }).from(users)
      ]);

      return {
        dbSizeMb,
        totalCustomers: Number(cCount[0]?.count || 0),
        totalVisits: Number(vCount[0]?.count || 0),
        totalInventoryItems: Number(iCount[0]?.count || 0),
        totalEmployees: Number(eCount[0]?.count || 0),
        totalUsers: Number(uCount[0]?.count || 0),
        serverUptimeHours: Math.round((process.uptime() / 3600) * 10) / 10,
        nodeVersion: process.version,
        databaseStatus: 'متصل ومحمي (Healthy)'
      };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'فشل استرجاع إحصائيات النظام' });
    }
  });

  // 5. GET Audit Logs
  fastify.get('/audit-logs', async (request, reply) => {
    try {
      const logs = await db.select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        entityName: auditLogs.entityName,
        entityId: auditLogs.entityId,
        action: auditLogs.action,
        newValues: auditLogs.newValues,
        createdAt: auditLogs.createdAt,
        username: users.username,
        role: users.role
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(50);

      return { data: logs };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'فشل استرجاع سجل العمليات' });
    }
  });
}

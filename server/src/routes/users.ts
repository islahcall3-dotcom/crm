import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { users, employees, auditLogs, sessions } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { verifyAuth, hashPassword } from '../utils/auth.js';
import { ROLES, getRolePermissions } from '../utils/rbac.js';
import { randomUUID } from 'crypto';
import z from 'zod';

const createUserSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم يجب ألا يقل عن 3 أحرف'),
  password: z.string().min(4, 'كلمة المرور يجب ألا تقل عن 4 أحرف'),
  role: z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'DATA_ENTRY']),
  employeeId: z.string().optional().nullable()
});

const updateUserSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'TECHNICIAN', 'DATA_ENTRY']).optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(4).optional().or(z.literal('')),
  employeeId: z.string().optional().nullable()
});

export default async function usersRoutes(fastify: FastifyInstance) {
  // Apply verifyAuth to all routes in this plugin
  fastify.addHook('preHandler', verifyAuth);

  // 1. GET all users with linked employee information
  fastify.get('/', async (request, reply) => {
    try {
      const allUsers = await db.select({
        id: users.id,
        username: users.username,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        version: users.version
      }).from(users).orderBy(desc(users.createdAt));

      // Fetch linked employees
      const allEmployees = await db.select({
        id: employees.id,
        name: employees.name,
        userId: employees.userId,
        isTechnician: employees.isTechnician
      }).from(employees);

      const enrichedUsers = allUsers.map(u => {
        const linkedEmp = allEmployees.find(e => e.userId === u.id);
        return {
          ...u,
          employeeId: linkedEmp ? linkedEmp.id : null,
          employeeName: linkedEmp ? linkedEmp.name : null
        };
      });

      return {
        data: enrichedUsers,
        availableEmployees: allEmployees.filter(e => !e.userId)
      };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'فشل في استرجاع قائمة المستخدمين' });
    }
  });

  // 2. GET Roles & Permissions Matrix
  fastify.get('/roles-matrix', async (request, reply) => {
    const rolesList = Object.keys(ROLES).map(r => ({
      key: r,
      name: r === 'ADMIN' ? 'مدير النظام (كامل الصلاحيات)' :
            r === 'MANAGER' ? 'مشرف عام / مدير فرع' :
            r === 'TECHNICIAN' ? 'فني صيانة ميداني' : 'مدخل بيانات وحسابات',
      description: r === 'ADMIN' ? 'تحكم كامل ومطلق في كافة العمليات والإعدادات والمستخدمين' :
                   r === 'MANAGER' ? 'إدارة العملاء والمخزون والتقارير بدون حذف جذري' :
                   r === 'TECHNICIAN' ? 'استعراض عملاء الصيانة وتسجيل الزيارات واستهلاك الشمع فقط' :
                   'تسجيل العملاء والأقساط والمصروفات اليومية',
      permissions: getRolePermissions(r)
    }));

    return { roles: rolesList };
  });

  // 3. CREATE User
  fastify.post('/', async (request, reply) => {
    const currentUser = (request as any).user;
    if (currentUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'عفواً، إضافة المستخدمين تتطلب صلاحية مدير النظام' });
    }

    try {
      const parsed = createUserSchema.parse(request.body);
      
      // Check existing username
      const existing = await db.select().from(users).where(eq(users.username, parsed.username));
      if (existing.length > 0) {
        return reply.status(400).send({ error: 'اسم المستخدم مسجل مسبقاً، يرجى اختيار اسم آخر' });
      }

      const newId = randomUUID();
      const pwdHash = await hashPassword(parsed.password);

      await db.insert(users).values({
        id: newId,
        username: parsed.username,
        passwordHash: pwdHash,
        role: parsed.role,
        isActive: true,
        createdAt: new Date(),
        version: 1
      });

      // Link to employee if provided
      if (parsed.employeeId) {
        await db.update(employees).set({ userId: newId }).where(eq(employees.id, parsed.employeeId));
      }

      // Log audit
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId: currentUser.id,
        entityName: 'users',
        entityId: newId,
        action: 'CREATE_USER',
        newValues: { username: parsed.username, role: parsed.role },
        createdAt: new Date()
      });

      return { success: true, message: 'تم إنشاء المستخدم بنجاح', id: newId };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(400).send({ error: e.errors ? e.errors[0].message : 'بيانات غير صحيحة' });
    }
  });

  // 4. UPDATE User
  fastify.put('/:id', async (request, reply) => {
    const currentUser = (request as any).user;
    const { id } = request.params as { id: string };

    if (currentUser.role !== 'ADMIN' && currentUser.id !== id) {
      return reply.status(403).send({ error: 'غير مصرح لك بتعديل بيانات هذا الحساب' });
    }

    try {
      const parsed = updateUserSchema.parse(request.body);
      const userList = await db.select().from(users).where(eq(users.id, id));
      if (userList.length === 0) {
        return reply.status(404).send({ error: 'المستخدم غير موجود' });
      }

      // Prevent deactivating own admin account
      if (currentUser.id === id && parsed.isActive === false) {
        return reply.status(400).send({ error: 'لا يمكنك تعطيل حسابك الشخصي الحالي' });
      }

      const updates: any = {};
      if (parsed.role && currentUser.role === 'ADMIN') updates.role = parsed.role;
      if (parsed.isActive !== undefined && currentUser.role === 'ADMIN') updates.isActive = parsed.isActive;
      if (parsed.password && parsed.password.trim().length >= 4) {
        updates.passwordHash = await hashPassword(parsed.password.trim());
      }

      if (Object.keys(updates).length > 0) {
        await db.update(users).set(updates).where(eq(users.id, id));
      }

      // Handle employee link/unlink if provided by ADMIN
      if (currentUser.role === 'ADMIN' && parsed.employeeId !== undefined) {
        // Unlink previous
        await db.update(employees).set({ userId: null }).where(eq(employees.userId, id));
        // Link new if specified
        if (parsed.employeeId) {
          await db.update(employees).set({ userId: id }).where(eq(employees.id, parsed.employeeId));
        }
      }

      // Audit log
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId: currentUser.id,
        entityName: 'users',
        entityId: id,
        action: 'UPDATE_USER',
        newValues: updates,
        createdAt: new Date()
      });

      return { success: true, message: 'تم تحديث بيانات المستخدم بنجاح' };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(400).send({ error: e.errors ? e.errors[0].message : 'فشل تحديث البيانات' });
    }
  });

  // 5. DELETE / DEACTIVATE User
  fastify.delete('/:id', async (request, reply) => {
    const currentUser = (request as any).user;
    const { id } = request.params as { id: string };

    if (currentUser.role !== 'ADMIN') {
      return reply.status(403).send({ error: 'حذف المستخدمين يتطلب صلاحية مدير النظام' });
    }

    if (currentUser.id === id) {
      return reply.status(400).send({ error: 'لا يمكنك حذف الحساب الخاص بك أثناء تسجيل الدخول منه' });
    }

    try {
      // Unlink any linked employees
      await db.update(employees).set({ userId: null }).where(eq(employees.userId, id));

      // Invalidate all active sessions for this user
      await db.delete(sessions).where(eq(sessions.userId, id));

      // Delete user
      await db.delete(users).where(eq(users.id, id));

      // Audit log
      await db.insert(auditLogs).values({
        id: randomUUID(),
        userId: currentUser.id,
        entityName: 'users',
        entityId: id,
        action: 'DELETE_USER',
        createdAt: new Date()
      });

      return { success: true, message: 'تم حذف حساب المستخدم بنجاح' };
    } catch (e: any) {
      request.log.error(e);
      return reply.status(500).send({ error: 'فشل في حذف المستخدم' });
    }
  });
}

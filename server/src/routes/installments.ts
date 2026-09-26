import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { installments, customers } from '../db/schema.js';
import { eq, and, lte, isNull, desc } from 'drizzle-orm';
import { verifyAuth } from '../utils/auth.js';
import { hasPermission } from '../utils/rbac.js';
import z from 'zod';
import crypto from 'crypto';

const installmentSchema = z.object({
  customerId: z.string().min(1),
  amount: z.number().positive(),
  dueDate: z.string(),
  notes: z.string().optional().nullable(),
});

function uuidv4() {
  return crypto.randomUUID();
}

export default async function installmentsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  const requirePermission = (permission: string) => async (request: any, reply: any) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: 'ليس لديك صلاحية' });
    }
  };

  // 1. Get Installments (Pending / Paid)
  fastify.get('/', {
    preHandler: [requirePermission('installments.view')]
  }, async (request, reply) => {
    const status = (request.query as any).status || 'pending'; // pending, paid
    
    // In SQLite Drizzle, joining is a bit more verbose, let's just do two queries for simplicity or a simple join.
    const allInstallments = await db.select({
      id: installments.id,
      amount: installments.amount,
      dueDate: installments.dueDate,
      isPaid: installments.isPaid,
      paidDate: installments.paidDate,
      customerName: customers.name,
      customerPhone: customers.phone1,
      customerCode: customers.customerCode,
    })
    .from(installments)
    .leftJoin(customers, eq(installments.customerId, customers.id))
    .where(eq(installments.isPaid, status === 'paid'))
    .orderBy(desc(installments.dueDate));

    return { data: allInstallments };
  });

  // 2. Add Installment
  fastify.post('/', {
    preHandler: [requirePermission('installments.create')]
  }, async (request, reply) => {
    const data = installmentSchema.parse(request.body);
    const id = uuidv4();
    await db.insert(installments).values({
      id,
      customerId: data.customerId,
      amount: data.amount,
      dueDate: data.dueDate,
      notes: data.notes,
      createdAt: new Date(),
    });
    return { success: true, id };
  });

  // 3. Mark as Paid
  fastify.put('/:id/pay', {
    preHandler: [requirePermission('installments.update')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const today = new Date().toISOString().split('T')[0];
    await db.update(installments).set({
      isPaid: true,
      paidDate: today
    }).where(eq(installments.id, id));
    return { success: true };
  });
}

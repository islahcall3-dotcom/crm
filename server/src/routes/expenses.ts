import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { expenses } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { verifyAuth } from '../utils/auth.js';
import { hasPermission } from '../utils/rbac.js';
import z from 'zod';
import crypto from 'crypto';

const expenseSchema = z.object({
  amount: z.number().positive(),
  category: z.string().min(1),
  description: z.string().min(1),
  expenseDate: z.string(),
});

function uuidv4() {
  return crypto.randomUUID();
}

export default async function expensesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  const requirePermission = (permission: string) => async (request: any, reply: any) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: 'ليس لديك صلاحية' });
    }
  };

  // 1. Get Expenses
  fastify.get('/', {
    preHandler: [requirePermission('expenses.view')]
  }, async (request, reply) => {
    const allExpenses = await db.select().from(expenses).orderBy(desc(expenses.expenseDate));
    return { data: allExpenses };
  });

  // 2. Add Expense
  fastify.post('/', {
    preHandler: [requirePermission('expenses.create')]
  }, async (request, reply) => {
    const data = expenseSchema.parse(request.body);
    const id = uuidv4();
    await db.insert(expenses).values({
      id,
      amount: data.amount,
      category: data.category,
      description: data.description,
      expenseDate: data.expenseDate,
      createdAt: new Date(),
    });
    return { success: true, id };
  });
}

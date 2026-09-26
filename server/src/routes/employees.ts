import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { employees } from '../db/schema.js';
import { verifyAuth } from '../utils/auth.js';
import { hasPermission } from '../utils/rbac.js';
import z from 'zod';
import crypto from 'crypto';

const employeeSchema = z.object({
  name: z.string().min(1),
  isTechnician: z.boolean(),
});

function uuidv4() {
  return crypto.randomUUID();
}

export default async function employeesRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  const requirePermission = (permission: string) => async (request: any, reply: any) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: 'ليس لديك صلاحية' });
    }
  };

  // 1. Get Employees
  fastify.get('/', {
    preHandler: [requirePermission('employees.view')]
  }, async (request, reply) => {
    const allEmployees = await db.select().from(employees);
    return { data: allEmployees };
  });

  // 2. Add Employee
  fastify.post('/', {
    preHandler: [requirePermission('employees.create')]
  }, async (request, reply) => {
    const data = employeeSchema.parse(request.body);
    const id = uuidv4();
    await db.insert(employees).values({
      id,
      name: data.name,
      isTechnician: data.isTechnician,
    });
    return { success: true, id };
  });
}

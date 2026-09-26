import Fastify from 'fastify'
import cors from '@fastify/cors'
import cookie from '@fastify/cookie'
import rateLimit from '@fastify/rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { db } from './db/db.js'
import { sql } from 'drizzle-orm'
import authRoutes from './routes/auth.js'
import customerRoutes from './routes/customers.js'
import lookupRoutes from './routes/lookups.js'

import helmet from '@fastify/helmet'

dotenv.config({ path: path.resolve(process.cwd(), '../.env') })

const fastify = Fastify({
  logger: true,
  bodyLimit: 50 * 1024 * 1024
})

fastify.register(helmet, { global: true })

fastify.register(cors, {
  origin: true,
  credentials: true
})

fastify.register(cookie)
fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute'
})

// Centralized Error Handling
fastify.setErrorHandler(function (error, request, reply) {
  this.log.error(error)
  // Hide stack trace and internal details from the client in production
  if (error.validation) {
    return reply.status(400).send({ error: 'بيانات غير صحيحة', details: error.validation })
  }
  if (error.statusCode === 429) {
    return reply.status(429).send({ error: 'عذراً، تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً' })
  }
  if (error.statusCode && error.statusCode < 500) {
    return reply.status(error.statusCode).send({ error: error.message })
  }
  // Generic 500
  reply.status(500).send({ error: 'حدث خطأ داخلي في الخادم، يرجى المحاولة لاحقاً' })
})

fastify.register(authRoutes, { prefix: '/api/v1/auth' })
fastify.register(customerRoutes, { prefix: '/api/v1/customers' })
fastify.register(lookupRoutes, { prefix: '/api/v1/lookups' })
import maintenanceRoutes from './routes/maintenance.js'
import installmentsRoutes from './routes/installments.js'
import expensesRoutes from './routes/expenses.js'
import inventoryRoutes from './routes/inventory.js'
import employeesRoutes from './routes/employees.js'
import reportsRoutes from './routes/reports.js'
import dashboardRoutes from './routes/dashboard.js'
import usersRoutes from './routes/users.js'
import settingsRoutes from './routes/settings.js'

fastify.register(maintenanceRoutes, { prefix: '/api/v1/maintenance' })
fastify.register(installmentsRoutes, { prefix: '/api/v1/installments' })
fastify.register(expensesRoutes, { prefix: '/api/v1/expenses' })
fastify.register(inventoryRoutes, { prefix: '/api/v1/inventory' })
fastify.register(employeesRoutes, { prefix: '/api/v1/employees' })
fastify.register(reportsRoutes, { prefix: '/api/v1/reports' })
fastify.register(dashboardRoutes, { prefix: '/api/v1/dashboard' })
fastify.register(usersRoutes, { prefix: '/api/v1/users' })
fastify.register(settingsRoutes, { prefix: '/api/v1/settings' })

fastify.get('/api/v1/healthz', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() }
})

fastify.get('/api/v1/readyz', async (request, reply) => {
  try {
    const res = await db.get(sql`SELECT 1`);
    if (res) {
      return { status: 'ready', db: 'connected', timestamp: new Date().toISOString() }
    }
    reply.status(503).send({ status: 'error', message: 'DB not ready' })
  } catch (error) {
    reply.status(503).send({ status: 'error', message: 'DB connection failed' })
  }
})

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 8080
    await fastify.listen({ port, host: '0.0.0.0' })
    console.log(`Server listening on port ${port}`)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()

import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { users, sessions } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyPassword, createSession, invalidateSession, hashSessionToken } from '../utils/auth.js';
import { getRolePermissions } from '../utils/rbac.js';
import z from 'zod';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1)
});

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/login', {
    config: {
      rateLimit: {
        max: 50, // Increased for development
        timeWindow: '1 minute'
      }
    }
  }, async (request, reply) => {
    try {
      const { username, password } = loginSchema.parse(request.body);
      
      const userList = await db.select().from(users).where(eq(users.username, username));
      const user = userList[0];
      
      if (!user || !user.isActive) {
        return reply.status(401).send({ error: 'بيانات الدخول غير صحيحة أو الحساب معطل' });
      }

      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return reply.status(401).send({ error: 'بيانات الدخول غير صحيحة' });
      }

      const { token, maxAge } = await createSession(user.id);
      
      reply.setCookie('sessionId', token, {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: maxAge / 1000
      });

      return { success: true, role: user.role };
    } catch (e) {
      console.error('Login error:', e);
      return reply.status(400).send({ error: 'بيانات غير صالحة' });
    }
  });

  fastify.post('/logout', async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    if (sessionId) {
      await invalidateSession(sessionId);
    }
    reply.clearCookie('sessionId', { path: '/' });
    return { success: true };
  });

  fastify.get('/me', async (request, reply) => {
    const sessionId = request.cookies.sessionId;
    if (!sessionId) {
      return reply.status(401).send({ error: 'غير مصرح' });
    }

    const tokenHash = hashSessionToken(sessionId);
    const sessionList = await db.select().from(sessions).where(eq(sessions.id, tokenHash));
    const session = sessionList[0];
    
    if (!session || new Date(session.expiresAt) < new Date()) {
      reply.clearCookie('sessionId', { path: '/' });
      return reply.status(401).send({ error: 'انتهت الجلسة' });
    }

    const userList = await db.select().from(users).where(eq(users.id, session.userId));
    const user = userList[0];
    if (!user || !user.isActive) {
      return reply.status(401).send({ error: 'المستخدم غير موجود أو معطل' });
    }

    return { 
      user: { id: user.id, username: user.username, role: user.role },
      permissions: getRolePermissions(user.role) 
    };
  });
}

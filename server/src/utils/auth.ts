import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db/db.js';
import { sessions, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { FastifyRequest, FastifyReply } from 'fastify';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId: string): Promise<{ token: string, maxAge: number }> {
  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  const idleMaxAge = 1 * 24 * 60 * 60 * 1000;

  await db.insert(sessions).values({
    id: tokenHash,
    userId,
    expiresAt: new Date(Date.now() + maxAge),
    idleExpiresAt: new Date(Date.now() + idleMaxAge)
  });

  return { token, maxAge };
}

export async function invalidateSession(token: string) {
  const tokenHash = hashSessionToken(token);
  await db.delete(sessions).where(eq(sessions.id, tokenHash));
}

// Global hook compatible auth checker
export async function verifyAuth(request: FastifyRequest, reply: FastifyReply) {
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
    reply.clearCookie('sessionId', { path: '/' });
    return reply.status(401).send({ error: 'حسابك معطل أو محذوف' });
  }

  // Attach user to request for further RBAC checks
  (request as any).user = user;
}

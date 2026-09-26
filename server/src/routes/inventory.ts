import { FastifyInstance } from 'fastify';
import { db } from '../db/db.js';
import { inventory } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { verifyAuth } from '../utils/auth.js';
import { hasPermission } from '../utils/rbac.js';
import z from 'zod';
import crypto from 'crypto';

const inventorySchema = z.object({
  itemName: z.string().min(1),
  category: z.string().optional().default('spare'),
  quantity: z.number().int().min(0),
  unitPrice: z.number().min(0),
});

function uuidv4() {
  return crypto.randomUUID();
}

export default async function inventoryRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', verifyAuth);

  const requirePermission = (permission: string) => async (request: any, reply: any) => {
    if (!hasPermission(request.user.role, permission)) {
      return reply.status(403).send({ error: 'ليس لديك صلاحية' });
    }
  };

  // 1. Get Inventory + Summary Stats
  fastify.get('/', {
    preHandler: [requirePermission('inventory.view')]
  }, async (request, reply) => {
    const allItems = await db.select().from(inventory);
    
    const totalItems = allItems.length;
    const totalQuantity = allItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalValue = allItems.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.unitPrice || 0)), 0);
    const lowStockCount = allItems.filter(i => (i.quantity || 0) <= 5).length;
    const totalCandles = allItems.filter(i => i.category === 'candle').reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalSpares = allItems.filter(i => i.category === 'spare').reduce((acc, curr) => acc + (curr.quantity || 0), 0);

    return { 
      data: allItems,
      stats: {
        totalItems,
        totalQuantity,
        totalValue: Math.round(totalValue * 100) / 100,
        lowStockCount,
        totalCandles,
        totalSpares
      }
    };
  });

  // 2. Add Item (with smart merge if item already exists)
  fastify.post('/', {
    preHandler: [requirePermission('inventory.create')]
  }, async (request, reply) => {
    try {
      const data = inventorySchema.parse(request.body);

      // Check if item already exists
      const existing = await db.select().from(inventory).where(eq(inventory.itemName, data.itemName));
      if (existing[0]) {
        // Automatically add to existing stock and update price if provided
        const newQty = existing[0].quantity + data.quantity;
        const newPrice = data.unitPrice > 0 ? data.unitPrice : existing[0].unitPrice;
        await db.update(inventory).set({
          quantity: newQty,
          unitPrice: newPrice,
          category: data.category || existing[0].category
        }).where(eq(inventory.id, existing[0].id));

        return { 
          success: true, 
          id: existing[0].id, 
          merged: true,
          message: `تم إضافة ${data.quantity} قطعة إلى رصيد الصنف ليصبح ${newQty} قطعة`
        };
      }

      const id = uuidv4();
      await db.insert(inventory).values({
        id,
        itemName: data.itemName,
        category: data.category || 'spare',
        quantity: data.quantity,
        unitPrice: data.unitPrice,
      });
      return { success: true, id };
    } catch (err: any) {
      return reply.status(400).send({ error: err.message || 'حدث خطأ أثناء حفظ الصنف' });
    }
  });

  // 3. Update Item (Full Update or Stock Adjustment)
  fastify.put('/:id', {
    preHandler: [requirePermission('inventory.update')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    const body = request.body as any;
    
    const itemRes = await db.select().from(inventory).where(eq(inventory.id, id));
    if (!itemRes[0]) return reply.status(404).send({ error: 'المنتج غير موجود' });
    
    const updateData: any = {};
    if (typeof body.itemName === 'string') updateData.itemName = body.itemName;
    if (typeof body.unitPrice === 'number') updateData.unitPrice = body.unitPrice;
    
    if (typeof body.quantity === 'number') {
      updateData.quantity = body.quantity;
    } else if (typeof body.adjustment === 'number') {
      updateData.quantity = Math.max(0, itemRes[0].quantity + body.adjustment);
    }
    
    await db.update(inventory).set(updateData).where(eq(inventory.id, id));
    return { success: true };
  });

  // 4. Delete Item
  fastify.delete('/:id', {
    preHandler: [requirePermission('inventory.delete')]
  }, async (request, reply) => {
    const { id } = request.params as any;
    await db.delete(inventory).where(eq(inventory.id, id));
    return { success: true };
  });
}

import { Router, type IRouter } from "express";
import { db, ordersTable } from "@workspace/db";
import { desc } from "drizzle-orm";
import {
  ListOrdersResponse,
  CreateOrderBody,
  CreateOrderResponse,
  GetOrderRevenueResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/orders", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt));
  res.json(ListOrdersResponse.parse(orders));
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [order] = await db
    .insert(ordersTable)
    .values({
      ...parsed.data,
      discountRate: parsed.data.discountRate ?? 0,
    })
    .returning();

  res.status(201).json(CreateOrderResponse.parse(order));
});

router.get("/orders/revenue", async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);
  const totalRevenue = orders.reduce((sum, o) => sum + o.finalPrice, 0);
  const totalOrders = orders.length;
  const totalDiscount = orders.reduce(
    (sum, o) => sum + (o.totalPrice - o.finalPrice),
    0
  );
  const ordersWithVoucher = orders.filter((o) => o.voucherCode).length;

  res.json(
    GetOrderRevenueResponse.parse({
      totalRevenue,
      totalOrders,
      totalDiscount,
      ordersWithVoucher,
    })
  );
});

export default router;

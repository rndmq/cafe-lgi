import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, menusTable } from "@workspace/db";
import {
  ListMenusQueryParams,
  ListMenusResponse,
  CreateMenuBody,
  CreateMenuResponse,
  GetMenuParams,
  GetMenuResponse,
  UpdateMenuParams,
  UpdateMenuBody,
  UpdateMenuResponse,
  DeleteMenuParams,
  DeleteMenuResponse,
  GetMenuSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/menus/summary", async (_req, res): Promise<void> => {
  const menus = await db.select().from(menusTable).orderBy(asc(menusTable.orderIndex));
  const total = menus.length;
  const available = menus.filter((m) => m.isAvailable).length;
  const makanan = menus.filter((m) => m.category === "Makanan").length;
  const minuman = menus.filter((m) => m.category === "Minuman").length;
  res.json(
    GetMenuSummaryResponse.parse({
      total,
      available,
      byCategory: { Makanan: makanan, Minuman: minuman },
    })
  );
});

router.get("/menus", async (req, res): Promise<void> => {
  const query = ListMenusQueryParams.safeParse(req.query);
  const menus = await db.select().from(menusTable).orderBy(asc(menusTable.orderIndex));

  let filtered = menus;
  if (query.success) {
    if (query.data.category) {
      filtered = filtered.filter((m) => m.category === query.data.category);
    }
    if (query.data.available !== undefined) {
      filtered = filtered.filter((m) => m.isAvailable === query.data.available);
    }
  }

  res.json(ListMenusResponse.parse(filtered.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))));
});

router.post("/menus", async (req, res): Promise<void> => {
  const parsed = CreateMenuBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const count = await db.$count(menusTable);
  const [menu] = await db
    .insert(menusTable)
    .values({
      ...parsed.data,
      isDefault: false,
      orderIndex: count,
    })
    .returning();

  res.status(201).json(CreateMenuResponse.parse({ ...menu, createdAt: menu.createdAt.toISOString() }));
});

router.get("/menus/:id", async (req, res): Promise<void> => {
  const params = GetMenuParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [menu] = await db.select().from(menusTable).where(eq(menusTable.id, params.data.id));

  if (!menu) {
    res.status(404).json({ error: "Menu not found" });
    return;
  }

  res.json(GetMenuResponse.parse({ ...menu, createdAt: menu.createdAt.toISOString() }));
});

router.patch("/menus/:id", async (req, res): Promise<void> => {
  const params = UpdateMenuParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMenuBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [menu] = await db
    .update(menusTable)
    .set(parsed.data)
    .where(eq(menusTable.id, params.data.id))
    .returning();

  if (!menu) {
    res.status(404).json({ error: "Menu not found" });
    return;
  }

  res.json(UpdateMenuResponse.parse({ ...menu, createdAt: menu.createdAt.toISOString() }));
});

router.delete("/menus/:id", async (req, res): Promise<void> => {
  const params = DeleteMenuParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db.delete(menusTable).where(eq(menusTable.id, params.data.id)).returning();

  if (!deleted) {
    res.status(404).json({ error: "Menu not found" });
    return;
  }

  res.json(DeleteMenuResponse.parse({ success: true }));
});

export default router;

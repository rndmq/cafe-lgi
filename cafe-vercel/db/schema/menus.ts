import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const menusTable = pgTable("menus", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  category: text("category").notNull().default("Makanan"),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  orderIndex: integer("order_index").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMenuSchema = createInsertSchema(menusTable).omit({ id: true, createdAt: true });
export type InsertMenu = z.infer<typeof insertMenuSchema>;
export type Menu = typeof menusTable.$inferSelect;

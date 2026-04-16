import { pgTable, text, serial, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const queueIndustryEnum = pgEnum("queue_industry", [
  "hospital",
  "bank",
  "salon",
  "college",
  "government",
  "retail",
  "other",
]);

export const queueStatusEnum = pgEnum("queue_status", ["active", "paused", "closed"]);

export const queuesTable = pgTable("queues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  industry: queueIndustryEnum("industry").notNull(),
  location: text("location").notNull(),
  avgServiceTimeMinutes: integer("avg_service_time_minutes").notNull().default(5),
  status: queueStatusEnum("status").notNull().default("active"),
  maxCapacity: integer("max_capacity").default(100),
  openAt: text("open_at"),
  closeAt: text("close_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertQueueSchema = createInsertSchema(queuesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertQueue = z.infer<typeof insertQueueSchema>;
export type Queue = typeof queuesTable.$inferSelect;

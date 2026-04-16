import { pgTable, text, serial, timestamp, integer, pgEnum, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { queuesTable } from "./queues";

export const tokenStatusEnum = pgEnum("token_status", [
  "waiting",
  "called",
  "serving",
  "completed",
  "skipped",
  "left",
  "no_show",
]);

export const tokenPriorityEnum = pgEnum("token_priority", [
  "normal",
  "vip",
  "emergency",
]);

export const tokensTable = pgTable("tokens", {
  id: serial("id").primaryKey(),
  queueId: integer("queue_id")
    .notNull()
    .references(() => queuesTable.id),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id),
  tokenNumber: text("token_number").notNull(),
  position: integer("position").notNull(),
  status: tokenStatusEnum("status").notNull().default("waiting"),
  priority: tokenPriorityEnum("priority").notNull().default("normal"),
  estimatedWaitMinutes: integer("estimated_wait_minutes").notNull().default(0),
  noShowProbability: real("no_show_probability").notNull().default(0.1),
  arrivalConfirmed: boolean("arrival_confirmed").notNull().default(false),
  notes: text("notes"),
  leaveReason: text("leave_reason"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
  calledAt: timestamp("called_at"),
  completedAt: timestamp("completed_at"),
});

export const insertTokenSchema = createInsertSchema(tokensTable).omit({
  id: true,
  joinedAt: true,
});
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokensTable.$inferSelect;

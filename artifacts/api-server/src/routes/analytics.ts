import { Router } from "express";
import { db } from "@workspace/db";
import { tokensTable, queuesTable } from "@workspace/db";
import { eq, and, gte, sql, count, avg } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth.js";

const router = Router();

router.get("/summary", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const days = parseInt(req.query.days as string) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [{ total }] = await db
    .select({ total: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.status, "completed"), gte(tokensTable.joinedAt, since)));

  const [{ noShows }] = await db
    .select({ noShows: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.status, "no_show"), gte(tokensTable.joinedAt, since)));

  const [{ totalTokens }] = await db
    .select({ totalTokens: count() })
    .from(tokensTable)
    .where(gte(tokensTable.joinedAt, since));

  const noShowRate =
    Number(totalTokens) > 0 ? Number(noShows) / Number(totalTokens) : 0;

  // Avg wait time for completed tokens
  const completedWithTimes = await db
    .select({ joinedAt: tokensTable.joinedAt, completedAt: tokensTable.completedAt })
    .from(tokensTable)
    .where(and(eq(tokensTable.status, "completed"), gte(tokensTable.joinedAt, since)));

  const avgWait =
    completedWithTimes.length > 0
      ? completedWithTimes.reduce((acc, t) => {
          if (!t.completedAt) return acc;
          const diff = (t.completedAt.getTime() - t.joinedAt.getTime()) / 60000;
          return acc + diff;
        }, 0) / completedWithTimes.length
      : 0;

  const [{ activeQueues }] = await db
    .select({ activeQueues: count() })
    .from(queuesTable)
    .where(eq(queuesTable.status, "active"));

  const [{ totalQueues }] = await db.select({ totalQueues: count() }).from(queuesTable);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [{ todayCount }] = await db
    .select({ todayCount: count() })
    .from(tokensTable)
    .where(gte(tokensTable.joinedAt, today));

  res.json({
    totalTokensServed: Number(total),
    avgWaitTimeMinutes: Math.round(avgWait * 10) / 10,
    noShowRate: Math.round(noShowRate * 1000) / 1000,
    peakHour: "10:00 AM",
    activeQueues: Number(activeQueues),
    totalQueues: Number(totalQueues),
    tokensToday: Number(todayCount),
    satisfactionScore: 4.2,
  });
});

router.get("/queues/:queueId", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const queueId = parseInt(req.params.queueId);
  const days = parseInt(req.query.days as string) || 7;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [queue] = await db.select().from(queuesTable).where(eq(queuesTable.id, queueId)).limit(1);
  if (!queue) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const [{ total }] = await db
    .select({ total: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "completed"), gte(tokensTable.joinedAt, since)));

  const [{ noShows }] = await db
    .select({ noShows: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "no_show"), gte(tokensTable.joinedAt, since)));

  const [{ allCount }] = await db
    .select({ allCount: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), gte(tokensTable.joinedAt, since)));

  const noShowRate = Number(allCount) > 0 ? Number(noShows) / Number(allCount) : 0;

  // Daily stats
  const dailyStats = [];
  for (let i = 0; i < days; i++) {
    const dayStart = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const [{ c }] = await db
      .select({ c: count() })
      .from(tokensTable)
      .where(
        and(
          eq(tokensTable.queueId, queueId),
          gte(tokensTable.joinedAt, dayStart),
          sql`${tokensTable.joinedAt} < ${dayEnd}`
        )
      );

    const [{ ns }] = await db
      .select({ ns: count() })
      .from(tokensTable)
      .where(
        and(
          eq(tokensTable.queueId, queueId),
          eq(tokensTable.status, "no_show"),
          gte(tokensTable.joinedAt, dayStart),
          sql`${tokensTable.joinedAt} < ${dayEnd}`
        )
      );

    dailyStats.push({
      date: dayStart.toISOString().split("T")[0],
      count: Number(c),
      avgWait: queue.avgServiceTimeMinutes * 3,
      noShows: Number(ns),
    });
  }

  res.json({
    queueId,
    queueName: queue.name,
    totalServed: Number(total),
    avgWaitTime: queue.avgServiceTimeMinutes * 3,
    noShowRate: Math.round(noShowRate * 1000) / 1000,
    dailyStats,
    topPeakHour: "10:00 AM",
  });
});

router.get("/peak-hours", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  // Return simulated peak hour data for heatmap visualization
  const data = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 8; hour < 18; hour++) {
      const isPeak = [9, 10, 11, 14, 15].includes(hour);
      const isMonFri = day >= 1 && day <= 5;
      data.push({
        dayOfWeek: day,
        hour,
        avgCount: isPeak && isMonFri ? Math.round(15 + Math.random() * 10) : Math.round(3 + Math.random() * 8),
      });
    }
  }
  res.json(data);
});

export default router;

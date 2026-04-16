import { Router } from "express";
import { db } from "@workspace/db";
import { queuesTable, tokensTable } from "@workspace/db";
import { eq, and, sql, count } from "drizzle-orm";
import { requireAuth, requireRole } from "../lib/auth.js";
import {
  CreateQueueBody,
  UpdateQueueBody,
  PauseQueueBody,
  ListQueuesQueryParams,
} from "@workspace/api-zod";

const router = Router();

function formatQueue(q: typeof queuesTable.$inferSelect, currentCount: number, estimatedWait: number) {
  return {
    id: q.id,
    name: q.name,
    description: q.description,
    industry: q.industry,
    location: q.location,
    avgServiceTimeMinutes: q.avgServiceTimeMinutes,
    status: q.status,
    maxCapacity: q.maxCapacity,
    currentCount,
    estimatedWaitMinutes: estimatedWait,
    openAt: q.openAt,
    closeAt: q.closeAt,
    createdAt: q.createdAt,
  };
}

router.get("/", async (req, res) => {
  const parsed = ListQueuesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let query = db.select().from(queuesTable).$dynamic();

  if (params.industry) {
    query = query.where(eq(queuesTable.industry, params.industry as "hospital" | "bank" | "salon" | "college" | "government" | "retail" | "other"));
  } else if (params.active !== undefined) {
    if (params.active) {
      query = query.where(eq(queuesTable.status, "active"));
    }
  }

  const queues = await query;

  const result = await Promise.all(
    queues.map(async (q) => {
      const [{ c }] = await db
        .select({ c: count() })
        .from(tokensTable)
        .where(and(eq(tokensTable.queueId, q.id), eq(tokensTable.status, "waiting")));
      const waiting = Number(c);
      const estimatedWait = waiting * q.avgServiceTimeMinutes;
      return formatQueue(q, waiting, estimatedWait);
    })
  );

  res.json(result);
});

router.post("/", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const parsed = CreateQueueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const [queue] = await db.insert(queuesTable).values(parsed.data as typeof queuesTable.$inferInsert).returning();
  res.status(201).json(formatQueue(queue, 0, 0));
});

router.get("/:queueId", async (req, res) => {
  const queueId = parseInt(req.params.queueId);
  if (isNaN(queueId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const [queue] = await db.select().from(queuesTable).where(eq(queuesTable.id, queueId)).limit(1);
  if (!queue) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const tokens = await db
    .select()
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId)))
    .orderBy(tokensTable.position);

  const waitingTokens = tokens.filter((t) => t.status === "waiting");
  const calledToken = tokens.find((t) => t.status === "called" || t.status === "serving") || null;

  const estimatedWait = waitingTokens.length * queue.avgServiceTimeMinutes;

  res.json({
    ...formatQueue(queue, waitingTokens.length, estimatedWait),
    tokens: tokens.map((t) => ({
      id: t.id,
      queueId: t.queueId,
      userId: t.userId,
      tokenNumber: t.tokenNumber,
      position: t.position,
      status: t.status,
      priority: t.priority,
      estimatedWaitMinutes: t.estimatedWaitMinutes,
      noShowProbability: t.noShowProbability,
      arrivalConfirmed: t.arrivalConfirmed,
      joinedAt: t.joinedAt,
      calledAt: t.calledAt,
      completedAt: t.completedAt,
    })),
    calledToken: calledToken
      ? {
          id: calledToken.id,
          queueId: calledToken.queueId,
          userId: calledToken.userId,
          tokenNumber: calledToken.tokenNumber,
          position: calledToken.position,
          status: calledToken.status,
          priority: calledToken.priority,
          estimatedWaitMinutes: calledToken.estimatedWaitMinutes,
          noShowProbability: calledToken.noShowProbability,
          arrivalConfirmed: calledToken.arrivalConfirmed,
          joinedAt: calledToken.joinedAt,
          calledAt: calledToken.calledAt,
          completedAt: calledToken.completedAt,
        }
      : null,
  });
});

router.patch("/:queueId", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const queueId = parseInt(req.params.queueId);
  if (isNaN(queueId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const parsed = UpdateQueueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error", message: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(queuesTable)
    .set(parsed.data as Partial<typeof queuesTable.$inferInsert>)
    .where(eq(queuesTable.id, queueId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const [{ c }] = await db
    .select({ c: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "waiting")));

  res.json(formatQueue(updated, Number(c), Number(c) * updated.avgServiceTimeMinutes));
});

router.post("/:queueId/pause", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const queueId = parseInt(req.params.queueId);
  if (isNaN(queueId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const parsed = PauseQueueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "validation_error" });
    return;
  }

  const newStatus = parsed.data.paused ? "paused" : "active";
  const [updated] = await db
    .update(queuesTable)
    .set({ status: newStatus })
    .where(eq(queuesTable.id, queueId))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const [{ c }] = await db
    .select({ c: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "waiting")));

  res.json(formatQueue(updated, Number(c), Number(c) * updated.avgServiceTimeMinutes));
});

router.post("/:queueId/call-next", requireAuth, requireRole("admin", "staff"), async (req, res) => {
  const queueId = parseInt(req.params.queueId);
  if (isNaN(queueId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  // Mark any currently "called" tokens as no_show before calling next
  await db
    .update(tokensTable)
    .set({ status: "no_show" })
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "called")));

  // Get next waiting token by priority then position
  const waitingTokens = await db
    .select()
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "waiting")))
    .orderBy(tokensTable.position);

  // Sort by priority: emergency first, then vip, then normal, then by position
  const priorityOrder: Record<string, number> = { emergency: 0, vip: 1, normal: 2 };
  waitingTokens.sort((a, b) => {
    const pa = priorityOrder[a.priority] ?? 2;
    const pb = priorityOrder[b.priority] ?? 2;
    if (pa !== pb) return pa - pb;
    return a.position - b.position;
  });

  const nextToken = waitingTokens[0];
  if (!nextToken) {
    res.status(404).json({ error: "no_tokens", message: "No one waiting in queue" });
    return;
  }

  const [called] = await db
    .update(tokensTable)
    .set({ status: "called", calledAt: new Date() })
    .where(eq(tokensTable.id, nextToken.id))
    .returning();

  res.json({
    id: called.id,
    queueId: called.queueId,
    userId: called.userId,
    tokenNumber: called.tokenNumber,
    position: called.position,
    status: called.status,
    priority: called.priority,
    estimatedWaitMinutes: called.estimatedWaitMinutes,
    noShowProbability: called.noShowProbability,
    arrivalConfirmed: called.arrivalConfirmed,
    joinedAt: called.joinedAt,
    calledAt: called.calledAt,
    completedAt: called.completedAt,
  });
});

export default router;

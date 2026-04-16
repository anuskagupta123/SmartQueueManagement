import { Router } from "express";
import { db } from "@workspace/db";
import { tokensTable, queuesTable, usersTable } from "@workspace/db";
import { eq, and, count, sql } from "drizzle-orm";
import { requireAuth } from "../lib/auth.js";
import {
  JoinQueueBody,
  LeaveQueueBody,
  ListTokensQueryParams,
} from "@workspace/api-zod";
import {
  predictWaitTime,
  predictNoShowProbability,
  generateTokenNumber,
  isPeakHour,
} from "../lib/queue-intelligence.js";

const router = Router();

function formatToken(t: typeof tokensTable.$inferSelect) {
  return {
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
  };
}

// List tokens for a queue
router.get("/queues/:queueId/tokens", async (req, res) => {
  const queueId = parseInt(req.params.queueId);
  if (isNaN(queueId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const parsed = ListTokensQueryParams.safeParse(req.query);
  const status = parsed.success ? parsed.data.status : undefined;

  let conditions = [eq(tokensTable.queueId, queueId)];
  if (status) {
    conditions.push(eq(tokensTable.status, status as "waiting" | "called" | "serving" | "completed" | "skipped" | "left" | "no_show"));
  }

  const tokens = await db
    .select()
    .from(tokensTable)
    .where(and(...conditions))
    .orderBy(tokensTable.position);

  res.json(tokens.map(formatToken));
});

// Join a queue
router.post("/queues/:queueId/tokens", requireAuth, async (req, res) => {
  const queueId = parseInt(req.params.queueId);
  if (isNaN(queueId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const [queue] = await db.select().from(queuesTable).where(eq(queuesTable.id, queueId)).limit(1);
  if (!queue) {
    res.status(404).json({ error: "not_found", message: "Queue not found" });
    return;
  }
  if (queue.status !== "active") {
    res.status(400).json({ error: "queue_inactive", message: "Queue is not active" });
    return;
  }

  const parsed = JoinQueueBody.safeParse(req.body);
  const body = parsed.success ? parsed.data : {};

  // Check if user already in this queue
  const existing = await db
    .select({ id: tokensTable.id })
    .from(tokensTable)
    .where(
      and(
        eq(tokensTable.queueId, queueId),
        eq(tokensTable.userId, req.user!.id),
        eq(tokensTable.status, "waiting")
      )
    )
    .limit(1);

  if (existing.length > 0) {
    res.status(400).json({ error: "already_in_queue", message: "Already waiting in this queue" });
    return;
  }

  // Get current queue count for position assignment
  const [{ c }] = await db
    .select({ c: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "waiting")));

  const position = Number(c) + 1;

  // Get total tokens for token number sequence
  const [{ total }] = await db
    .select({ total: count() })
    .from(tokensTable)
    .where(eq(tokensTable.queueId, queueId));

  const tokenNumber = generateTokenNumber(queueId, Number(total) + 1, queue.industry);

  // AI prediction
  const { minutes: estimatedWait } = predictWaitTime(position, {
    waitingCount: Number(c),
    avgServiceTimeMinutes: queue.avgServiceTimeMinutes,
    noShowRate: 0.12,
    staffEfficiency: 1.0,
  });

  const noShowProbability = predictNoShowProbability(0, 0.12, isPeakHour(new Date().getHours()));

  const [token] = await db
    .insert(tokensTable)
    .values({
      queueId,
      userId: req.user!.id,
      tokenNumber,
      position,
      status: "waiting",
      priority: (body.priority as "normal" | "vip" | "emergency") || "normal",
      estimatedWaitMinutes: estimatedWait,
      noShowProbability,
      notes: body.notes,
    })
    .returning();

  res.status(201).json(formatToken(token));
});

// Get a specific token
router.get("/tokens/:tokenId", requireAuth, async (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  if (isNaN(tokenId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const [token] = await db.select().from(tokensTable).where(eq(tokensTable.id, tokenId)).limit(1);
  if (!token) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const [queue] = await db.select().from(queuesTable).where(eq(queuesTable.id, token.queueId)).limit(1);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, token.userId)).limit(1);

  const { confidence } = predictWaitTime(token.position, {
    waitingCount: token.position,
    avgServiceTimeMinutes: queue?.avgServiceTimeMinutes || 5,
    noShowRate: 0.12,
    staffEfficiency: 1.0,
  });

  // Generate QR code data (the frontend will render it)
  const qrCode = `smartqueue://token/${token.id}/${token.tokenNumber}`;

  res.json({
    ...formatToken(token),
    queue: queue
      ? {
          id: queue.id,
          name: queue.name,
          description: queue.description,
          industry: queue.industry,
          location: queue.location,
          avgServiceTimeMinutes: queue.avgServiceTimeMinutes,
          status: queue.status,
          maxCapacity: queue.maxCapacity,
          currentCount: 0,
          estimatedWaitMinutes: token.estimatedWaitMinutes,
          openAt: queue.openAt,
          closeAt: queue.closeAt,
          createdAt: queue.createdAt,
        }
      : null,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          createdAt: user.createdAt,
        }
      : null,
    qrCode,
    confidenceLevel: confidence,
  });
});

// Confirm arrival (QR scan)
router.post("/tokens/:tokenId/confirm", requireAuth, async (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  if (isNaN(tokenId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const [token] = await db
    .update(tokensTable)
    .set({ arrivalConfirmed: true, noShowProbability: 0.02 })
    .where(eq(tokensTable.id, tokenId))
    .returning();

  if (!token) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  res.json(formatToken(token));
});

// Leave the queue
router.post("/tokens/:tokenId/leave", requireAuth, async (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  if (isNaN(tokenId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const parsed = LeaveQueueBody.safeParse(req.body);
  const reason = parsed.success ? parsed.data.reason : undefined;

  const [token] = await db
    .update(tokensTable)
    .set({ status: "left", leaveReason: reason, completedAt: new Date() })
    .where(eq(tokensTable.id, tokenId))
    .returning();

  if (!token) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  // Recalculate positions for remaining waiters
  await recalculatePositions(token.queueId);

  res.json(formatToken(token));
});

// Skip a token
router.post("/tokens/:tokenId/skip", requireAuth, async (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  if (isNaN(tokenId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const [token] = await db
    .update(tokensTable)
    .set({ status: "skipped" })
    .where(eq(tokensTable.id, tokenId))
    .returning();

  if (!token) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  await recalculatePositions(token.queueId);
  res.json(formatToken(token));
});

// Complete a token
router.post("/tokens/:tokenId/complete", requireAuth, async (req, res) => {
  const tokenId = parseInt(req.params.tokenId);
  if (isNaN(tokenId)) {
    res.status(400).json({ error: "invalid_id" });
    return;
  }

  const [token] = await db
    .update(tokensTable)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(tokensTable.id, tokenId))
    .returning();

  if (!token) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  await recalculatePositions(token.queueId);
  res.json(formatToken(token));
});

// Get my active tokens
router.get("/my-tokens", requireAuth, async (req, res) => {
  const tokens = await db
    .select({
      token: tokensTable,
      queue: queuesTable,
    })
    .from(tokensTable)
    .leftJoin(queuesTable, eq(tokensTable.queueId, queuesTable.id))
    .where(
      and(
        eq(tokensTable.userId, req.user!.id),
        sql`${tokensTable.status} IN ('waiting', 'called', 'serving')`
      )
    )
    .orderBy(tokensTable.joinedAt);

  res.json(
    tokens.map(({ token, queue }) => ({
      ...formatToken(token),
      queue: queue
        ? {
            id: queue.id,
            name: queue.name,
            description: queue.description,
            industry: queue.industry,
            location: queue.location,
            avgServiceTimeMinutes: queue.avgServiceTimeMinutes,
            status: queue.status,
            maxCapacity: queue.maxCapacity,
            currentCount: 0,
            estimatedWaitMinutes: token.estimatedWaitMinutes,
            openAt: queue.openAt,
            closeAt: queue.closeAt,
            createdAt: queue.createdAt,
          }
        : null,
      user: null,
      qrCode: `smartqueue://token/${token.id}/${token.tokenNumber}`,
      confidenceLevel: token.position <= 3 ? "high" : token.position <= 8 ? "medium" : "low",
    }))
  );
});

async function recalculatePositions(queueId: number) {
  const waitingTokens = await db
    .select({ id: tokensTable.id })
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "waiting")))
    .orderBy(tokensTable.position);

  await Promise.all(
    waitingTokens.map((t, i) =>
      db
        .update(tokensTable)
        .set({ position: i + 1 })
        .where(eq(tokensTable.id, t.id))
    )
  );
}

export default router;

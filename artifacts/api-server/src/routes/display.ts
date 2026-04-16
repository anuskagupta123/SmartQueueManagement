import { Router } from "express";
import { db } from "@workspace/db";
import { tokensTable, queuesTable } from "@workspace/db";
import { eq, and, sql, count } from "drizzle-orm";

const router = Router();

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

  // Currently serving (called or serving)
  const calledTokens = await db
    .select()
    .from(tokensTable)
    .where(
      and(
        eq(tokensTable.queueId, queueId),
        sql`${tokensTable.status} IN ('called', 'serving')`
      )
    )
    .limit(1);

  const currentlyServing = calledTokens.length > 0 ? calledTokens[0].tokenNumber : "---";

  // Recently completed/called tokens
  const recent = await db
    .select({ tokenNumber: tokensTable.tokenNumber })
    .from(tokensTable)
    .where(
      and(
        eq(tokensTable.queueId, queueId),
        sql`${tokensTable.status} IN ('completed', 'called', 'serving')`
      )
    )
    .limit(5);

  const [{ waitingCount }] = await db
    .select({ waitingCount: count() })
    .from(tokensTable)
    .where(and(eq(tokensTable.queueId, queueId), eq(tokensTable.status, "waiting")));

  const estimatedWait = Number(waitingCount) * queue.avgServiceTimeMinutes;

  res.json({
    queueName: queue.name,
    currentlyServing,
    waitingCount: Number(waitingCount),
    recentlyCalled: recent.map((r) => r.tokenNumber),
    estimatedWaitMinutes: estimatedWait,
    status: queue.status,
  });
});

export default router;

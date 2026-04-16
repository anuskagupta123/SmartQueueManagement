import { useParams } from "wouter";
import {
  useGetQueue, useCallNext, usePauseQueue, useSkipToken, useCompleteToken,
  getGetQueueQueryKey
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge, NoShowBar, StatusIndicator } from "@/components/ui-custom/badges";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatWaitTime } from "@/lib/utils";
import { Link } from "wouter";
import {
  ArrowLeft, ChevronRight, SkipForward, CheckCircle2, Pause, Play,
  Hash, Users, Clock, Monitor, Zap
} from "lucide-react";

export default function QueueControl() {
  const { queueId } = useParams<{ queueId: string }>();
  const id = parseInt(queueId || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queue, isLoading } = useGetQueue(id, {
    query: {
      enabled: !!id,
      queryKey: getGetQueueQueryKey(id),
      refetchInterval: 10000,
    },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey(id) });

  const callNextMutation = useCallNext({
    mutation: {
      onSuccess: (token) => {
        toast({ title: `Calling ${token.tokenNumber}`, description: "Token has been called to the counter." });
        invalidate();
      },
      onError: (err) => {
        toast({ title: "No tokens waiting", description: "The queue is currently empty.", variant: "destructive" });
      },
    },
  });

  const pauseMutation = usePauseQueue({
    mutation: {
      onSuccess: (q) => {
        toast({ title: q.status === "paused" ? "Queue paused" : "Queue resumed" });
        invalidate();
      },
    },
  });

  const skipMutation = useSkipToken({
    mutation: {
      onSuccess: () => {
        toast({ title: "Token skipped" });
        invalidate();
      },
    },
  });

  const completeMutation = useCompleteToken({
    mutation: {
      onSuccess: () => {
        toast({ title: "Marked as served" });
        invalidate();
      },
    },
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!queue) {
    return (
      <AdminLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Queue not found.</p>
          <Link href="/admin/queues"><Button className="mt-4">Back to Queues</Button></Link>
        </div>
      </AdminLayout>
    );
  }

  const waitingTokens = (queue.tokens || []).filter(t => t.status === "waiting");
  const calledToken = queue.calledToken;
  const isPaused = queue.status === "paused";

  return (
    <AdminLayout>
      <Link href="/admin/queues" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Queues
      </Link>

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{queue.name}</h1>
          <p className="text-muted-foreground text-sm capitalize">{queue.industry} · {queue.location}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusIndicator status={queue.status} />
          <Button
            variant={isPaused ? "default" : "outline"}
            size="sm"
            onClick={() => pauseMutation.mutate({ queueId: id, data: { paused: !isPaused } })}
            disabled={pauseMutation.isPending}
          >
            {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>
          <Link href={`/display/${id}`} target="_blank">
            <Button variant="outline" size="sm">
              <Monitor className="w-4 h-4 mr-1" /> Display
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { label: "Waiting", value: queue.currentCount, icon: <Users className="w-4 h-4" /> },
          { label: "Est. Wait", value: formatWaitTime(queue.estimatedWaitMinutes), icon: <Clock className="w-4 h-4" /> },
          { label: "Service Time", value: `${queue.avgServiceTimeMinutes}m`, icon: <Zap className="w-4 h-4" /> },
          { label: "Capacity", value: queue.maxCapacity || "∞", icon: <Hash className="w-4 h-4" /> },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="text-muted-foreground">{stat.icon}</div>
              <div>
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Token List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Queue ({waitingTokens.length} waiting)</CardTitle>
            </CardHeader>
            <CardContent>
              {waitingTokens.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No one waiting in queue</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {waitingTokens.map((token) => (
                    <div key={token.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {token.position}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-sm">{token.tokenNumber}</div>
                          <div className="text-xs text-muted-foreground">~{formatWaitTime(token.estimatedWaitMinutes)}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={token.priority} />
                        <NoShowBar probability={Math.round((token.noShowProbability || 0) * 100)} />
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => skipMutation.mutate({ tokenId: token.id })}
                            disabled={skipMutation.isPending}
                            className="h-7 px-2 text-xs"
                          >
                            <SkipForward className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => completeMutation.mutate({ tokenId: token.id })}
                            disabled={completeMutation.isPending}
                            className="h-7 px-2 text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Currently Serving */}
          <Card className={calledToken ? "border-amber-300 bg-amber-50 dark:bg-amber-900/10" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Now Serving</CardTitle>
            </CardHeader>
            <CardContent>
              {calledToken ? (
                <div className="text-center">
                  <div className="text-5xl font-black text-amber-600 dark:text-amber-400 mb-2">{calledToken.tokenNumber}</div>
                  <PriorityBadge priority={calledToken.priority} />
                  <div className="mt-3 flex gap-2">
                    <Button
                      className="flex-1"
                      size="sm"
                      onClick={() => completeMutation.mutate({ tokenId: calledToken.id })}
                      disabled={completeMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Served
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => skipMutation.mutate({ tokenId: calledToken.id })}
                      disabled={skipMutation.isPending}
                    >
                      <SkipForward className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No token currently called
                </div>
              )}
            </CardContent>
          </Card>

          {/* Call Next Button */}
          <Button
            className="w-full h-16 text-lg font-bold"
            onClick={() => callNextMutation.mutate({ queueId: id })}
            disabled={callNextMutation.isPending || isPaused || waitingTokens.length === 0}
          >
            <ChevronRight className="w-6 h-6 mr-2" />
            {callNextMutation.isPending ? "Calling..." : "Call Next"}
          </Button>

          {/* Next in line */}
          {waitingTokens.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">Next in Line</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {waitingTokens.slice(0, 3).map((token, i) => (
                  <div key={token.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">#{i + 1}</span>
                      <span className="font-mono font-bold">{token.tokenNumber}</span>
                    </div>
                    <PriorityBadge priority={token.priority} />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

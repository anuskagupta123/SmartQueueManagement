import { useParams, useLocation } from "wouter";
import { useGetQueue, useJoinQueue, getGetQueueQueryKey } from "@workspace/api-client-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator, PriorityBadge, NoShowBar } from "@/components/ui-custom/badges";
import { useAuth } from "@/lib/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatWaitTime } from "@/lib/utils";
import { MapPin, Clock, Users, ArrowLeft, CheckCircle, Hash } from "lucide-react";
import { Link } from "wouter";

export default function QueueDetail() {
  const { queueId } = useParams<{ queueId: string }>();
  const id = parseInt(queueId || "0");
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: queue, isLoading } = useGetQueue(id, {
    query: { enabled: !!id, queryKey: getGetQueueQueryKey(id) },
  });

  const joinMutation = useJoinQueue({
    mutation: {
      onSuccess: (token) => {
        toast({ title: "Joined queue!", description: `Your token number is ${token.tokenNumber}` });
        queryClient.invalidateQueries({ queryKey: getGetQueueQueryKey(id) });
        setLocation(`/token/${token.id}`);
      },
      onError: (err) => {
        toast({ title: "Failed to join", description: (err as Error).message || "Already in queue or not available.", variant: "destructive" });
      },
    },
  });

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!queue) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Queue not found.</p>
          <Link href="/queues"><Button className="mt-4">Back to Queues</Button></Link>
        </div>
      </CustomerLayout>
    );
  }

  const waitingTokens = queue.tokens?.filter(t => t.status === "waiting") || [];
  const calledToken = queue.calledToken;

  return (
    <CustomerLayout>
      <Link href="/queues" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Queues
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Queue Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{queue.name}</CardTitle>
                  {queue.description && <p className="text-muted-foreground mt-1">{queue.description}</p>}
                </div>
                <StatusIndicator status={queue.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {queue.location}
              </div>
              {queue.openAt && queue.closeAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Open: {queue.openAt} – {queue.closeAt}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div className="text-center p-4 bg-muted/40 rounded-lg">
                  <div className="text-3xl font-bold text-primary">{queue.currentCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Waiting</div>
                </div>
                <div className="text-center p-4 bg-muted/40 rounded-lg">
                  <div className="text-3xl font-bold">{formatWaitTime(queue.estimatedWaitMinutes)}</div>
                  <div className="text-xs text-muted-foreground mt-1">Est. Wait</div>
                </div>
                <div className="text-center p-4 bg-muted/40 rounded-lg">
                  <div className="text-3xl font-bold">{queue.avgServiceTimeMinutes}m</div>
                  <div className="text-xs text-muted-foreground mt-1">Per Person</div>
                </div>
              </div>

              {user && queue.status === "active" && (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => joinMutation.mutate({ queueId: id, data: { priority: "normal" } })}
                  disabled={joinMutation.isPending}
                >
                  {joinMutation.isPending ? "Joining..." : "Join This Queue"}
                </Button>
              )}
              {!user && (
                <Link href="/login">
                  <Button className="w-full" size="lg">Login to Join Queue</Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Currently Serving */}
          {calledToken && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                    <Hash className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-amber-800 dark:text-amber-200">Now Serving</div>
                    <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{calledToken.tokenNumber}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Token List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4" /> Current Queue ({waitingTokens.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waitingTokens.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No one waiting right now</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {waitingTokens.slice(0, 10).map((token) => (
                    <div key={token.id} className="flex items-center justify-between p-3 rounded-lg border bg-card text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs">
                          {token.position}
                        </div>
                        <span className="font-mono font-semibold">{token.tokenNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={token.priority} />
                        <span className="text-muted-foreground">{formatWaitTime(token.estimatedWaitMinutes)}</span>
                      </div>
                    </div>
                  ))}
                  {waitingTokens.length > 10 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      +{waitingTokens.length - 10} more in queue
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Queue Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Industry</span>
                <span className="capitalize font-medium">{queue.industry}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-medium">{queue.maxCapacity || "Unlimited"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <StatusIndicator status={queue.status} />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 text-sm">
              <div className="font-semibold text-primary mb-1">AI Prediction</div>
              <p className="text-muted-foreground text-xs">
                Based on current queue length and historical service times, your expected wait is approximately <strong>{formatWaitTime(queue.estimatedWaitMinutes + queue.avgServiceTimeMinutes)}</strong> from now.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}

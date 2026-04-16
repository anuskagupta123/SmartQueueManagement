import { useAuth } from "@/lib/AuthContext";
import { useGetMyTokens, getGetMyTokensQueryKey } from "@workspace/api-client-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PriorityBadge, ConfidenceBadge } from "@/components/ui-custom/badges";
import { QRCodeDisplay } from "@/components/ui-custom/qr-code";
import { formatWaitTime } from "@/lib/utils";
import { MapPin, Clock, ArrowRight, ActivitySquare } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: tokens, isLoading } = useGetMyTokens();

  const activeTokens = tokens?.filter(t => 
    t.status === "waiting" || t.status === "called" || t.status === "serving"
  ) || [];

  const pastTokens = tokens?.filter(t => 
    t.status === "completed" || t.status === "skipped" || t.status === "left" || t.status === "no_show"
  ) || [];

  return (
    <CustomerLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground mt-2">Manage your virtual queues and active tokens.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <ActivitySquare className="w-6 h-6 text-primary" /> Active Tokens
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="h-40 bg-muted/50"></CardContent>
                </Card>
              ))}
            </div>
          ) : activeTokens.length > 0 ? (
            <div className="space-y-4">
              {activeTokens.map(token => (
                <Card key={token.id} className={`overflow-hidden border-l-4 ${token.status === 'called' ? 'border-l-amber-500' : 'border-l-primary'}`}>
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground mb-1">Queue</div>
                            <h3 className="text-xl font-bold">Queue #{token.queueId}</h3>
                          </div>
                          <Badge variant={token.status === "called" ? "destructive" : "secondary"} className="text-sm">
                            {token.status.toUpperCase()}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Your Number</div>
                            <div className="text-3xl font-bold tracking-tighter">{token.tokenNumber}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Position</div>
                            <div className="text-3xl font-bold tracking-tighter">{token.position}</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <PriorityBadge priority={token.priority} />
                        </div>
                        
                        <Link href={`/token/${token.id}`}>
                          <Button variant="secondary" className="w-full">
                            View Details <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                      
                      <div className="bg-muted/30 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border md:w-64 shrink-0">
                        <div className="text-center mb-4">
                          <div className="text-sm font-medium text-muted-foreground mb-1">Estimated Wait</div>
                          <div className="text-3xl font-bold text-primary">{formatWaitTime(token.estimatedWaitMinutes)}</div>
                        </div>
                        <div className="mt-2 p-2 bg-white rounded-md">
                          <QRCodeDisplay value={JSON.stringify({ tokenId: token.id })} size={100} />
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">Show this at arrival</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Clock className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No active tokens</h3>
                <p className="text-muted-foreground mt-2 mb-6">You aren't in any queues right now.</p>
                <Link href="/queues">
                  <Button>Find a Queue</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your past queue history</CardDescription>
            </CardHeader>
            <CardContent>
              {pastTokens.length > 0 ? (
                <div className="space-y-4">
                  {pastTokens.slice(0, 5).map(token => (
                    <div key={token.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <div className="font-medium text-sm">Token {token.tokenNumber}</div>
                        <div className="text-xs text-muted-foreground">Queue #{token.queueId}</div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {token.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 text-muted-foreground text-sm">
                  No past history available.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerLayout>
  );
}

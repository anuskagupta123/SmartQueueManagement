import { useGetAnalyticsSummary, useListQueues, getGetAnalyticsSummaryQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { StatusIndicator } from "@/components/ui-custom/badges";
import { formatWaitTime } from "@/lib/utils";
import {
  Users, Clock, BarChart3, TrendingUp, Activity, ArrowRight,
  CheckCircle2, XCircle, AlertTriangle, Layers
} from "lucide-react";

export default function AdminDashboard() {
  const { data: summary, isLoading: summaryLoading } = useGetAnalyticsSummary(
    { days: 7 },
    { query: { queryKey: getGetAnalyticsSummaryQueryKey({ days: 7 }) } }
  );
  const { data: queues, isLoading: queuesLoading } = useListQueues({});

  const statCards = [
    {
      title: "Tokens Served (7d)",
      value: summary?.totalTokensServed ?? "—",
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: "Avg Wait Time",
      value: summary ? formatWaitTime(summary.avgWaitTimeMinutes) : "—",
      icon: <Clock className="w-5 h-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "No-Show Rate",
      value: summary ? `${(summary.noShowRate * 100).toFixed(1)}%` : "—",
      icon: <XCircle className="w-5 h-5" />,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Active Queues",
      value: summary ? `${summary.activeQueues}/${summary.totalQueues}` : "—",
      icon: <Layers className="w-5 h-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Today's Tokens",
      value: summary?.tokensToday ?? "—",
      icon: <Activity className="w-5 h-5" />,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Satisfaction",
      value: summary?.satisfactionScore ? `${summary.satisfactionScore}/5` : "—",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-teal-600",
      bg: "bg-teal-50 dark:bg-teal-900/20",
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Real-time overview of all queue operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {summaryLoading ? <div className="h-6 w-12 bg-muted animate-pulse rounded" /> : stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.title}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Queues Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>All Queues</CardTitle>
            <CardDescription>Current status and performance</CardDescription>
          </div>
          <Link href="/admin/queues">
            <Button variant="outline" size="sm">
              Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {queuesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(queues || []).map((queue) => (
                <div key={queue.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <StatusIndicator status={queue.status} />
                    <div>
                      <div className="font-medium text-sm">{queue.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{queue.industry} · {queue.location}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center hidden sm:block">
                      <div className="font-semibold">{queue.currentCount}</div>
                      <div className="text-xs text-muted-foreground">waiting</div>
                    </div>
                    <div className="text-center hidden sm:block">
                      <div className="font-semibold">{formatWaitTime(queue.estimatedWaitMinutes)}</div>
                      <div className="text-xs text-muted-foreground">est. wait</div>
                    </div>
                    <Link href={`/admin/queues/${queue.id}`}>
                      <Button size="sm" variant="outline">
                        Control <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

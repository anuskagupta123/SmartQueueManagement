import { useState } from "react";
import { Link } from "wouter";
import { useListQueues, useJoinQueue, getListQueuesQueryKey } from "@workspace/api-client-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusIndicator } from "@/components/ui-custom/badges";
import { useAuth } from "@/lib/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Users, ArrowRight, Hospital, Building2, Scissors, GraduationCap, Landmark, ShoppingCart, Grid } from "lucide-react";
import { formatWaitTime } from "@/lib/utils";

const INDUSTRY_ICONS: Record<string, React.ReactNode> = {
  hospital: <Hospital className="w-5 h-5" />,
  bank: <Building2 className="w-5 h-5" />,
  salon: <Scissors className="w-5 h-5" />,
  college: <GraduationCap className="w-5 h-5" />,
  government: <Landmark className="w-5 h-5" />,
  retail: <ShoppingCart className="w-5 h-5" />,
  other: <Grid className="w-5 h-5" />,
};

const INDUSTRY_COLORS: Record<string, string> = {
  hospital: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  bank: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  salon: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  college: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  government: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  retail: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  other: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300",
};

export default function QueuesPage() {
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = industryFilter !== "all" ? { industry: industryFilter } : {};
  const { data: queues, isLoading } = useListQueues(params);

  const joinMutation = useJoinQueue({
    mutation: {
      onSuccess: () => {
        toast({ title: "Joined queue!", description: "You've been added to the queue." });
        queryClient.invalidateQueries({ queryKey: getListQueuesQueryKey() });
      },
      onError: (err) => {
        toast({ title: "Failed to join", description: (err as Error).message || "Already in queue or queue inactive.", variant: "destructive" });
      },
    },
  });

  const handleJoin = (queueId: number) => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    joinMutation.mutate({ queueId, data: { priority: "normal" } });
  };

  return (
    <CustomerLayout>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Queues</h1>
          <p className="text-muted-foreground mt-1">Find and join a virtual queue near you</p>
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            <SelectItem value="hospital">Hospital</SelectItem>
            <SelectItem value="bank">Bank</SelectItem>
            <SelectItem value="salon">Salon</SelectItem>
            <SelectItem value="college">College</SelectItem>
            <SelectItem value="government">Government</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48 bg-muted/30"></CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(queues || []).map((queue) => (
            <Card key={queue.id} className="group hover:shadow-md transition-all duration-200 border-border/70 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className={`p-2 rounded-lg ${INDUSTRY_COLORS[queue.industry] || INDUSTRY_COLORS.other}`}>
                    {INDUSTRY_ICONS[queue.industry] || INDUSTRY_ICONS.other}
                  </div>
                  <StatusIndicator status={queue.status} />
                </div>
                <CardTitle className="text-lg mt-3">{queue.name}</CardTitle>
                {queue.description && (
                  <CardDescription className="line-clamp-2">{queue.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{queue.location}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Waiting</div>
                      <div className="font-semibold text-sm">{queue.currentCount}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-xs text-muted-foreground">Est. Wait</div>
                      <div className="font-semibold text-sm">{formatWaitTime(queue.estimatedWaitMinutes)}</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    disabled={queue.status !== "active" || joinMutation.isPending}
                    onClick={() => handleJoin(queue.id)}
                    size="sm"
                  >
                    {queue.status !== "active" ? "Unavailable" : "Join Queue"}
                  </Button>
                  <Link href={`/queues/${queue.id}`}>
                    <Button variant="outline" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (queues || []).length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Grid className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium">No queues found</h3>
          <p className="text-sm mt-1">Try a different filter or check back later.</p>
        </div>
      )}
    </CustomerLayout>
  );
}

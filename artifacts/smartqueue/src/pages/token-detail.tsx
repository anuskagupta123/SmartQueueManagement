import { useParams, useLocation } from "wouter";
import { useGetToken, useLeaveQueue, useConfirmArrival, getGetTokenQueryKey, getGetMyTokensQueryKey } from "@workspace/api-client-react";
import { CustomerLayout } from "@/components/layout/CustomerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PriorityBadge, ConfidenceBadge, StatusIndicator, NoShowBar } from "@/components/ui-custom/badges";
import { QRCodeDisplay } from "@/components/ui-custom/qr-code";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatWaitTime } from "@/lib/utils";
import {
  ArrowLeft, Clock, Users, MapPin, CheckCircle2, AlertTriangle, QrCode, LogOut
} from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  waiting: { label: "Waiting", color: "bg-blue-100 text-blue-800", icon: <Clock className="w-4 h-4" /> },
  called: { label: "Called - Please Come Now!", color: "bg-amber-100 text-amber-800", icon: <AlertTriangle className="w-4 h-4" /> },
  serving: { label: "Being Served", color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-4 h-4" /> },
  completed: { label: "Completed", color: "bg-gray-100 text-gray-800", icon: <CheckCircle2 className="w-4 h-4" /> },
  skipped: { label: "Skipped", color: "bg-orange-100 text-orange-800", icon: <AlertTriangle className="w-4 h-4" /> },
  left: { label: "Left Queue", color: "bg-gray-100 text-gray-600", icon: <LogOut className="w-4 h-4" /> },
  no_show: { label: "No Show", color: "bg-red-100 text-red-800", icon: <AlertTriangle className="w-4 h-4" /> },
};

export default function TokenDetail() {
  const { tokenId } = useParams<{ tokenId: string }>();
  const id = parseInt(tokenId || "0");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const { data: token, isLoading } = useGetToken(id, {
    query: { enabled: !!id, queryKey: getGetTokenQueryKey(id), refetchInterval: 15000 },
  });

  const leaveMutation = useLeaveQueue({
    mutation: {
      onSuccess: () => {
        toast({ title: "Left queue", description: "You've been removed from the queue." });
        queryClient.invalidateQueries({ queryKey: getGetMyTokensQueryKey() });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Error", description: "Could not leave the queue.", variant: "destructive" });
      },
    },
  });

  const confirmMutation = useConfirmArrival({
    mutation: {
      onSuccess: () => {
        toast({ title: "Arrival confirmed!", description: "Your no-show probability has been reduced." });
        queryClient.invalidateQueries({ queryKey: getGetTokenQueryKey(id) });
      },
    },
  });

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="max-w-lg mx-auto space-y-6 animate-pulse">
          <div className="h-64 bg-muted rounded-xl"></div>
          <div className="h-32 bg-muted rounded-xl"></div>
        </div>
      </CustomerLayout>
    );
  }

  if (!token) {
    return (
      <CustomerLayout>
        <div className="text-center py-16">
          <p className="text-muted-foreground">Token not found.</p>
          <Link href="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
        </div>
      </CustomerLayout>
    );
  }

  const statusConfig = STATUS_CONFIG[token.status] || STATUS_CONFIG.waiting;
  const isActive = ["waiting", "called", "serving"].includes(token.status);
  const noShowPct = Math.round((token.noShowProbability || 0) * 100);
  const qrValue = token.qrCode || `smartqueue://token/${token.id}/${token.tokenNumber}`;

  return (
    <CustomerLayout>
      <div className="max-w-lg mx-auto">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        {/* Main Token Card */}
        <Card className={`mb-4 overflow-hidden ${token.status === "called" ? "ring-2 ring-amber-400 animate-pulse" : ""}`}>
          <div className="bg-gradient-to-br from-primary to-primary/70 p-8 text-primary-foreground text-center">
            <div className="text-sm font-medium opacity-80 mb-2">Your Token Number</div>
            <div className="text-7xl font-black tracking-tighter mb-2">{token.tokenNumber}</div>
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </div>
          </div>

          <CardContent className="p-6 space-y-4">
            {token.queue && (
              <div>
                <div className="font-semibold text-lg">{token.queue.name}</div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {token.queue.location}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-muted/40 rounded-lg p-3">
                <div className="text-2xl font-bold">{token.position}</div>
                <div className="text-xs text-muted-foreground">Position</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <div className="text-2xl font-bold text-primary">{formatWaitTime(token.estimatedWaitMinutes)}</div>
                <div className="text-xs text-muted-foreground">Est. Wait</div>
              </div>
              <div className="bg-muted/40 rounded-lg p-3">
                <div className="text-2xl font-bold">{token.position > 0 ? token.position - 1 : 0}</div>
                <div className="text-xs text-muted-foreground">Ahead</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <PriorityBadge priority={token.priority} />
              <ConfidenceBadge level={token.confidenceLevel as any} />
              {token.arrivalConfirmed && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Arrived
                </Badge>
              )}
            </div>

            {/* No-show risk */}
            {isActive && noShowPct > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>No-show risk</span>
                  <span>{noShowPct}%</span>
                </div>
                <Progress value={noShowPct} className="h-1.5" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* QR Code Card */}
        <Card className="mb-4">
          <CardContent className="p-6 flex flex-col items-center">
            <QrCode className="w-5 h-5 text-muted-foreground mb-2" />
            <div className="text-sm font-medium mb-4 text-muted-foreground">Show this QR code at the counter</div>
            <QRCodeDisplay value={qrValue} size={180} />
            <div className="text-xs text-muted-foreground mt-3">Token: {token.tokenNumber}</div>
          </CardContent>
        </Card>

        {/* Actions */}
        {isActive && (
          <div className="space-y-2">
            {!token.arrivalConfirmed && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => confirmMutation.mutate({ tokenId: id })}
                disabled={confirmMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {confirmMutation.isPending ? "Confirming..." : "Confirm I Have Arrived"}
              </Button>
            )}

            {!showLeaveConfirm ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowLeaveConfirm(true)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave Queue
              </Button>
            ) : (
              <Card className="border-destructive">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-medium">Are you sure you want to leave?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => leaveMutation.mutate({ tokenId: id, data: { reason: "User left voluntarily" } })}
                      disabled={leaveMutation.isPending}
                    >
                      {leaveMutation.isPending ? "Leaving..." : "Yes, Leave"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => setShowLeaveConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

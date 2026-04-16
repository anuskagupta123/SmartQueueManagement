import { Badge } from "@/components/ui/badge";
import { TokenPriority, TokenDetailConfidenceLevel, QueueStatus } from "@workspace/api-client-react";
import { CheckCircle2, CircleDashed, PauseCircle, XCircle } from "lucide-react";

export function PriorityBadge({ priority }: { priority: TokenPriority }) {
  if (priority === TokenPriority.vip) {
    return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none">VIP</Badge>;
  }
  if (priority === TokenPriority.emergency) {
    return <Badge variant="destructive" className="border-none">Emergency</Badge>;
  }
  return <Badge variant="secondary" className="border-none text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200">Normal</Badge>;
}

export function ConfidenceBadge({ level }: { level: TokenDetailConfidenceLevel | undefined }) {
  if (!level) return null;
  if (level === TokenDetailConfidenceLevel.high) {
    return <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">High Confidence</Badge>;
  }
  if (level === TokenDetailConfidenceLevel.medium) {
    return <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">Medium Confidence</Badge>;
  }
  return <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">Low Confidence</Badge>;
}

export function StatusIndicator({ status }: { status: QueueStatus }) {
  if (status === QueueStatus.active) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
        </span>
        Active
      </div>
    );
  }
  if (status === QueueStatus.paused) {
    return (
      <div className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400 text-sm font-medium">
        <PauseCircle className="w-3.5 h-3.5" />
        Paused
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
      <XCircle className="w-3.5 h-3.5" />
      Closed
    </div>
  );
}

export function NoShowBar({ probability }: { probability: number | undefined }) {
  if (probability === undefined) return null;
  const colorClass = probability > 50 ? "bg-red-500" : probability > 20 ? "bg-yellow-500" : "bg-green-500";
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="w-12 text-right">{probability}% Risk</span>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden flex-1 max-w-[60px]">
        <div className={`h-full ${colorClass}`} style={{ width: `${probability}%` }} />
      </div>
    </div>
  );
}

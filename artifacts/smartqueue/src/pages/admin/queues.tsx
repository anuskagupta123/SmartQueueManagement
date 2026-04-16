import { useState } from "react";
import { useListQueues, useCreateQueue, getListQueuesQueryKey } from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatusIndicator } from "@/components/ui-custom/badges";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatWaitTime } from "@/lib/utils";
import { Plus, ArrowRight, Users, Clock, Settings } from "lucide-react";

export default function AdminQueues() {
  const { data: queues, isLoading } = useListQueues({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    industry: "hospital",
    location: "",
    avgServiceTimeMinutes: "10",
    maxCapacity: "50",
    openAt: "09:00",
    closeAt: "17:00",
  });

  const createMutation = useCreateQueue({
    mutation: {
      onSuccess: () => {
        toast({ title: "Queue created!", description: "New queue is now active." });
        queryClient.invalidateQueries({ queryKey: getListQueuesQueryKey() });
        setOpen(false);
        setForm({ name: "", description: "", industry: "hospital", location: "", avgServiceTimeMinutes: "10", maxCapacity: "50", openAt: "09:00", closeAt: "17:00" });
      },
      onError: () => {
        toast({ title: "Failed to create queue", variant: "destructive" });
      },
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      data: {
        ...form,
        avgServiceTimeMinutes: parseInt(form.avgServiceTimeMinutes),
        maxCapacity: parseInt(form.maxCapacity),
        industry: form.industry as any,
      },
    });
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Manage Queues</h1>
          <p className="text-muted-foreground text-sm mt-1">Create and manage all your queues</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> New Queue</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Queue</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Queue Name</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. General Consultation" required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={form.industry} onValueChange={v => setForm(f => ({ ...f, industry: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["hospital", "bank", "salon", "college", "government", "retail", "other"].map(i => (
                        <SelectItem key={i} value={i} className="capitalize">{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Avg Service (min)</Label>
                  <Input type="number" value={form.avgServiceTimeMinutes} onChange={e => setForm(f => ({ ...f, avgServiceTimeMinutes: e.target.value }))} min="1" max="120" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Block A, Floor 2" required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" value={form.maxCapacity} onChange={e => setForm(f => ({ ...f, maxCapacity: e.target.value }))} min="1" />
                </div>
                <div className="space-y-2">
                  <Label>Opens At</Label>
                  <Input type="time" value={form.openAt} onChange={e => setForm(f => ({ ...f, openAt: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Closes At</Label>
                  <Input type="time" value={form.closeAt} onChange={e => setForm(f => ({ ...f, closeAt: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Queue"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(queues || []).map(queue => (
            <Card key={queue.id} className="group hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{queue.name}</CardTitle>
                  <StatusIndicator status={queue.status} />
                </div>
                <p className="text-xs text-muted-foreground capitalize">{queue.industry} · {queue.location}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3 text-sm">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span><strong className="text-foreground">{queue.currentCount}</strong> waiting</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span><strong className="text-foreground">{formatWaitTime(queue.estimatedWaitMinutes)}</strong> wait</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/queues/${queue.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      Control Panel <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                  <Link href={`/display/${queue.id}`}>
                    <Button size="sm" variant="outline" title="Display Screen">
                      <Settings className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

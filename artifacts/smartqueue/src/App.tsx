import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import QueuesPage from "@/pages/queues";
import QueueDetail from "@/pages/queue-detail";
import TokenDetail from "@/pages/token-detail";
import AdminDashboard from "@/pages/admin/index";
import AdminQueues from "@/pages/admin/queues";
import QueueControl from "@/pages/admin/queue-control";
import DisplayScreen from "@/pages/display-screen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/queues" component={QueuesPage} />
      <Route path="/queues/:queueId" component={QueueDetail} />
      <Route path="/display/:queueId" component={DisplayScreen} />
      <ProtectedRoute path="/dashboard" component={Dashboard} />
      <ProtectedRoute path="/token/:tokenId" component={TokenDetail} />
      <ProtectedRoute path="/admin" component={AdminDashboard} adminOnly />
      <ProtectedRoute path="/admin/queues" component={AdminQueues} adminOnly />
      <ProtectedRoute path="/admin/queues/:queueId" component={QueueControl} adminOnly />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

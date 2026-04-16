import { useAuth } from "@/lib/AuthContext";
import { Redirect, Route, RouteProps } from "wouter";

export function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user.role !== "admin" && user.role !== "staff") {
    return <Redirect to="/dashboard" />;
  }

  return <Route {...rest} component={Component} />;
}

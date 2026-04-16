import { useAuth } from "@/lib/AuthContext";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ActivitySquare, LogOut, User } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
          <ActivitySquare className="w-6 h-6" />
          SmartQueue<span className="text-foreground">AI</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground hidden md:inline-block">
                {user.name} ({user.role})
              </span>
              {user.role === "admin" || user.role === "staff" ? (
                <Link href="/admin">
                  <Button variant="outline" size="sm">Admin</Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

import { Navbar } from "./Navbar";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, ListPlus, Users, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/queues", label: "Manage Queues", icon: ListPlus },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-[calc(100vh-4rem)]">
        <aside className="w-full md:w-64 border-r bg-card shrink-0 flex-col py-4 px-2 hidden md:flex">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-3">
            Admin Menu
          </div>
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                    location === item.href || (location.startsWith(item.href) && item.href !== "/admin")
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}

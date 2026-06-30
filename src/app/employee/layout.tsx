"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, PhoneCall, ClipboardList,
  Calendar, BarChart3, Bell, LogOut, ChevronLeft, Globe,
  Menu, X, Clock
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const employeeMenu = [
  { label: "Dashboard", href: "/employee", icon: <LayoutDashboard size={18} /> },
  { label: "Bookings", href: "/employee/bookings", icon: <ShoppingBag size={18} /> },
  { label: "Follow-Ups", href: "/employee/follow-ups", icon: <PhoneCall size={18} /> },
  { label: "Tasks", href: "/employee/tasks", icon: <ClipboardList size={18} /> },
  { label: "Calendar", href: "/employee/calendar", icon: <Calendar size={18} /> },
  { label: "Performance", href: "/employee/performance", icon: <BarChart3 size={18} /> },
  { label: "Notifications", href: "/employee/notifications", icon: <Bell size={18} /> },
];

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();

  // Auth guard: redirect to login if not authenticated or not employee/admin
  useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || !user || !["EMPLOYEE", "ADMIN"].includes(user.role))) {
      router.push("/auth/login");
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated || !isAuthenticated || !user || !["EMPLOYEE", "ADMIN"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-50 bg-slate-900 border-r border-slate-800/60 flex flex-col transition-all duration-300",
        sidebarOpen ? "w-64" : "w-[72px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 border-b border-slate-800/60 flex items-center justify-between px-4">
          <Link href="/employee" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>L</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: "var(--font-outfit)" }}>
                CRM Panel
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <ChevronLeft size={16} className={cn("transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {employeeMenu.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/employee" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/15 to-blue-500/10 text-cyan-400 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                )}
              >
                <span className={cn("shrink-0", isActive && "text-cyan-400")}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-slate-800/60 p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 transition-colors"
          >
            <Globe size={18} />
            {sidebarOpen && <span>View Site</span>}
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300",
        sidebarOpen ? "lg:ml-64" : "lg:ml-[72px]"
      )}>
        {/* Top Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/60 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <Clock size={14} className="text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/employee/notifications" className="relative p-2 rounded-lg hover:bg-slate-800 transition-colors">
              <Bell size={18} className="text-slate-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            </Link>
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/10">
                <span className="text-white text-xs font-bold">{user?.name?.[0] || "E"}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-200">{user?.name || "Employee"}</p>
                <p className="text-[10px] text-cyan-400 font-medium uppercase tracking-wider">Employee</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Layers, ShoppingBag, Star, Clock,
  Settings, BarChart3, LogOut, Menu, X, ChevronLeft,
  Bell, Globe, CreditCard, Calendar
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const vendorMenu = [
  { label: "Dashboard", href: "/vendor", icon: <LayoutDashboard size={18} /> },
  { label: "My Services", href: "/vendor/services", icon: <Layers size={18} /> },
  { label: "Bookings", href: "/vendor/bookings", icon: <ShoppingBag size={18} /> },
  { label: "Calendar", href: "/vendor/calendar", icon: <Calendar size={18} /> },
  { label: "Reviews", href: "/vendor/reviews", icon: <Star size={18} /> },
  { label: "Availability", href: "/vendor/availability", icon: <Clock size={18} /> },
  { label: "Earnings", href: "/vendor/earnings", icon: <CreditCard size={18} /> },
  { label: "Analytics", href: "/vendor/analytics", icon: <BarChart3 size={18} /> },
  { label: "Settings", href: "/vendor/settings", icon: <Settings size={18} /> },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();

  // Auth guard: redirect to login if not authenticated or not vendor
  useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || !user || user.role !== "VENDOR")) {
      router.push("/auth/login");
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  // Show loading spinner while checking auth
  if (!_hasHydrated || !isAuthenticated || !user || user.role !== "VENDOR") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300",
        sidebarOpen ? "w-64" : "w-[72px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-4">
          <Link href="/vendor" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>L</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>
                <span className="text-emerald-600">Vendor</span>
              </span>
            )}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <ChevronLeft size={16} className={cn("transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {vendorMenu.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/vendor" && pathname?.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}>
                <span className={cn("shrink-0", isActive && "text-emerald-600")}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-3 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
            <Globe size={18} />{sidebarOpen && <span>View Site</span>}
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50">
            <LogOut size={18} />{sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "lg:ml-64" : "lg:ml-[72px]")}>
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block" style={{ fontFamily: "var(--font-outfit)" }}>
              Vendor Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.name?.[0] || "V"}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.vendor?.businessName || user?.name || "Vendor"}</p>
                <p className="text-xs text-gray-500">Vendor Account</p>
              </div>
            </div>
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, Store, ShoppingBag, Star, Tag,
  Menu, Settings, BarChart3, Image, Gift, Bell, LogOut,
  ChevronLeft, FileText, MessageSquare, Layers, Globe,
  CreditCard, X
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const adminMenu = [
  { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={18} /> },
  { label: "Vendors", href: "/admin/vendors", icon: <Store size={18} /> },
  { label: "Services", href: "/admin/services", icon: <Layers size={18} /> },
  { label: "Bookings", href: "/admin/bookings", icon: <ShoppingBag size={18} /> },
  { label: "Categories", href: "/admin/categories", icon: <Tag size={18} /> },
  { label: "Menu Builder", href: "/admin/menu", icon: <Menu size={18} /> },
  { label: "Banners", href: "/admin/banners", icon: <Image size={18} /> },
  { label: "Reviews", href: "/admin/reviews", icon: <Star size={18} /> },
  { label: "Coupons", href: "/admin/coupons", icon: <Gift size={18} /> },
  { label: "Users", href: "/admin/users", icon: <Users size={18} /> },
  { label: "Payments", href: "/admin/payments", icon: <CreditCard size={18} /> },
  { label: "Homepage", href: "/admin/homepage", icon: <Globe size={18} /> },
  { label: "Reports", href: "/admin/reports", icon: <BarChart3 size={18} /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings size={18} /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();

  // Auth guard: redirect to login if not authenticated or not admin
  useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || !user || user.role !== "ADMIN")) {
      router.push("/auth/login");
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  // Show loading spinner while checking auth
  if (!_hasHydrated || !isAuthenticated || !user || user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 bottom-0 z-50 bg-white border-r border-gray-100 flex flex-col transition-all duration-300",
        sidebarOpen ? "w-64" : "w-[72px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="h-16 border-b border-gray-100 flex items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>L</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg gradient-text" style={{ fontFamily: "var(--font-outfit)" }}>
                Admin
              </span>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <ChevronLeft size={16} className={cn("transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {adminMenu.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <span className={cn("shrink-0", isActive && "text-violet-600")}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <Globe size={18} />
            {sidebarOpen && <span>View Site</span>}
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50"
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
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block" style={{ fontFamily: "var(--font-outfit)" }}>
              Admin Panel
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.name?.[0] || "A"}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500">Super Admin</p>
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

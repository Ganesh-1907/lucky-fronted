"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, ShoppingBag, Users, Store,
  UserCheck, LogOut, ChevronLeft, Globe, Menu, X, Shield
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const investorMenu = [
  { label: "Dashboard", href: "/investor", icon: <LayoutDashboard size={18} /> },
  { label: "Revenue", href: "/investor/revenue", icon: <TrendingUp size={18} /> },
  { label: "Bookings", href: "/investor/bookings", icon: <ShoppingBag size={18} /> },
  { label: "Customers", href: "/investor/customers", icon: <Users size={18} /> },
  { label: "Vendors", href: "/investor/vendors", icon: <Store size={18} /> },
  { label: "Employees", href: "/investor/employees", icon: <UserCheck size={18} /> },
];

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && (!isAuthenticated || !user || !["INVESTOR", "ADMIN"].includes(user.role))) {
      router.push("/auth/login");
    }
  }, [_hasHydrated, isAuthenticated, user, router]);

  if (!_hasHydrated || !isAuthenticated || !user || !["INVESTOR", "ADMIN"].includes(user.role)) {
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
          <Link href="/investor" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>L</span>
            </div>
            {sidebarOpen && (
              <div>
                <span className="font-bold text-base gradient-text block leading-tight" style={{ fontFamily: "var(--font-outfit)" }}>
                  Lucky
                </span>
                <span className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-semibold">Investor Portal</span>
              </div>
            )}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
            <ChevronLeft size={16} className={cn("transition-transform", !sidebarOpen && "rotate-180")} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {investorMenu.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/investor" && pathname?.startsWith(item.href));
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
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <Globe size={18} />
            {sidebarOpen && <span>View Site</span>}
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors">
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={cn("flex-1 transition-all duration-300", sidebarOpen ? "lg:ml-64" : "lg:ml-[72px]")}>
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100">
              <Shield size={12} className="text-violet-600" />
              <span className="text-[10px] text-violet-600 font-semibold uppercase tracking-wider">Read-Only Access</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase() || "I"}</span>
              )}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || "Investor"}</p>
              <p className="text-xs text-gray-500">Investor</p>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

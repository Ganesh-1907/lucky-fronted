"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, ShoppingBag, Heart, Settings, Star,
  Calendar, CreditCard, User, MapPin, ArrowRight,
  Gift, Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useMyBookings } from "@/hooks/useApi";
import { cn, formatPrice } from "@/lib/utils";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const statusEmoji: Record<string, string> = {
  PENDING: "⏳",
  CONFIRMED: "✅",
  IN_PROGRESS: "🔄",
  COMPLETED: "🎉",
  CANCELLED: "❌",
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const { data: bookingsRes } = useMyBookings();

  useEffect(() => {
    // Only redirect after Zustand has finished rehydrating from localStorage
    if (_hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, _hasHydrated, router]);

  if (!_hasHydrated || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const bookings = (bookingsRes as any)?.data || [];
  const activeBookings = bookings.filter((b: any) => ["PENDING", "CONFIRMED", "IN_PROGRESS"].includes(b.status));
  const completedBookings = bookings.filter((b: any) => b.status === "COMPLETED");

  const quickActions = [
    {
      label: "My Bookings",
      desc: "View and manage your bookings",
      icon: <ShoppingBag size={22} />,
      href: "/bookings",
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-50",
      count: bookings.length,
    },
    {
      label: "Wishlist",
      desc: "Your saved services",
      icon: <Heart size={22} />,
      href: "/wishlist",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-50",
    },
    {
      label: "Account Settings",
      desc: "Update profile & password",
      icon: <Settings size={22} />,
      href: "/account/settings",
      color: "from-gray-600 to-gray-700",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">My Account</span>
        </nav>

        {/* Welcome Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                Welcome back, {user.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage your bookings, wishlist, and account settings
              </p>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
            >
              Browse Services <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 mb-3">
              <ShoppingBag size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {bookings.length}
            </p>
            <p className="text-xs text-gray-500">Total Bookings</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <Clock size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {activeBookings.length}
            </p>
            <p className="text-xs text-gray-500">Active Bookings</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 mb-3">
              <CheckCircle size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {completedBookings.length}
            </p>
            <p className="text-xs text-gray-500">Completed</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
              <Star size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {completedBookings.length}
            </p>
            <p className="text-xs text-gray-500">Reviews Given</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="md:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              Quick Actions
            </h2>
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:border-violet-100 transition-all"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white bg-gradient-to-br", action.color)}>
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 group-hover:text-violet-600 transition-colors">
                    {action.label}
                    {action.count !== undefined && (
                      <span className="ml-2 text-xs font-normal text-gray-400">({action.count})</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

          {/* Recent Bookings */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                Recent Bookings
              </h2>
              <Link href="/bookings" className="text-sm text-violet-600 font-medium hover:text-violet-700 flex items-center gap-1">
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.slice(0, 4).map((booking: any) => (
                  <div key={booking.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                        <span className="text-xl">{statusEmoji[booking.status] || "📦"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm text-gray-900 truncate">
                              {booking.service?.title || "Service"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              #{booking.bookingNumber} · {booking.bookingDate}
                            </p>
                          </div>
                          <span className={cn(
                            "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0",
                            statusColors[booking.status] || "bg-gray-100 text-gray-600"
                          )}>
                            {booking.status?.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(Number(booking.totalAmount || 0))}
                          </p>
                          {booking.status === "CONFIRMED" && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <Calendar size={11} /> Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <p className="text-5xl mb-4">📦</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-500 text-sm mb-6">
                  Start exploring services and book your first celebration!
                </p>
                <Link
                  href="/services"
                  className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm inline-flex items-center gap-2"
                >
                  Browse Services <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            Account Information
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                <User size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">City</p>
                <p className="text-sm font-medium text-gray-900">{user.city || "Not set"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                <Gift size={16} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Member Since</p>
                <p className="text-sm font-medium text-gray-900">2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

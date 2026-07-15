"use client";

import Link from "next/link";
import {
  TrendingUp, ShoppingBag, DollarSign, Star, ArrowUpRight,
  Layers, Clock, Eye, ChevronRight, Calendar, Loader2
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function VendorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor", "dashboard", "stats"],
    queryFn: () => api.get<any>("/vendors/dashboard/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  const d = data || {};
  const totalEarnings = d.totalEarnings || 0;
  const totalBookings = d.totalBookings || 0;
  const activeServices = d.activeServices || 0;
  const avgRating = d.avgRating || 0;
  const recentBookings: any[] = d.recentBookings || [];

  const stats = [
    { label: "Total Earnings", value: formatPrice(totalEarnings), change: "+18.2%", up: true, icon: <DollarSign size={20} />, color: "from-emerald-500 to-teal-500" },
    { label: "Total Bookings", value: String(totalBookings), change: "+12.5%", up: true, icon: <ShoppingBag size={20} />, color: "from-blue-500 to-indigo-500" },
    { label: "Active Services", value: String(activeServices), change: "+2", up: true, icon: <Layers size={20} />, color: "from-violet-500 to-purple-500" },
    { label: "Avg Rating", value: avgRating.toFixed(1), change: "+0.2", up: true, icon: <Star size={20} />, color: "from-amber-500 to-orange-500" },
  ];

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySchedule = recentBookings
    .filter((b: any) => (b.bookingDate || b.date) === todayStr)
    .slice(0, 5)
    .map((b: any) => ({
      time: b.timeSlot || b.time || "—",
      customer: b.customer || b.client || "—",
      service: b.service || "—",
      status: b.status || "PENDING",
      city: b.city || "",
    }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here&apos;s your business overview.</p>
        </div>
        <Link href="/vendor/services/new" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:opacity-90 transition-opacity">
          + Add New Service
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <span className="flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full bg-green-50 text-green-600">
                <ArrowUpRight size={12} /> {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-emerald-600" />
              <h2 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Today&apos;s Schedule</h2>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
              {todaySchedule.length} bookings
            </span>
          </div>
          <div className="p-4 space-y-3">
            {todaySchedule.length > 0 ? todaySchedule.map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="text-center shrink-0">
                  <p className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{item.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.service}</p>
                  <p className="text-xs text-gray-500">{item.customer} · {item.city}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1 inline-block", statusColors[item.status])}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            )) : (
              <p className="text-center text-sm text-gray-400 py-8">No bookings today 🎉</p>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Recent Bookings</h2>
            <Link href="/vendor/bookings" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">View All →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                  <th className="text-left p-4 font-medium">Booking</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Service</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="text-sm font-mono font-bold text-emerald-600">{booking.id}</p>
                      <p className="text-xs text-gray-500">{booking.customer || booking.client}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm text-gray-700 truncate max-w-[180px]">{booking.service}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900">{booking.bookingDate || booking.date}</p>
                      <p className="text-xs text-gray-500">{booking.timeSlot || booking.time}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-gray-900">{formatPrice(booking.amount)}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", statusColors[booking.status])}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Eye size={16} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-900">Profile Views</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>2,340</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: "72%" }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>38%</p>
          <p className="text-xs text-gray-500 mt-1">Views to bookings</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: "38%" }} />
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-900">Response Time</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>2.4h</p>
          <p className="text-xs text-gray-500 mt-1">Avg. response time</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" style={{ width: "65%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

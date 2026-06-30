"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag, CalendarDays, Calendar, Clock, CheckCircle2,
  UserPlus, Store, MessageSquare, Archive, DollarSign,
  AlertTriangle, ChevronRight, Phone, ArrowUpRight, TrendingUp
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import api from "@/lib/api";

const PIPELINE_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-slate-600/20 text-slate-300 border-slate-600/30",
  CUSTOMER_CONTACTED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  VENDOR_CONTACTED: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  CUSTOMER_DISCUSSION: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  ADVANCE_PAYMENT_PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCE_PAYMENT_RECEIVED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  BOOKING_CONFIRMED: "bg-green-500/15 text-green-400 border-green-500/30",
  PLANNING_STAGE: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  VENDOR_CONFIRMATION_PENDING: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  EVENT_PREPARATION: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  EVENT_ONGOING: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  EVENT_COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CUSTOMER_FEEDBACK_PENDING: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  CLOSED: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
};

function formatPipelineStatus(status: string) {
  return status.replace(/_/g, " ");
}

export default function EmployeeDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res: any = await api.get("/employee/dashboard");
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-800/50 animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-80 rounded-2xl bg-slate-800/50 animate-pulse" />
          <div className="h-80 rounded-2xl bg-slate-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const statCards = [
    { label: "Total Assigned", value: stats.totalAssigned || 0, icon: <ShoppingBag size={18} />, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
    { label: "Today's Events", value: stats.todaysEvents || 0, icon: <Calendar size={18} />, gradient: "from-blue-500 to-blue-600", glow: "shadow-blue-500/20" },
    { label: "Upcoming 7 Days", value: stats.upcomingEvents || 0, icon: <CalendarDays size={18} />, gradient: "from-indigo-500 to-indigo-600", glow: "shadow-indigo-500/20" },
    { label: "Pending Follow-Ups", value: stats.pendingFollowUps || 0, icon: <Clock size={18} />, gradient: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20" },
    { label: "Completed Follow-Ups", value: stats.completedFollowUps || 0, icon: <CheckCircle2 size={18} />, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/20" },
    { label: "New Inquiries", value: stats.newInquiries || 0, icon: <UserPlus size={18} />, gradient: "from-cyan-500 to-cyan-600", glow: "shadow-cyan-500/20" },
    { label: "Vendor Awaiting", value: stats.vendorResponsesAwaiting || 0, icon: <Store size={18} />, gradient: "from-orange-500 to-red-500", glow: "shadow-orange-500/20" },
    { label: "Customer Awaiting", value: stats.customerResponsesAwaiting || 0, icon: <MessageSquare size={18} />, gradient: "from-rose-500 to-pink-600", glow: "shadow-rose-500/20" },
    { label: "Closed Bookings", value: stats.closedBookings || 0, icon: <Archive size={18} />, gradient: "from-slate-500 to-slate-600", glow: "shadow-slate-500/20" },
    { label: "Total Revenue", value: formatPrice(stats.revenue || 0), icon: <DollarSign size={18} />, gradient: "from-green-500 to-emerald-600", glow: "shadow-green-500/20", isRevenue: true },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">Welcome back! Here&apos;s your CRM overview.</p>
        </div>
        <Link
          href="/employee/bookings"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <ShoppingBag size={14} />
          View All Bookings
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/60 transition-all duration-300 group"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className={cn(
              "w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3 shadow-lg",
              stat.gradient, stat.glow
            )}>
              {stat.icon}
            </div>
            <p className={cn(
              "text-xl font-bold text-white",
              stat.isRevenue && "text-lg"
            )} style={{ fontFamily: "var(--font-outfit)" }}>
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Today's Follow-Ups */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-700/40">
            <div className="flex items-center gap-2">
              <Phone size={16} className="text-cyan-400" />
              <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                Today&apos;s Follow-Ups
              </h2>
            </div>
            <Link href="/employee/follow-ups" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-700/30">
            {(data?.todaysFollowUps || []).length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={32} className="text-emerald-500/40 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No follow-ups scheduled for today</p>
              </div>
            ) : (
              (data?.todaysFollowUps || []).map((fu: any) => (
                <div key={fu.id} className="px-5 py-3.5 hover:bg-slate-700/20 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                      <Phone size={14} className="text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{fu.customerName}</p>
                      <p className="text-xs text-slate-500">
                        {fu.followUpTime} {fu.booking ? `• ${fu.booking.bookingNumber}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-1 rounded-full border shrink-0",
                    fu.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : fu.status === "MISSED" ? "bg-red-500/15 text-red-400 border-red-500/30"
                      : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                  )}>
                    {fu.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overdue Follow-Ups */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-700/40">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400" />
              <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                Overdue Follow-Ups
              </h2>
            </div>
            <Link href="/employee/follow-ups?filter=overdue" className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center gap-1">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-700/30">
            {(data?.overdueFollowUps || []).length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle2 size={32} className="text-emerald-500/40 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No overdue follow-ups — great job!</p>
              </div>
            ) : (
              (data?.overdueFollowUps || []).map((fu: any) => (
                <div key={fu.id} className="px-5 py-3.5 hover:bg-slate-700/20 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                      <AlertTriangle size={14} className="text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{fu.customerName}</p>
                      <p className="text-xs text-red-400/70">
                        Due: {formatDate(fu.followUpDate)} {fu.booking ? `• ${fu.booking.bookingNumber}` : ""}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/employee/follow-ups"
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium shrink-0"
                  >
                    Act Now →
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-700/40">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-400" />
            <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
              Recent Bookings
            </h2>
          </div>
          <Link href="/employee/bookings" className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
            View All <ChevronRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase tracking-wider border-b border-slate-700/30">
                <th className="text-left p-4 font-medium">Booking ID</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Service</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Pipeline</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Priority</th>
                <th className="text-left p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentBookings || []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-slate-500">
                    No bookings assigned yet
                  </td>
                </tr>
              ) : (
                (data?.recentBookings || []).map((booking: any) => (
                  <tr key={booking.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                    <td className="p-4">
                      <span className="text-sm font-mono font-medium text-cyan-400">{booking.bookingNumber}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-slate-200">{booking.client?.name}</p>
                      <p className="text-xs text-slate-500">{booking.client?.phone}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm text-slate-400 truncate max-w-[200px]">{booking.service?.title}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-white">{formatPrice(Number(booking.totalAmount))}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[9px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide",
                        PIPELINE_COLORS[booking.pipelineStatus] || "bg-slate-700 text-slate-300"
                      )}>
                        {formatPipelineStatus(booking.pipelineStatus)}
                      </span>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                        booking.priority === "URGENT" ? "bg-red-500/15 text-red-400"
                          : booking.priority === "HIGH" ? "bg-orange-500/15 text-orange-400"
                          : booking.priority === "MEDIUM" ? "bg-blue-500/15 text-blue-400"
                          : "bg-slate-700/50 text-slate-400"
                      )}>
                        {booking.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/employee/bookings/${booking.id}`}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                      >
                        Open <ArrowUpRight size={10} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

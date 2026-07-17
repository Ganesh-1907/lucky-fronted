"use client";

import Link from "next/link";
import {
  DollarSign, Star, ShoppingBag, Layers, Calendar, 
  Clock, AlertCircle, RefreshCw, ChevronRight,
  Plus, CalendarDays, ExternalLink
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-violet-50 text-violet-700 border-violet-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function VendorDashboard() {
  const { user } = useAuthStore();
  
  const { data: statsData, isLoading, isError, refetch } = useQuery({
    queryKey: ["vendor", "dashboard", "stats"],
    queryFn: () => api.get<any>("/vendors/dashboard/stats"),
    refetchInterval: 15000,
    staleTime: 60000,
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse pb-12">
        <div className="h-8 bg-gray-200 rounded-lg w-48 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="grid lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to load dashboard</h2>
        <p className="text-gray-500 mb-6">There was an error fetching your data. Please try again.</p>
        <button onClick={() => refetch()} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl inline-flex items-center gap-2 hover:bg-gray-800 transition-colors text-sm font-medium">
          <RefreshCw size={16} /> Retry Data Fetch
        </button>
      </div>
    );
  }

  const d = statsData?.data || statsData || {};

  const totalEarnings = d.totalEarnings || 0;
  const totalBookings = d.totalBookings || 0;
  const activeServices = d.activeServices || 0;
  const avgRating = d.avgRating || 0;
  const pendingBookings = d.pendingBookings || 0;
  const upcomingBookings = d.upcomingBookings || 0;
  const recentBookings: any[] = d.recentBookings || [];

  const todayStr = new Date().toISOString().split("T")[0];
  const todaySchedule = recentBookings
    .filter((b: any) => (b.bookingDate || b.date)?.startsWith(todayStr))
    .sort((a: any, b: any) => (a.timeSlot || "").localeCompare(b.timeSlot || ""));

  const kpis = [
    { label: "Total Earnings", value: formatPrice(totalEarnings), icon: <DollarSign size={20} className="text-emerald-600" />, bg: "bg-emerald-50", link: "/vendor/earnings" },
    { label: "Total Bookings", value: String(totalBookings), icon: <ShoppingBag size={20} className="text-blue-600" />, bg: "bg-blue-50", link: "/vendor/bookings" },
    { label: "Active Services", value: String(activeServices), icon: <Layers size={20} className="text-violet-600" />, bg: "bg-violet-50", link: "/vendor/services" },
    { label: "Avg Rating", value: avgRating.toFixed(1), icon: <Star size={20} className="text-amber-500" />, bg: "bg-amber-50", link: "/vendor/reviews" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
            Welcome back, {user?.vendor?.businessName || user?.name || "Vendor"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Here is what&apos;s happening with your business today.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/vendor/calendar" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors">
            <CalendarDays size={16} /> Calendar
          </Link>
          <Link href="/vendor/services/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-gray-800 text-sm font-medium transition-colors">
            <Plus size={16} /> Add Service
          </Link>
        </div>
      </div>

      {/* Pending Actions Alert */}
      {pendingBookings > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <AlertCircle size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">You have {pendingBookings} pending booking{pendingBookings > 1 ? 's' : ''}</p>
              <p className="text-xs text-amber-700 mt-0.5">Please review and approve them as soon as possible.</p>
            </div>
          </div>
          <Link href="/vendor/bookings?status=PENDING" className="text-sm font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap text-center">
            Review Bookings
          </Link>
        </div>
      )}

      {/* Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Link key={i} href={kpi.link} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex items-center gap-4 group">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", kpi.bg)}>
              {kpi.icon}
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.label}</p>
              <div className="flex items-center justify-between mt-0.5">
                <p className="text-2xl font-bold text-gray-900 tracking-tight">{kpi.value}</p>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <h2 className="text-lg font-bold text-gray-900">Recent Bookings</h2>
              {recentBookings.length > 0 && (
                <Link href="/vendor/bookings" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
                  View All <ChevronRight size={16} />
                </Link>
              )}
            </div>
            
            {recentBookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap">
                  <thead>
                    <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                      <th className="text-left p-4 font-semibold">Booking ID</th>
                      <th className="text-left p-4 font-semibold">Service</th>
                      <th className="text-left p-4 font-semibold hidden md:table-cell">Date</th>
                      <th className="text-right p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {recentBookings.slice(0, 6).map((booking: any) => (
                      <tr key={booking.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="p-4 align-top">
                          <Link href={`/vendor/bookings/${booking.id}`} className="block">
                            <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {booking.bookingNumber || `#${booking.id}`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">{booking.client?.name || "Customer"}</p>
                          </Link>
                        </td>
                        <td className="p-4 align-top">
                          <p className="text-sm text-gray-700 font-medium line-clamp-2 max-w-[200px]">{booking.service?.title || "Unknown"}</p>
                          <p className="text-xs font-semibold text-gray-900 mt-1">Total: {formatPrice(booking.totalAmount)}</p>
                          {Number(booking.advancePaid) > 0 && (
                            <p className="text-[10px] text-emerald-600 mt-0.5 font-bold">
                              Paid: {formatPrice(Number(booking.advancePaid))}
                            </p>
                          )}
                        </td>
                        <td className="p-4 align-top hidden md:table-cell">
                          <p className="text-sm text-gray-900 font-medium">
                            {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "—"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{booking.timeSlot || "—"}</p>
                        </td>
                        <td className="p-4 align-top text-right">
                          <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border inline-block mb-1", statusColors[booking.status] || "bg-gray-100 text-gray-700 border-gray-200")}>
                            {booking.status.replace(/_/g, " ")}
                          </span>
                          <div className="mt-1">
                            <Link href={`/vendor/bookings/${booking.id}`} className="inline-flex items-center text-[11px] font-medium text-emerald-600 hover:text-emerald-700">
                              Details <ExternalLink size={12} className="ml-0.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <ShoppingBag size={24} className="text-gray-400" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto leading-relaxed">When customers book your services, they will appear here in real-time.</p>
                <Link href="/vendor/services/new" className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                  Create a Service
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Today's Schedule & Quick Links */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[250px]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Today&apos;s Schedule</h2>
              <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full">
                {todaySchedule.length} Events
              </span>
            </div>
            
            <div className="p-4 max-h-[350px] overflow-y-auto custom-scrollbar flex-1">
              {todaySchedule.length > 0 ? (
                <div className="space-y-3">
                  {todaySchedule.map((item: any) => (
                    <Link key={item.id} href={`/vendor/bookings/${item.id}`} className="block p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:border-emerald-200 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-3 mb-2.5">
                        <span className="text-xs font-bold text-gray-900 bg-white border border-gray-200 px-2 py-1 rounded-md shrink-0">
                          {item.timeSlot || "All Day"}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider border ml-auto", statusColors[item.status] || "bg-gray-100 text-gray-700")}>
                          {item.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">{item.service?.title}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-gray-600">{item.client?.name?.charAt(0) || "C"}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{item.client?.name || "Customer"}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <Calendar size={20} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Schedule is clear</p>
                  <p className="text-xs text-gray-500 mt-1 max-w-[180px] mx-auto leading-relaxed">No bookings are scheduled for today.</p>
                </div>
              )}
            </div>
          </div>

          {/* Business Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-900">Overview</h2>
            </div>
            <div className="p-0">
              <Link href="/vendor/bookings?status=UPCOMING" className="flex items-center justify-between p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Upcoming Bookings</p>
                    <p className="text-xs text-gray-500">Scheduled for future</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{upcomingBookings}</span>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
              
              <Link href="/vendor/services" className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <Layers size={16} className="text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Manage Services</p>
                    <p className="text-xs text-gray-500">Add or edit offerings</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

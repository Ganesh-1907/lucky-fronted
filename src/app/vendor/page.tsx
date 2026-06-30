"use client";

import Link from "next/link";
import {
  TrendingUp, ShoppingBag, DollarSign, Star, ArrowUpRight,
  Layers, Clock, Eye, ChevronRight, Calendar
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const stats = [
  { label: "Total Earnings", value: "₹12,45,000", change: "+18.2%", up: true, icon: <DollarSign size={20} />, color: "from-emerald-500 to-teal-500" },
  { label: "Total Bookings", value: "890", change: "+12.5%", up: true, icon: <ShoppingBag size={20} />, color: "from-blue-500 to-indigo-500" },
  { label: "Active Services", value: "15", change: "+2", up: true, icon: <Layers size={20} />, color: "from-violet-500 to-purple-500" },
  { label: "Avg Rating", value: "4.7", change: "+0.2", up: true, icon: <Star size={20} />, color: "from-amber-500 to-orange-500" },
];

const recentBookings = [
  { id: "LM7X8K2A", customer: "Priya Sharma", service: "Premium Birthday Balloon Decoration", amount: 4498, status: "CONFIRMED", bookingDate: "2024-03-20", timeSlot: "10:00 AM" },
  { id: "LM7X8K3B", customer: "Rahul Verma", service: "Romantic Candlelight Dinner", amount: 5698, status: "PENDING", bookingDate: "2024-03-22", timeSlot: "7:00 PM" },
  { id: "LM7X8K5D", customer: "Vikram Singh", service: "Kids Theme Party Setup", amount: 6498, status: "IN_PROGRESS", bookingDate: "2024-03-16", timeSlot: "3:00 PM" },
  { id: "LM7X8K7F", customer: "Sneha Kapoor", service: "Simple Anniversary Setup", amount: 2499, status: "PENDING", bookingDate: "2024-03-25", timeSlot: "6:00 PM" },
];

const todaySchedule = [
  { time: "10:00 AM", customer: "Priya Sharma", service: "Birthday Balloon Decoration", status: "CONFIRMED", city: "Mumbai" },
  { time: "3:00 PM", customer: "Vikram Singh", service: "Kids Theme Party", status: "IN_PROGRESS", city: "Pune" },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function VendorDashboard() {
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
                {recentBookings.map(booking => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="text-sm font-mono font-bold text-emerald-600">{booking.id}</p>
                      <p className="text-xs text-gray-500">{booking.customer}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm text-gray-700 truncate max-w-[180px]">{booking.service}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900">{booking.bookingDate}</p>
                      <p className="text-xs text-gray-500">{booking.timeSlot}</p>
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

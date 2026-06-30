"use client";

import Link from "next/link";
import {
  TrendingUp, Users, Store, ShoppingBag, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock, AlertCircle,
  Eye, Star, ChevronRight
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const stats = [
  { label: "Total Revenue", value: "₹12,45,890", change: "+12.5%", up: true, icon: <DollarSign size={20} />, color: "from-violet-500 to-purple-500" },
  { label: "Total Orders", value: "1,234", change: "+8.2%", up: true, icon: <ShoppingBag size={20} />, color: "from-blue-500 to-indigo-500" },
  { label: "Active Vendors", value: "156", change: "+3.1%", up: true, icon: <Store size={20} />, color: "from-emerald-500 to-teal-500" },
  { label: "Total Customers", value: "8,432", change: "+15.7%", up: true, icon: <Users size={20} />, color: "from-amber-500 to-orange-500" },
];

const pendingActions = [
  { type: "vendor", label: "Pending Vendor Approvals", count: 5, href: "/admin/vendors?status=PENDING", color: "bg-amber-50 text-amber-700" },
  { type: "service", label: "Services Awaiting Review", count: 12, href: "/admin/services?status=PENDING", color: "bg-blue-50 text-blue-700" },
  { type: "review", label: "Unmoderated Reviews", count: 8, href: "/admin/reviews?approved=false", color: "bg-rose-50 text-rose-700" },
];

const recentOrders = [
  { id: "LM7X8K2A", customer: "Priya Sharma", service: "Premium Birthday Balloon Decoration", amount: 4498, status: "CONFIRMED", date: "2024-03-15" },
  { id: "LM7X8K3B", customer: "Rahul Verma", service: "Romantic Candlelight Dinner", amount: 5698, status: "PENDING", date: "2024-03-15" },
  { id: "LM7X8K4C", customer: "Anita Patel", service: "Royal Wedding Stage", amount: 42999, status: "COMPLETED", date: "2024-03-14" },
  { id: "LM7X8K5D", customer: "Vikram Singh", service: "Kids Theme Party Setup", amount: 6498, status: "IN_PROGRESS", date: "2024-03-14" },
  { id: "LM7X8K6E", customer: "Meera Joshi", service: "Simple Anniversary Decoration", amount: 2499, status: "CANCELLED", date: "2024-03-13" },
];

const topServices = [
  { title: "Premium Birthday Balloon Decoration", vendor: "Dream Decorators", bookings: 456, revenue: 1823544, rating: 4.5 },
  { title: "Romantic Candlelight Dinner Setup", vendor: "Dream Decorators", bookings: 234, revenue: 1053666, rating: 4.8 },
  { title: "Royal Wedding Stage Decoration", vendor: "Dream Decorators", bookings: 123, revenue: 4919877, rating: 4.9 },
  { title: "Kids Birthday Theme Party", vendor: "Party Kings", bookings: 189, revenue: 1133811, rating: 4.6 },
];

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
              <span className={cn(
                "flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full",
                stat.up ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}>
                {stat.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {stat.value}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pendingActions.map((action, i) => (
          <Link
            key={i}
            href={action.href}
            className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", action.color)}>
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{action.count}</p>
                <p className="text-xs text-gray-500">{action.label}</p>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 group-hover:text-violet-500 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              Recent Orders
            </h2>
            <Link href="/admin/bookings" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Service</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className="text-sm font-mono font-medium text-violet-600">{order.id}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900">{order.customer}</p>
                      <p className="text-xs text-gray-400">{order.date}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600 truncate max-w-[200px]">{order.service}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(order.amount)}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase",
                        statusColors[order.status] || "bg-gray-100 text-gray-600"
                      )}>
                        {order.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              Top Services
            </h2>
            <Link href="/admin/services" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
              View All →
            </Link>
          </div>

          <div className="p-4 space-y-4">
            {topServices.map((service, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600 text-sm font-bold shrink-0">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{service.title}</p>
                  <p className="text-xs text-gray-500">{service.vendor}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <ShoppingBag size={10} /> {service.bookings}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Star size={10} className="fill-amber-400 text-amber-400" /> {service.rating}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      {formatPrice(service.revenue)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart Placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
          Revenue Overview
        </h2>
        <div className="h-64 bg-gradient-to-b from-violet-50 to-transparent rounded-xl flex items-end justify-around px-4 pb-4">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => {
            const h = [35, 42, 55, 48, 62, 70, 58, 75, 82, 78, 90, 85][i];
            return (
              <div key={month} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 transition-all duration-500 hover:from-violet-700 hover:to-violet-500"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] text-gray-400">{month}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  TrendingUp, Users, Store, ShoppingBag, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock, AlertCircle,
  Eye, Star, ChevronRight
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => api.get<any>("/admin/dashboard"),
  });

  const dashboardData = data?.data;

  if (isLoading) return <div>Loading...</div>;

  const stats = dashboardData?.stats ? [
    { label: "Total Revenue", value: formatPrice(dashboardData.stats.totalRevenue || 0), change: "+12.5%", up: true, icon: <DollarSign size={20} />, color: "from-violet-500 to-purple-500" },
    { label: "Total Orders", value: (dashboardData.stats.totalOrders || 0).toLocaleString(), change: "+8.2%", up: true, icon: <ShoppingBag size={20} />, color: "from-blue-500 to-indigo-500" },
    { label: "Active Vendors", value: (dashboardData.stats.totalVendors || 0).toLocaleString(), change: "+3.1%", up: true, icon: <Store size={20} />, color: "from-emerald-500 to-teal-500" },
    { label: "Total Customers", value: (dashboardData.stats.totalClients || 0).toLocaleString(), change: "+15.7%", up: true, icon: <Users size={20} />, color: "from-amber-500 to-orange-500" },
  ] : [];

  const pendingActions = [
    { type: "vendor", label: "Pending Vendor Approvals", count: dashboardData?.stats?.pendingVendors || 0, href: "/admin/vendors?status=PENDING", color: "bg-amber-50 text-amber-700" },
    { type: "service", label: "Services Awaiting Review", count: dashboardData?.stats?.pendingServices || 0, href: "/admin/services?status=PENDING", color: "bg-blue-50 text-blue-700" },
  ];

  const recentOrders = dashboardData?.recentOrders || [];
  const topServices = dashboardData?.topServices || [];

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <span className="text-sm font-mono font-medium text-violet-600">{String(order.id)}</span>
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
                        {order.status?.replace("_", " ")}
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
            {topServices.map((service: any, i: number) => (
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
            const h = dashboardData?.stats?.monthlyRevenue?.[month?.toLowerCase()] 
              ? Math.min(Math.round((dashboardData.stats.monthlyRevenue[month.toLowerCase()] / (dashboardData.stats.totalRevenue || 1)) * 100), 95)
              : [35, 42, 55, 48, 62, 70, 58, 75, 82, 78, 90, 85][i];
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

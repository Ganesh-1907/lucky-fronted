"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Download, Calendar, ArrowUpRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

const catColors = ["bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-gray-400"];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("yearly");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reports", period],
    queryFn: () => api.get<any>(`/admin/reports?period=${period}`),
  });

  const reportData = data?.data || data;

  if (isLoading) return <div>Loading...</div>;

  const stats = reportData?.stats ? [
    { label: "Total Revenue", value: formatPrice(reportData.stats.totalRevenue || 0), icon: <DollarSign size={18} />, color: "from-violet-500 to-purple-500" },
    { label: "Total Bookings", value: (reportData.stats.totalOrders || 0).toLocaleString(), icon: <ShoppingBag size={18} />, color: "from-emerald-500 to-teal-500" },
    { label: "New Customers", value: (reportData.stats.totalClients || 0).toLocaleString(), icon: <Users size={18} />, color: "from-blue-500 to-indigo-500" },
    { label: "Active Vendors", value: (reportData.stats.activeVendors || 0).toLocaleString(), icon: <TrendingUp size={18} />, color: "from-amber-500 to-orange-500" },
  ] : [];

  const monthlyRevenue = reportData?.monthlyRevenue || [];
  const maxRevenue = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map((m: any) => m.revenue)) : 1;

  const topCategories = reportData?.topCategories || [];
  const topCities = reportData?.topCities || [];
  const topVendors = reportData?.topVendors || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Platform performance overview</p>
        </div>
        <div className="flex gap-2">
          {["monthly", "quarterly", "yearly"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={cn(
              "px-3 py-2 rounded-lg text-xs font-medium capitalize", period === p ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            )}>{p}</button>
          ))}
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 hover:bg-gray-50">
            <Download size={12} /> Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white`}>{s.icon}</div>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Monthly Revenue</h3>
        <div className="h-56 flex items-end justify-around gap-1 px-2">
          {monthlyRevenue.length > 0 ? monthlyRevenue.map((m: any) => (
            <div key={m.month} className="flex flex-col items-center justify-end gap-1 flex-1 h-full">
              <span className="text-[9px] font-medium text-gray-500">{formatPrice(m.revenue)}</span>
              <div className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 hover:from-violet-700 hover:to-violet-500 transition-all cursor-pointer"
                style={{ height: `${Math.max(2, (m.revenue / (maxRevenue || 1)) * 100)}%` }}
                title={`${m.month}: ${formatPrice(m.revenue)} · ${m.orders || 0} orders`} />
              <span className="text-[10px] text-gray-400">{m.month}</span>
            </div>
          )) : (
            <div className="flex items-center justify-center w-full h-56 text-sm text-gray-400">No revenue data available</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Revenue by Category</h3>
          {topCategories.length > 0 && (
            <>
              <div className="flex h-4 rounded-full overflow-hidden mb-4">
                {topCategories.map((c: any, i: number) => {
                  const total = topCategories.reduce((acc: number, val: any) => acc + val.revenue, 0);
                  const percentage = total > 0 ? (c.revenue / total) * 100 : 0;
                  return (
                    <div key={c.name} className={`${catColors[i] || "bg-gray-400"}`} style={{ width: `${percentage}%` }} title={`${c.name}: ${percentage.toFixed(1)}%`} />
                  )
                })}
              </div>
              <div className="space-y-2">
                {topCategories.map((c: any, i: number) => {
                  const total = topCategories.reduce((acc: number, val: any) => acc + val.revenue, 0);
                  const percentage = total > 0 ? (c.revenue / total) * 100 : 0;
                  return (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-sm ${catColors[i] || "bg-gray-400"}`} />
                        <span className="text-sm text-gray-700">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-900">{formatPrice(c.revenue)}</span>
                        <span className="text-xs text-gray-400 w-8 text-right">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
          {topCategories.length === 0 && (
            <p className="text-sm text-gray-400">No category data available</p>
          )}
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Bookings by City</h3>
          {topCities.length > 0 ? (
            <div className="space-y-3">
              {topCities.map((c: any) => {
                const totalOrders = topCities.reduce((acc: number, val: any) => acc + (val.orders || 0), 0);
                const percentage = totalOrders > 0 ? ((c.orders || 0) / totalOrders) * 100 : 0;
                return (
                  <div key={c.city}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-700">{c.city}</span>
                      <span className="text-gray-500">{c.orders} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No city data available</p>
          )}
        </div>
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Top Vendors</h3>
        </div>
        {topVendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                  <th className="text-left p-4 font-medium">#</th>
                  <th className="text-left p-4 font-medium">Vendor</th>
                  <th className="text-left p-4 font-medium">Bookings</th>
                  <th className="text-left p-4 font-medium">Revenue</th>
                  <th className="text-left p-4 font-medium">Rating</th>
                </tr>
              </thead>
              <tbody>
                {topVendors.map((v: any, i: number) => (
                  <tr key={v.name || i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4"><span className="text-sm font-bold text-violet-600">#{i + 1}</span></td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900">{v.name || 'Unnamed Vendor'}</p>
                      <p className="text-xs text-gray-500">{v.city || 'Unknown City'}</p>
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-900">{v.bookings}</td>
                    <td className="p-4 text-sm font-medium text-emerald-600">{formatPrice(v.revenue)}</td>
                    <td className="p-4 text-sm">⭐ {Number(v.rating).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-sm text-gray-400">No vendor data available</div>
        )}
      </div>
    </div>
  );
}

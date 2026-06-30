"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Users, ShoppingBag, DollarSign, Download, Calendar, ArrowUpRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const stats = [
  { label: "Total Revenue", value: "₹24,56,000", change: "+22.5%", icon: <DollarSign size={18} />, color: "from-violet-500 to-purple-500" },
  { label: "Total Orders", value: "2,345", change: "+18.2%", icon: <ShoppingBag size={18} />, color: "from-emerald-500 to-teal-500" },
  { label: "New Users", value: "456", change: "+12.8%", icon: <Users size={18} />, color: "from-blue-500 to-indigo-500" },
  { label: "Conversion Rate", value: "34%", change: "+5.2%", icon: <TrendingUp size={18} />, color: "from-amber-500 to-orange-500" },
];

const monthlyRevenue = [
  { month: "Jan", revenue: 185000, orders: 45 },
  { month: "Feb", revenue: 205000, orders: 52 },
  { month: "Mar", revenue: 245000, orders: 65 },
  { month: "Apr", revenue: 198000, orders: 50 },
  { month: "May", revenue: 278000, orders: 72 },
  { month: "Jun", revenue: 312000, orders: 85 },
  { month: "Jul", revenue: 295000, orders: 78 },
  { month: "Aug", revenue: 345000, orders: 92 },
  { month: "Sep", revenue: 320000, orders: 88 },
  { month: "Oct", revenue: 398000, orders: 105 },
  { month: "Nov", revenue: 425000, orders: 115 },
  { month: "Dec", revenue: 350000, orders: 98 },
];
const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

const topCategories = [
  { name: "Birthday Decorations", orders: 890, revenue: 3556000, percentage: 38 },
  { name: "Wedding Decorations", orders: 234, revenue: 9360000, percentage: 25 },
  { name: "Candlelight Dinner", orders: 456, revenue: 2052000, percentage: 18 },
  { name: "Anniversary", orders: 345, revenue: 862500, percentage: 12 },
  { name: "Others", orders: 420, revenue: 1625700, percentage: 7 },
];

const topVendors = [
  { name: "Dream Decorators", city: "Mumbai", orders: 890, revenue: 4450000, rating: 4.7 },
  { name: "Party Kings", city: "Delhi", orders: 456, revenue: 2280000, rating: 4.5 },
  { name: "Glow Events", city: "Bangalore", orders: 345, revenue: 1725000, rating: 4.8 },
  { name: "Love Setup Co", city: "Pune", orders: 234, revenue: 1170000, rating: 4.3 },
  { name: "Sweet Bliss", city: "Hyderabad", orders: 189, revenue: 945000, rating: 4.6 },
];

const topCities = [
  { city: "Mumbai", orders: 890, percentage: 25 },
  { city: "Delhi", orders: 678, percentage: 19 },
  { city: "Bangalore", orders: 567, percentage: 16 },
  { city: "Hyderabad", orders: 456, percentage: 13 },
  { city: "Chennai", orders: 345, percentage: 10 },
  { city: "Pune", orders: 234, percentage: 7 },
  { city: "Others", orders: 375, percentage: 10 },
];

const catColors = ["bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-gray-400"];

export default function AdminReportsPage() {
  const [period, setPeriod] = useState("yearly");

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
              <span className="flex items-center gap-0.5 text-xs font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={10} /> {s.change}
              </span>
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
          {monthlyRevenue.map(m => (
            <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[9px] font-medium text-gray-500">{formatPrice(m.revenue)}</span>
              <div className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 hover:from-violet-700 hover:to-violet-500 transition-all cursor-pointer"
                style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                title={`${m.month}: ${formatPrice(m.revenue)} · ${m.orders} orders`} />
              <span className="text-[10px] text-gray-400">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Revenue by Category</h3>
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            {topCategories.map((c, i) => (
              <div key={c.name} className={`${catColors[i]}`} style={{ width: `${c.percentage}%` }} title={`${c.name}: ${c.percentage}%`} />
            ))}
          </div>
          <div className="space-y-2">
            {topCategories.map((c, i) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${catColors[i]}`} />
                  <span className="text-sm text-gray-700">{c.name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500">{c.orders} orders</span>
                  <span className="font-medium text-gray-900 w-20 text-right">{formatPrice(c.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Orders by City</h3>
          <div className="space-y-3">
            {topCities.map(c => (
              <div key={c.city}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-700">{c.city}</span>
                  <span className="text-gray-500">{c.orders} ({c.percentage}%)</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: `${c.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Vendors */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Top Vendors</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                <th className="text-left p-4 font-medium">#</th>
                <th className="text-left p-4 font-medium">Vendor</th>
                <th className="text-left p-4 font-medium">Orders</th>
                <th className="text-left p-4 font-medium">Revenue</th>
                <th className="text-left p-4 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {topVendors.map((v, i) => (
                <tr key={v.name} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4"><span className="text-sm font-bold text-violet-600">#{i + 1}</span></td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-900">{v.name}</p>
                    <p className="text-xs text-gray-500">{v.city}</p>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-900">{v.orders}</td>
                  <td className="p-4 text-sm font-medium text-emerald-600">{formatPrice(v.revenue)}</td>
                  <td className="p-4 text-sm">⭐ {v.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { Eye, ShoppingBag, Star, TrendingUp, Users, DollarSign, ArrowUpRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const metrics = [
  { label: "Profile Views", value: "2,340", change: "+12%", icon: <Eye size={18} />, color: "from-blue-500 to-indigo-500" },
  { label: "Total Bookings", value: "890", change: "+8%", icon: <ShoppingBag size={18} />, color: "from-emerald-500 to-teal-500" },
  { label: "Avg Rating", value: "4.7", change: "+0.2", icon: <Star size={18} />, color: "from-amber-500 to-orange-500" },
  { label: "Repeat Customers", value: "234", change: "+15%", icon: <Users size={18} />, color: "from-violet-500 to-purple-500" },
];

const topServices = [
  { name: "Premium Birthday Balloon Decoration", bookings: 456, revenue: 1823544, conversion: 38, rating: 4.5 },
  { name: "Romantic Candlelight Dinner Setup", bookings: 234, revenue: 1053666, conversion: 42, rating: 4.8 },
  { name: "Royal Wedding Stage Decoration", bookings: 123, revenue: 4919877, conversion: 55, rating: 4.9 },
  { name: "Kids Birthday Theme Party", bookings: 77, revenue: 461923, conversion: 30, rating: 4.6 },
];

const weeklyViews = [
  { day: "Mon", views: 45 }, { day: "Tue", views: 62 }, { day: "Wed", views: 38 },
  { day: "Thu", views: 78 }, { day: "Fri", views: 92 }, { day: "Sat", views: 110 }, { day: "Sun", views: 85 },
];
const maxViews = Math.max(...weeklyViews.map(w => w.views));

const cityBreakdown = [
  { city: "Mumbai", bookings: 345, percentage: 39 },
  { city: "Delhi", bookings: 234, percentage: 26 },
  { city: "Bangalore", bookings: 156, percentage: 18 },
  { city: "Pune", bookings: 89, percentage: 10 },
  { city: "Others", bookings: 66, percentage: 7 },
];

const cityColors = ["bg-violet-500", "bg-emerald-500", "bg-blue-500", "bg-amber-500", "bg-gray-400"];

export default function VendorAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Insights into your business performance</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white`}>{m.icon}</div>
              <span className="flex items-center gap-0.5 text-xs font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                <ArrowUpRight size={10} /> {m.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{m.value}</p>
            <p className="text-xs text-gray-500 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Views Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Weekly Profile Views</h3>
          <div className="h-44 flex items-end justify-around gap-2">
            {weeklyViews.map(w => (
              <div key={w.day} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-medium text-gray-600">{w.views}</span>
                <div className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 transition-all"
                  style={{ height: `${(w.views / maxViews) * 100}%` }} />
                <span className="text-[10px] text-gray-400">{w.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* City Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Bookings by City</h3>
          {/* Bar */}
          <div className="flex h-4 rounded-full overflow-hidden mb-4">
            {cityBreakdown.map((c, i) => (
              <div key={c.city} className={`${cityColors[i]} transition-all`} style={{ width: `${c.percentage}%` }}
                title={`${c.city}: ${c.percentage}%`} />
            ))}
          </div>
          <div className="space-y-2">
            {cityBreakdown.map((c, i) => (
              <div key={c.city} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${cityColors[i]}`} />
                  <span className="text-sm text-gray-700">{c.city}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-900">{c.bookings}</span>
                  <span className="text-xs text-gray-400 w-8 text-right">{c.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Services */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Service Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                <th className="text-left p-4 font-medium">Service</th>
                <th className="text-left p-4 font-medium">Bookings</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Revenue</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Conversion</th>
                <th className="text-left p-4 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((s, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4 text-sm font-medium text-gray-900">{s.name}</td>
                  <td className="p-4 text-sm font-bold text-gray-900">{s.bookings}</td>
                  <td className="p-4 hidden md:table-cell text-sm text-emerald-600 font-medium">{formatPrice(s.revenue)}</td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${s.conversion}%` }} />
                      </div>
                      <span className="text-xs text-gray-600">{s.conversion}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-sm">
                      <Star size={12} className="text-amber-400 fill-amber-400" /> {s.rating}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

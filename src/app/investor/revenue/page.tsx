"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, TrendingUp, Store, CreditCard, RefreshCw,
  ArrowDownRight, BarChart3, MapPin, Tag
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

const PERIODS = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "monthly", label: "Monthly" },
  { key: "quarterly", label: "Quarterly" },
  { key: "yearly", label: "Yearly" },
];

export default function RevenueAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("monthly");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      try {
        const res: any = await api.get(`/investor/revenue?period=${period}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [period]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 bg-gray-800/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 bg-gray-800/50 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-gray-800/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const fin = data?.financials || {};
  const finCards = [
    { label: "Total Revenue", value: formatPrice(fin.totalRevenue), icon: <DollarSign size={18} />, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/25" },
    { label: "Commission Earned", value: formatPrice(fin.commissionEarned), icon: <TrendingUp size={18} />, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25" },
    { label: "Vendor Payouts", value: formatPrice(fin.vendorPayouts), icon: <Store size={18} />, gradient: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/25" },
    { label: "Pending Payments", value: formatPrice(fin.pendingPayments), icon: <CreditCard size={18} />, gradient: "from-yellow-500 to-amber-600", glow: "shadow-yellow-500/25" },
    { label: "Refunds", value: formatPrice(fin.refunds), icon: <ArrowDownRight size={18} />, gradient: "from-red-500 to-rose-600", glow: "shadow-red-500/25" },
  ];

  const trendData = data?.revenueTrend || [];
  const maxTrend = Math.max(...trendData.map((t: any) => t.revenue), 1);

  const categoryData = data?.revenueByCategory || [];
  const maxCat = Math.max(...categoryData.map((c: any) => c.revenue), 1);

  const cityData = data?.revenueByCity || [];
  const maxCity = Math.max(...cityData.map((c: any) => c.revenue), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Revenue Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Track platform revenue across all dimensions.</p>
        </div>
      </div>

      {/* Period Toggle */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border",
              period === p.key
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                : "bg-gray-800/50 text-gray-400 border-gray-700/40 hover:bg-gray-800 hover:text-gray-200"
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {finCards.map((card, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 hover:border-gray-600/60 transition-all">
            <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-3 shadow-lg", card.gradient, card.glow)}>
              {card.icon}
            </div>
            <p className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{card.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5 font-medium uppercase tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
          <BarChart3 size={14} className="text-emerald-400" /> Revenue Trend ({PERIODS.find(p => p.key === period)?.label})
        </h3>
        {trendData.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-12">No data for this period</p>
        ) : (
          <div className="h-52 flex items-end justify-around gap-1 px-2 overflow-x-auto">
            {trendData.map((t: any, i: number) => {
              const height = (t.revenue / maxTrend) * 100;
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 min-w-[30px] flex-1 max-w-[60px]">
                  <span className="text-[8px] text-gray-500 font-bold">{formatPrice(t.revenue)}</span>
                  <div className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-500 hover:from-emerald-500 hover:to-emerald-300"
                    style={{ height: `${Math.max(height, 3)}%` }} />
                  <span className="text-[7px] text-gray-600 truncate max-w-full">{t.period?.split("-").pop() || t.period}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <Tag size={14} className="text-violet-400" /> Revenue by Category
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No data</p>
          ) : (
            <div className="space-y-3">
              {categoryData.map((c: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{c.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500">{c.bookings} bookings</span>
                      <span className="text-xs font-bold text-white">{formatPrice(c.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${(c.revenue / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by City */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <MapPin size={14} className="text-amber-400" /> Revenue by City
          </h3>
          {cityData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No data</p>
          ) : (
            <div className="space-y-3">
              {cityData.map((c: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{c.city}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-gray-500">{c.bookings} bookings</span>
                      <span className="text-xs font-bold text-white">{formatPrice(c.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                      style={{ width: `${(c.revenue / maxCity) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

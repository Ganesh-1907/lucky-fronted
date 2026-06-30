"use client";

import { useState, useEffect } from "react";
import {
  Users, UserPlus, UserCheck, Repeat, TrendingUp,
  DollarSign, Star, BarChart3, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

function GrowthBadge({ value }: { value: number }) {
  const isPositive = value >= 0;
  return (
    <span className={cn(
      "inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md",
      isPositive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
    )}>
      {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
      {Math.abs(value)}%
    </span>
  );
}

export default function CustomerAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res: any = await api.get("/investor/customers");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-32 bg-gray-800/50 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: "Total Customers", value: data?.totalCustomers?.toLocaleString() || "0", icon: <Users size={18} />, gradient: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/25" },
    { label: "Active Customers", value: data?.activeCustomers?.toLocaleString() || "0", icon: <UserCheck size={18} />, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/25" },
    { label: "New Customers (30d)", value: data?.newCustomers?.toLocaleString() || "0", icon: <UserPlus size={18} />, gradient: "from-cyan-500 to-blue-600", glow: "shadow-cyan-500/25", growth: data?.growth?.growthRate },
    { label: "Returning Customers", value: data?.returningCustomers?.toLocaleString() || "0", icon: <Repeat size={18} />, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/25" },
    { label: "Retention Rate", value: `${data?.retentionRate || 0}%`, icon: <TrendingUp size={18} />, gradient: "from-teal-500 to-emerald-600", glow: "shadow-teal-500/25" },
    { label: "Lifetime Value", value: formatPrice(data?.lifetimeValue || 0), icon: <DollarSign size={18} />, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25" },
    { label: "Avg Spend / Customer", value: formatPrice(data?.avgSpend || 0), icon: <DollarSign size={18} />, gradient: "from-pink-500 to-rose-600", glow: "shadow-pink-500/25" },
    { label: "Satisfaction Score", value: `${data?.customerSatisfaction || "0"} / 5`, icon: <Star size={18} />, gradient: "from-yellow-500 to-amber-600", glow: "shadow-yellow-500/25" },
  ];

  const growthData = data?.customerGrowth || [];
  const maxGrowth = Math.max(...growthData.map((g: any) => g.new_customers), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Customer Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Understand customer acquisition, retention, and lifetime value.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600/60 transition-all">
            <div className="flex items-start justify-between">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", kpi.gradient, kpi.glow)}>
                {kpi.icon}
              </div>
              {kpi.growth !== undefined && <GrowthBadge value={kpi.growth} />}
            </div>
            <p className="text-2xl font-bold text-white mt-3" style={{ fontFamily: "var(--font-outfit)" }}>{kpi.value}</p>
            <p className="text-[10px] text-gray-500 mt-1 font-medium uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer Growth Chart */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <BarChart3 size={14} className="text-cyan-400" /> Customer Growth (Last 6 Months)
          </h3>
          {growthData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No data yet</p>
          ) : (
            <div className="h-48 flex items-end justify-around gap-3 px-2">
              {growthData.map((g: any, i: number) => {
                const height = (g.new_customers / maxGrowth) * 100;
                const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const monthNum = parseInt(g.month?.split("-")[1]);
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] text-gray-400 font-bold">{g.new_customers}</span>
                    <div className="w-full max-w-[50px] rounded-t-lg bg-gradient-to-t from-cyan-600 to-cyan-400 transition-all duration-500"
                      style={{ height: `${Math.max(height, 5)}%` }} />
                    <span className="text-[9px] text-gray-500">{monthNames[monthNum]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Retention Metrics */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <Repeat size={14} className="text-violet-400" /> Retention & Engagement
          </h3>
          <div className="space-y-5">
            {/* Retention Rate Gauge */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Retention Rate</span>
                <span className="text-sm font-bold text-white">{data?.retentionRate || 0}%</span>
              </div>
              <div className="h-3 bg-gray-700/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, data?.retentionRate || 0)}%` }} />
              </div>
            </div>
            {/* Repeat Booking Rate */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Repeat Booking Rate</span>
                <span className="text-sm font-bold text-white">{data?.repeatRate || 0}%</span>
              </div>
              <div className="h-3 bg-gray-700/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, data?.repeatRate || 0)}%` }} />
              </div>
            </div>
            {/* Satisfaction */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Customer Satisfaction</span>
                <span className="text-sm font-bold text-white flex items-center gap-1">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  {data?.customerSatisfaction || "0"} / 5
                </span>
              </div>
              <div className="h-3 bg-gray-700/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, (parseFloat(data?.customerSatisfaction || "0") / 5) * 100)}%` }} />
              </div>
            </div>
            {/* New vs Returning visual */}
            <div className="pt-2 border-t border-gray-700/30">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-3">Customer Composition</p>
              <div className="flex items-center gap-1 h-4 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-l-full transition-all duration-700"
                  style={{ width: `${data?.totalCustomers > 0 ? ((data?.activeCustomers - data?.returningCustomers) / data?.totalCustomers) * 100 : 50}%` }} />
                <div className="h-full bg-violet-500 rounded-r-full transition-all duration-700"
                  style={{ width: `${data?.totalCustomers > 0 ? (data?.returningCustomers / data?.totalCustomers) * 100 : 50}%` }} />
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] text-cyan-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> New</span>
                <span className="text-[10px] text-violet-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500" /> Returning</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

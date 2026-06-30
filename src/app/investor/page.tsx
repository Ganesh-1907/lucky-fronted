"use client";

import { useState, useEffect } from "react";
import {
  DollarSign, ShoppingBag, CheckCircle2, Store, Users, UserCheck,
  TrendingUp, TrendingDown, BarChart3, ArrowUpRight, ArrowDownRight,
  Zap, Target, PieChart
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

function Sparkline({ data, color = "emerald" }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  const fillPoints = `0,${h} ${points} ${w},${h}`;
  const colorMap: Record<string, { stroke: string; fill: string }> = {
    emerald: { stroke: "#34d399", fill: "rgba(52,211,153,0.1)" },
    amber: { stroke: "#fbbf24", fill: "rgba(251,191,36,0.1)" },
    violet: { stroke: "#a78bfa", fill: "rgba(167,139,250,0.1)" },
  };
  const c = colorMap[color] || colorMap.emerald;

  return (
    <svg width={w} height={h} className="mt-2">
      <polygon points={fillPoints} fill={c.fill} />
      <polyline points={points} fill="none" stroke={c.stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function InvestorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res: any = await api.get("/investor/executive-summary");
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-gray-800/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const growth = data?.growth || {};
  const sparkData = (data?.recentMonthlyRevenue || []).map((m: any) => m.revenue);

  const kpiCards = [
    { label: "Total Platform Revenue", value: formatPrice(kpis.totalRevenue), icon: <DollarSign size={18} />, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/25", growth: kpis.monthlyRevenueGrowth, sparkline: sparkData },
    { label: "Total Bookings", value: kpis.totalBookings?.toLocaleString(), icon: <ShoppingBag size={18} />, gradient: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/25", growth: growth.bookingGrowth },
    { label: "Completed Events", value: kpis.completedEvents?.toLocaleString(), icon: <CheckCircle2 size={18} />, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/25" },
    { label: "Active Vendors", value: kpis.activeVendors?.toLocaleString(), icon: <Store size={18} />, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25" },
    { label: "Total Customers", value: kpis.totalCustomers?.toLocaleString(), icon: <Users size={18} />, gradient: "from-cyan-500 to-blue-600", glow: "shadow-cyan-500/25" },
    { label: "Total Employees", value: kpis.totalEmployees?.toLocaleString(), icon: <UserCheck size={18} />, gradient: "from-teal-500 to-emerald-600", glow: "shadow-teal-500/25" },
    { label: "Monthly Revenue Growth", value: `${kpis.monthlyRevenueGrowth >= 0 ? "+" : ""}${kpis.monthlyRevenueGrowth}%`, icon: <TrendingUp size={18} />, gradient: kpis.monthlyRevenueGrowth >= 0 ? "from-emerald-500 to-green-600" : "from-red-500 to-rose-600", glow: kpis.monthlyRevenueGrowth >= 0 ? "shadow-emerald-500/25" : "shadow-red-500/25", isGrowth: true },
    { label: "Yearly Revenue Growth", value: `${kpis.yearlyRevenueGrowth >= 0 ? "+" : ""}${kpis.yearlyRevenueGrowth}%`, icon: <BarChart3 size={18} />, gradient: kpis.yearlyRevenueGrowth >= 0 ? "from-emerald-500 to-green-600" : "from-red-500 to-rose-600", glow: kpis.yearlyRevenueGrowth >= 0 ? "shadow-emerald-500/25" : "shadow-red-500/25", isGrowth: true },
    { label: "Gross Profit", value: formatPrice(kpis.grossProfit), icon: <Target size={18} />, gradient: "from-lime-500 to-green-600", glow: "shadow-lime-500/25" },
    { label: "Net Profit", value: formatPrice(kpis.netProfit), icon: <Zap size={18} />, gradient: "from-yellow-500 to-amber-600", glow: "shadow-yellow-500/25" },
    { label: "Avg Booking Value", value: formatPrice(kpis.avgBookingValue), icon: <PieChart size={18} />, gradient: "from-pink-500 to-rose-600", glow: "shadow-pink-500/25" },
    { label: "Commission Revenue", value: formatPrice(kpis.commissionRevenue), icon: <DollarSign size={18} />, gradient: "from-emerald-400 to-teal-600", glow: "shadow-emerald-400/25" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
          Executive Summary
        </h1>
        <p className="text-sm text-gray-400 mt-1">Platform performance overview and key metrics.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div
            key={i}
            className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600/60 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", kpi.gradient, kpi.glow)}>
                {kpi.icon}
              </div>
              {kpi.growth !== undefined && <GrowthBadge value={kpi.growth} />}
            </div>
            <p className={cn(
              "font-bold text-white mt-3",
              (kpi as any).isGrowth ? "text-2xl" : "text-xl"
            )} style={{ fontFamily: "var(--font-outfit)" }}>
              {kpi.value}
            </p>
            <p className="text-[10px] text-gray-500 mt-1 font-medium uppercase tracking-wider">{kpi.label}</p>
            {kpi.sparkline && <Sparkline data={kpi.sparkline} />}
          </div>
        ))}
      </div>

      {/* Period Comparison */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <TrendingUp size={14} className="text-emerald-400" /> Monthly Revenue Comparison
          </h3>
          <div className="flex items-end gap-6">
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">This Month</p>
              <p className="text-2xl font-bold text-white mt-1" style={{ fontFamily: "var(--font-outfit)" }}>
                {formatPrice(growth.thisMonthRevenue || 0)}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Last Month</p>
              <p className="text-2xl font-bold text-gray-500 mt-1" style={{ fontFamily: "var(--font-outfit)" }}>
                {formatPrice(growth.lastMonthRevenue || 0)}
              </p>
            </div>
            <div>
              <GrowthBadge value={kpis.monthlyRevenueGrowth || 0} />
            </div>
          </div>
          {/* Visual bar comparison */}
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>This Month</span>
                <span>{formatPrice(growth.thisMonthRevenue || 0)}</span>
              </div>
              <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(5, (growth.thisMonthRevenue / Math.max(growth.thisMonthRevenue, growth.lastMonthRevenue, 1)) * 100))}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Last Month</span>
                <span>{formatPrice(growth.lastMonthRevenue || 0)}</span>
              </div>
              <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(5, (growth.lastMonthRevenue / Math.max(growth.thisMonthRevenue, growth.lastMonthRevenue, 1)) * 100))}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <ShoppingBag size={14} className="text-blue-400" /> Monthly Booking Comparison
          </h3>
          <div className="flex items-end gap-6">
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">This Month</p>
              <p className="text-2xl font-bold text-white mt-1" style={{ fontFamily: "var(--font-outfit)" }}>
                {growth.thisMonthBookings || 0}
              </p>
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Last Month</p>
              <p className="text-2xl font-bold text-gray-500 mt-1" style={{ fontFamily: "var(--font-outfit)" }}>
                {growth.lastMonthBookings || 0}
              </p>
            </div>
            <div>
              <GrowthBadge value={growth.bookingGrowth || 0} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>This Month</span>
                <span>{growth.thisMonthBookings || 0} bookings</span>
              </div>
              <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(5, (growth.thisMonthBookings / Math.max(growth.thisMonthBookings, growth.lastMonthBookings, 1)) * 100))}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Last Month</span>
                <span>{growth.lastMonthBookings || 0} bookings</span>
              </div>
              <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-700"
                  style={{ width: `${Math.min(100, Math.max(5, (growth.lastMonthBookings / Math.max(growth.thisMonthBookings, growth.lastMonthBookings, 1)) * 100))}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Sparkline Trend */}
      {sparkData.length > 0 && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <BarChart3 size={14} className="text-emerald-400" /> Revenue Trend (Last 6 Months)
          </h3>
          <div className="h-48 flex items-end justify-around gap-3 px-2">
            {(data?.recentMonthlyRevenue || []).map((m: any, i: number) => {
              const maxRev = Math.max(...sparkData, 1);
              const height = (m.revenue / maxRev) * 100;
              const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const monthNum = parseInt(m.month?.split("-")[1]);
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <span className="text-[10px] text-gray-400 font-bold">{formatPrice(m.revenue)}</span>
                  <div
                    className="w-full max-w-[50px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all duration-700 hover:from-emerald-500 hover:to-emerald-300 cursor-default"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 uppercase block">{monthNames[monthNum] || m.month}</span>
                    <span className="text-[9px] text-gray-600">{m.bookings} bookings</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

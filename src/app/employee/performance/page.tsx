"use client";

import { useState, useEffect } from "react";
import {
  BarChart3, Phone, CheckCircle2, TrendingUp, DollarSign,
  Target, ArrowUpRight, Zap
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

function fmtStatus(s: string) { return s.replace(/_/g, " "); }

const PIPELINE_DOT_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-slate-400",
  CUSTOMER_CONTACTED: "bg-blue-400",
  VENDOR_CONTACTED: "bg-indigo-400",
  CUSTOMER_DISCUSSION: "bg-cyan-400",
  ADVANCE_PAYMENT_PENDING: "bg-amber-400",
  ADVANCE_PAYMENT_RECEIVED: "bg-yellow-400",
  BOOKING_CONFIRMED: "bg-green-400",
  PLANNING_STAGE: "bg-violet-400",
  VENDOR_CONFIRMATION_PENDING: "bg-orange-400",
  EVENT_PREPARATION: "bg-teal-400",
  EVENT_ONGOING: "bg-purple-400",
  EVENT_COMPLETED: "bg-emerald-400",
  CUSTOMER_FEEDBACK_PENDING: "bg-rose-400",
  CLOSED: "bg-gray-400",
  CANCELLED: "bg-red-400",
};

export default function PerformancePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const res: any = await api.get("/employee/performance");
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchPerformance();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-800/50 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-800/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Bookings Converted",
      value: data?.bookingsConverted || 0,
      subtitle: `of ${data?.totalAssigned || 0} assigned`,
      icon: <Target size={18} />,
      gradient: "from-green-500 to-emerald-600",
      glow: "shadow-green-500/20",
    },
    {
      label: "Conversion Rate",
      value: `${data?.conversionRate || 0}%`,
      subtitle: "lead to booking",
      icon: <TrendingUp size={18} />,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/20",
    },
    {
      label: "Follow-Ups Done",
      value: data?.totalFollowUpsCompleted || 0,
      subtitle: `of ${data?.totalFollowUps || 0} total`,
      icon: <Phone size={18} />,
      gradient: "from-violet-500 to-purple-600",
      glow: "shadow-violet-500/20",
    },
    {
      label: "Revenue Generated",
      value: formatPrice(data?.revenue || 0),
      subtitle: "from confirmed bookings",
      icon: <DollarSign size={18} />,
      gradient: "from-amber-500 to-orange-500",
      glow: "shadow-amber-500/20",
    },
  ];

  // Pipeline funnel
  const pipelineData = (data?.pipelineBreakdown || []).map((p: any) => ({
    status: p.pipelineStatus,
    count: p._count,
  })).sort((a: any, b: any) => b.count - a.count);

  const maxPipeline = Math.max(...pipelineData.map((p: any) => p.count), 1);

  // Monthly performance chart
  const monthlyData: any[] = data?.monthlyPerformance || [];
  const maxMonthly = Math.max(...monthlyData.map((m: any) => m.count), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Performance</h1>
        <p className="text-sm text-slate-400 mt-1">Track your productivity and conversion metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/60 transition-all">
            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-4 shadow-lg", kpi.gradient, kpi.glow)}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
              {kpi.value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{kpi.label}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{kpi.subtitle}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pipeline Breakdown */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <Zap size={16} className="text-cyan-400" /> Pipeline Breakdown
          </h2>
          {pipelineData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {pipelineData.map((p: any) => (
                <div key={p.status} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("w-2 h-2 rounded-full", PIPELINE_DOT_COLORS[p.status] || "bg-slate-400")} />
                      <span className="text-xs text-slate-300 capitalize">{fmtStatus(p.status)}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">{p.count}</span>
                  </div>
                  <div className="h-2 bg-slate-700/40 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", PIPELINE_DOT_COLORS[p.status] || "bg-slate-400")}
                      style={{ width: `${(p.count / maxPipeline) * 100}%`, opacity: 0.7 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Performance Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
          <h2 className="font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <BarChart3 size={16} className="text-violet-400" /> Monthly Follow-Ups Completed
          </h2>
          {monthlyData.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">No data yet — start completing follow-ups!</p>
          ) : (
            <div className="h-48 flex items-end justify-around gap-2 px-2">
              {monthlyData.map((m: any, i: number) => {
                const height = (m.count / maxMonthly) * 100;
                const monthLabel = m.month?.split("-")[1];
                const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] text-slate-400 font-bold">{m.count}</span>
                    <div
                      className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-violet-600 to-violet-400 transition-all duration-700 hover:from-violet-500 hover:to-violet-300"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-[9px] text-slate-500 uppercase">{monthNames[parseInt(monthLabel)] || monthLabel}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
          <ArrowUpRight size={16} className="text-emerald-400" /> Conversion Funnel
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total Assigned", value: data?.totalAssigned || 0, color: "from-slate-600 to-slate-500" },
            { label: "In Pipeline", value: (data?.totalAssigned || 0) - (data?.bookingsConverted || 0) - pipelineData.find((p: any) => p.status === "CANCELLED")?.count || 0, color: "from-blue-500 to-indigo-500" },
            { label: "Converted", value: data?.bookingsConverted || 0, color: "from-green-500 to-emerald-500" },
            { label: "Revenue", value: formatPrice(data?.revenue || 0), color: "from-amber-500 to-orange-500", isText: true },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className={cn("w-full h-1.5 rounded-full bg-gradient-to-r mb-3", step.color)} />
              <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                {step.value}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-medium">{step.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  ShoppingBag, CheckCircle2, XCircle, Clock, AlertCircle,
  BarChart3, MapPin, Tag, TrendingUp
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

const STATUS_CONFIGS: Record<string, { icon: React.ReactNode; gradient: string; glow: string }> = {
  PENDING: { icon: <Clock size={18} />, gradient: "from-amber-500 to-orange-600", glow: "shadow-amber-500/25" },
  CONFIRMED: { icon: <CheckCircle2 size={18} />, gradient: "from-blue-500 to-indigo-600", glow: "shadow-blue-500/25" },
  IN_PROGRESS: { icon: <AlertCircle size={18} />, gradient: "from-violet-500 to-purple-600", glow: "shadow-violet-500/25" },
  COMPLETED: { icon: <CheckCircle2 size={18} />, gradient: "from-emerald-500 to-green-600", glow: "shadow-emerald-500/25" },
  CANCELLED: { icon: <XCircle size={18} />, gradient: "from-red-500 to-rose-600", glow: "shadow-red-500/25" },
  DISPUTED: { icon: <AlertCircle size={18} />, gradient: "from-pink-500 to-rose-600", glow: "shadow-pink-500/25" },
};

const PIPELINE_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-slate-400", CUSTOMER_CONTACTED: "bg-blue-400", VENDOR_CONTACTED: "bg-indigo-400",
  CUSTOMER_DISCUSSION: "bg-cyan-400", ADVANCE_PAYMENT_PENDING: "bg-amber-400",
  ADVANCE_PAYMENT_RECEIVED: "bg-yellow-400", BOOKING_CONFIRMED: "bg-green-400",
  PLANNING_STAGE: "bg-violet-400", VENDOR_CONFIRMATION_PENDING: "bg-orange-400",
  EVENT_PREPARATION: "bg-teal-400", EVENT_ONGOING: "bg-purple-400",
  EVENT_COMPLETED: "bg-emerald-400", CUSTOMER_FEEDBACK_PENDING: "bg-rose-400",
  CLOSED: "bg-gray-400", CANCELLED: "bg-red-400",
};

function fmtStatus(s: string) { return s.replace(/_/g, " "); }

export default function BookingAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res: any = await api.get("/investor/bookings");
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
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-28 bg-gray-800/50 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const statusData = data?.statusBreakdown || [];
  const growthData = data?.bookingGrowth || [];
  const maxGrowth = Math.max(...growthData.map((g: any) => g.bookings), 1);
  const catData = data?.categoryDistribution || [];
  const maxCat = Math.max(...catData.map((c: any) => c.bookings), 1);
  const cityData = data?.cityDistribution || [];
  const pipelineData = data?.pipelineBreakdown || [];
  const maxPipeline = Math.max(...pipelineData.map((p: any) => p.count), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Booking Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Analyze booking patterns, status distribution, and growth trends.</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {statusData.map((s: any) => {
          const cfg = STATUS_CONFIGS[s.status] || STATUS_CONFIGS.PENDING;
          return (
            <div key={s.status} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 hover:border-gray-600/60 transition-all">
              <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center text-white mb-2 shadow-lg", cfg.gradient, cfg.glow)}>
                {cfg.icon}
              </div>
              <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{s.count}</p>
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{s.status}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{formatPrice(s.revenue)}</p>
            </div>
          );
        })}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4 hover:border-gray-600/60 transition-all">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-white mb-2">
            <ShoppingBag size={18} />
          </div>
          <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{data?.total || 0}</p>
          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Total</p>
        </div>
      </div>

      {/* Growth Trend */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
          <TrendingUp size={14} className="text-blue-400" /> Booking Growth Trend
        </h3>
        {growthData.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No data yet</p>
        ) : (
          <div className="h-48 flex items-end justify-around gap-2 px-2">
            {growthData.map((g: any, i: number) => {
              const height = (g.bookings / maxGrowth) * 100;
              const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
              const monthNum = parseInt(g.month?.split("-")[1]);
              return (
                <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[9px] text-gray-400 font-bold">{g.bookings}</span>
                  <div className="w-full max-w-[50px] rounded-t-lg bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500"
                    style={{ height: `${Math.max(height, 5)}%` }} />
                  <span className="text-[9px] text-gray-500">{monthNames[monthNum]}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <Tag size={14} className="text-violet-400" /> Category Distribution
          </h3>
          {catData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No data</p>
          ) : (
            <div className="space-y-3">
              {catData.map((c: any, i: number) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-300">{c.category}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-white">{c.bookings}</span>
                      <span className="text-[10px] text-gray-500">{formatPrice(c.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-700"
                      style={{ width: `${(c.bookings / maxCat) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* City Distribution */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <MapPin size={14} className="text-amber-400" /> City Distribution
          </h3>
          {cityData.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No data</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-gray-700/30">
                    <th className="text-left p-2 font-medium">City</th>
                    <th className="text-right p-2 font-medium">Bookings</th>
                    <th className="text-right p-2 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {cityData.map((c: any, i: number) => (
                    <tr key={i} className="border-b border-gray-700/15">
                      <td className="p-2 text-sm text-gray-300">{c.city}</td>
                      <td className="p-2 text-sm text-white text-right font-semibold">{c.bookings}</td>
                      <td className="p-2 text-sm text-emerald-400 text-right font-semibold">{formatPrice(c.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline Status Breakdown */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
          <BarChart3 size={14} className="text-teal-400" /> Pipeline Status Breakdown
        </h3>
        {pipelineData.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No data</p>
        ) : (
          <div className="space-y-2.5">
            {pipelineData.sort((a: any, b: any) => b.count - a.count).map((p: any) => (
              <div key={p.status}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", PIPELINE_COLORS[p.status] || "bg-gray-400")} />
                    <span className="text-xs text-gray-300 capitalize">{fmtStatus(p.status)}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">{p.count}</span>
                </div>
                <div className="h-1.5 bg-gray-700/40 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all duration-700", PIPELINE_COLORS[p.status] || "bg-gray-400")}
                    style={{ width: `${(p.count / maxPipeline) * 100}%`, opacity: 0.7 }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Store, UserCheck, UserPlus, Clock, Award, Star,
  DollarSign, ShoppingBag, BarChart3, TrendingUp,
  ArrowUpRight, ArrowDownRight, Tag, ShieldCheck
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

type LeaderboardTab = "revenue" | "bookings" | "rating";

export default function VendorAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<LeaderboardTab>("revenue");

  useEffect(() => {
    async function fetch() {
      try {
        const res: any = await api.get("/investor/vendors");
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
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-gray-800/50 rounded-2xl animate-pulse" />
          <div className="h-96 bg-gray-800/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Vendors",
      value: data?.totalVendors?.toLocaleString() || "0",
      icon: <Store size={18} />,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/25",
    },
    {
      label: "Active Vendors",
      value: data?.activeVendors?.toLocaleString() || "0",
      icon: <ShieldCheck size={18} />,
      gradient: "from-emerald-500 to-green-600",
      glow: "shadow-emerald-500/25",
    },
    {
      label: "New Vendors (30d)",
      value: data?.newVendors?.toLocaleString() || "0",
      icon: <UserPlus size={18} />,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/25",
    },
    {
      label: "Pending Approval",
      value: data?.pendingApproval?.toLocaleString() || "0",
      icon: <Clock size={18} />,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/25",
    },
  ];

  const getLeaderboardData = () => {
    switch (activeTab) {
      case "bookings":
        return data?.topByBookings || [];
      case "rating":
        return data?.topByRating || [];
      case "revenue":
      default:
        return data?.topByRevenue || [];
    }
  };

  const currentLeaderboard = getLeaderboardData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Vendor Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Analyze vendor onboarding, category market shares, and performance leaderboards.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 hover:border-gray-600/60 transition-all duration-300">
            <div className="flex items-start justify-between">
              <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg", kpi.gradient, kpi.glow)}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-white mt-3" style={{ fontFamily: "var(--font-outfit)" }}>{kpi.value}</p>
            <p className="text-[10px] text-gray-500 mt-1 font-medium uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Vendor Leaderboard */}
        <div className="lg:col-span-2 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <h3 className="text-sm font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
              <Award size={14} className="text-amber-400" /> Vendor Leaderboard
            </h3>
            <div className="flex rounded-lg bg-gray-900/60 p-1 border border-gray-800">
              <button
                onClick={() => setActiveTab("revenue")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md font-medium transition-all",
                  activeTab === "revenue"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                Revenue
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md font-medium transition-all",
                  activeTab === "bookings"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab("rating")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md font-medium transition-all",
                  activeTab === "rating"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                )}
              >
                Rating
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto">
            {currentLeaderboard.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-12">No vendor data available</p>
            ) : (
              <table className="w-full text-left text-sm text-gray-400">
                <thead>
                  <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                    <th className="pb-3 pl-2">Rank</th>
                    <th className="pb-3">Business Name</th>
                    <th className="pb-3 text-right">Bookings</th>
                    {activeTab !== "rating" && <th className="pb-3 text-right">Revenue</th>}
                    <th className="pb-3 text-right pr-2">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {currentLeaderboard.map((vendor: any, idx: number) => (
                    <tr key={vendor.id} className="hover:bg-gray-700/20 transition-colors group">
                      <td className="py-3.5 pl-2 font-bold text-gray-500 group-hover:text-emerald-400 transition-colors">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5 font-semibold text-gray-200">
                        {vendor.businessName}
                      </td>
                      <td className="py-3.5 text-right font-medium text-gray-300">
                        {vendor.bookings?.toLocaleString() || 0}
                      </td>
                      {activeTab !== "rating" && (
                        <td className="py-3.5 text-right font-semibold text-emerald-400">
                          {formatPrice(vendor.revenue || 0)}
                        </td>
                      )}
                      <td className="py-3.5 text-right pr-2">
                        <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-md text-xs">
                          <Star size={10} className="fill-amber-400" />
                          {vendor.rating ? parseFloat(vendor.rating).toFixed(1) : "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <Tag size={14} className="text-teal-400" /> Category Breakdown
          </h3>
          <div className="space-y-4">
            {(!data?.categoryPerformance || data.categoryPerformance.length === 0) ? (
              <p className="text-sm text-gray-500 text-center py-12">No category data available</p>
            ) : (
              data.categoryPerformance.map((cat: any, idx: number) => {
                const maxRevenue = Math.max(...data.categoryPerformance.map((c: any) => c.revenue), 1);
                const widthPercent = (cat.revenue / maxRevenue) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-300">{cat.category}</span>
                      <span className="font-medium text-emerald-400">{formatPrice(cat.revenue || 0)}</span>
                    </div>
                    <div className="h-2 bg-gray-700/40 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${Math.max(widthPercent, 4)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-gray-500">
                      <span>{cat.vendors || 0} Vendors</span>
                      <span>{cat.bookings || 0} Bookings</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Users, UserCheck, TrendingUp, CheckSquare, Award,
  DollarSign, BarChart3, Mail, Percent, Zap
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

export default function EmployeeAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res: any = await api.get("/investor/employees");
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
        <div className="h-96 bg-gray-800/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const kpis = [
    {
      label: "Total Employees",
      value: data?.totalEmployees?.toLocaleString() || "0",
      icon: <Users size={18} />,
      gradient: "from-blue-500 to-indigo-600",
      glow: "shadow-blue-500/25",
    },
    {
      label: "Conversion Rate",
      value: `${data?.overallConversionRate || 0}%`,
      icon: <Percent size={18} />,
      gradient: "from-emerald-500 to-green-600",
      glow: "shadow-emerald-500/25",
    },
    {
      label: "Total Leads Handled",
      value: data?.totalLeads?.toLocaleString() || "0",
      icon: <Zap size={18} />,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/25",
    },
    {
      label: "Leads Converted",
      value: data?.totalConverted?.toLocaleString() || "0",
      icon: <UserCheck size={18} />,
      gradient: "from-amber-500 to-orange-600",
      glow: "shadow-amber-500/25",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Employee Performance</h1>
        <p className="text-sm text-gray-400 mt-1">Review operational productivity, sales conversion rates, and employee leaderboards.</p>
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

      {/* Leaderboard Table */}
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-5 flex flex-col">
        <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
          <Award size={14} className="text-amber-400" /> Operational Leaderboard
        </h3>

        <div className="overflow-x-auto">
          {(!data?.leaderboard || data.leaderboard.length === 0) ? (
            <p className="text-sm text-gray-500 text-center py-12">No employee performance records found</p>
          ) : (
            <table className="w-full text-left text-sm text-gray-400">
              <thead>
                <tr className="border-b border-gray-800 text-[10px] uppercase tracking-wider font-semibold text-gray-500">
                  <th className="pb-3 pl-2">Rank</th>
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3 text-right">Leads Handled</th>
                  <th className="pb-3 text-right">Converted</th>
                  <th className="pb-3 text-right">Conversion Rate</th>
                  <th className="pb-3 text-right">Follow-ups</th>
                  <th className="pb-3 text-right pr-2">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/40">
                {data.leaderboard.map((emp: any, idx: number) => {
                  const followUpPercent = emp.total_followups > 0
                    ? Math.round((emp.followups_completed / emp.total_followups) * 100)
                    : 0;

                  return (
                    <tr key={emp.id} className="hover:bg-gray-700/20 transition-colors group">
                      <td className="py-3.5 pl-2 font-bold text-gray-500 group-hover:text-emerald-400 transition-colors">
                        #{idx + 1}
                      </td>
                      <td className="py-3.5">
                        <div className="font-semibold text-gray-200">{emp.name}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail size={10} /> {emp.email}
                        </div>
                      </td>
                      <td className="py-3.5 text-right font-medium text-gray-300">
                        {emp.leads_handled || 0}
                      </td>
                      <td className="py-3.5 text-right font-medium text-gray-300">
                        {emp.leads_converted || 0}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 font-semibold text-emerald-400">
                          {emp.conversion_rate || 0}%
                        </div>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="text-gray-300 font-medium">{emp.followups_completed} / {emp.total_followups}</div>
                        <div className="text-[9px] text-gray-500 font-semibold uppercase">{followUpPercent}% Comp.</div>
                      </td>
                      <td className="py-3.5 text-right font-bold text-emerald-400 pr-2">
                        {formatPrice(emp.revenue_generated || 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

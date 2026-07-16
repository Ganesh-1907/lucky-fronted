"use client";

import { DollarSign, TrendingUp, ArrowUpRight, Download, Calendar, ChevronDown, Loader2 } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function VendorEarningsPage() {
  const [period, setPeriod] = useState("yearly");
  const { data, isLoading } = useQuery({
    queryKey: ["vendor", "earnings"],
    queryFn: () => api.get<any>("/vendors/earnings"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  const d = data || {};
  const monthlyEarnings: { month: string; earnings: number; bookings: number }[] = d.monthlyRevenue || d.monthlyEarnings || [];
  const transactions: any[] = d.transactions || [];

  const totalEarnings = monthlyEarnings.reduce((s: number, m: any) => s + (m.earnings || m.amount || 0), 0);
  const totalCommission = Math.round(totalEarnings * 0.15);
  const netEarnings = totalEarnings - totalCommission;
  const maxEarning = Math.max(...monthlyEarnings.map((m: any) => m.earnings || m.amount || 0), 1);

  const chartData = monthlyEarnings.map((m: any) => ({
    month: m.month,
    amount: m.earnings || m.amount || 0,
    bookings: m.bookings || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Track your revenue and payouts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={14} /> Export Report
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(totalEarnings)}</p>
          <p className="text-xs text-gray-500 mt-1">Gross Earnings (2024)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(totalCommission)}</p>
          <p className="text-xs text-gray-500 mt-1">Platform Commission (15%)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(netEarnings)}</p>
          <p className="text-xs text-gray-500 mt-1">Net Earnings</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Monthly Revenue</h2>
        <div className="h-56 flex items-end justify-around gap-1 px-2">
          {chartData.map((m: any) => (
            <div key={m.month} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-[10px] font-medium text-gray-600">{formatPrice(m.amount)}</span>
              <div
                className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-700 hover:to-emerald-500 transition-all cursor-pointer"
                style={{ height: `${(m.amount / maxEarning) * 100}%` }}
                title={`${m.month}: ${formatPrice(m.amount)} (${m.bookings} bookings)`}
              />
              <span className="text-[10px] text-gray-400">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                <th className="text-left p-4 font-medium">Booking</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Service</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Commission</th>
                <th className="text-left p-4 font-medium">Net</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t: any) => {
                const amount = t.totalAmount || t.amount || 0;
                const commission = t.commission ?? Math.round(amount * 0.15);
                const net = t.net ?? (amount - commission);
                return (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="text-sm font-mono font-bold text-emerald-600">{t.bookingNumber || t.bookingId || t.id}</p>
                      <p className="text-xs text-gray-500">{t.client?.name || t.customer || "Unknown"} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : t.date}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-700 truncate max-w-[180px]">{t.service?.title || t.service}</td>
                    <td className="p-4 text-sm font-medium text-gray-900">{formatPrice(amount)}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-red-600">-{formatPrice(commission)}</td>
                    <td className="p-4 text-sm font-bold text-emerald-600">{formatPrice(net)}</td>
                    <td className="p-4">
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full",
                        t.status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>{t.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

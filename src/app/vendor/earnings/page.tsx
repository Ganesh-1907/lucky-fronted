"use client";

import { DollarSign, TrendingUp, ArrowUpRight, Download, Calendar, ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useState } from "react";

const monthlyEarnings = [
  { month: "Jan", amount: 45000, bookings: 23 },
  { month: "Feb", amount: 52000, bookings: 28 },
  { month: "Mar", amount: 68000, bookings: 35 },
  { month: "Apr", amount: 58000, bookings: 30 },
  { month: "May", amount: 72000, bookings: 38 },
  { month: "Jun", amount: 85000, bookings: 45 },
  { month: "Jul", amount: 78000, bookings: 40 },
  { month: "Aug", amount: 92000, bookings: 48 },
  { month: "Sep", amount: 88000, bookings: 46 },
  { month: "Oct", amount: 105000, bookings: 55 },
  { month: "Nov", amount: 115000, bookings: 60 },
  { month: "Dec", amount: 98000, bookings: 52 },
];

const transactions = [
  { id: 1, bookingId: "LM7X8K2A", customer: "Priya Sharma", service: "Birthday Balloon Decoration", amount: 4498, commission: 675, net: 3823, status: "PAID", date: "2024-03-15" },
  { id: 2, bookingId: "LM7X8K4C", customer: "Anita Patel", service: "Royal Wedding Stage", amount: 42999, commission: 6450, net: 36549, status: "PAID", date: "2024-03-14" },
  { id: 3, bookingId: "LM7X8K5D", customer: "Vikram Singh", service: "Kids Theme Party", amount: 6498, commission: 975, net: 5523, status: "PENDING", date: "2024-03-16" },
  { id: 4, bookingId: "LM7X8K7F", customer: "Sneha Kapoor", service: "Anniversary Setup", amount: 2499, commission: 375, net: 2124, status: "PENDING", date: "2024-03-25" },
];

const maxEarning = Math.max(...monthlyEarnings.map(m => m.amount));

export default function VendorEarningsPage() {
  const [period, setPeriod] = useState("yearly");

  const totalEarnings = monthlyEarnings.reduce((s, m) => s + m.amount, 0);
  const totalCommission = Math.round(totalEarnings * 0.15);
  const netEarnings = totalEarnings - totalCommission;

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
            <span className="flex items-center gap-0.5 text-xs font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={10} /> +18.2%
            </span>
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
          {monthlyEarnings.map((m) => (
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
              {transactions.map(t => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="p-4">
                    <p className="text-sm font-mono font-bold text-emerald-600">{t.bookingId}</p>
                    <p className="text-xs text-gray-500">{t.customer} · {t.date}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-gray-700 truncate max-w-[180px]">{t.service}</td>
                  <td className="p-4 text-sm font-medium text-gray-900">{formatPrice(t.amount)}</td>
                  <td className="p-4 hidden md:table-cell text-sm text-red-600">-{formatPrice(t.commission)}</td>
                  <td className="p-4 text-sm font-bold text-emerald-600">{formatPrice(t.net)}</td>
                  <td className="p-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full",
                      t.status === "PAID" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>{t.status}</span>
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

"use client";

import { useState } from "react";
import { Search, Eye, Download, ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAdminPayments } from "@/hooks/useApi";

const statusFilters = ["All", "SUCCESS", "PENDING", "REFUNDED", "FAILED"];
const statusColors: Record<string, string> = {
  SUCCESS: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REFUNDED: "bg-blue-100 text-blue-700",
  FAILED: "bg-red-100 text-red-700",
};

const methodIcons: Record<string, string> = { RAZORPAY: "💳", UPI: "📱", CARD: "💳", NETBANKING: "🏦", WALLET: "👛" };

export default function AdminPaymentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const { data, isLoading } = useAdminPayments(statusFilter, search);
  const payments = data?.data || (data as any)?.pagination ? (data as any).data : [];

  const totalRevenue = payments.filter((p: any) => p.status === "SUCCESS").reduce((s: number, p: any) => s + p.amount, 0);
  const totalCommission = payments.filter((p: any) => p.status === "SUCCESS").reduce((s: number, p: any) => s + p.commission, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Track all platform payments and commissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">Total Collections</p>
          <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">Platform Commission</p>
          <p className="text-2xl font-bold text-emerald-600" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(totalCommission)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500 mb-1">Vendor Payouts</p>
          <p className="text-2xl font-bold text-violet-600" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(totalRevenue - totalCommission)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by payment ID or customer..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2">
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  statusFilter === s ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>{s === "All" ? "All" : s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 font-medium">Payment ID</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Customer</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Vendor</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Commission</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Method</th>
                <th className="text-left p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">Loading payments...</td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">No payments found.</td>
                </tr>
              ) : (
                payments.map((p: any) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="text-xs font-mono font-bold text-violet-600">{p.paymentId}</p>
                      <p className="text-xs text-gray-400">{p.createdAt}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm font-medium text-gray-900">{p.customer}</p>
                      <p className="text-xs text-gray-400">#{p.bookingNumber}</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm text-gray-600">{p.vendor}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">{formatPrice(p.amount)}</td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm text-emerald-600 font-medium">{formatPrice(p.commission)}</p>
                      <p className="text-xs text-gray-400">Payout: {formatPrice(p.vendorPayout)}</p>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className="text-sm">{methodIcons[p.method] || "💳"} {p.method}</span>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full", statusColors[p.status] || "bg-gray-100 text-gray-700")}>{p.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

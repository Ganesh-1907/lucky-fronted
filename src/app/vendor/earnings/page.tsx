"use client";

import { DollarSign, TrendingUp, Download, Loader2, Calendar } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function VendorEarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor", "earnings"],
    queryFn: () => api.get<any>("/vendors/earnings"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading your earnings...</p>
      </div>
    );
  }

  const d = data?.data || {};
  const monthlyEarnings: any[] = d.monthlyEarnings || [];
  const transactions: any[] = d.recentTransactions || [];
  
  // Calculate stats directly from dynamic response if not provided in totalEarnings
  const totalGross = monthlyEarnings.reduce((sum: number, m: any) => sum + (Number(m.revenue) || 0), 0);
  const totalCommission = Math.round(totalGross * 0.10); // Standard 10% commission assumption
  const netEarnings = totalGross - totalCommission;
  
  const maxEarning = Math.max(...monthlyEarnings.map((m: any) => Number(m.revenue) || 0), 1);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Earnings</h1>
          <p className="text-sm text-gray-500 mt-1">Track your revenue, payouts, and recent transactions.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(totalGross)}</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">Gross Earnings</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(totalCommission)}</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">Platform Commission (10%)</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-emerald-600" style={{ fontFamily: "var(--font-outfit)" }}>{formatPrice(netEarnings)}</p>
          <p className="text-sm text-gray-500 mt-1 font-medium">Net Earnings</p>
        </div>
      </div>

      {/* Monthly Revenue Breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 mb-6 border-b border-gray-50 pb-4">Monthly Revenue Breakdown</h2>
        {monthlyEarnings.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No revenue data available yet.</div>
        ) : (
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {[...monthlyEarnings].reverse().map((m: any) => {
              const percentage = Math.max((m.revenue / maxEarning) * 100, 2);
              const formattedMonth = (() => {
                try {
                  return new Date(m.month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
                } catch {
                  return m.month;
                }
              })();

              return (
                <div key={m.month} className="relative w-full bg-gray-50/50 rounded-xl overflow-hidden border border-gray-100/50 shrink-0">
                  {/* Background Bar */}
                  <div 
                    className="absolute top-0 left-0 h-full bg-emerald-50 transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                  />
                  
                  {/* Content */}
                  <div className="relative z-10 flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{formattedMonth}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{m.bookings} {m.bookings === 1 ? 'booking' : 'bookings'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{formatPrice(m.revenue)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">Gross</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-base font-bold text-gray-900">Recent Transactions</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">No recent transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-gray-500 uppercase tracking-wider border-b border-gray-50 bg-gray-50/50">
                  <th className="text-left p-4 font-bold">Booking Info</th>
                  <th className="text-left p-4 font-bold hidden md:table-cell">Service</th>
                  <th className="text-left p-4 font-bold">Gross Amount</th>
                  <th className="text-left p-4 font-bold hidden md:table-cell">Commission</th>
                  <th className="text-left p-4 font-bold">Net Earnings</th>
                  <th className="text-left p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => {
                  const amount = Number(t.totalAmount) || 0;
                  const commission = Math.round(amount * 0.10);
                  const net = amount - commission;
                  return (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <p className="text-sm font-bold font-mono text-gray-900">{t.bookingNumber}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.client?.name || "Guest"} &bull; {new Date(t.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4 hidden md:table-cell text-sm text-gray-600 truncate max-w-[200px]">
                        {t.service?.title || "Unknown Service"}
                      </td>
                      <td className="p-4 text-sm font-semibold text-gray-900">{formatPrice(amount)}</td>
                      <td className="p-4 hidden md:table-cell text-sm font-medium text-orange-600">-{formatPrice(commission)}</td>
                      <td className="p-4 text-sm font-bold text-emerald-600">{formatPrice(net)}</td>
                      <td className="p-4">
                        <span className={cn(
                          "text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wide uppercase",
                          t.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : 
                          t.status === "CONFIRMED" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

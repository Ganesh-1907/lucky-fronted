"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { formatPrice, cn } from "@/lib/utils";
import Link from "next/link";
import { 
  BarChart3, DollarSign, ShoppingBag, Layers, Star, 
  ArrowUpRight, ArrowDownRight, Download, Filter,
  PieChart, Activity, Users, Clock, AlertCircle, RefreshCw, ChevronRight, CheckCircle2, XCircle
} from "lucide-react";

const dateRanges = [
  { label: "Today", value: "today" },
  { label: "Last 7 Days", value: "7d" },
  { label: "Last 30 Days", value: "30d" },
  { label: "Last 90 Days", value: "90d" },
  { label: "Last Year", value: "1y" },
];

export default function VendorAnalytics() {
  const [range, setRange] = useState("30d");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["vendor", "analytics", range],
    queryFn: () => api.get<any>(`/vendors/analytics?range=${range}`),
    staleTime: 60000,
  });

  const d = data?.data || data || {};
  const m = d.metrics || {};
  const statusDist = d.statusDistribution || [];
  const topServices = d.topServices || [];
  const chartData = d.chartData || [];

  const handleExport = () => {
    if (!chartData.length) return;
    const csvContent = "data:text/csv;charset=utf-8,Date,Revenue,Bookings\n" + 
      chartData.map((row: any) => `${row.date},${row.revenue},${row.bookings}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `business_analytics_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="flex justify-between items-center mb-8">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-10 bg-gray-200 rounded w-64"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>)}
        </div>
        <div className="h-96 bg-gray-200 rounded-xl mt-6"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics Unavailable</h2>
        <p className="text-gray-500 mb-6">There was an error loading your business metrics.</p>
        <button onClick={() => refetch()} className="px-5 py-2.5 bg-gray-900 text-white rounded-xl inline-flex items-center gap-2 hover:bg-gray-800 transition-colors text-sm font-medium">
          <RefreshCw size={16} /> Retry Fetch
        </button>
      </div>
    );
  }

  const maxRevenue = Math.max(...chartData.map((c: any) => c.revenue), 100);
  const totalBookingsStatus = statusDist.reduce((acc: number, curr: any) => acc + curr.value, 0) || 1;

  const getGrowthColor = (val: number) => {
    if (val > 0) return "text-emerald-600 bg-emerald-50";
    if (val < 0) return "text-rose-600 bg-rose-50";
    return "text-gray-600 bg-gray-50";
  };

  const GrowthBadge = ({ value }: { value: number }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold", getGrowthColor(value))}>
        {isPositive ? <ArrowUpRight size={12} /> : isNegative ? <ArrowDownRight size={12} /> : null}
        {Math.abs(value).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Analytics & Insights</h1>
          <p className="text-sm text-gray-500 mt-1">Track your performance and business growth.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors appearance-none outline-none focus:border-gray-300 cursor-pointer"
            >
              {dateRanges.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleExport}
            disabled={chartData.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium shadow-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue KPI */}
        <Link href="/vendor/earnings" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all group block">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 transition-transform group-hover:scale-110">
              <DollarSign size={20} />
            </div>
            <GrowthBadge value={m.revenueGrowth || 0} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{formatPrice(m.totalRevenue || 0)}</h3>
        </Link>

        {/* Bookings KPI */}
        <Link href="/vendor/bookings" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all group block">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 transition-transform group-hover:scale-110">
              <ShoppingBag size={20} />
            </div>
            <GrowthBadge value={m.bookingsGrowth || 0} />
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Total Bookings</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{m.totalBookings || 0}</h3>
        </Link>

        {/* AOV KPI */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
              <Activity size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Average Order Value</p>
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{formatPrice(m.averageOrderValue || 0)}</h3>
        </div>

        {/* Conversion / Rating KPI */}
        <Link href="/vendor/reviews" className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-gray-200 hover:shadow-md transition-all group block">
          <div className="flex items-start justify-between mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 transition-transform group-hover:scale-110">
              <Star size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-500 mb-1">Average Rating</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{(m.avgRating || 0).toFixed(1)}</h3>
            <span className="text-xs font-medium text-gray-400">/ 5.0</span>
          </div>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Main Chart: Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Income over the selected period</p>
            </div>
          </div>
          
          {chartData.length > 0 ? (
            <div className="flex-1 flex items-end gap-1.5 md:gap-3 mt-4 relative pt-10">
              {/* Y-Axis lines (decorative) */}
              <div className="absolute inset-0 flex flex-col justify-between border-b border-gray-100 pb-6 pointer-events-none">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-full border-t border-gray-100/60" />
                ))}
              </div>
              
              {chartData.map((point: any, i: number) => {
                const heightPercent = Math.max((point.revenue / maxRevenue) * 100, 2); // min 2% height for visibility
                return (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group relative z-10">
                    {/* Tooltip */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20 shadow-xl">
                      <p className="font-bold">{formatPrice(point.revenue)}</p>
                      <p className="text-gray-300 text-[10px]">{point.day}</p>
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className="w-full bg-emerald-100 rounded-t-sm transition-all duration-300 group-hover:bg-emerald-400 max-w-[40px]" 
                      style={{ height: `${heightPercent}%` }} 
                    />
                    
                    {/* X-Axis label */}
                    <span className="text-[10px] text-gray-400 mt-2 rotate-45 md:rotate-0 origin-left truncate w-full text-center">
                      {chartData.length > 15 && i % 2 !== 0 ? "" : point.day}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                <BarChart3 size={24} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900">No revenue data</p>
              <p className="text-xs text-gray-500 mt-1 max-w-[200px]">There is no recorded revenue in this time period.</p>
            </div>
          )}
        </div>

        {/* Secondary Metrics Column */}
        <div className="space-y-6">
          
          {/* Operational Metrics */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Operational Health</h2>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500"/> Completion Rate</span>
                  <span className="font-bold text-gray-900">{m.completionRate?.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${m.completionRate || 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 flex items-center gap-2"><Activity size={14} className="text-blue-500"/> Acceptance Rate</span>
                  <span className="font-bold text-gray-900">{m.acceptanceRate?.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${m.acceptanceRate || 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-gray-500 flex items-center gap-2"><XCircle size={14} className="text-rose-500"/> Cancellation Rate</span>
                  <span className="font-bold text-gray-900">{m.cancellationRate?.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${m.cancellationRate || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Insights */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-5">Customer Insights</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Users size={18} className="text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-500">Total Unique</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{m.totalCustomers || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <RefreshCw size={18} className="text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-500">Repeat</p>
                <p className="text-xl font-bold text-gray-900 mt-1">{m.repeatCustomers || 0}</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Grid: Top Services & Status Dist */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Top Performing Services */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Top Performing Services</h2>
            <Link href="/vendor/services" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          <div className="p-0">
            {topServices.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {topServices.map((service: any, index: number) => (
                  <Link key={service.id} href={`/vendor/services/${service.id}/edit`} className="flex items-center justify-between p-4 sm:p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-bold shrink-0">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-1">{service.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{service.count} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(service.revenue)}</p>
                      <p className="text-xs text-gray-400 mt-1">Generated</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Layers size={24} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900">No service data</p>
                <p className="text-xs text-gray-500 mt-1">Services will appear here once they receive bookings.</p>
              </div>
            )}
          </div>
        </div>

        {/* Booking Status Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 mb-6">Booking Pipeline</h2>
          
          {totalBookingsStatus > 1 ? (
            <div className="space-y-4">
              {statusDist.sort((a: any, b: any) => b.value - a.value).map((status: any) => {
                const percentage = (status.value / totalBookingsStatus) * 100;
                let colorClass = "bg-gray-200";
                
                if (status.name === 'COMPLETED') colorClass = "bg-emerald-500";
                else if (status.name === 'CONFIRMED') colorClass = "bg-blue-500";
                else if (status.name === 'PENDING') colorClass = "bg-amber-400";
                else if (status.name === 'CANCELLED') colorClass = "bg-rose-500";
                else if (status.name === 'IN_PROGRESS') colorClass = "bg-violet-500";

                return (
                  <div key={status.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-gray-700">{status.name.replace(/_/g, " ")}</span>
                      <span className="font-bold text-gray-900">{status.value} <span className="text-xs font-normal text-gray-400">({percentage.toFixed(0)}%)</span></span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all duration-1000", colorClass)} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
             <div className="py-12 text-center">
              <PieChart size={24} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-900">No pipeline data</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

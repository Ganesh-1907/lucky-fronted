"use client";

import { useState } from "react";
import { Search, CheckCircle, XCircle, Clock, Eye, ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const bookings = [
  { id: "LM7X8K2A", customer: "Priya Sharma", phone: "+91 98765 43210", service: "Premium Birthday Balloon Decoration", amount: 4498, advancePaid: 2249, status: "CONFIRMED", bookingDate: "2024-03-20", timeSlot: "10:00 AM", city: "Mumbai", address: "Andheri West, Mumbai", notes: "Theme: Pink & Gold" },
  { id: "LM7X8K3B", customer: "Rahul Verma", phone: "+91 98765 43211", service: "Romantic Candlelight Dinner", amount: 5698, advancePaid: 0, status: "PENDING", bookingDate: "2024-03-22", timeSlot: "7:00 PM", city: "Delhi", address: "Connaught Place, Delhi", notes: "Anniversary surprise" },
  { id: "LM7X8K5D", customer: "Vikram Singh", phone: "+91 98765 43213", service: "Kids Theme Party Setup", amount: 6498, advancePaid: 3249, status: "IN_PROGRESS", bookingDate: "2024-03-16", timeSlot: "3:00 PM", city: "Pune", address: "Hinjewadi, Pune", notes: "Spiderman theme" },
  { id: "LM7X8K7F", customer: "Sneha Kapoor", phone: "+91 98765 43215", service: "Simple Anniversary Setup", amount: 2499, advancePaid: 1250, status: "PENDING", bookingDate: "2024-03-25", timeSlot: "6:00 PM", city: "Mumbai", address: "Bandra, Mumbai", notes: "" },
  { id: "LM7X8K4C", customer: "Anita Patel", phone: "+91 98765 43212", service: "Royal Wedding Stage", amount: 42999, advancePaid: 21500, status: "COMPLETED", bookingDate: "2024-03-14", timeSlot: "8:00 AM", city: "Bangalore", address: "Whitefield, Bangalore", notes: "100 guests expected" },
];

const statusFilters = ["All", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function VendorBookingsPage() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = bookings.filter(b => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
    if (search && !b.id.toLowerCase().includes(search.toLowerCase()) && !b.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your customer bookings</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by ID or customer..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  statusFilter === s ? "bg-emerald-100 text-emerald-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {s === "All" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings as expandable cards */}
      <div className="space-y-3">
        {filtered.map(booking => (
          <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div
              className="flex items-center gap-4 p-5 cursor-pointer"
              onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
            >
              <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-3 items-center">
                <div>
                  <p className="text-sm font-mono font-bold text-emerald-600">{booking.id}</p>
                  <p className="text-xs text-gray-500">{booking.customer}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-gray-700 truncate">{booking.service}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm text-gray-900">{booking.bookingDate}</p>
                  <p className="text-xs text-gray-500">{booking.timeSlot}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-gray-900">{formatPrice(booking.amount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", statusColors[booking.status])}>
                    {booking.status.replace("_", " ")}
                  </span>
                  <ChevronDown size={16} className={cn("text-gray-400 transition-transform", expandedId === booking.id && "rotate-180")} />
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {expandedId === booking.id && (
              <div className="px-5 pb-5 border-t border-gray-100 pt-4 animate-fade-in">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Customer Details</p>
                    <p className="text-sm font-medium text-gray-900">{booking.customer}</p>
                    <p className="text-sm text-gray-600">{booking.phone}</p>
                    <p className="text-sm text-gray-600">{booking.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Payment</p>
                    <p className="text-sm text-gray-700">Total: <strong>{formatPrice(booking.amount)}</strong></p>
                    <p className="text-sm text-gray-700">Advance: <strong>{formatPrice(booking.advancePaid)}</strong></p>
                    <p className="text-sm text-emerald-600 font-medium">Remaining: {formatPrice(booking.amount - booking.advancePaid)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-600">{booking.notes || "No notes"}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                  {booking.status === "PENDING" && (
                    <>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
                        <CheckCircle size={14} /> Accept
                      </button>
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">
                        <XCircle size={14} /> Decline
                      </button>
                    </>
                  )}
                  {booking.status === "CONFIRMED" && (
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">
                      <Clock size={14} /> Start Service
                    </button>
                  )}
                  {booking.status === "IN_PROGRESS" && (
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
                      <CheckCircle size={14} /> Mark Complete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

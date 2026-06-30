"use client";

import { useState } from "react";
import { Search, Eye, ChevronDown } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const bookings = [
  { id: 1, bookingNumber: "LM7X8K2A", customer: "Priya Sharma", phone: "+91 98765 43210", service: "Premium Birthday Balloon Decoration", vendor: "Dream Decorators", amount: 4498, advancePaid: 2249, status: "CONFIRMED", bookingDate: "2024-03-20", timeSlot: "10:00 AM", city: "Mumbai", createdAt: "2024-03-15" },
  { id: 2, bookingNumber: "LM7X8K3B", customer: "Rahul Verma", phone: "+91 98765 43211", service: "Romantic Candlelight Dinner", vendor: "Dream Decorators", amount: 5698, advancePaid: 0, status: "PENDING", bookingDate: "2024-03-22", timeSlot: "7:00 PM", city: "Delhi", createdAt: "2024-03-15" },
  { id: 3, bookingNumber: "LM7X8K4C", customer: "Anita Patel", phone: "+91 98765 43212", service: "Royal Wedding Stage", vendor: "Dream Decorators", amount: 42999, advancePaid: 21500, status: "COMPLETED", bookingDate: "2024-03-14", timeSlot: "8:00 AM", city: "Bangalore", createdAt: "2024-03-10" },
  { id: 4, bookingNumber: "LM7X8K5D", customer: "Vikram Singh", phone: "+91 98765 43213", service: "Kids Theme Party Setup", vendor: "Party Kings", amount: 6498, advancePaid: 3249, status: "IN_PROGRESS", bookingDate: "2024-03-16", timeSlot: "3:00 PM", city: "Pune", createdAt: "2024-03-12" },
  { id: 5, bookingNumber: "LM7X8K6E", customer: "Meera Joshi", phone: "+91 98765 43214", service: "Simple Anniversary Decoration", vendor: "Love Setup Co", amount: 2499, advancePaid: 1250, status: "CANCELLED", bookingDate: "2024-03-18", timeSlot: "5:00 PM", city: "Mumbai", createdAt: "2024-03-13" },
];

const statusFilters = ["All", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function AdminBookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = bookings.filter(b => {
    if (statusFilter !== "All" && b.status !== statusFilter) return false;
    if (search && !b.bookingNumber.toLowerCase().includes(search.toLowerCase()) && !b.customer.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all customer bookings</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by booking ID or customer..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-all",
                  statusFilter === s ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {s === "All" ? "All" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 font-medium">Booking</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Service</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Date & Time</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Advance</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(booking => (
                <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <p className="text-sm font-mono font-bold text-violet-600">{booking.bookingNumber}</p>
                    <p className="text-xs text-gray-700 font-medium">{booking.customer}</p>
                    <p className="text-xs text-gray-400">{booking.phone}</p>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <p className="text-sm text-gray-900 truncate max-w-[200px]">{booking.service}</p>
                    <p className="text-xs text-gray-500">{booking.vendor}</p>
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    <p className="text-sm text-gray-900">{booking.bookingDate}</p>
                    <p className="text-xs text-gray-500">{booking.timeSlot} · {booking.city}</p>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-bold text-gray-900">{formatPrice(booking.amount)}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-sm text-gray-700">{formatPrice(booking.advancePaid)}</span>
                    <p className="text-xs text-gray-400">Remaining: {formatPrice(booking.amount - booking.advancePaid)}</p>
                  </td>
                  <td className="p-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", statusColors[booking.status])}>
                      {booking.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="View Details">
                      <Eye size={16} />
                    </button>
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

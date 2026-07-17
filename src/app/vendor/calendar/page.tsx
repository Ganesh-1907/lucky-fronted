"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Loader2, Calendar as CalendarIcon, User, CreditCard, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Link from "next/link";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const statusConfig: Record<string, { bg: string; dot: string; text: string }> = {
  PENDING: { bg: "bg-amber-100", dot: "bg-amber-500", text: "text-amber-700" },
  CONFIRMED: { bg: "bg-blue-100", dot: "bg-blue-500", text: "text-blue-700" },
  IN_PROGRESS: { bg: "bg-violet-100", dot: "bg-violet-500", text: "text-violet-700" },
  COMPLETED: { bg: "bg-emerald-100", dot: "bg-emerald-500", text: "text-emerald-700" },
  CANCELLED: { bg: "bg-red-100", dot: "bg-red-500", text: "text-red-700" },
};

export default function VendorCalendarPage() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", "calendar", year, month],
    queryFn: () => api.get<any>(`/vendors/calendar?month=${month + 1}&year=${year}`),
  });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const formatDate = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const bookingsByDate: Record<string, { id: number; bookingNumber: string; time: string; customer: string; service: string; status: string; paymentStatus: string; city: string }[]> = data?.data || {};
  const selectedBookings = selectedDate ? bookingsByDate[selectedDate] || [] : [];

  let totalBookings = 0;
  let completedBookings = 0;
  let pendingBookings = 0;
  Object.values(bookingsByDate).forEach((dayBookings) => {
    if (Array.isArray(dayBookings)) {
      totalBookings += dayBookings.length;
      dayBookings.forEach((b) => {
        if (b.status === "COMPLETED") completedBookings++;
        if (b.status === "PENDING" || b.status === "CONFIRMED") pendingBookings++;
      });
    }
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Calendar Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and view your upcoming service bookings.</p>
        </div>
        <Link href="/vendor/bookings" className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm shrink-0">
          View All Bookings <ExternalLink size={14} />
        </Link>
      </div>

      {/* Analytics Banner */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total {MONTHS[month]} Bookings</p>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{totalBookings}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400"><CalendarIcon size={18} /></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{completedBookings}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500"><User size={18} /></div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-1">Upcoming / Pending</p>
            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{pendingBookings}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500"><Clock size={18} /></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Left Column: Calendar Grid */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[650px]">
          {/* Month Navigation */}
          <div className="flex items-center justify-between p-6 border-b border-gray-50 shrink-0">
            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {MONTHS[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <button onClick={() => setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1))} className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors">
                Today
              </button>
              <button onClick={nextMonth} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col min-h-0">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-2 mb-2 shrink-0">
              {DAYS.map(d => (
                <div key={d} className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            {/* Date Grid */}
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={36} />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="rounded-xl border border-transparent" />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = formatDate(day);
                  const bookings = bookingsByDate[dateStr] || [];
                  const hasBookings = bookings.length > 0;
                  const isSelected = selectedDate === dateStr;
                  const isToday = dateStr === todayStr;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        "rounded-xl flex flex-col items-center justify-center relative transition-all border p-1",
                        isSelected 
                          ? "bg-emerald-600 border-emerald-600 shadow-md shadow-emerald-500/20" 
                          : isToday 
                            ? "bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                            : "bg-white border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-semibold",
                        isSelected ? "text-white" : isToday ? "text-emerald-700" : "text-gray-700"
                      )}>
                        {day}
                      </span>
                      
                      {/* Dots Indicator */}
                      {hasBookings && (
                        <div className="flex flex-wrap justify-center gap-1 mt-1.5 w-full px-1">
                          {bookings.slice(0, 3).map((b, j) => (
                            <div key={j} className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-white/80" : statusConfig[b.status]?.dot || "bg-gray-400")} />
                          ))}
                          {bookings.length > 3 && (
                            <span className={cn("text-[9px] font-bold leading-none -mt-0.5", isSelected ? "text-emerald-100" : "text-gray-500")}>
                              +{bookings.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Date Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[650px]">
          <div className="p-6 border-b border-gray-50 shrink-0">
            <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {selectedDate ? new Date(selectedDate + "T00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : "Select a date"}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {selectedBookings.length} {selectedBookings.length === 1 ? 'Booking' : 'Bookings'} Scheduled
            </p>
          </div>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <Loader2 className="animate-spin text-emerald-500" size={24} />
                <span className="text-sm">Loading bookings...</span>
              </div>
            ) : selectedBookings.length > 0 ? (
              <div className="space-y-4">
                {selectedBookings.map((booking) => {
                  const conf = statusConfig[booking.status] || { bg: "bg-gray-100", dot: "bg-gray-500", text: "text-gray-700" };
                  
                  return (
                    <div key={booking.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors shadow-sm group">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold font-mono text-gray-500">#{booking.bookingNumber}</span>
                        <div className={cn("px-2 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase flex items-center gap-1.5", conf.bg, conf.text)}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", conf.dot)} />
                          {booking.status.replace("_", " ")}
                        </div>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 text-sm mb-1">{booking.service}</h4>
                      
                      <div className="space-y-1.5 mt-3">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <User size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate">{booking.customer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          <span>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate">{booking.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <CreditCard size={14} className="text-gray-400 shrink-0" />
                          <span>Payment: {booking.paymentStatus}</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                        <Link href={`/vendor/bookings/${booking.id}`} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                          View Details <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
                  <CalendarIcon size={24} className="text-gray-300" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">No Bookings Found</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">You have an empty schedule for {selectedDate ? new Date(selectedDate + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "this date"}.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

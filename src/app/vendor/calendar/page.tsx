"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const statusDots: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-blue-500",
  IN_PROGRESS: "bg-violet-500",
  COMPLETED: "bg-green-500",
};

export default function VendorCalendarPage() {
  const now = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(now.getFullYear(), now.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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

  const bookingsByDate: Record<string, { time: string; customer: string; service: string; status: string; city: string }[]> = data || {};
  const selectedBookings = selectedDate ? bookingsByDate[selectedDate] || [] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Calendar</h1>
        <p className="text-sm text-gray-500 mt-1">View your scheduled bookings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft size={18} /></button>
            <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {MONTHS[month]} {year}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight size={18} /></button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>
            ))}
          </div>

          {/* Date Grid */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-emerald-600" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDate(day);
                const hasBookings = !!bookingsByDate[dateStr];
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative transition-all",
                      isSelected ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" :
                      isToday ? "bg-emerald-50 text-emerald-700 font-bold" :
                      hasBookings ? "bg-gray-50 text-gray-900 hover:bg-emerald-50" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {day}
                    {hasBookings && !isSelected && (
                      <div className="flex gap-0.5 mt-0.5">
                        {bookingsByDate[dateStr].map((b, j) => (
                          <div key={j} className={cn("w-1.5 h-1.5 rounded-full", statusDots[b.status] || "bg-gray-400")} />
                        ))}
                      </div>
                    )}
                    {hasBookings && isSelected && (
                      <span className="text-[9px] mt-0.5">{bookingsByDate[dateStr].length} bookings</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Date Details */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            {selectedDate ? new Date(selectedDate + "T00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" }) : "Select a date"}
          </h3>

          {selectedBookings.length > 0 ? (
            <div className="space-y-3">
              {selectedBookings.map((booking, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn("w-2 h-2 rounded-full", statusDots[booking.status])} />
                    <span className="text-xs font-bold uppercase text-gray-500">{booking.status.replace("_", " ")}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{booking.service}</p>
                  <p className="text-xs text-gray-500 mt-1">{booking.customer}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={10} /> {booking.time}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} /> {booking.city}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📅</p>
              <p className="text-sm text-gray-500">{selectedDate ? "No bookings on this day" : "Click a date to see details"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

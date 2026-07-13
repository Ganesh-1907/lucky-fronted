"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock,
  Phone, ClipboardList
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import api from "@/lib/api";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

type ViewMode = "month" | "week" | "day";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [data, setData] = useState<any>({ events: [], followUps: [], tasks: [] });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res: any = await api.get(`/employee/calendar?month=${month + 1}&year=${year}`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [month, year]);

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else if (viewMode === "week") d.setDate(d.getDate() + dir * 7);
    else d.setDate(d.getDate() + dir);
    setCurrentDate(d);
  };

  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(firstDay).fill(null);

  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // Build events map per day
  const dayMap: Record<string, { events: any[]; followUps: any[]; tasks: any[] }> = {};

  (data.events || []).forEach((e: any) => {
    const key = new Date(e.bookingDate).toISOString().split("T")[0];
    if (!dayMap[key]) dayMap[key] = { events: [], followUps: [], tasks: [] };
    dayMap[key].events.push(e);
  });
  (data.followUps || []).forEach((f: any) => {
    const key = new Date(f.followUpDate).toISOString().split("T")[0];
    if (!dayMap[key]) dayMap[key] = { events: [], followUps: [], tasks: [] };
    dayMap[key].followUps.push(f);
  });
  (data.tasks || []).forEach((t: any) => {
    const key = new Date(t.dueDate).toISOString().split("T")[0];
    if (!dayMap[key]) dayMap[key] = { events: [], followUps: [], tasks: [] };
    dayMap[key].tasks.push(t);
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const selectedItems = selectedDate ? dayMap[selectedDate] : null;

  // Week view data
  const getWeekDates = () => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">View events, follow-ups, and tasks at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          {(["month", "week", "day"] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setViewMode(v)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors",
                viewMode === v ? "bg-violet-50 text-violet-600" : "bg-gray-50 text-gray-500 hover:text-gray-900"
              )}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
            {viewMode === "day"
              ? currentDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : `${MONTHS[month]} ${year}`}
          </h2>
          <button onClick={goToday} className="px-2 py-1 rounded-lg bg-cyan-500/10 text-[10px] text-violet-600 font-medium hover:bg-violet-50 transition-colors">
            Today
          </button>
        </div>
        <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
          {viewMode === "month" && (
            <>
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-gray-200/30">
                {DAYS.map((d) => (
                  <div key={d} className="p-2.5 text-center text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    {d}
                  </div>
                ))}
              </div>
              {/* Calendar cells */}
              {loading ? (
                <div className="p-12 text-center text-sm text-gray-500">Loading calendar...</div>
              ) : (
                weeks.map((w, wi) => (
                  <div key={wi} className="grid grid-cols-7 border-b border-gray-200/20 last:border-0">
                    {w.map((day, di) => {
                      if (!day) return <div key={di} className="p-2 min-h-[80px] bg-white/30" />;
                      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      const items = dayMap[dateStr];
                      const isToday = dateStr === todayStr;
                      const isSelected = dateStr === selectedDate;

                      return (
                        <button
                          key={di}
                          onClick={() => setSelectedDate(dateStr)}
                          className={cn(
                            "p-2 min-h-[80px] text-left transition-colors relative border-r border-gray-200/10 last:border-0",
                            isSelected ? "bg-violet-50" : "hover:bg-gray-50",
                            isToday && "bg-cyan-500/[0.03]"
                          )}
                        >
                          <span className={cn(
                            "inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium",
                            isToday ? "bg-cyan-500 text-gray-900" : isSelected ? "bg-cyan-500/20 text-violet-600" : "text-gray-500"
                          )}>
                            {day}
                          </span>
                          {items && (
                            <div className="flex flex-wrap gap-0.5 mt-1">
                              {items.events.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" title={`${items.events.length} event(s)`} />
                              )}
                              {items.followUps.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title={`${items.followUps.length} follow-up(s)`} />
                              )}
                              {items.tasks.length > 0 && (
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title={`${items.tasks.length} task(s)`} />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
              {/* Legend */}
              <div className="flex items-center gap-4 p-3 border-t border-gray-200/30">
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-violet-400" /> Events
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Follow-Ups
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <span className="w-2 h-2 rounded-full bg-blue-400" /> Tasks
                </span>
              </div>
            </>
          )}

          {viewMode === "week" && (
            <div className="divide-y divide-slate-700/20">
              {getWeekDates().map((date) => {
                const dateStr = date.toISOString().split("T")[0];
                const items = dayMap[dateStr];
                const isToday = dateStr === todayStr;
                return (
                  <button
                    key={dateStr}
                    onClick={() => setSelectedDate(dateStr)}
                    className={cn(
                      "w-full p-4 text-left flex items-center gap-4 transition-colors",
                      dateStr === selectedDate ? "bg-violet-50" : "hover:bg-gray-50",
                      isToday && "bg-cyan-500/[0.03]"
                    )}
                  >
                    <div className="text-center w-12 shrink-0">
                      <p className="text-[10px] text-gray-500 uppercase">{DAYS[date.getDay()]}</p>
                      <p className={cn(
                        "text-lg font-bold mt-0.5",
                        isToday ? "text-violet-600" : "text-gray-600"
                      )} style={{ fontFamily: "var(--font-outfit)" }}>{date.getDate()}</p>
                    </div>
                    <div className="flex-1 flex items-center gap-2 flex-wrap">
                      {items?.events.map((e: any, i: number) => (
                        <span key={`e${i}`} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30">
                          {e.service?.title || e.bookingNumber}
                        </span>
                      ))}
                      {items?.followUps.map((f: any, i: number) => (
                        <span key={`f${i}`} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {f.customerName} • {f.followUpTime}
                        </span>
                      ))}
                      {items?.tasks.map((t: any, i: number) => (
                        <span key={`t${i}`} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">
                          {t.title}
                        </span>
                      ))}
                      {!items && <span className="text-xs text-slate-600">No items</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === "day" && (() => {
            const dateStr = currentDate.toISOString().split("T")[0];
            const items = dayMap[dateStr];
            return (
              <div className="p-5 space-y-4">
                {!items ? (
                  <div className="text-center py-12">
                    <CalendarIcon size={40} className="text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Nothing scheduled for this day</p>
                  </div>
                ) : (
                  <>
                    {items.events.length > 0 && (
                      <div>
                        <h3 className="text-xs text-violet-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                          <CalendarIcon size={12} /> Events ({items.events.length})
                        </h3>
                        {items.events.map((e: any) => (
                          <div key={e.id} className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-3 mb-2">
                            <p className="text-sm font-medium text-gray-900">{e.service?.title}</p>
                            <p className="text-xs text-gray-500">{e.client?.name} • {e.timeSlot}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {items.followUps.length > 0 && (
                      <div>
                        <h3 className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Phone size={12} /> Follow-Ups ({items.followUps.length})
                        </h3>
                        {items.followUps.map((f: any) => (
                          <div key={f.id} className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-2">
                            <p className="text-sm font-medium text-gray-900">{f.customerName}</p>
                            <p className="text-xs text-gray-500">{f.followUpTime} • {f.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {items.tasks.length > 0 && (
                      <div>
                        <h3 className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                          <ClipboardList size={12} /> Tasks ({items.tasks.length})
                        </h3>
                        {items.tasks.map((t: any) => (
                          <div key={t.id} className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-2">
                            <p className="text-sm font-medium text-gray-900">{t.title}</p>
                            <p className="text-xs text-gray-500">{t.priority} • {t.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })()}
        </div>

        {/* Day Detail Panel */}
        <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-200/40">
            <h3 className="font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              {selectedDate ? formatDate(selectedDate) : "Select a date"}
            </h3>
          </div>
          <div className="p-5 space-y-4 max-h-[600px] overflow-y-auto">
            {!selectedDate || !selectedItems ? (
              <p className="text-sm text-gray-500 text-center py-8">Click a date to see details</p>
            ) : (
              <>
                {selectedItems.events.length > 0 && (
                  <div>
                    <h4 className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <CalendarIcon size={10} /> Events
                    </h4>
                    {selectedItems.events.map((e: any) => (
                      <div key={e.id} className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-3 mb-2">
                        <p className="text-sm font-medium text-gray-900">{e.service?.title || e.bookingNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{e.client?.name} • {e.timeSlot}</p>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/30 mt-1 inline-block">
                          {e.pipelineStatus?.replace(/_/g, " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedItems.followUps.length > 0 && (
                  <div>
                    <h4 className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Phone size={10} /> Follow-Ups
                    </h4>
                    {selectedItems.followUps.map((f: any) => (
                      <div key={f.id} className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 mb-2">
                        <p className="text-sm font-medium text-gray-900">{f.customerName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{f.followUpTime} • {f.reminderNote || "No note"}</p>
                        <span className={cn(
                          "text-[9px] font-bold px-2 py-0.5 rounded-full border mt-1 inline-block",
                          f.status === "COMPLETED" ? "bg-violet-50 text-violet-600 border-emerald-500/30"
                            : f.status === "MISSED" ? "bg-red-500/15 text-red-400 border-red-500/30"
                            : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        )}>
                          {f.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedItems.tasks.length > 0 && (
                  <div>
                    <h4 className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                      <ClipboardList size={10} /> Tasks
                    </h4>
                    {selectedItems.tasks.map((t: any) => (
                      <div key={t.id} className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-3 mb-2">
                        <p className="text-sm font-medium text-gray-900">{t.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn(
                            "text-[9px] font-bold px-2 py-0.5 rounded-full",
                            t.priority === "URGENT" ? "bg-red-500/15 text-red-400" :
                            t.priority === "HIGH" ? "bg-orange-500/15 text-orange-400" :
                            "bg-blue-500/15 text-blue-400"
                          )}>
                            {t.priority}
                          </span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {t.status?.replace(/_/g, " ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedItems.events.length === 0 && selectedItems.followUps.length === 0 && selectedItems.tasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-8">Nothing scheduled</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

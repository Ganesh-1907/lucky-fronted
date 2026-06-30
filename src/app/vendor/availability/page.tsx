"use client";

import { useState } from "react";
import { Plus, Trash2, Clock, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

interface TimeSlot { start: string; end: string; }
interface DaySchedule { day: string; isOpen: boolean; slots: TimeSlot[]; }

const initialSchedule: DaySchedule[] = DAYS.map(day => ({
  day,
  isOpen: day !== "Sunday",
  slots: day === "Sunday" ? [] : [{ start: "09:00", end: "18:00" }],
}));

const blockedDates = ["2024-03-25", "2024-03-26", "2024-04-01"];

export default function VendorAvailabilityPage() {
  const [schedule, setSchedule] = useState(initialSchedule);
  const [blocked, setBlocked] = useState(blockedDates);
  const [newBlockDate, setNewBlockDate] = useState("");

  const toggleDay = (idx: number) => {
    const updated = [...schedule];
    updated[idx].isOpen = !updated[idx].isOpen;
    if (updated[idx].isOpen && updated[idx].slots.length === 0) {
      updated[idx].slots = [{ start: "09:00", end: "18:00" }];
    }
    setSchedule(updated);
  };

  const addSlot = (dayIdx: number) => {
    const updated = [...schedule];
    updated[dayIdx].slots.push({ start: "09:00", end: "18:00" });
    setSchedule(updated);
  };

  const removeSlot = (dayIdx: number, slotIdx: number) => {
    const updated = [...schedule];
    updated[dayIdx].slots = updated[dayIdx].slots.filter((_, i) => i !== slotIdx);
    setSchedule(updated);
  };

  const updateSlot = (dayIdx: number, slotIdx: number, field: "start" | "end", value: string) => {
    const updated = [...schedule];
    updated[dayIdx].slots[slotIdx][field] = value;
    setSchedule(updated);
  };

  const addBlockedDate = () => {
    if (newBlockDate && !blocked.includes(newBlockDate)) {
      setBlocked([...blocked, newBlockDate]);
      setNewBlockDate("");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Availability</h1>
        <p className="text-sm text-gray-500 mt-1">Set your weekly schedule and block specific dates</p>
      </div>

      {/* Weekly Schedule */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={18} className="text-emerald-600" /> Weekly Schedule
        </h3>
        <div className="space-y-3">
          {schedule.map((day, dayIdx) => (
            <div key={day.day} className={cn("p-4 rounded-xl border transition-all", day.isOpen ? "border-gray-100 bg-white" : "border-gray-50 bg-gray-50")}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleDay(dayIdx)}
                    className={cn("transition-colors", day.isOpen ? "text-emerald-600" : "text-gray-400")}>
                    {day.isOpen ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <span className={cn("text-sm font-medium", day.isOpen ? "text-gray-900" : "text-gray-400")}>
                    {day.day}
                  </span>
                </div>
                {day.isOpen && (
                  <button onClick={() => addSlot(dayIdx)} className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
                    <Plus size={12} /> Add Slot
                  </button>
                )}
              </div>

              {day.isOpen && day.slots.map((slot, slotIdx) => (
                <div key={slotIdx} className="flex items-center gap-3 ml-9 mt-2">
                  <input type="time" value={slot.start} onChange={e => updateSlot(dayIdx, slotIdx, "start", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
                  <span className="text-gray-400 text-sm">to</span>
                  <input type="time" value={slot.end} onChange={e => updateSlot(dayIdx, slotIdx, "end", e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
                  {day.slots.length > 1 && (
                    <button onClick={() => removeSlot(dayIdx, slotIdx)} className="p-1 rounded hover:bg-red-50 text-red-500">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}

              {!day.isOpen && <p className="text-xs text-gray-400 ml-9">Closed</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Blocked Dates */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-900 mb-4">🚫 Blocked Dates</h3>
        <p className="text-sm text-gray-500 mb-4">Block specific dates when you&apos;re unavailable</p>
        <div className="flex gap-3 mb-4">
          <input type="date" value={newBlockDate} onChange={e => setNewBlockDate(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
          <button onClick={addBlockedDate} className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">
            Block Date
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {blocked.map(date => (
            <span key={date} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {date}
              <button onClick={() => setBlocked(blocked.filter(d => d !== date))} className="hover:text-red-900">×</button>
            </span>
          ))}
          {blocked.length === 0 && <p className="text-sm text-gray-400">No blocked dates</p>}
        </div>
      </div>

      <button onClick={() => toast.success("Availability saved!")} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm">
        <Save size={16} /> Save Availability
      </button>
    </div>
  );
}

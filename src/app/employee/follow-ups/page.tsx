"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Phone, Clock, CheckCircle2, AlertTriangle, Plus, X,
  Calendar, Search
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import api from "@/lib/api";

const TABS = [
  { key: "", label: "All", icon: <Phone size={14} /> },
  { key: "today", label: "Today", icon: <Clock size={14} /> },
  { key: "overdue", label: "Overdue", icon: <AlertTriangle size={14} /> },
  { key: "upcoming", label: "Upcoming", icon: <Calendar size={14} /> },
];

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({});
  const [activeTab, setActiveTab] = useState("");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [form, setForm] = useState({
    customerName: "",
    followUpDate: "",
    followUpTime: "",
    reminderNote: "",
    bookingId: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchFollowUps = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (activeTab) params.set("filter", activeTab);
      const res: any = await api.get(`/employee/follow-ups?${params.toString()}`);
      setFollowUps(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page]);

  useEffect(() => { fetchFollowUps(); }, [fetchFollowUps]);

  // Check URL params for pre-filled form
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const newBooking = params.get("newBooking");
      const customer = params.get("customer");
      if (newBooking || customer) {
        setForm(prev => ({
          ...prev,
          bookingId: newBooking || "",
          customerName: customer || "",
        }));
        setShowModal(true);
      }
    }
  }, []);

  const handleCreate = async () => {
    if (!form.customerName || !form.followUpDate || !form.followUpTime) return;
    setSaving(true);
    try {
      await api.post("/employee/follow-ups", form);
      setShowModal(false);
      setForm({ customerName: "", followUpDate: "", followUpTime: "", reminderNote: "", bookingId: "" });
      fetchFollowUps();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.patch(`/employee/follow-ups/${id}`, { status });
      fetchFollowUps();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Follow-Ups</h1>
          <p className="text-sm text-slate-400 mt-1">Track and manage your customer follow-ups.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
        >
          <Plus size={14} /> New Follow-Up
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setPage(1); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              activeTab === tab.key
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:bg-slate-800 hover:text-slate-200"
            )}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Follow-Ups List */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-800/50 rounded-2xl animate-pulse" />
          ))
        ) : followUps.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-12 text-center">
            <CheckCircle2 size={40} className="text-emerald-500/30 mx-auto mb-3" />
            <p className="text-sm text-slate-500">
              {activeTab === "overdue" ? "No overdue follow-ups — great job!" : "No follow-ups found"}
            </p>
          </div>
        ) : (
          followUps.map((fu) => {
            const isOverdue = fu.status === "PENDING" && new Date(fu.followUpDate) < new Date(new Date().toDateString());
            return (
              <div
                key={fu.id}
                className={cn(
                  "bg-slate-800/50 border rounded-2xl p-4 hover:border-slate-600/60 transition-all",
                  isOverdue ? "border-red-500/30" : "border-slate-700/50"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                      isOverdue ? "bg-red-500/10" : fu.status === "COMPLETED" ? "bg-emerald-500/10" : "bg-cyan-500/10"
                    )}>
                      {isOverdue ? <AlertTriangle size={18} className="text-red-400" />
                        : fu.status === "COMPLETED" ? <CheckCircle2 size={18} className="text-emerald-400" />
                        : <Phone size={18} className="text-cyan-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200">{fu.customerName}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(fu.followUpDate)}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={10} /> {fu.followUpTime}
                        </span>
                        {fu.booking && (
                          <span className="text-xs text-cyan-500 font-mono">
                            {fu.booking.bookingNumber}
                          </span>
                        )}
                      </div>
                      {fu.reminderNote && (
                        <p className="text-xs text-slate-400 mt-1.5 bg-slate-700/20 rounded-lg px-2.5 py-1.5">{fu.reminderNote}</p>
                      )}
                      {fu.booking?.client && (
                        <div className="flex items-center gap-2 mt-1.5">
                          {fu.booking.client.phone && (
                            <a href={`tel:${fu.booking.client.phone}`} className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5">
                              <Phone size={8} /> {fu.booking.client.phone}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {fu.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(fu.id, "COMPLETED")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 hover:bg-emerald-500/15 transition-colors"
                        >
                          <CheckCircle2 size={12} /> Done
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(fu.id, "MISSED")}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 hover:bg-red-500/15 transition-colors"
                        >
                          <X size={12} /> Missed
                        </button>
                      </>
                    )}
                    {fu.status !== "PENDING" && (
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full border",
                        fu.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/15 text-red-400 border-red-500/30"
                      )}>
                        {fu.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors">
              Previous
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Follow-Up Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Schedule Follow-Up</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Customer Name *</label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm(p => ({ ...p, customerName: e.target.value }))}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Date *</label>
                  <input
                    type="date"
                    value={form.followUpDate}
                    onChange={(e) => setForm(p => ({ ...p, followUpDate: e.target.value }))}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Time *</label>
                  <input
                    type="time"
                    value={form.followUpTime}
                    onChange={(e) => setForm(p => ({ ...p, followUpTime: e.target.value }))}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Booking ID (Optional)</label>
                <input
                  type="text"
                  value={form.bookingId}
                  onChange={(e) => setForm(p => ({ ...p, bookingId: e.target.value }))}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  placeholder="e.g. 5"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mb-1.5 block">Reminder Note</label>
                <textarea
                  value={form.reminderNote}
                  onChange={(e) => setForm(p => ({ ...p, reminderNote: e.target.value }))}
                  rows={3}
                  placeholder="What should you remember?"
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !form.customerName || !form.followUpDate || !form.followUpTime}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-medium text-white hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {saving ? "Scheduling..." : "Schedule"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

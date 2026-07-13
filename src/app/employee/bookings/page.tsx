"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Filter, ChevronDown, ArrowUpRight, Phone,
  Mail, X, StickyNote, Clock, RefreshCw
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import api from "@/lib/api";

const PIPELINE_STATUSES = [
  "NEW_LEAD", "CUSTOMER_CONTACTED", "VENDOR_CONTACTED", "CUSTOMER_DISCUSSION",
  "ADVANCE_PAYMENT_PENDING", "ADVANCE_PAYMENT_RECEIVED", "BOOKING_CONFIRMED",
  "PLANNING_STAGE", "VENDOR_CONFIRMATION_PENDING", "EVENT_PREPARATION",
  "EVENT_ONGOING", "EVENT_COMPLETED", "CUSTOMER_FEEDBACK_PENDING", "CLOSED", "CANCELLED",
];

const PIPELINE_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-gray-100 text-gray-600 border-gray-200",
  CUSTOMER_CONTACTED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  VENDOR_CONTACTED: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  CUSTOMER_DISCUSSION: "bg-violet-50 text-violet-600 border-cyan-500/30",
  ADVANCE_PAYMENT_PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCE_PAYMENT_RECEIVED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  BOOKING_CONFIRMED: "bg-green-500/15 text-green-400 border-green-500/30",
  PLANNING_STAGE: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  VENDOR_CONFIRMATION_PENDING: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  EVENT_PREPARATION: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  EVENT_ONGOING: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  EVENT_COMPLETED: "bg-violet-50 text-violet-600 border-emerald-500/30",
  CUSTOMER_FEEDBACK_PENDING: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  CLOSED: "bg-gray-500/15 text-gray-500 border-gray-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
};

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: "bg-red-500/15 text-red-400",
  HIGH: "bg-orange-500/15 text-orange-400",
  MEDIUM: "bg-blue-500/15 text-blue-400",
  LOW: "bg-gray-100 text-gray-500",
};

function formatStatus(s: string) { return s.replace(/_/g, " "); }

export default function EmployeeBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({});
  const [search, setSearch] = useState("");
  const [filterPipeline, setFilterPipeline] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Pipeline status update modal
  const [statusModal, setStatusModal] = useState<any>(null);
  const [newPipeline, setNewPipeline] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  // Notes modal
  const [notesModal, setNotesModal] = useState<any>(null);
  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (filterPipeline) params.set("pipelineStatus", filterPipeline);
      if (filterPriority) params.set("priority", filterPriority);

      const res: any = await api.get(`/employee/bookings?${params.toString()}`);
      setBookings(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, filterPipeline, filterPriority]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleUpdatePipeline = async () => {
    if (!statusModal || !newPipeline) return;
    setUpdating(true);
    try {
      await api.patch(`/employee/bookings/${statusModal.id}/pipeline`, {
        pipelineStatus: newPipeline,
        note: statusNote || undefined,
      });
      setStatusModal(null);
      setNewPipeline("");
      setStatusNote("");
      fetchBookings();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!notesModal || !noteContent.trim()) return;
    setAddingNote(true);
    try {
      await api.post(`/employee/bookings/${notesModal.id}/notes`, { content: noteContent });
      setNotesModal(null);
      setNoteContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
            Bookings
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your assigned bookings and update statuses.</p>
        </div>
        <button
          onClick={() => { setPage(1); fetchBookings(); }}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600 hover:border-cyan-500/30 transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search bookings, customers..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50/70 border border-gray-100 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors",
            showFilters ? "bg-cyan-500/10 border-cyan-500/30 text-violet-600" : "bg-gray-50/70 border-gray-100 text-gray-600 hover:border-slate-600"
          )}
        >
          <Filter size={14} />
          Filters
          {(filterPipeline || filterPriority) && (
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-wrap gap-4 animate-fade-in">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1.5 block">Pipeline Status</label>
            <select
              value={filterPipeline}
              onChange={(e) => { setFilterPipeline(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 rounded-lg bg-white border border-gray-100 text-sm text-gray-900 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Statuses</option>
              {PIPELINE_STATUSES.map(s => (
                <option key={s} value={s}>{formatStatus(s)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1.5 block">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 rounded-lg bg-white border border-gray-100 text-sm text-gray-900 focus:outline-none focus:border-cyan-500/50"
            >
              <option value="">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          {(filterPipeline || filterPriority) && (
            <button
              onClick={() => { setFilterPipeline(""); setFilterPriority(""); setPage(1); }}
              className="self-end flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-gray-500 uppercase tracking-wider border-b border-gray-200/30">
                <th className="text-left p-4 font-medium">Booking</th>
                <th className="text-left p-4 font-medium">Customer</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Vendor</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Event Date</th>
                <th className="text-left p-4 font-medium">Amount</th>
                <th className="text-left p-4 font-medium">Pipeline</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Priority</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-200/20">
                    <td colSpan={8} className="p-4"><div className="h-6 bg-gray-100 rounded animate-pulse" /></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-sm text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-200/20 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <Link href={`/employee/bookings/${b.id}`} className="text-sm font-mono font-medium text-violet-600 hover:text-cyan-300">
                        {b.bookingNumber}
                      </Link>
                      <p className="text-xs text-gray-500 truncate max-w-[150px]">{b.service?.title}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-medium text-gray-900">{b.client?.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {b.client?.phone && (
                          <a href={`tel:${b.client.phone}`} className="text-xs text-gray-500 hover:text-violet-600 flex items-center gap-0.5">
                            <Phone size={9} /> {b.client.phone}
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <p className="text-sm text-gray-600">{b.vendor?.user?.name || b.vendor?.businessName}</p>
                      {b.vendor?.user?.phone && (
                        <a href={`tel:${b.vendor.user.phone}`} className="text-xs text-gray-500 hover:text-violet-600 flex items-center gap-0.5 mt-0.5">
                          <Phone size={9} /> {b.vendor.user.phone}
                        </a>
                      )}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <p className="text-sm text-gray-600">{formatDate(b.bookingDate)}</p>
                      <p className="text-xs text-gray-500">{b.timeSlot}</p>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold text-gray-900">{formatPrice(Number(b.totalAmount))}</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => { setStatusModal(b); setNewPipeline(b.pipelineStatus); }}
                        className={cn(
                          "text-[9px] font-bold px-2 py-1 rounded-full border uppercase tracking-wide cursor-pointer hover:opacity-80 transition-opacity",
                          PIPELINE_COLORS[b.pipelineStatus] || "bg-gray-100 text-gray-600"
                        )}
                      >
                        {formatStatus(b.pipelineStatus)}
                      </button>
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", PRIORITY_COLORS[b.priority])}>
                        {b.priority}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/employee/bookings/${b.id}`}
                          className="p-1.5 rounded-lg hover:bg-cyan-500/10 text-violet-600 transition-colors"
                          title="Open Booking"
                        >
                          <ArrowUpRight size={14} />
                        </Link>
                        <button
                          onClick={() => setNotesModal(b)}
                          className="p-1.5 rounded-lg hover:bg-violet-500/10 text-violet-400 transition-colors"
                          title="Add Note"
                        >
                          <StickyNote size={14} />
                        </button>
                        <Link
                          href={`/employee/follow-ups?newBooking=${b.id}&customer=${encodeURIComponent(b.client?.name || "")}`}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-400 transition-colors"
                          title="Schedule Follow-Up"
                        >
                          <Clock size={14} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200/30">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setStatusModal(null)}>
          <div className="bg-white border border-gray-200/60 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Update Pipeline Status</h3>
              <button onClick={() => setStatusModal(null)} className="p-1 rounded-lg hover:bg-gray-50 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Booking: <span className="text-violet-600 font-mono">{statusModal.bookingNumber}</span></p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1.5 block">New Status</label>
                <select
                  value={newPipeline}
                  onChange={(e) => setNewPipeline(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-900 focus:outline-none focus:border-cyan-500/50"
                >
                  {PIPELINE_STATUSES.map(s => (
                    <option key={s} value={s}>{formatStatus(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1.5 block">Note (Optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note about this status change..."
                  rows={3}
                  className="w-full py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStatusModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-100 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePipeline}
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-sm font-medium text-gray-900 hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {notesModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setNotesModal(null)}>
          <div className="bg-white border border-gray-200/60 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Add Note</h3>
              <button onClick={() => setNotesModal(null)} className="p-1 rounded-lg hover:bg-gray-50 text-gray-500">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Booking: <span className="text-violet-600 font-mono">{notesModal.bookingNumber}</span></p>

            <div className="space-y-4">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note..."
                rows={4}
                className="w-full py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 resize-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setNotesModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-100 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={addingNote || !noteContent.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-sm font-medium text-gray-900 hover:shadow-lg hover:shadow-violet-500/25 transition-all disabled:opacity-50"
                >
                  {addingNote ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

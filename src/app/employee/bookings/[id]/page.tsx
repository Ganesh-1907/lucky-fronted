"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Phone, Mail, MapPin, Calendar, Clock, DollarSign,
  StickyNote, Send, User, Store, ChevronRight, AlertCircle
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import api from "@/lib/api";

const PIPELINE_COLORS: Record<string, string> = {
  NEW_LEAD: "bg-slate-600/20 text-slate-300 border-slate-600/30",
  CUSTOMER_CONTACTED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  VENDOR_CONTACTED: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  CUSTOMER_DISCUSSION: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  ADVANCE_PAYMENT_PENDING: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  ADVANCE_PAYMENT_RECEIVED: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  BOOKING_CONFIRMED: "bg-green-500/15 text-green-400 border-green-500/30",
  PLANNING_STAGE: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  VENDOR_CONFIRMATION_PENDING: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  EVENT_PREPARATION: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  EVENT_ONGOING: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  EVENT_COMPLETED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  CUSTOMER_FEEDBACK_PENDING: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  CLOSED: "bg-gray-500/15 text-gray-400 border-gray-500/30",
  CANCELLED: "bg-red-500/15 text-red-400 border-red-500/30",
};

function fmtStatus(s: string) { return s.replace(/_/g, " "); }

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    async function fetch() {
      try {
        const res: any = await api.get(`/employee/bookings/${params.id}`);
        setBooking(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [params.id]);

  const handleAddNote = async () => {
    if (!noteContent.trim()) return;
    setAddingNote(true);
    try {
      const res: any = await api.post(`/employee/bookings/${params.id}/notes`, { content: noteContent });
      setBooking((prev: any) => ({
        ...prev,
        bookingNotes: [res.data, ...(prev.bookingNotes || [])],
      }));
      setNoteContent("");
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-40 bg-slate-800/50 rounded-xl animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-800/50 rounded-2xl animate-pulse" />
          <div className="h-96 bg-slate-800/50 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={40} className="text-red-400/40 mx-auto mb-3" />
        <p className="text-slate-400">Booking not found</p>
        <button onClick={() => router.back()} className="mt-4 text-sm text-cyan-400 hover:text-cyan-300">← Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
              {booking.bookingNumber}
              <span className={cn("text-[9px] font-bold px-2 py-1 rounded-full border uppercase", PIPELINE_COLORS[booking.pipelineStatus])}>
                {fmtStatus(booking.pipelineStatus)}
              </span>
            </h1>
            <p className="text-sm text-slate-400">{booking.service?.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-[10px] font-bold px-2.5 py-1 rounded-full",
            booking.priority === "URGENT" ? "bg-red-500/15 text-red-400" :
            booking.priority === "HIGH" ? "bg-orange-500/15 text-orange-400" :
            booking.priority === "MEDIUM" ? "bg-blue-500/15 text-blue-400" :
            "bg-slate-700/50 text-slate-400"
          )}>
            {booking.priority} PRIORITY
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Details Card */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
              <Calendar size={16} className="text-cyan-400" /> Booking Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Event Date" value={formatDate(booking.bookingDate)} />
              <InfoRow label="Time Slot" value={booking.timeSlot} />
              <InfoRow label="Location" value={`${booking.city}${booking.address ? `, ${booking.address}` : ""}${booking.pincode ? ` - ${booking.pincode}` : ""}`} />
              <InfoRow label="Total Amount" value={formatPrice(Number(booking.totalAmount))} highlight />
              <InfoRow label="Advance Paid" value={formatPrice(Number(booking.advancePaid))} />
              <InfoRow label="Remaining" value={formatPrice(Number(booking.remainingAmount))} />
              {booking.lastFollowUpDate && (
                <InfoRow label="Last Follow-Up" value={formatDate(booking.lastFollowUpDate)} />
              )}
              {booking.notes && (
                <div className="sm:col-span-2">
                  <InfoRow label="Customer Notes" value={booking.notes} />
                </div>
              )}
            </div>
          </div>

          {/* Customer & Vendor Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <ContactCard
              title="Customer"
              icon={<User size={16} />}
              name={booking.client?.name}
              email={booking.client?.email}
              phone={booking.client?.phone}
              color="cyan"
            />
            <ContactCard
              title="Vendor"
              icon={<Store size={16} />}
              name={booking.vendor?.user?.name || booking.vendor?.businessName}
              email={booking.vendor?.user?.email}
              phone={booking.vendor?.user?.phone}
              color="violet"
            />
          </div>

          {/* Timeline */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h2 className="font-bold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              Status Timeline
            </h2>
            {(booking.bookingTimeline || []).length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">No status changes yet</p>
            ) : (
              <div className="space-y-3">
                {booking.bookingTimeline.map((entry: any, i: number) => (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 border-2 border-slate-900 shrink-0" />
                      {i < booking.bookingTimeline.length - 1 && <div className="w-0.5 flex-1 bg-slate-700/40" />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", PIPELINE_COLORS[entry.fromStatus])}>
                          {fmtStatus(entry.fromStatus)}
                        </span>
                        <ChevronRight size={12} className="text-slate-600" />
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border", PIPELINE_COLORS[entry.toStatus])}>
                          {fmtStatus(entry.toStatus)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {entry.employee?.name} • {formatDate(entry.createdAt)}
                      </p>
                      {entry.note && <p className="text-xs text-slate-400 mt-1 bg-slate-700/20 rounded-lg px-3 py-2">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm" style={{ fontFamily: "var(--font-outfit)" }}>Quick Actions</h3>
            {booking.client?.phone && (
              <a href={`tel:${booking.client.phone}`} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sm text-cyan-400 hover:bg-cyan-500/15 transition-colors">
                <Phone size={14} /> Call Customer
              </a>
            )}
            {booking.vendor?.user?.phone && (
              <a href={`tel:${booking.vendor.user.phone}`} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-sm text-violet-400 hover:bg-violet-500/15 transition-colors">
                <Phone size={14} /> Call Vendor
              </a>
            )}
            {booking.client?.email && (
              <a href={`mailto:${booking.client.email}`} className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-blue-400 hover:bg-blue-500/15 transition-colors">
                <Mail size={14} /> Email Customer
              </a>
            )}
            <Link href={`/employee/follow-ups?newBooking=${booking.id}&customer=${encodeURIComponent(booking.client?.name || "")}`}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 hover:bg-amber-500/15 transition-colors"
            >
              <Clock size={14} /> Schedule Follow-Up
            </Link>
          </div>

          {/* Follow-Ups */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3" style={{ fontFamily: "var(--font-outfit)" }}>Follow-Ups</h3>
            {(booking.followUps || []).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No follow-ups scheduled</p>
            ) : (
              <div className="space-y-2">
                {booking.followUps.slice(0, 5).map((fu: any) => (
                  <div key={fu.id} className="px-3 py-2 rounded-lg bg-slate-700/20 border border-slate-700/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-300">{formatDate(fu.followUpDate)} • {fu.followUpTime}</span>
                      <span className={cn(
                        "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                        fu.status === "COMPLETED" ? "bg-emerald-500/15 text-emerald-400"
                          : fu.status === "MISSED" ? "bg-red-500/15 text-red-400"
                          : "bg-amber-500/15 text-amber-400"
                      )}>
                        {fu.status}
                      </span>
                    </div>
                    {fu.reminderNote && <p className="text-xs text-slate-500 mt-1">{fu.reminderNote}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
              <StickyNote size={14} className="text-violet-400" /> Notes
            </h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add a quick note..."
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700/50 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                onClick={handleAddNote}
                disabled={addingNote || !noteContent.trim()}
                className="p-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white disabled:opacity-40 hover:shadow-lg hover:shadow-violet-500/20 transition-all"
              >
                <Send size={14} />
              </button>
            </div>
            {(booking.bookingNotes || []).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No notes yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {booking.bookingNotes.map((note: any) => (
                  <div key={note.id} className="px-3 py-2 rounded-lg bg-slate-700/20 border border-slate-700/30">
                    <p className="text-sm text-slate-300">{note.content}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{note.employee?.name} • {formatDate(note.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{label}</p>
      <p className={cn("text-sm mt-0.5", highlight ? "text-cyan-400 font-semibold" : "text-slate-300")}>{value}</p>
    </div>
  );
}

function ContactCard({ title, icon, name, email, phone, color }: {
  title: string; icon: React.ReactNode; name?: string; email?: string; phone?: string; color: string;
}) {
  const colorClasses = color === "cyan"
    ? { bg: "bg-cyan-500/10", border: "border-cyan-500/20", text: "text-cyan-400", hover: "hover:text-cyan-300" }
    : { bg: "bg-violet-500/10", border: "border-violet-500/20", text: "text-violet-400", hover: "hover:text-violet-300" };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colorClasses.bg, colorClasses.text)}>
          {icon}
        </div>
        <h3 className="text-sm font-bold text-white">{title}</h3>
      </div>
      <p className="text-sm font-medium text-slate-200 mb-1">{name || "—"}</p>
      {phone && (
        <a href={`tel:${phone}`} className={cn("text-xs flex items-center gap-1 mb-0.5", colorClasses.text, colorClasses.hover)}>
          <Phone size={10} /> {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={cn("text-xs flex items-center gap-1", colorClasses.text, colorClasses.hover)}>
          <Mail size={10} /> {email}
        </a>
      )}
    </div>
  );
}

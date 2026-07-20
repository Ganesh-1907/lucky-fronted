"use client";

// ═══════════════════════════════════════════════════════════════
// Notifications Module — HIDDEN for future implementation
// ═══════════════════════════════════════════════════════════════
// Uncomment the code below when ready to enable notification UI.
// ═══════════════════════════════════════════════════════════════

export default function NotificationsPage() {
  return null;
}

/* -- FUTURE NOTIFICATIONS PAGE --
import { useState, useEffect, useCallback } from "react";
import {
  Bell, CheckCheck, ShoppingBag, CreditCard, Phone,
  UserPlus, AlertCircle, Settings, Clock
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import api from "@/lib/api";

const TYPE_ICONS: Record<string, { icon: React.ReactNode; color: string }> = {
  BOOKING: { icon: <ShoppingBag size={16} />, color: "bg-violet-500/15 text-violet-400" },
  PAYMENT: { icon: <CreditCard size={16} />, color: "bg-green-500/15 text-green-400" },
  FOLLOW_UP: { icon: <Phone size={16} />, color: "bg-amber-500/15 text-amber-400" },
  ASSIGNMENT: { icon: <UserPlus size={16} />, color: "bg-violet-50 text-violet-600" },
  SYSTEM: { icon: <Settings size={16} />, color: "bg-gray-100 text-gray-500" },
  PROMOTION: { icon: <AlertCircle size={16} />, color: "bg-rose-500/15 text-rose-400" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/employee/notifications?page=${page}&limit=20`);
      setNotifications(res.data);
      setPagination(res.pagination);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const markRead = async (id: number) => {
    try {
      await api.patch(`/employee/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch("/employee/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return formatDate(date);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            Notifications
            {unreadCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-cyan-500/30">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Stay updated on bookings, follow-ups, and assignments.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-600 hover:border-cyan-500/30 transition-colors"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-50 rounded-2xl animate-pulse" />
          ))
        ) : notifications.length === 0 ? (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-12 text-center">
            <Bell size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => {
            const typeConfig = TYPE_ICONS[n.type] || TYPE_ICONS.SYSTEM;
            return (
              <button
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={cn(
                  "w-full text-left bg-gray-50 border rounded-2xl p-4 transition-all hover:border-slate-600/60",
                  n.isRead ? "border-gray-200/30 opacity-60" : "border-gray-100"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", typeConfig.color)}>
                    {typeConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        n.isRead ? "text-gray-500" : "text-gray-900"
                      )}>
                        {n.title}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                        <span className="text-[10px] text-slate-600 flex items-center gap-0.5">
                          <Clock size={8} /> {timeAgo(n.createdAt)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors">
              Previous
            </button>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.totalPages}
              className="px-3 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-600 disabled:opacity-40 hover:bg-gray-100 transition-colors">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
*/

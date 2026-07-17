"use client";

import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Clock, ChevronDown, CheckCircle2, CalendarDays, User, MapPin } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Booking {
  id: number;
  bookingNumber: string;
  clientId: number;
  serviceId: number;
  vendorId: number;
  bookingDate: string;
  timeSlot: string;
  baseAmount: string;
  addonsAmount: string;
  couponDiscount: string;
  totalAmount: string;
  advancePaid: string;
  remainingAmount: string;
  status: string;
  city: string;
  address: string;
  pincode: string;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  client: { name: string; email: string; phone?: string };
  service: { title: string; images: string[] };
  payments: any[];
}

const statusFilters = ["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-violet-100 text-violet-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function VendorBookingsPage() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "ALL";

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [statusChangeId, setStatusChangeId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Use React Query for caching and instant loads on navigation
  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ["vendor", "bookings", page, limit, statusFilter, debouncedSearch],
    queryFn: async () => {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (statusFilter !== "ALL") query.append("status", statusFilter);
      if (debouncedSearch) query.append("search", debouncedSearch);

      const res = await api.get<{success: boolean, data: Booking[], pagination: any}>(`/bookings/vendor/list?${query.toString()}`);
      return res;
    },
    staleTime: 60000,
  });

  const bookings = data?.data || [];
  const total = data?.pagination?.total || 0;
  const totalPages = data?.pagination?.totalPages || Math.ceil(total / limit);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleStatusUpdate = async () => {
    if (!statusChangeId || !newStatus) return;
    if (newStatus === "CANCELLED" && !cancelReason.trim()) {
      showToast("Cancellation reason is required", "error");
      return;
    }

    try {
      setUpdating(true);
      const payload: any = { status: newStatus };
      if (newStatus === "CANCELLED") {
        payload.cancelReason = cancelReason;
      }
      
      await api.put(`/bookings/${statusChangeId}/status`, payload);
      showToast("Booking status updated", "success");
      
      setStatusChangeId(null);
      setNewStatus("");
      setCancelReason("");
      
      queryClient.invalidateQueries({ queryKey: ["vendor", "dashboard", "stats"] });
      refetch(); // Refresh data
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (id: number, status: string) => {
    setStatusChangeId(id);
    setNewStatus(status);
    setCancelReason("");
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Bookings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your customer bookings</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search by Booking ID..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map(s => (
              <button key={s} onClick={() => {setStatusFilter(s); setPage(1);}}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all border",
                  statusFilter === s ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}>
                {s === "ALL" ? "All Bookings" : s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings as expandable cards */}
      <div className="space-y-4">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24 animate-pulse"></div>
          ))
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="text-sm text-gray-500 mt-1">You don't have any bookings matching this filter.</p>
          </div>
        ) : (
          bookings.map(booking => (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div
                className="flex flex-col md:flex-row md:items-center gap-4 p-5 cursor-pointer"
                onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
              >
                <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center w-full">
                  <div>
                    <p className="text-sm font-mono font-bold text-emerald-600">{booking.bookingNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{booking.client?.name}</p>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-sm font-medium text-gray-900 truncate" title={booking.service?.title}>{booking.service?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{booking.timeSlot}</p>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-900">{formatPrice(Number(booking.totalAmount))}</span>
                  </div>
                  <div className="flex items-center justify-between col-span-2 md:col-span-1">
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider", statusColors[booking.status])}>
                      {booking.status.replace("_", " ")}
                    </span>
                    <ChevronDown size={18} className={cn("text-gray-400 transition-transform", expandedId === booking.id && "rotate-180")} />
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === booking.id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-5 bg-gray-50/30 animate-fade-in">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5"><User size={14}/> Customer Details</p>
                      <p className="text-sm font-medium text-gray-900 mb-1">{booking.client?.name}</p>
                      <p className="text-sm text-gray-600 mb-1">{booking.client?.phone || booking.client?.email}</p>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><MapPin size={12}/> Service Location</p>
                        <p className="text-sm text-gray-700">{booking.address}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{booking.city} - {booking.pincode}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">Payment Details</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base</span>
                          <span className="font-medium">{formatPrice(Number(booking.baseAmount))}</span>
                        </div>
                        {Number(booking.addonsAmount) > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Add-ons</span>
                            <span className="font-medium">+{formatPrice(Number(booking.addonsAmount))}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                          <span className="text-gray-900 font-bold">Total</span>
                          <span className="text-gray-900 font-bold">{formatPrice(Number(booking.totalAmount))}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2">
                          <span className="text-gray-600">Advance Paid</span>
                          <span className="font-medium text-emerald-600">{formatPrice(Number(booking.advancePaid))}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                          <span className="text-gray-900 font-bold">Collect from client</span>
                          <span className="text-red-600 font-bold">{formatPrice(Number(booking.remainingAmount))}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Notes & Reason</p>
                      <div className="flex-1">
                        {booking.notes ? (
                          <p className="text-sm text-gray-700 italic border-l-2 border-emerald-400 pl-3 py-1">{booking.notes}</p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No notes provided</p>
                        )}
                        
                        {booking.cancelReason && (
                          <div className="mt-4">
                            <p className="text-xs text-red-500 font-bold mb-1">Cancellation Reason:</p>
                            <p className="text-sm text-red-700">{booking.cancelReason}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-200">
                    {booking.status === "PENDING" && (
                      <>
                        <button onClick={() => openStatusModal(booking.id, 'CONFIRMED')} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                          <CheckCircle size={16} /> Accept Booking
                        </button>
                        <button onClick={() => openStatusModal(booking.id, 'CANCELLED')} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors shadow-sm">
                          <XCircle size={16} /> Decline
                        </button>
                      </>
                    )}
                    {booking.status === "CONFIRMED" && (
                      <button onClick={() => openStatusModal(booking.id, 'IN_PROGRESS')} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors shadow-sm">
                        <Clock size={16} /> Start Service
                      </button>
                    )}
                    {booking.status === "IN_PROGRESS" && (
                      <button onClick={() => openStatusModal(booking.id, 'COMPLETED')} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-green-600 text-white text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
                        <CheckCircle2 size={16} /> Mark as Completed
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}

        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="flex items-center justify-between pt-4">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-medium text-gray-900">{total}</span> bookings
            </span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">Prev</button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {statusChangeId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              {newStatus === 'CONFIRMED' ? 'Accept Booking' : newStatus === 'CANCELLED' ? 'Decline Booking' : `Update Status to ${newStatus.replace("_", " ")}`}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {newStatus === 'CONFIRMED' ? 'Are you sure you want to accept this booking?' : 'Are you sure you want to proceed with this action?'}
            </p>
            
            {newStatus === 'CANCELLED' && (
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Reason for declining <span className="text-red-500">*</span></label>
                <textarea 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 bg-gray-50 focus:bg-white" 
                  rows={3} 
                  placeholder="e.g. Fully booked on this date"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => {setStatusChangeId(null); setCancelReason("");}} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
              <button 
                onClick={handleStatusUpdate} 
                disabled={updating || (newStatus === 'CANCELLED' && !cancelReason.trim())}
                className={cn("flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50",
                  newStatus === 'CANCELLED' ? "bg-red-600 hover:bg-red-700" :
                  newStatus === 'COMPLETED' ? "bg-green-600 hover:bg-green-700" :
                  newStatus === 'IN_PROGRESS' ? "bg-violet-600 hover:bg-violet-700" :
                  "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {updating ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] animate-fade-in">
          <div className={cn("px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border", toast.type === "success" ? "bg-gray-900 text-white border-gray-800" : "bg-red-600 text-white border-red-700")}>
            {toast.type === "success" ? <CheckCircle2 size={20} className="text-green-400" /> : <XCircle size={20} className="text-red-300" />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

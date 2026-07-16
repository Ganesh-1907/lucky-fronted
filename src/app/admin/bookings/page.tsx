"use client";

import { useState, useEffect } from "react";
import { Search, Eye, X, Filter, CalendarDays, User, MapPin, CheckCircle2, Clock, Check, XCircle } from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { cn, formatPrice } from "@/lib/utils";
import api from "@/lib/api";

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
  commission: string;
  status: string;
  city: string;
  address: string;
  pincode: string;
  notes?: string;
  cancelReason?: string;
  cancelledAt?: string;
  completedAt?: string;
  createdAt: string;
  client: { name: string; email: string; phone?: string };
  service: { title: string };
  vendor: { businessName: string };
  payments: any[];
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-violet-100 text-violet-700 border-violet-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [viewBooking, setViewBooking] = useState<Booking | null>(null);
  const [statusChangeId, setStatusChangeId] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchBookings();
  }, [page, limit, debouncedSearch, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (debouncedSearch) query.append("search", debouncedSearch);
      if (statusFilter !== "ALL") query.append("status", statusFilter);

      const res = await api.get<{success: boolean, data: Booking[], pagination: any}>(`/admin/bookings?${query.toString()}`);
      if (res.success) {
        setBookings(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages || Math.ceil(res.pagination.total / limit));
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

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
      showToast("Booking status updated successfully", "success");
      setStatusChangeId(null);
      setNewStatus("");
      setCancelReason("");
      
      if (viewBooking && viewBooking.id === statusChangeId) {
        setViewBooking({ ...viewBooking, status: newStatus, cancelReason: newStatus === "CANCELLED" ? cancelReason : viewBooking.cancelReason });
      }
      
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const openStatusModal = (booking: Booking, status: string) => {
    setStatusChangeId(booking.id);
    setNewStatus(status);
    setCancelReason("");
  };


  return (
    <div className="space-y-6 pb-10">
      {/* Toast Notification */}
      {toast && (
        <div className={cn("fixed top-4 right-4 z-[100] px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-fade-in flex items-center gap-2 text-white", toast.type === "success" ? "bg-gray-900" : "bg-red-600")}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      )}
      {/* Header */}

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by Booking ID..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <Filter size={18} className="text-gray-400 shrink-0" />
          {["ALL", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"].map(status => (
            <button 
              key={status} 
              onClick={() => {setStatusFilter(status); setPage(1);}}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap border",
                statusFilter === status ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              {status === "ALL" ? "All Bookings" : status.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                <th className="px-6 py-4">Booking Info</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Service & Vendor</th>
                <th className="px-6 py-4">Schedule</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right sticky right-0 bg-gray-50/90 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 mb-2"></div><div className="h-3 bg-gray-100 rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-40 mb-2"></div><div className="h-3 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24 mb-2"></div><div className="h-3 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-8 ml-auto"></div></td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <CalendarDays className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-mono text-sm font-bold text-violet-600">{booking.bookingNumber}</div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(booking.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.client?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500 mt-1">{booking.client?.phone || booking.client?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]" title={booking.service?.title}>{booking.service?.title}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={booking.vendor?.businessName}>By: {booking.vendor?.businessName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{new Date(booking.bookingDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500 mt-1">{booking.timeSlot}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{formatPrice(Number(booking.totalAmount))}</div>
                      <div className="text-xs text-gray-500 mt-1">Paid: {formatPrice(Number(booking.advancePaid))}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", statusColors[booking.status])}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right sticky right-0 bg-white group-hover:bg-gray-50/90 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                      <ActionMenu>
                        <button 
                          onClick={() => { setViewBooking(booking); }}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 text-gray-700 w-full text-sm transition-colors"
                        >
                          <Eye size={16} className="text-gray-400" /> View Details
                        </button>
                      </ActionMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {!loading && total > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
            <span className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{(page - 1) * limit + 1}</span> to <span className="font-medium text-gray-900">{Math.min(page * limit, total)}</span> of <span className="font-medium text-gray-900">{total}</span> bookings
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Booking Drawer */}
      {viewBooking && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] animate-fade-in" onClick={() => setViewBooking(null)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-900 font-mono">{viewBooking.bookingNumber}</h2>
                <p className="text-xs text-gray-500 mt-1">Created on {new Date(viewBooking.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewBooking(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Status Header */}
              <div className={cn("p-4 rounded-xl border flex items-center justify-between", statusColors[viewBooking.status].replace("text-", "text-").replace("border-", "border-"))}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Current Status</p>
                  <p className="text-lg font-bold">{viewBooking.status.replace("_", " ")}</p>
                </div>
                {viewBooking.status === 'COMPLETED' && <CheckCircle2 size={28} className="opacity-80" />}
                {viewBooking.status === 'CANCELLED' && <XCircle size={28} className="opacity-80" />}
                {viewBooking.status === 'PENDING' && <Clock size={28} className="opacity-80" />}
              </div>

              {/* Service & Vendor */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2"><CalendarDays size={14}/> Booking Details</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Service</p>
                    <p className="text-sm font-semibold text-gray-900">{viewBooking.service?.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Vendor</p>
                    <p className="text-sm font-semibold text-gray-900">{viewBooking.vendor?.businessName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{new Date(viewBooking.bookingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Time Slot</p>
                      <p className="text-sm font-semibold text-gray-900">{viewBooking.timeSlot}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2"><User size={14}/> Customer Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Name</span>
                    <span className="font-semibold text-gray-900">{viewBooking.client?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200 pb-2">
                    <span className="text-gray-500">Email</span>
                    <span className="font-semibold text-gray-900">{viewBooking.client?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span className="font-semibold text-gray-900">{viewBooking.client?.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2"><MapPin size={14}/> Location</h4>
                <p className="text-sm text-gray-900 font-medium">{viewBooking.address}</p>
                <p className="text-sm text-gray-600 mt-1">{viewBooking.city} - {viewBooking.pincode}</p>
              </div>

              {/* Pricing Breakdown */}
              <div className="border border-gray-200 p-4 rounded-xl bg-white shadow-sm">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Base Amount</span>
                    <span>{formatPrice(Number(viewBooking.baseAmount))}</span>
                  </div>
                  {Number(viewBooking.addonsAmount) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Add-ons</span>
                      <span>+{formatPrice(Number(viewBooking.addonsAmount))}</span>
                    </div>
                  )}
                  {Number(viewBooking.couponDiscount) > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Discount</span>
                      <span>-{formatPrice(Number(viewBooking.couponDiscount))}</span>
                    </div>
                  )}
                  <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between font-bold text-gray-900 text-base">
                    <span>Total Amount</span>
                    <span>{formatPrice(Number(viewBooking.totalAmount))}</span>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-dashed border-gray-200 space-y-2">
                    <div className="flex justify-between font-medium text-gray-700">
                      <span>Advance Paid</span>
                      <span>{formatPrice(Number(viewBooking.advancePaid))}</span>
                    </div>
                    <div className="flex justify-between font-bold text-violet-700 bg-violet-50 p-2 rounded-lg">
                      <span>Remaining Balance</span>
                      <span>{formatPrice(Number(viewBooking.remainingAmount))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Internal Info */}
              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Platform Economics (Admin Only)</h4>
                <div className="flex justify-between text-sm text-amber-800">
                  <span>Commission Earned</span>
                  <span className="font-bold">{formatPrice(Number(viewBooking.commission))}</span>
                </div>
              </div>

              {/* Cancellation Reason */}
              {viewBooking.cancelReason && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                  <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider mb-1">Cancellation Reason</h4>
                  <p className="text-sm text-red-700">{viewBooking.cancelReason}</p>
                </div>
              )}

              {/* Notes */}
              {viewBooking.notes && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">Customer Notes</h4>
                  <p className="text-sm text-blue-800">{viewBooking.notes}</p>
                </div>
              )}
            </div>
            
            {/* Action Footer */}
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex flex-wrap gap-2">
              {viewBooking.status !== 'COMPLETED' && viewBooking.status !== 'CANCELLED' && (
                <>
                  <p className="w-full text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Update Status</p>
                  
                  {viewBooking.status === 'PENDING' && (
                    <button onClick={() => openStatusModal(viewBooking, 'CONFIRMED')} className="flex-1 px-3 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-center">Confirm</button>
                  )}
                  
                  {(viewBooking.status === 'PENDING' || viewBooking.status === 'CONFIRMED') && (
                    <button onClick={() => openStatusModal(viewBooking, 'IN_PROGRESS')} className="flex-1 px-3 py-2.5 bg-violet-600 text-white text-sm font-bold rounded-xl hover:bg-violet-700 transition-colors shadow-sm text-center">In Progress</button>
                  )}
                  
                  {viewBooking.status === 'IN_PROGRESS' && (
                    <button onClick={() => openStatusModal(viewBooking, 'COMPLETED')} className="flex-1 px-3 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm text-center flex justify-center items-center gap-1.5"><Check size={16}/> Complete</button>
                  )}
                  
                  <button onClick={() => openStatusModal(viewBooking, 'CANCELLED')} className="w-full mt-2 px-3 py-2.5 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-bold rounded-xl transition-colors shadow-sm text-center">Cancel Booking</button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Status Change Modal */}
      {statusChangeId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Update Status to {newStatus.replace("_", " ")}</h3>
            <p className="text-sm text-gray-500 mb-5">Are you sure you want to change the status of this booking?</p>
            
            {newStatus === 'CANCELLED' && (
              <div className="mb-5">
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Cancellation Reason <span className="text-red-500">*</span></label>
                <textarea 
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 bg-gray-50 focus:bg-white" 
                  rows={3} 
                  placeholder="Why is this booking being cancelled?"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            )}
            
            <div className="flex gap-3">
              <button onClick={() => {setStatusChangeId(null); setCancelReason("");}} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">Go Back</button>
              <button 
                onClick={handleStatusUpdate} 
                disabled={updating || (newStatus === 'CANCELLED' && !cancelReason.trim())}
                className={cn("flex-1 px-4 py-2.5 rounded-xl text-white text-sm font-bold transition-all shadow-sm disabled:opacity-50",
                  newStatus === 'CANCELLED' ? "bg-red-600 hover:bg-red-700" :
                  newStatus === 'COMPLETED' ? "bg-green-600 hover:bg-green-700" :
                  newStatus === 'IN_PROGRESS' ? "bg-violet-600 hover:bg-violet-700" :
                  "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {updating ? 'Updating...' : 'Confirm Update'}
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

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Eye, CheckCircle, XCircle, Star, TrendingUp,
  Award, Sparkles, Loader, ShoppingBag, Ban,
  Edit, ChevronLeft, ChevronRight, X, Briefcase, MoreVertical
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAdminServices, useUpdateServiceStatus } from "@/hooks/useApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const statusFilters = ["All", "APPROVED", "PENDING", "REJECTED", "SUSPENDED"];
const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-gray-100 text-gray-700",
};

export default function AdminServicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [viewService, setViewService] = useState<any>(null);
  
  // Modal states
  const [modalState, setModalState] = useState<{ type: "APPROVE" | "REJECT" | "SUSPEND" | null; serviceId: number | null }>({ type: null, serviceId: null });
  const [reason, setReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const { data, isLoading, error } = useAdminServices(statusFilter !== "All" ? statusFilter : undefined);
  const updateServiceStatus = useUpdateServiceStatus();

  const services = Array.isArray(data) ? data : (data?.data || []);

  const filteredAndSorted = useMemo(() => {
    let result = services.filter((s: any) => {
      const matchSearch = search ? (
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.vendor?.businessName?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.name?.toLowerCase().includes(search.toLowerCase())
      ) : true;
      return matchSearch;
    });

    if (sortKey === "highest_rated") result.sort((a: any, b: any) => (b.avgRating || 0) - (a.avgRating || 0));
    else if (sortKey === "most_bookings") result.sort((a: any, b: any) => (b.bookingCount || 0) - (a.bookingCount || 0));
    else if (sortKey === "highest_price") result.sort((a: any, b: any) => (b.discountPrice || b.basePrice || 0) - (a.discountPrice || a.basePrice || 0));
    // default newest
    else result.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    return result;
  }, [services, search, sortKey]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginated = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  const handleAction = async () => {
    if (!modalState.serviceId || !modalState.type) return;
    if ((modalState.type === "REJECT" || modalState.type === "SUSPEND") && !reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    
    try {
      setActionLoading(true);
      await updateServiceStatus.mutateAsync({ 
        id: modalState.serviceId, 
        status: modalState.type === "APPROVE" ? "APPROVED" : modalState.type === "REJECT" ? "REJECTED" : "SUSPENDED"
      });
      toast.success(`Service ${modalState.type.toLowerCase()} successfully`);
      setModalState({ type: null, serviceId: null });
      setReason("");
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const Actions = ({ service, isMobile }: { service: any, isMobile?: boolean }) => (
    <div className={cn("flex items-center gap-1", isMobile ? "flex-col items-start p-1" : "")}>
      <button onClick={() => { setViewService(service); setOpenDropdown(null); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 w-full text-left" title="View">
        <Eye size={16} /> {isMobile && <span className="text-sm">View</span>}
      </button>
      <Link href={`/admin/services/${service.id}/edit`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 w-full text-left" title="Edit">
        <Edit size={16} /> {isMobile && <span className="text-sm">Edit</span>}
      </Link>


      {(service.status === "PENDING" || service.status === "REJECTED" || service.status === "SUSPENDED") && (
        <button onClick={() => { setModalState({ type: "APPROVE", serviceId: service.id }); setOpenDropdown(null); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-green-50 text-green-600 w-full text-left" title="Approve">
          <CheckCircle size={16} /> {isMobile && <span className="text-sm">Approve</span>}
        </button>
      )}
      
      {service.status === "PENDING" && (
        <button onClick={() => { setModalState({ type: "REJECT", serviceId: service.id }); setOpenDropdown(null); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-red-50 text-red-600 w-full text-left" title="Reject">
          <XCircle size={16} /> {isMobile && <span className="text-sm">Reject</span>}
        </button>
      )}

      {service.status === "APPROVED" && (
        <button onClick={() => { setModalState({ type: "SUSPEND", serviceId: service.id }); setOpenDropdown(null); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 w-full text-left" title="Suspend">
          <Ban size={16} /> {isMobile && <span className="text-sm">Suspend</span>}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Service Management</h1>
        <p className="text-sm text-gray-500 mt-1">Moderate and manage all vendor services</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by service title, vendor, category..." value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {statusFilters.map(s => (
              <button key={s} onClick={() => {setStatusFilter(s); setPage(1);}}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  statusFilter === s ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <select value={sortKey} onChange={e => {setSortKey(e.target.value); setPage(1);}} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 focus:outline-none">
              <option value="newest">Newest First</option>
              <option value="highest_rated">Highest Rated</option>
              <option value="most_bookings">Most Bookings</option>
              <option value="highest_price">Highest Price</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader size={32} className="mx-auto mb-3 text-violet-500 animate-spin" />
            <p className="text-gray-500">Loading services...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700">Failed to load services. Please try again.</p>
        </div>
      )}

      {!isLoading && services.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50/90 backdrop-blur z-10">
                <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="text-left p-4 font-medium">Service</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Category</th>
                  <th className="text-left p-4 font-medium">Price</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Rating</th>
                  <th className="text-left p-4 font-medium hidden lg:table-cell">Bookings</th>
                  <th className="text-left p-4 font-medium hidden md:table-cell">Tags</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium sticky right-0 bg-gray-50/90 z-20 shadow-[-4px_0_10px_rgba(0,0,0,0.05)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length > 0 ? paginated.map((service: any) => (
                  <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                    <td className="p-4">
                      <div onClick={() => setViewService(service)} className="cursor-pointer hover:underline decoration-violet-500">
                        <p className="text-sm font-semibold text-gray-900">{service.title}</p>
                        <p className="text-xs text-gray-500">{service.vendor?.businessName || service.vendor?.name || service.vendor || "Unknown Vendor"}</p>
                      </div>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{service.category?.name || service.category || "General"}</span>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(service.discountPrice || service.basePrice || service.price || 0)}</p>
                      {service.discountPrice && service.basePrice && <p className="text-xs text-gray-400 line-through">{formatPrice(service.basePrice)}</p>}
                    </td>
                    <td className="p-4 hidden lg:table-cell">
                      {service.avgRating > 0 ? (
                        <span className="flex items-center gap-1 text-sm">
                          <Star size={12} className="text-amber-500 fill-amber-500" /> {service.avgRating}
                        </span>
                      ) : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="p-4 hidden lg:table-cell text-sm font-medium text-gray-900">{service.bookingCount || service._count?.bookings || 0}</td>
                    <td className="p-4 hidden md:table-cell">
                      <div className="flex gap-1 flex-wrap">
                        {service.isFeatured && <span title="Featured"><Award size={14} className="text-amber-500" /></span>}
                        {service.isTrending && <span title="Trending"><TrendingUp size={14} className="text-red-500" /></span>}
                        {service.isBestSeller && <span title="Best Seller"><Star size={14} className="text-violet-500 fill-violet-500" /></span>}
                        {service.isNewArrival && <span title="New"><Sparkles size={14} className="text-green-500" /></span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", statusColors[service.status] || statusColors.SUSPENDED)}>
                        {service.status || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="p-4 relative sticky right-0 bg-white group-hover:bg-gray-50/90 shadow-[-4px_0_10px_rgba(0,0,0,0.05)] transition-colors">
                      {/* Actions Dropdown */}
                      <div className="relative">
                        <button onClick={() => setOpenDropdown(openDropdown === service.id ? null : service.id)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                          <MoreVertical size={16} />
                        </button>
                        {openDropdown === service.id && (
                          <div className="absolute right-4 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                            <Actions service={service} isMobile />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-gray-500">
                      No services match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {filteredAndSorted.length > 0 && (
            <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setPage(1);}} className="text-sm border border-gray-200 rounded-md p-1 bg-white outline-none">
                  {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1 rounded-md hover:bg-gray-200 disabled:opacity-50">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && services.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-lg font-medium">No services found</p>
          <p className="text-sm text-gray-400 mt-1">There are no services created by vendors yet.</p>
        </div>
      )}

      {/* Action Modals */}
      <AnimatePresence>
        {modalState.type && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalState({ type: null, serviceId: null })} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modalState.type === "APPROVE" ? "Approve Service" : modalState.type === "REJECT" ? "Reject Service" : "Suspend Service"}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {modalState.type === "APPROVE" ? "Are you sure you want to approve this service? It will become public and bookable." : 
                 modalState.type === "REJECT" ? "Please provide a reason for rejecting this service." :
                 "Suspended services cannot receive new bookings."}
              </p>
              
              {(modalState.type === "REJECT" || modalState.type === "SUSPEND") && (
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder={`Please provide the ${modalState.type.toLowerCase()} reason...`}
                  className="w-full p-3 border border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 resize-none h-24 text-sm"
                />
              )}

              <div className="flex gap-3 justify-end">
                <button onClick={() => setModalState({ type: null, serviceId: null })} disabled={actionLoading} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAction} disabled={actionLoading} className={cn("px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors flex items-center gap-2", 
                  modalState.type === "APPROVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}>
                  {actionLoading && <Loader size={16} className="animate-spin" />}
                  {modalState.type === "APPROVE" ? "Approve Service" : modalState.type === "REJECT" ? "Reject Service" : "Suspend Service"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Drawer */}
      <AnimatePresence>
        {viewService && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewService(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="font-bold text-lg text-gray-900">Service Details</h2>
                <button onClick={() => setViewService(null)} className="p-2 rounded-full hover:bg-gray-200 text-gray-500">
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center shrink-0 shadow-inner">
                    <Briefcase size={32} className="text-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{viewService.title || "Unnamed Service"}</h3>
                    <p className="text-sm text-gray-500">{viewService.category?.name || viewService.category || "General Category"}</p>
                    <span className={cn("inline-block mt-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", statusColors[viewService.status] || statusColors.SUSPENDED)}>
                      {viewService.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Pricing & Info</h4>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Base Price</span><span className="font-medium text-gray-900">{formatPrice(viewService.basePrice || viewService.price || 0)}</span></div>
                    {viewService.discountPrice && <div className="flex justify-between"><span className="text-gray-500">Discount Price</span><span className="font-medium text-green-600">{formatPrice(viewService.discountPrice)}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-medium text-gray-900">{viewService.vendor?.businessName || viewService.vendor?.name || viewService.vendor || "Unknown"}</span></div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Description</h4>
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed">
                    {viewService.description || "No description provided."}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Performance</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                      <p className="text-xs text-blue-600 mb-1">Total Bookings</p>
                      <p className="text-xl font-bold text-blue-900">{viewService.bookingCount || viewService._count?.bookings || 0}</p>
                    </div>
                    <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                      <p className="text-xs text-amber-600 mb-1">Rating</p>
                      <p className="text-xl font-bold text-amber-900 flex items-center gap-1">
                        {viewService.avgRating || 0} <Star size={14} className="fill-amber-500 text-amber-500" />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline Placeholder */}
                <div className="space-y-3 pb-8">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Activity Timeline</h4>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-white bg-violet-500 shrink-0 ml-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                      <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-white p-3 rounded-lg border border-gray-100 shadow-sm ml-4 md:ml-0">
                        <p className="text-xs font-semibold text-gray-900">Service Created</p>
                        <time className="text-[10px] text-gray-500">{new Date(viewService.createdAt || Date.now()).toLocaleDateString()}</time>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 flex gap-3 bg-white">
                <button onClick={() => setViewService(null)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Close
                </button>
                <Link href={`/admin/services/${viewService.id}/edit`} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors text-center">
                  Edit Service
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

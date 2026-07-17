"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search, Eye, Edit, Copy, Clock, ToggleLeft, ToggleRight,
  DollarSign, Image as ImageIcon, ShoppingBag, Star, LayoutTemplate,
  Archive, Trash2, ChevronLeft, ChevronRight, Award, TrendingUp, Sparkles, Loader
} from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { cn, formatPrice } from "@/lib/utils";
import { useVendorServices, useUpdateVendorService } from "@/hooks/useApi";
import api from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const statusFilters = ["All", "APPROVED", "PENDING", "REJECTED", "SUSPENDED"];
const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-gray-100 text-gray-700",
};

export default function VendorServicesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [modalState, setModalState] = useState<{ type: "ARCHIVE" | "DELETE" | null; serviceId: number | null }>({ type: null, serviceId: null });
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading, error } = useVendorServices();
  const updateService = useUpdateVendorService();

  const services = Array.isArray(data) ? data : (data?.data || []);

  const filteredAndSorted = useMemo(() => {
    let result = services.filter((s: any) => {
      if (statusFilter !== "All" && s.status !== statusFilter) return false;
      const matchSearch = search ? (
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.name?.toLowerCase().includes(search.toLowerCase())
      ) : true;
      return matchSearch;
    });

    if (sortKey === "highest_rated") result.sort((a: any, b: any) => (b.avgRating || 0) - (a.avgRating || 0));
    else if (sortKey === "most_bookings") result.sort((a: any, b: any) => (b.bookingCount || 0) - (a.bookingCount || 0));
    else if (sortKey === "highest_price") result.sort((a: any, b: any) => (b.discountPrice || b.basePrice || 0) - (a.discountPrice || a.basePrice || 0));
    else result.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    return result;
  }, [services, search, statusFilter, sortKey]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginated = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await updateService.mutateAsync({ id, data: { isActive: !currentStatus } });
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update service status");
    }
  };

  const handleAction = async () => {
    if (!modalState.serviceId || !modalState.type) return;
    
    try {
      setActionLoading(true);
      if (modalState.type === "DELETE") {
        await api.delete(`/services/${modalState.serviceId}`);
        toast.success("Service deleted successfully");
        window.location.reload(); // Simple reload since we don't have the query client here easily
      } else if (modalState.type === "ARCHIVE") {
        await updateService.mutateAsync({ id: modalState.serviceId, data: { isArchived: true } });
        toast.success("Service archived successfully");
      }
      setModalState({ type: null, serviceId: null });
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  const Actions = ({ service, isMobile }: { service: any, isMobile?: boolean }) => (
    <div className={cn("flex items-center gap-1", isMobile ? "flex-col items-start p-1 w-full" : "")}>
      <Link href={`/vendor/services/${service.id}`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title="View Service">
        <Eye size={16} /> {isMobile && <span className="text-sm">View Service</span>}
      </Link>
      <Link href={`/vendor/services/${service.id}/edit`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600 w-full text-left" title="Edit Service">
        <Edit size={16} /> {isMobile && <span className="text-sm">Edit Service</span>}
      </Link>
      <button onClick={() => toast.info("Duplicate service coming soon")} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title="Duplicate Service">
        <Copy size={16} /> {isMobile && <span className="text-sm">Duplicate Service</span>}
      </button>
      
      <div className="w-full h-px bg-gray-100 my-1 hidden md:block"></div>
      
      <Link href={`/vendor/settings?tab=availability`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title="Change Availability">
        <Clock size={16} /> {isMobile && <span className="text-sm">Change Availability</span>}
      </Link>
      <button onClick={() => toggleStatus(service.id, service.isActive)} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title={service.isActive ? "Deactivate" : "Activate"}>
        {service.isActive ? <ToggleRight size={16} className="text-emerald-500" /> : <ToggleLeft size={16} />} {isMobile && <span className="text-sm">{service.isActive ? "Deactivate" : "Activate"}</span>}
      </button>
      <Link href={`/vendor/services/${service.id}/edit?tab=pricing`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title="Manage Pricing">
        <DollarSign size={16} /> {isMobile && <span className="text-sm">Manage Pricing</span>}
      </Link>
      <Link href={`/vendor/services/${service.id}/edit?tab=gallery`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title="Manage Gallery">
        <ImageIcon size={16} /> {isMobile && <span className="text-sm">Manage Gallery</span>}
      </Link>

      <div className="w-full h-px bg-gray-100 my-1 hidden md:block"></div>
      
      <Link href={`/vendor/bookings?service=${service.id}`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title="View Bookings">
        <ShoppingBag size={16} /> {isMobile && <span className="text-sm">View Bookings</span>}
      </Link>
      <Link href={`/vendor/reviews?service=${service.id}`} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title="View Reviews">
        <Star size={16} /> {isMobile && <span className="text-sm">View Reviews</span>}
      </Link>
      <Link href={`/service/${service.slug}`} target="_blank" className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 text-gray-700 w-full text-left" title="Preview Service">
        <LayoutTemplate size={16} /> {isMobile && <span className="text-sm">Preview Service</span>}
      </Link>
      
      <div className="w-full h-px bg-gray-100 my-1 hidden md:block"></div>

      <button onClick={() => { setModalState({ type: "ARCHIVE", serviceId: service.id }); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-amber-50 text-amber-600 w-full text-left" title="Archive">
        <Archive size={16} /> {isMobile && <span className="text-sm">Archive</span>}
      </button>
      <button onClick={() => { setModalState({ type: "DELETE", serviceId: service.id }); }} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-red-50 text-red-600 w-full text-left" title="Delete">
        <Trash2 size={16} /> {isMobile && <span className="text-sm">Delete</span>}
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>My Services</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and optimize your service offerings</p>
        </div>
        <Link href="/vendor/services/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 text-white font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm">
          <Edit size={16} /> Add New Service
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by service title or category..." value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {statusFilters.map(s => (
              <button key={s} onClick={() => {setStatusFilter(s); setPage(1);}}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  statusFilter === s ? "bg-emerald-100 text-emerald-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <select value={sortKey} onChange={e => {setSortKey(e.target.value); setPage(1);}} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-100">
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
            <Loader size={32} className="mx-auto mb-3 text-emerald-500 animate-spin" />
            <p className="text-gray-500">Loading your services...</p>
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
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="text-left p-4 font-semibold w-1/3">Service</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">Pricing</th>
                  <th className="text-left p-4 font-semibold">Performance</th>
                  <th className="text-left p-4 font-semibold">Visibility</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length > 0 ? paginated.map((service: any) => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-4 align-top">
                      <Link href={`/vendor/services/${service.id}`} className="block hover:underline decoration-emerald-500">
                        <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2">{service.title}</p>
                      </Link>
                      <div className="flex gap-1 flex-wrap mt-2">
                        {service.isFeatured && <span title="Featured"><Award size={14} className="text-amber-500" /></span>}
                        {service.isTrending && <span title="Trending"><TrendingUp size={14} className="text-red-500" /></span>}
                        {service.isBestSeller && <span title="Best Seller"><Star size={14} className="text-emerald-500 fill-emerald-500" /></span>}
                        {service.isNewArrival && <span title="New"><Sparkles size={14} className="text-blue-500" /></span>}
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {service.category?.name || service.category || "General"}
                      </span>
                    </td>
                    <td className="p-4 align-top">
                      <p className="text-sm font-bold text-gray-900">{formatPrice(service.discountPrice || service.basePrice || service.price || 0)}</p>
                      {service.discountPrice && service.basePrice && <p className="text-xs text-gray-400 line-through mt-0.5">{formatPrice(service.basePrice)}</p>}
                    </td>
                    <td className="p-4 align-top">
                      <div className="space-y-1.5 text-xs text-gray-600">
                        <span className="flex items-center gap-1.5"><ShoppingBag size={13} className="text-gray-400"/> {service.bookingCount || 0} Bookings</span>
                        <span className="flex items-center gap-1.5">
                          <Star size={13} className={service.avgRating > 0 ? "text-amber-500 fill-amber-500" : "text-gray-400"} /> 
                          {service.avgRating > 0 ? `${service.avgRating} (${service.reviewCount})` : "No ratings"}
                        </span>
                        <span className="flex items-center gap-1.5"><Eye size={13} className="text-gray-400"/> {service.viewCount || 0} Views</span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggleStatus(service.id, service.isActive)} className="group/toggle relative flex items-center justify-center p-1 rounded hover:bg-gray-100">
                          {service.isActive ? <ToggleRight size={24} className="text-emerald-500" /> : <ToggleLeft size={24} className="text-gray-400" />}
                        </button>
                        <span className="text-xs font-medium text-gray-600">{service.isActive ? "Active" : "Hidden"}</span>
                      </div>
                    </td>
                    <td className="p-4 align-top">
                      <span className={cn("inline-flex text-[10px] font-bold px-2.5 py-1.5 rounded-lg uppercase tracking-wide", statusColors[service.status] || statusColors.SUSPENDED)}>
                        {service.status || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="p-4 align-top text-right relative">
                      <ActionMenu>
                        <Actions service={service} isMobile />
                      </ActionMenu>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-gray-500 bg-gray-50/50">
                      <Search size={32} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-sm font-medium text-gray-900">No services found</p>
                      <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters.</p>
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
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-50 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && services.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No services listed</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">You haven't created any services yet. Add your first service to start receiving bookings.</p>
          <Link href="/vendor/services/new" className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Edit size={16} /> Create First Service
          </Link>
        </div>
      )}

      {/* Action Modals */}
      <AnimatePresence>
        {modalState.type && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalState({ type: null, serviceId: null })} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modalState.type === "ARCHIVE" ? "Archive Service" : "Delete Service"}
              </h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                {modalState.type === "ARCHIVE" ? 
                  "Are you sure you want to archive this service? It will no longer be visible to customers, but past bookings will be retained." : 
                  "Are you sure you want to permanently delete this service? This action cannot be undone and will remove it from the marketplace entirely."}
              </p>
              
              <div className="flex gap-3 justify-end">
                <button onClick={() => setModalState({ type: null, serviceId: null })} disabled={actionLoading} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAction} disabled={actionLoading} className={cn("px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors flex items-center gap-2 shadow-sm", 
                  modalState.type === "ARCHIVE" ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700")}>
                  {actionLoading && <Loader size={16} className="animate-spin" />}
                  {modalState.type === "ARCHIVE" ? "Archive Service" : "Yes, Delete Service"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Search, Edit, Eye, Star, TrendingUp,
  Award, Sparkles, Loader2, ShoppingBag, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, Layers, Image as ImageIcon, MapPin, Clock, MoreVertical
} from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { cn, formatPrice } from "@/lib/utils";
import { useVendorServices, useUpdateVendorService } from "@/hooks/useApi";
import { toast } from "sonner";
import Image from "next/image";

const statusFilters = ["All", "APPROVED", "PENDING", "REJECTED"];
const statusColors: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
  SUSPENDED: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function VendorServicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, error } = useVendorServices();
  const updateService = useUpdateVendorService();

  const services = useMemo(() => {
    return (data as any)?.data || [];
  }, [data]);

  const filteredAndSorted = useMemo(() => {
    let result = services.filter((s: any) => {
      const matchSearch = search ? (
        s.title?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.name?.toLowerCase().includes(search.toLowerCase())
      ) : true;
      
      const matchStatus = statusFilter === "All" ? true : s.status === statusFilter;
      
      return matchSearch && matchStatus;
    });

    if (sortKey === "highest_rated") result.sort((a: any, b: any) => (b.avgRating || 0) - (a.avgRating || 0));
    else if (sortKey === "most_bookings") result.sort((a: any, b: any) => (b.bookingCount || 0) - (a.bookingCount || 0));
    else if (sortKey === "highest_price") result.sort((a: any, b: any) => (b.discountPrice || b.basePrice || 0) - (a.discountPrice || a.basePrice || 0));
    // default newest
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

  const Actions = ({ service, isMobile }: { service: any, isMobile?: boolean }) => (
    <div className={cn("flex flex-col gap-1 p-1 w-full min-w-[140px]")}>
      <Link href={`/vendor/services/${service.id}`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 w-full text-left transition-colors font-medium">
        <Eye size={16} className="text-gray-400" /> <span className="text-sm">View Details</span>
      </Link>
      <Link href={`/vendor/services/${service.id}/edit`} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-gray-700 w-full text-left transition-colors font-medium">
        <Edit size={16} className="text-blue-500" /> <span className="text-sm">Edit Service</span>
      </Link>
      <div className="h-px bg-gray-100 my-1 w-full"></div>
      <button onClick={() => toggleStatus(service.id, service.isActive)} disabled={updateService.isPending} className={cn(
        "flex items-center gap-2 p-2 rounded-lg w-full text-left transition-colors font-medium",
        service.isActive ? "text-gray-700 hover:bg-amber-50" : "text-gray-700 hover:bg-emerald-50",
        updateService.isPending && "opacity-50 cursor-not-allowed"
      )}>
        {service.isActive ? <ToggleRight size={16} className="text-amber-500" /> : <ToggleLeft size={16} className="text-emerald-500" />}
        <span className="text-sm">{service.isActive ? "Deactivate" : "Activate"}</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Service Portfolio</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and monitor all your listed services</p>
        </div>
        <Link href="/vendor/services/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <Plus size={16} /> Create Service
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by service title or category..." value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow bg-gray-50/50 hover:bg-gray-50 focus:bg-white" />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="flex p-1 bg-gray-100/80 rounded-xl">
              {statusFilters.map(s => (
                <button key={s} onClick={() => {setStatusFilter(s); setPage(1);}}
                  className={cn("px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
                    statusFilter === s ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}>
                  {s === "All" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <select value={sortKey} onChange={e => {setSortKey(e.target.value); setPage(1);}} 
              className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-500 transition-colors cursor-pointer">
              <option value="newest">Sort: Newest First</option>
              <option value="highest_rated">Sort: Highest Rated</option>
              <option value="most_bookings">Sort: Most Bookings</option>
              <option value="highest_price">Sort: Highest Price</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 min-h-[400px] flex items-center justify-center shadow-sm">
          <div className="text-center">
            <Loader2 size={32} className="mx-auto mb-4 text-emerald-500 animate-spin" />
            <p className="text-gray-500 font-medium">Loading your services...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
            <span className="text-xl">⚠️</span>
          </div>
          <p className="text-red-800 font-bold text-lg mb-1">Failed to load services</p>
          <p className="text-red-600 text-sm">Please check your connection and try again.</p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && services.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="py-4 px-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Service Info</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Pricing</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden xl:table-cell">Performance</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="py-4 px-5 text-[11px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.length > 0 ? paginated.map((service: any) => (
                  <tr key={service.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden relative border border-gray-100 shadow-sm group-hover:border-emerald-200 transition-colors">
                          {service.images && Array.isArray(service.images) && service.images.length > 0 ? (
                            <Image 
                              src={service.images[0].startsWith('http') ? service.images[0] : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${service.images[0]}`}
                              alt={service.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <ImageIcon size={20} className="text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-[180px]">
                          <Link href={`/vendor/services/${service.id}`} className="text-sm font-bold text-gray-900 hover:text-emerald-600 transition-colors line-clamp-1">{service.title}</Link>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><Clock size={12}/> {service.serviceDuration || 0}m</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin size={12}/> {service.cities && typeof service.cities === 'string' ? JSON.parse(service.cities).length : (service.cities?.length || 0)} Cities</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 hidden lg:table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 whitespace-nowrap border border-gray-200/60">
                        {service.category?.name || service.category || "General"}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col justify-center">
                        <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(service.discountPrice || service.basePrice || service.price || 0)}</span>
                        {service.discountPrice && service.basePrice && <span className="text-[11px] font-medium text-gray-400 line-through whitespace-nowrap mt-0.5">{formatPrice(service.basePrice)}</span>}
                      </div>
                    </td>
                    <td className="py-4 px-5 hidden xl:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                          <span className="text-sm font-bold text-gray-900">{service.avgRating > 0 ? service.avgRating.toFixed(1) : "New"}</span>
                          <span className="text-[10px] font-medium text-gray-400">({service.reviewCount || 0})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ShoppingBag size={14} className="text-blue-500" />
                          <span className="text-xs font-semibold text-gray-600">{service.bookingCount || service._count?.bookings || 0} Bookings</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={cn("inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-md uppercase whitespace-nowrap border tracking-wide", statusColors[service.status] || statusColors.SUSPENDED)}>
                          {service.status || "UNKNOWN"}
                        </span>
                        {service.isActive ? (
                          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border border-gray-200 bg-gray-50 text-gray-700 whitespace-nowrap tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                            ACTIVE
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border border-gray-200 bg-gray-50 text-gray-500 whitespace-nowrap tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></span>
                            INACTIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <ActionMenu>
                        <Actions service={service} isMobile />
                      </ActionMenu>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Search size={32} className="text-gray-300 mb-3" />
                        <p className="text-gray-900 font-bold text-lg">No matches found</p>
                        <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          {filteredAndSorted.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50 gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <span className="text-sm font-medium text-gray-500">Rows per page:</span>
                <select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setPage(1);}} className="text-sm font-semibold border border-gray-200 rounded-lg py-1.5 px-3 bg-white outline-none focus:border-gray-400 cursor-pointer shadow-sm">
                  {[10, 25, 50].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-5 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-sm font-medium text-gray-500">
                  Showing <span className="font-bold text-gray-900">{((page - 1) * pageSize) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * pageSize, filteredAndSorted.length)}</span> of <span className="font-bold text-gray-900">{filteredAndSorted.length}</span>
                </span>
                <div className="flex gap-1.5">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-50 transition-colors shadow-sm text-gray-700">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:bg-gray-50 transition-colors shadow-sm text-gray-700">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && services.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center flex flex-col items-center justify-center shadow-sm min-h-[400px]">
          <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-5 border-4 border-emerald-100/50">
            <Layers size={32} className="text-emerald-500" />
          </div>
          <h2 className="text-gray-900 text-xl font-bold mb-2">Build Your Service Catalog</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
            You haven't listed any services yet. Create your first service listing to start attracting customers and receiving bookings on the platform.
          </p>
          <Link href="/vendor/services/new" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-emerald-500/20">
            <Plus size={18} /> Create Your First Service
          </Link>
        </div>
      )}
    </div>
  );
}

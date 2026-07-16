"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Search, Edit, Eye, Trash2, Star,
  ShoppingBag, TrendingUp, ToggleLeft, ToggleRight, Loader2
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useVendorServices, useUpdateVendorService } from "@/hooks/useApi";
import { toast } from "sonner";
import Image from "next/image";

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function VendorServicesPage() {
  const [search, setSearch] = useState("");
  
  const { data, isLoading, error } = useVendorServices();
  const updateService = useUpdateVendorService();

  const services = useMemo(() => {
    return (data as any)?.data || [];
  }, [data]);

  const filtered = services.filter((s: any) => !search || s.title.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await updateService.mutateAsync({ id, data: { isActive: !currentStatus } });
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update service status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
        Failed to load services. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>My Services</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} services listed</p>
        </div>
        <Link href="/vendor/services/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} /> Add New Service
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search your services..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
        </div>
      </div>

      {/* Service Cards */}
      <div className="space-y-4">
        {filtered.map((service: any) => (
          <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Image Placeholder */}
              <div className="w-full md:w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                {service.images && Array.isArray(service.images) && service.images.length > 0 ? (
                  <Image 
                    src={service.images[0].startsWith('http') ? service.images[0] : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${service.images[0]}`}
                    alt={service.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl">🎈</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{service.category?.name || "Uncategorized"} · Created {new Date(service.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0", statusColors[service.status])}>
                    {service.status}
                  </span>
                </div>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-900">{formatPrice(service.discountPrice || service.basePrice)}</span>
                    {service.discountPrice && <span className="text-sm text-gray-400 line-through">{formatPrice(service.basePrice)}</span>}
                  </div>
                  <span className="text-gray-200">|</span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Star size={13} className="text-amber-500 fill-amber-500" /> {service.avgRating > 0 ? service.avgRating : "—"}
                    <span className="text-xs text-gray-400">({service.reviewCount})</span>
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <ShoppingBag size={13} /> {service.bookingCount} bookings
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-600">
                    <Eye size={13} /> {service.viewCount} views
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {service.isFeatured && <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md">⭐ Featured</span>}
                  {service.isTrending && <span className="text-[10px] font-medium bg-red-50 text-red-600 px-2 py-0.5 rounded-md">🔥 Trending</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col items-center gap-2 shrink-0">
                <Link href={`/vendor/services/${service.id}/edit`} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">
                  <Edit size={14} /> Edit
                </Link>
                <button onClick={() => toggleStatus(service.id, service.isActive)} disabled={updateService.isPending} className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  service.isActive
                    ? "text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                    : "text-gray-500 hover:bg-gray-50 border border-gray-200",
                  updateService.isPending && "opacity-50 cursor-not-allowed"
                )}>
                  {service.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {service.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

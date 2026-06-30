"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, Search, Edit, Eye, Trash2, MoreVertical, Star,
  ShoppingBag, TrendingUp, ToggleLeft, ToggleRight
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const services = [
  { id: 1, title: "Premium Birthday Balloon Decoration", category: "Balloon Decorations", basePrice: 4999, discountPrice: 3999, status: "APPROVED", isActive: true, avgRating: 4.5, reviewCount: 128, bookingCount: 456, viewCount: 2340, isFeatured: true, isTrending: true, createdAt: "2024-01-20" },
  { id: 2, title: "Romantic Candlelight Dinner Setup", category: "Candlelight Dinner", basePrice: 5999, discountPrice: 4499, status: "APPROVED", isActive: true, avgRating: 4.8, reviewCount: 89, bookingCount: 234, viewCount: 1560, isFeatured: true, isTrending: true, createdAt: "2024-02-10" },
  { id: 3, title: "Royal Wedding Stage Decoration", category: "Wedding Decorations", basePrice: 49999, discountPrice: 39999, status: "APPROVED", isActive: true, avgRating: 4.9, reviewCount: 56, bookingCount: 123, viewCount: 890, isFeatured: true, isTrending: false, createdAt: "2024-01-25" },
  { id: 4, title: "Simple Anniversary Setup", category: "Anniversary", basePrice: 2999, discountPrice: 2499, status: "PENDING", isActive: false, avgRating: 0, reviewCount: 0, bookingCount: 0, viewCount: 0, isFeatured: false, isTrending: false, createdAt: "2024-03-14" },
];

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function VendorServicesPage() {
  const [search, setSearch] = useState("");

  const filtered = services.filter(s => !search || s.title.toLowerCase().includes(search.toLowerCase()));

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
        {filtered.map(service => (
          <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Image Placeholder */}
              <div className="w-full md:w-24 h-24 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                <span className="text-3xl">🎈</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{service.category} · Created {service.createdAt}</p>
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
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 border border-gray-200">
                  <Edit size={14} /> Edit
                </button>
                <button className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  service.isActive
                    ? "text-emerald-600 hover:bg-emerald-50 border border-emerald-200"
                    : "text-gray-500 hover:bg-gray-50 border border-gray-200"
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

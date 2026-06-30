"use client";

import { useState } from "react";
import {
  Search, Eye, CheckCircle, XCircle, Star, TrendingUp,
  Award, Sparkles, Filter
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const services = [
  { id: 1, title: "Premium Birthday Balloon Decoration", vendor: "Dream Decorators", category: "Balloon Decorations", basePrice: 4999, discountPrice: 3999, status: "APPROVED", avgRating: 4.5, bookingCount: 456, isFeatured: true, isTrending: true, isBestSeller: true, isNewArrival: false, createdAt: "2024-01-20" },
  { id: 2, title: "Romantic Candlelight Dinner Setup", vendor: "Dream Decorators", category: "Candlelight Dinner", basePrice: 5999, discountPrice: 4499, status: "APPROVED", avgRating: 4.8, bookingCount: 234, isFeatured: true, isTrending: true, isBestSeller: false, isNewArrival: true, createdAt: "2024-02-10" },
  { id: 3, title: "Neon Glow Party Setup", vendor: "Glow Events", category: "Birthday Decorations", basePrice: 6999, discountPrice: 5499, status: "PENDING", avgRating: 0, bookingCount: 0, isFeatured: false, isTrending: false, isBestSeller: false, isNewArrival: true, createdAt: "2024-03-14" },
  { id: 4, title: "Golden Anniversary Setup", vendor: "Love Setup Co", category: "Anniversary", basePrice: 8999, discountPrice: 6999, status: "PENDING", avgRating: 0, bookingCount: 0, isFeatured: false, isTrending: false, isBestSeller: false, isNewArrival: true, createdAt: "2024-03-15" },
  { id: 5, title: "Corporate Conference Setup", vendor: "BizEvents Pro", category: "Corporate Events", basePrice: 15999, discountPrice: 12999, status: "REJECTED", avgRating: 0, bookingCount: 0, isFeatured: false, isTrending: false, isBestSeller: false, isNewArrival: false, createdAt: "2024-03-10" },
];

const statusFilters = ["All", "APPROVED", "PENDING", "REJECTED"];
const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminServicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = services.filter(s => {
    if (statusFilter !== "All" && s.status !== statusFilter) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
            <input type="text" placeholder="Search services..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  statusFilter === s ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 font-medium">Service</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Category</th>
                <th className="text-left p-4 font-medium">Price</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Rating</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Bookings</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Tags</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(service => (
                <tr key={service.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{service.title}</p>
                      <p className="text-xs text-gray-500">{service.vendor}</p>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{service.category}</span>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-gray-900">{formatPrice(service.discountPrice || service.basePrice)}</p>
                    {service.discountPrice && <p className="text-xs text-gray-400 line-through">{formatPrice(service.basePrice)}</p>}
                  </td>
                  <td className="p-4 hidden lg:table-cell">
                    {service.avgRating > 0 ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Star size={12} className="text-amber-500 fill-amber-500" /> {service.avgRating}
                      </span>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-sm font-medium text-gray-900">{service.bookingCount}</td>
                  <td className="p-4 hidden md:table-cell">
                    <div className="flex gap-1 flex-wrap">
                      {service.isFeatured && <span title="Featured"><Award size={14} className="text-amber-500" /></span>}
                      {service.isTrending && <span title="Trending"><TrendingUp size={14} className="text-red-500" /></span>}
                      {service.isBestSeller && <span title="Best Seller"><Star size={14} className="text-violet-500 fill-violet-500" /></span>}
                      {service.isNewArrival && <span title="New"><Sparkles size={14} className="text-green-500" /></span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", statusColors[service.status])}>
                      {service.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {service.status === "PENDING" && (
                        <>
                          <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="View">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

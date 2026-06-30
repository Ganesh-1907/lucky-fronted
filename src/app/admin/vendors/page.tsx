"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Filter, Eye, CheckCircle, XCircle, Ban,
  ChevronDown, Star, ShoppingBag, MoreVertical
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const vendors = [
  { id: 1, businessName: "Dream Decorators", ownerName: "Rajesh Kumar", email: "rajesh@dream.com", phone: "+91 98765 43210", city: "Mumbai", status: "APPROVED", totalBookings: 890, totalEarnings: 1245000, avgRating: 4.7, reviewCount: 342, services: 15, commissionRate: 15, joinedAt: "2024-01-15" },
  { id: 2, businessName: "Party Kings", ownerName: "Suresh Patel", email: "suresh@party.com", phone: "+91 98765 43211", city: "Delhi", status: "APPROVED", totalBookings: 456, totalEarnings: 789000, avgRating: 4.5, reviewCount: 189, services: 8, commissionRate: 15, joinedAt: "2024-02-10" },
  { id: 3, businessName: "Glow Events", ownerName: "Neha Sharma", email: "neha@glow.com", phone: "+91 98765 43212", city: "Bangalore", status: "PENDING", totalBookings: 0, totalEarnings: 0, avgRating: 0, reviewCount: 0, services: 0, commissionRate: 15, joinedAt: "2024-03-14" },
  { id: 4, businessName: "Love Setup Co", ownerName: "Arun Verma", email: "arun@love.com", phone: "+91 98765 43213", city: "Pune", status: "PENDING", totalBookings: 0, totalEarnings: 0, avgRating: 0, reviewCount: 0, services: 0, commissionRate: 15, joinedAt: "2024-03-15" },
  { id: 5, businessName: "BizEvents Pro", ownerName: "Kiran Mehta", email: "kiran@biz.com", phone: "+91 98765 43214", city: "Chennai", status: "SUSPENDED", totalBookings: 23, totalEarnings: 45000, avgRating: 3.2, reviewCount: 12, services: 3, commissionRate: 15, joinedAt: "2024-01-20" },
];

const statusFilters = ["All", "APPROVED", "PENDING", "REJECTED", "SUSPENDED"];
const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  REJECTED: "bg-red-100 text-red-700",
  SUSPENDED: "bg-gray-100 text-gray-700",
};

export default function AdminVendorsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);

  const filtered = vendors.filter(v => {
    if (statusFilter !== "All" && v.status !== statusFilter) return false;
    if (search && !v.businessName.toLowerCase().includes(search.toLowerCase()) && !v.ownerName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
            Vendor Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">{vendors.length} total vendors</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statusFilters.map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  statusFilter === s ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {s === "All" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
                {s === "PENDING" && <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{vendors.filter(v => v.status === "PENDING").length}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-4 font-medium">Vendor</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">City</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Services</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Bookings</th>
                <th className="text-left p-4 font-medium hidden md:table-cell">Rating</th>
                <th className="text-left p-4 font-medium hidden lg:table-cell">Earnings</th>
                <th className="text-left p-4 font-medium">Status</th>
                <th className="text-left p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(vendor => (
                <tr key={vendor.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-sm">{vendor.businessName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{vendor.businessName}</p>
                        <p className="text-xs text-gray-500">{vendor.ownerName} · {vendor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden md:table-cell text-sm text-gray-600">{vendor.city}</td>
                  <td className="p-4 hidden lg:table-cell text-sm font-medium text-gray-900">{vendor.services}</td>
                  <td className="p-4 hidden lg:table-cell text-sm font-medium text-gray-900">{vendor.totalBookings}</td>
                  <td className="p-4 hidden md:table-cell">
                    {vendor.avgRating > 0 ? (
                      <span className="flex items-center gap-1 text-sm">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        <span className="font-medium">{vendor.avgRating}</span>
                        <span className="text-gray-400 text-xs">({vendor.reviewCount})</span>
                      </span>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td className="p-4 hidden lg:table-cell text-sm font-semibold text-gray-900">{formatPrice(vendor.totalEarnings)}</td>
                  <td className="p-4">
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", statusColors[vendor.status])}>
                      {vendor.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {vendor.status === "PENDING" && (
                        <>
                          <button className="p-1.5 rounded-lg hover:bg-green-50 text-green-600" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      {vendor.status === "APPROVED" && (
                        <button className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Suspend">
                          <Ban size={16} />
                        </button>
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

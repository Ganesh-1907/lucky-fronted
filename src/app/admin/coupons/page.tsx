"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Copy, ToggleLeft, ToggleRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

const coupons = [
  { id: 1, code: "WELCOME20", description: "20% off for new users", type: "PERCENTAGE", value: 20, maxDiscount: 500, minOrder: 999, usageLimit: 1000, usedCount: 345, validFrom: "2024-01-01", validTo: "2024-12-31", isActive: true },
  { id: 2, code: "FLAT200", description: "Flat ₹200 off", type: "FIXED", value: 200, maxDiscount: null, minOrder: 1499, usageLimit: 500, usedCount: 123, validFrom: "2024-01-01", validTo: "2024-06-30", isActive: true },
  { id: 3, code: "WEDDING15", description: "15% off on wedding services", type: "PERCENTAGE", value: 15, maxDiscount: 5000, minOrder: 9999, usageLimit: 200, usedCount: 45, validFrom: "2024-02-01", validTo: "2024-12-31", isActive: true },
  { id: 4, code: "EXPIRED10", description: "10% off expired", type: "PERCENTAGE", value: 10, maxDiscount: 300, minOrder: 499, usageLimit: 100, usedCount: 100, validFrom: "2023-01-01", validTo: "2023-12-31", isActive: false },
];

export default function AdminCouponsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage discount coupons</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 mb-4">Create New Coupon</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input type="text" placeholder="COUPON_CODE" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm uppercase focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white">
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input type="number" placeholder="20" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Order</label>
              <input type="number" placeholder="999" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Discount</label>
              <input type="number" placeholder="500" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
              <input type="number" placeholder="1000" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid To</label>
              <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input type="text" placeholder="Coupon description" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {coupons.map(coupon => (
          <div key={coupon.id} className={cn("bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow", !coupon.isActive && "opacity-60")}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="px-4 py-2.5 rounded-xl bg-violet-50 border-2 border-dashed border-violet-200">
                  <span className="text-lg font-mono font-bold text-violet-700">{coupon.code}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{coupon.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {coupon.type === "PERCENTAGE" ? `${coupon.value}% off` : `₹${coupon.value} off`}
                    {coupon.maxDiscount && <> · Max {formatPrice(coupon.maxDiscount)}</>}
                    {` · Min order ${formatPrice(coupon.minOrder)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900">{coupon.usedCount}/{coupon.usageLimit}</p>
                  <p className="text-xs text-gray-400">Used</p>
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                    <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(coupon.usedCount / (coupon.usageLimit || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">{coupon.validFrom}</p>
                  <p className="text-xs text-gray-500">to {coupon.validTo}</p>
                </div>

                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Copy code">
                    <Copy size={14} />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" title="Edit">
                    <Edit size={14} />
                  </button>
                  <button className={cn("p-1.5 rounded-lg", coupon.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")} title="Toggle">
                    {coupon.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  </button>
                  <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

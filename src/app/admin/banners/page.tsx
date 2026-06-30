"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Image, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const banners = [
  { id: 1, title: "Summer Sale - 30% Off", position: "HERO", linkUrl: "/services", isActive: true, sortOrder: 1, image: null, color: "from-violet-500 to-purple-500" },
  { id: 2, title: "Wedding Season Special", position: "HERO", linkUrl: "/category/wedding-decorations", isActive: true, sortOrder: 2, image: null, color: "from-pink-500 to-rose-500" },
  { id: 3, title: "New Vendor Promo", position: "SIDEBAR", linkUrl: "/auth/register?role=vendor", isActive: true, sortOrder: 1, image: null, color: "from-emerald-500 to-teal-500" },
  { id: 4, title: "Download Our App", position: "FOOTER", linkUrl: "#", isActive: false, sortOrder: 1, image: null, color: "from-amber-500 to-orange-500" },
];

const positions = ["ALL", "HERO", "SIDEBAR", "FOOTER"];
const positionColors: Record<string, string> = {
  HERO: "bg-violet-100 text-violet-700",
  SIDEBAR: "bg-blue-100 text-blue-700",
  FOOTER: "bg-amber-100 text-amber-700",
};

export default function AdminBannersPage() {
  const [posFilter, setPosFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);

  const filtered = banners.filter(b => posFilter === "ALL" || b.position === posFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional banners across the site</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Position Filters */}
      <div className="flex gap-2">
        {positions.map(p => (
          <button key={p} onClick={() => setPosFilter(p)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
              posFilter === p ? "bg-violet-100 text-violet-700" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
            )}>
            {p === "ALL" ? "All" : p.charAt(0) + p.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 mb-4">Add New Banner</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" placeholder="Banner title" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white">
                <option value="HERO">Hero (Homepage)</option>
                <option value="SIDEBAR">Sidebar</option>
                <option value="FOOTER">Footer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input type="url" placeholder="/services or https://..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-violet-300 hover:bg-violet-50/50">
                <Image size={16} /> Upload image (1200×400px)
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Banners Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map(banner => (
          <div key={banner.id} className={cn("bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow", !banner.isActive && "opacity-60")}>
            {/* Preview */}
            <div className={`h-40 bg-gradient-to-r ${banner.color} flex items-center justify-center relative`}>
              <span className="text-white font-bold text-lg text-center px-4">{banner.title}</span>
              <div className="absolute top-3 left-3">
                <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase", positionColors[banner.position])}>
                  {banner.position}
                </span>
              </div>
            </div>
            {/* Controls */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{banner.title}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <ExternalLink size={10} /> {banner.linkUrl}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button className={cn("p-1.5 rounded-lg", banner.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")}>
                  {banner.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit size={14} /></button>
                <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

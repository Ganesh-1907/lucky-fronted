"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ChevronRight, GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  children: Category[];
}

const categories: Category[] = [
  { id: 1, name: "Birthday Decorations", slug: "birthday-decorations", icon: "🎂", isActive: true, sortOrder: 1, children: [
    { id: 2, name: "Balloon Decorations", slug: "balloon-decorations", icon: "🎈", isActive: true, sortOrder: 1, children: [] },
    { id: 3, name: "Theme Decorations", slug: "theme-decorations", icon: "🎭", isActive: true, sortOrder: 2, children: [] },
    { id: 4, name: "Simple Decorations", slug: "simple-decorations", icon: "🎉", isActive: true, sortOrder: 3, children: [] },
    { id: 5, name: "Premium Decorations", slug: "premium-decorations", icon: "✨", isActive: true, sortOrder: 4, children: [] },
  ]},
  { id: 6, name: "Wedding Decorations", slug: "wedding-decorations", icon: "💒", isActive: true, sortOrder: 2, children: [
    { id: 7, name: "Mandap Decoration", slug: "mandap-decoration", icon: "🏵️", isActive: true, sortOrder: 1, children: [] },
    { id: 8, name: "Stage Decoration", slug: "stage-decoration", icon: "🎪", isActive: true, sortOrder: 2, children: [] },
    { id: 9, name: "Car Decoration", slug: "car-decoration", icon: "🚗", isActive: true, sortOrder: 3, children: [] },
  ]},
  { id: 10, name: "Anniversary Celebrations", slug: "anniversary-celebrations", icon: "💕", isActive: true, sortOrder: 3, children: [] },
  { id: 11, name: "Candlelight Dinner", slug: "candlelight-dinner", icon: "🕯️", isActive: true, sortOrder: 4, children: [] },
  { id: 12, name: "Cakes", slug: "cakes", icon: "🎂", isActive: true, sortOrder: 5, children: [] },
  { id: 13, name: "Flowers", slug: "flowers", icon: "💐", isActive: true, sortOrder: 6, children: [] },
  { id: 14, name: "Corporate Events", slug: "corporate-events", icon: "🏢", isActive: true, sortOrder: 7, children: [] },
  { id: 15, name: "Surprise Planning", slug: "surprise-planning", icon: "🎁", isActive: false, sortOrder: 8, children: [] },
];

export default function AdminCategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", icon: "", parentId: 0 });
  const [expandedIds, setExpandedIds] = useState<number[]>([1, 6]);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const renderCategory = (cat: Category, depth: number = 0) => (
    <div key={cat.id}>
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50",
        depth > 0 && "bg-gray-50/50"
      )} style={{ paddingLeft: `${16 + depth * 24}px` }}>
        <GripVertical size={14} className="text-gray-300 cursor-grab shrink-0" />

        {cat.children.length > 0 && (
          <button onClick={() => toggleExpand(cat.id)} className="shrink-0">
            <ChevronRight size={14} className={cn("text-gray-400 transition-transform", expandedIds.includes(cat.id) && "rotate-90")} />
          </button>
        )}
        {cat.children.length === 0 && <div className="w-3.5" />}

        <span className="text-lg shrink-0">{cat.icon}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{cat.name}</p>
          <p className="text-xs text-gray-400">/{cat.slug}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className={cn("p-1.5 rounded-lg transition-colors", cat.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")}>
            {cat.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => { setEditId(cat.id); setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon, parentId: 0 }); setShowForm(true); }}>
            <Edit size={14} />
          </button>
          <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {cat.children.length > 0 && expandedIds.includes(cat.id) && (
        <div>{cat.children.map(child => renderCategory(child, depth + 1))}</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Categories</h1>
          <p className="text-sm text-gray-500 mt-1">Manage service categories with drag-and-drop ordering</p>
        </div>
        <button onClick={() => { setEditId(null); setFormData({ name: "", slug: "", icon: "", parentId: 0 }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Add"} Category</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
              <input type="text" value={formData.icon} onChange={e => setFormData({ ...formData, icon: e.target.value })} placeholder="🎉"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Category Name"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="category-slug"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
              <select value={formData.parentId} onChange={e => setFormData({ ...formData, parentId: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white">
                <option value={0}>None (Root)</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium">{editId ? "Update" : "Create"}</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Category Tree */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{categories.length} root categories</p>
          <div className="flex gap-2">
            <button onClick={() => setExpandedIds(categories.map(c => c.id))} className="text-xs text-violet-600 hover:underline">Expand All</button>
            <button onClick={() => setExpandedIds([])} className="text-xs text-violet-600 hover:underline">Collapse All</button>
          </div>
        </div>
        {categories.map(cat => renderCategory(cat))}
      </div>
    </div>
  );
}

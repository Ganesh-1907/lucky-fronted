"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff, ExternalLink, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  id: number;
  label: string;
  linkUrl: string;
  isActive: boolean;
  sortOrder: number;
  children: MenuItem[];
}

const menuItems: MenuItem[] = [
  { id: 1, label: "Birthday", linkUrl: "/category/birthday-decorations", isActive: true, sortOrder: 1, children: [
    { id: 10, label: "Balloon Decorations", linkUrl: "/category/balloon-decorations", isActive: true, sortOrder: 1, children: [] },
    { id: 11, label: "Theme Parties", linkUrl: "/category/theme-decorations", isActive: true, sortOrder: 2, children: [] },
    { id: 12, label: "Kids Birthday", linkUrl: "/category/kids-birthday", isActive: true, sortOrder: 3, children: [] },
  ]},
  { id: 2, label: "Wedding", linkUrl: "/category/wedding-decorations", isActive: true, sortOrder: 2, children: [
    { id: 20, label: "Mandap", linkUrl: "/category/mandap-decoration", isActive: true, sortOrder: 1, children: [] },
    { id: 21, label: "Stage", linkUrl: "/category/stage-decoration", isActive: true, sortOrder: 2, children: [] },
  ]},
  { id: 3, label: "Anniversary", linkUrl: "/category/anniversary-celebrations", isActive: true, sortOrder: 3, children: [] },
  { id: 4, label: "Candlelight Dinner", linkUrl: "/category/candlelight-dinner", isActive: true, sortOrder: 4, children: [] },
  { id: 5, label: "Cakes & Flowers", linkUrl: "/category/cakes", isActive: true, sortOrder: 5, children: [] },
  { id: 6, label: "Surprise Planning", linkUrl: "/category/surprise-planning", isActive: false, sortOrder: 6, children: [] },
];

export default function AdminMenuPage() {
  const [items, setItems] = useState(menuItems);
  const [showForm, setShowForm] = useState(false);
  const [expandedIds, setExpandedIds] = useState<number[]>([1, 2]);

  const toggle = (id: number) => setExpandedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  const renderItem = (item: MenuItem, depth = 0) => (
    <div key={item.id}>
      <div className={cn("flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50", !item.isActive && "opacity-50")}
        style={{ paddingLeft: `${16 + depth * 28}px` }}>
        <GripVertical size={14} className="text-gray-300 cursor-grab shrink-0" />
        {item.children.length > 0 ? (
          <button onClick={() => toggle(item.id)} className="shrink-0">
            <ChevronRight size={14} className={cn("text-gray-400 transition-transform", expandedIds.includes(item.id) && "rotate-90")} />
          </button>
        ) : <div className="w-3.5 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{item.label}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1"><ExternalLink size={9} /> {item.linkUrl}</p>
        </div>
        {item.children.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{item.children.length} sub</span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <button className={cn("p-1.5 rounded-lg", item.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")}>
            {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit size={14} /></button>
          <button className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
        </div>
      </div>
      {item.children.length > 0 && expandedIds.includes(item.id) && item.children.map(child => renderItem(child, depth + 1))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Menu Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the navigation mega menu structure</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 mb-4">Add Menu Item</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input type="text" placeholder="Menu label" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <input type="text" placeholder="/category/..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white">
                <option value="">None (Top Level)</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium">Create</button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{items.length} top-level items</p>
          <div className="flex gap-2">
            <button onClick={() => setExpandedIds(items.map(i => i.id))} className="text-xs text-violet-600 hover:underline">Expand</button>
            <button onClick={() => setExpandedIds([])} className="text-xs text-violet-600 hover:underline">Collapse</button>
          </div>
        </div>
        {items.map(item => renderItem(item))}
      </div>
    </div>
  );
}

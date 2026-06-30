"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2, Eye, EyeOff, Edit, Save, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
  id: number;
  type: string;
  title: string;
  isActive: boolean;
  config: Record<string, any>;
}

const sectionTypes = [
  { type: "HERO_BANNER", label: "Hero Banner Slider", icon: "🖼️" },
  { type: "CATEGORIES", label: "Category Grid", icon: "📂" },
  { type: "SERVICES_TRENDING", label: "Trending Services", icon: "🔥" },
  { type: "SERVICES_BESTSELLER", label: "Best Sellers", icon: "⭐" },
  { type: "SERVICES_NEW", label: "New Arrivals", icon: "✨" },
  { type: "HOW_IT_WORKS", label: "How It Works", icon: "📋" },
  { type: "TESTIMONIALS", label: "Testimonials", icon: "💬" },
  { type: "VENDOR_CTA", label: "Vendor CTA Banner", icon: "📢" },
  { type: "CITIES", label: "Cities Showcase", icon: "🏙️" },
  { type: "CUSTOM_BANNER", label: "Custom Banner", icon: "🎨" },
];

const initialSections: Section[] = [
  { id: 1, type: "HERO_BANNER", title: "Hero Banner Slider", isActive: true, config: { autoplay: true, interval: 5000 } },
  { id: 2, type: "CATEGORIES", title: "Browse Categories", isActive: true, config: { columns: 4, showCount: true } },
  { id: 3, type: "SERVICES_TRENDING", title: "Trending Services", isActive: true, config: { limit: 8, showViewAll: true } },
  { id: 4, type: "SERVICES_BESTSELLER", title: "Best Sellers", isActive: true, config: { limit: 8, showViewAll: true } },
  { id: 5, type: "HOW_IT_WORKS", title: "How It Works", isActive: true, config: { steps: 4 } },
  { id: 6, type: "VENDOR_CTA", title: "Become a Vendor", isActive: true, config: {} },
  { id: 7, type: "TESTIMONIALS", title: "What Our Customers Say", isActive: true, config: { limit: 3 } },
  { id: 8, type: "CITIES", title: "Available Cities", isActive: true, config: { limit: 10 } },
  { id: 9, type: "SERVICES_NEW", title: "New Arrivals", isActive: false, config: { limit: 4 } },
];

export default function AdminHomepagePage() {
  const [sections, setSections] = useState(initialSections);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const moveSection = (idx: number, dir: "up" | "down") => {
    const arr = [...sections];
    const swapIdx = dir === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= arr.length) return;
    [arr[idx], arr[swapIdx]] = [arr[swapIdx], arr[idx]];
    setSections(arr);
  };

  const toggleActive = (id: number) => {
    setSections(sections.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const removeSection = (id: number) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const addSection = (type: string) => {
    const st = sectionTypes.find(s => s.type === type);
    if (!st) return;
    setSections([...sections, {
      id: Date.now(),
      type,
      title: st.label,
      isActive: true,
      config: {},
    }]);
    setShowAddMenu(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Homepage Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Drag sections to reorder your homepage layout</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button onClick={() => setShowAddMenu(!showAddMenu)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
              <Plus size={16} /> Add Section
            </button>
            {showAddMenu && (
              <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl p-3 z-10 animate-fade-in">
                <p className="text-xs font-medium text-gray-400 uppercase mb-2 px-2">Section Types</p>
                {sectionTypes.map(st => (
                  <button key={st.type} onClick={() => addSection(st.type)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-violet-50 transition-colors">
                    <span className="text-lg">{st.icon}</span>
                    <span className="font-medium text-gray-700">{st.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700">
            <Save size={16} /> Save Layout
          </button>
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-700">
        💡 Reorder sections using the arrows. Toggle visibility with the eye icon. Click a section to expand its settings.
      </div>

      {/* Sections List */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const st = sectionTypes.find(t => t.type === section.type);
          return (
            <div key={section.id} className={cn(
              "bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all",
              !section.isActive && "opacity-50"
            )}>
              <div className="flex items-center gap-3 px-5 py-4">
                <GripVertical size={16} className="text-gray-300 cursor-grab shrink-0" />

                {/* Order arrows */}
                <div className="flex flex-col shrink-0">
                  <button onClick={() => moveSection(idx, "up")} disabled={idx === 0}
                    className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronUp size={14} /></button>
                  <button onClick={() => moveSection(idx, "down")} disabled={idx === sections.length - 1}
                    className="p-0.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronDown size={14} /></button>
                </div>

                <span className="text-xl shrink-0">{st?.icon || "📦"}</span>

                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(expandedId === section.id ? null : section.id)}>
                  <p className="text-sm font-semibold text-gray-900">{section.title}</p>
                  <p className="text-xs text-gray-400">{st?.label || section.type}</p>
                </div>

                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-mono shrink-0">#{idx + 1}</span>

                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => toggleActive(section.id)}
                    className={cn("p-1.5 rounded-lg", section.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")}>
                    {section.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => removeSection(section.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Expanded Settings */}
              {expandedId === section.id && (
                <div className="px-5 pb-4 border-t border-gray-100 pt-4 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                      <input type="text" value={section.title}
                        onChange={e => setSections(sections.map(s => s.id === section.id ? { ...s, title: e.target.value } : s))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
                    </div>
                    {(section.type.startsWith("SERVICES") || section.type === "TESTIMONIALS" || section.type === "CITIES") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Items Limit</label>
                        <input type="number" defaultValue={section.config.limit || 8} min={2} max={20}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { GripVertical, Plus, Trash2, Eye, EyeOff, Edit, Save, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminHomepageSections, useUpdateHomepageSection, useReorderHomepageSections, useAddHomepageSection, useDeleteHomepageSection } from "@/hooks/useApi";
import { toast } from "sonner";

interface Section {
  id: number;
  type: string;
  name: string;
  title: string;
  isActive: boolean;
  config: Record<string, any>;
}

const sectionTypes = [
  { type: "banner", name: "hero_banner", label: "Hero Banner Slider", icon: "🖼️" },
  { type: "categories", name: "categories", label: "Category Grid", icon: "📂" },
  { type: "services", name: "trending", label: "Trending Services", icon: "🔥" },
  { type: "services", name: "best_sellers", label: "Best Sellers", icon: "⭐" },
  { type: "services", name: "new_arrivals", label: "New Arrivals", icon: "✨" },
  { type: "how_it_works", name: "how_it_works", label: "How It Works", icon: "📋" },
  { type: "testimonials", name: "testimonials", label: "Testimonials", icon: "💬" },
  { type: "vendor_cta", name: "vendor_cta", label: "Vendor CTA Banner", icon: "📢" },
  { type: "cities", name: "cities", label: "Cities Showcase", icon: "🏙️" },
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
  const [sections, setSections] = useState<Section[]>([]);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, error } = useAdminHomepageSections();
  const updateSection = useUpdateHomepageSection();
  const reorderSections = useReorderHomepageSections();
  const addSectionMutation = useAddHomepageSection();
  const deleteSectionMutation = useDeleteHomepageSection();

  useEffect(() => {
    console.log("AdminHomepagePage - data:", data, "error:", error);
    if (data?.data) {
      setSections([...data.data].sort((a, b) => a.sortOrder - b.sortOrder));
    }
  }, [data, error]);

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

  const updateConfig = (id: number, key: string, value: any) => {
    setSections(sections.map(s => s.id === id ? { ...s, config: { ...(s.config || {}), [key]: value } } : s));
  };

  const removeSection = async (id: number) => {
    try {
      await handleSave(); // Save any pending local changes first
      await deleteSectionMutation.mutateAsync(id);
      toast.success("Section removed");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove section");
    }
  };

  const addSection = async (type: string, name: string) => {
    const st = sectionTypes.find(s => s.type === type && s.name === name);
    if (!st) return;
    
    try {
      await handleSave(); // Save any pending local changes first
      let initialConfig: any = {};
      if (type === 'services') {
        initialConfig.tag = name === 'best_sellers' ? 'bestseller' : name;
        initialConfig.limit = 8;
      }

      await addSectionMutation.mutateAsync({
        type,
        name,
        title: st.label,
        isActive: true,
        sortOrder: sections.length + 1,
        config: initialConfig
      });
      toast.success("Section added");
    } catch (err: any) {
      toast.error(err.message || "Failed to add section");
    } finally {
      setShowAddMenu(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Update reordering
      const orderItems = sections.map((s, i) => ({ id: s.id, sortOrder: i + 1 }));
      await reorderSections.mutateAsync(orderItems);

      // Update contents
      await Promise.all(sections.map(s => 
        updateSection.mutateAsync({
          id: s.id,
          data: {
            title: s.title,
            isActive: s.isActive,
            config: s.config
          }
        })
      ));
      
      toast.success("Homepage layout saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save layout");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-violet-600" /></div>;
  }

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
                  <button key={st.type + st.name} onClick={() => addSection(st.type, st.name)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-violet-50 transition-colors">
                    <span className="text-lg">{st.icon}</span>
                    <span className="font-medium text-gray-700">{st.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Layout
          </button>
        </div>
      </div>

      {/* Preview Info */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-sm text-violet-700">
        💡 Reorder sections using the arrows. Toggle visibility with the eye icon. Click a section to expand its settings.
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          Error loading sections: {(error as any)?.message || "Unknown error"}
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-2">
        {sections.map((section, idx) => {
          const st = sectionTypes.find(t => t.type === section.type && (!t.name || t.name === section.name));
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
                  <button onClick={(e) => { e.stopPropagation(); toggleActive(section.id); }}
                    className={cn("p-1.5 rounded-lg", section.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")}>
                    {section.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
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
                    {(section.type.startsWith("services") || section.type === "testimonials" || section.type === "cities") && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Items Limit</label>
                        <input type="number" value={section.config?.limit || 8} min={2} max={20}
                          onChange={e => updateConfig(section.id, 'limit', Number(e.target.value))}
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

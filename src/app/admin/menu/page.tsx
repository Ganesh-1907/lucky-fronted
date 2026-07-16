"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, ExternalLink, ChevronRight, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminMenu, useCreateMenuItem, useUpdateMenuItem, useDeleteMenuItem, useCategories } from "@/hooks/useApi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";

interface MenuItem {
  id: number;
  label: string;
  url: string;
  isActive: boolean;
  sortOrder: number;
  parentId: number | null;
  children: MenuItem[];
}

export default function AdminMenuPage() {
  const { data, isLoading } = useAdminMenu();
  const items: MenuItem[] = data?.data || [];

  const { data: catData } = useCategories();
  
  // Flatten categories so sub-categories are selectable in the dropdown
  const flattenCategories = (cats: any[], prefix = ""): any[] => {
    let flat: any[] = [];
    (cats || []).forEach(c => {
      const name = prefix ? `${prefix} > ${c.name}` : c.name;
      flat.push({ ...c, displayName: name });
      if (c.children && c.children.length > 0) {
        flat = flat.concat(flattenCategories(c.children, name));
      }
    });
    return flat;
  };
  
  const flatCategories = flattenCategories(catData?.data || []);

  const createMenuItem = useCreateMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const deleteMenuItem = useDeleteMenuItem();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ label: "", url: "", parentId: 0, isActive: true });
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reordering, setReordering] = useState(false);
  
  const qc = useQueryClient();

  const toggle = (id: number) => setExpandedIds(p => p.includes(id) ? p.filter(i => i !== id) : [...p, id]);

  const handleToggleStatus = async (item: MenuItem) => {
    try {
      await updateMenuItem.mutateAsync({ id: item.id, data: { isActive: !item.isActive } });
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    try {
      setDeleting(true);
      await deleteMenuItem.mutateAsync(deleteModalId);
      toast.success("Menu item deleted");
      setDeleteModalId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setDeleting(false);
    }
  };

  const moveItem = async (item: MenuItem, direction: 'up' | 'down', siblingItems: MenuItem[]) => {
    const currentIndex = siblingItems.findIndex(i => i.id === item.id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === siblingItems.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Create a new array and physically swap the items
    const newSiblings = [...siblingItems];
    const temp = newSiblings[currentIndex];
    newSiblings[currentIndex] = newSiblings[newIndex];
    newSiblings[newIndex] = temp;

    // Recalculate sortOrders sequentially for all siblings to guarantee no collisions
    const updates = newSiblings.map((sib, index) => ({
      id: sib.id,
      sortOrder: index + 1,
      parentId: sib.parentId
    }));

    try {
      setReordering(true);
      await api.put('/menu/reorder/batch', { items: updates });
      qc.invalidateQueries({ queryKey: ["admin", "menu"] });
      qc.invalidateQueries({ queryKey: ["menu"] });
      toast.success("Order updated");
    } catch (error: any) {
      toast.error("Failed to reorder");
    } finally {
      setReordering(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.label || !formData.url) {
      toast.error("Label and URL are required");
      return;
    }
    
    try {
      const payload = {
        label: formData.label,
        url: formData.url,
        parentId: formData.parentId === 0 ? null : formData.parentId,
        isActive: formData.isActive
      };

      if (editId) {
        await updateMenuItem.mutateAsync({ id: editId, data: payload });
        toast.success("Menu item updated");
      } else {
        await createMenuItem.mutateAsync(payload);
        toast.success("Menu item created");
      }
      
      setShowForm(false);
      setEditId(null);
      setFormData({ label: "", url: "", parentId: 0, isActive: true });
    } catch (error: any) {
      toast.error(error.message || "Failed to save menu item");
    }
  };

  const renderItem = (item: MenuItem, siblingItems: MenuItem[], depth = 0) => {
    const isFirst = siblingItems[0]?.id === item.id;
    const isLast = siblingItems[siblingItems.length - 1]?.id === item.id;

    return (
    <div key={item.id}>
      <div className={cn("flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 transition-colors", !item.isActive && "opacity-50")}
        style={{ paddingLeft: `${16 + depth * 32}px` }}>
        
        {/* Reorder Buttons */}
        <div className="flex flex-col shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
          <button disabled={isFirst || reordering} onClick={() => moveItem(item, 'up', siblingItems)} className="text-gray-500 hover:text-violet-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 p-0.5 transition-colors"><ChevronUp size={14} /></button>
          <div className="h-px bg-gray-200 w-full" />
          <button disabled={isLast || reordering} onClick={() => moveItem(item, 'down', siblingItems)} className="text-gray-500 hover:text-violet-600 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-500 p-0.5 transition-colors"><ChevronDown size={14} /></button>
        </div>

        {/* Expand/Collapse Chevron */}
        {item.children && item.children.length > 0 ? (
          <button onClick={() => toggle(item.id)} className="shrink-0 p-1 hover:bg-gray-200 rounded-md transition-colors">
            <ChevronRight size={16} className={cn("text-gray-400 transition-transform", expandedIds.includes(item.id) && "rotate-90")} />
          </button>
        ) : <div className="w-6 shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{item.label}</p>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-500 hover:text-violet-700 flex items-center gap-1 mt-0.5 w-fit">
            <ExternalLink size={10} /> {item.url}
          </a>
        </div>
        {item.children && item.children.length > 0 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md">{item.children.length} sub</span>
        )}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => handleToggleStatus(item)} className={cn("p-1.5 rounded-lg", item.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")}>
            {item.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button onClick={() => { setEditId(item.id); setFormData({ label: item.label, url: item.url, parentId: item.parentId || 0, isActive: item.isActive }); setShowForm(true); }} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"><Edit size={14} /></button>
          <button onClick={() => setDeleteModalId(item.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"><Trash2 size={14} /></button>
        </div>
      </div>
      {item.children && item.children.length > 0 && expandedIds.includes(item.id) && item.children.map(child => renderItem(child, item.children, depth + 1))}
    </div>
  )};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Menu Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the navigation mega menu structure</p>
        </div>
        <button onClick={() => { setEditId(null); setFormData({ label: "", url: "", parentId: 0, isActive: true }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-fade-in">
          <h3 className="font-bold text-gray-900 mb-4">{editId ? "Edit" : "Add"} Menu Item</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input type="text" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })} placeholder="e.g. Birthday Setup" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Item</label>
              <select value={formData.parentId} onChange={e => setFormData({ ...formData, parentId: Number(e.target.value) })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white">
                <option value={0}>None (Top Level)</option>
                {items.map(i => i.id !== editId ? <option key={i.id} value={i.id}>{i.label}</option> : null)}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link URL</label>
              <div className="flex gap-2">
                <input type="text" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="/category/..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400" />
                
                <input 
                  list="quick-link-categories"
                  placeholder="Type to search categories..."
                  className="w-1/3 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white"
                  onChange={e => {
                    if (e.target.value) {
                      const selectedCat = flatCategories.find((c: any) => c.displayName === e.target.value);
                      if (selectedCat) {
                        setFormData(prev => ({ 
                          ...prev, 
                          url: `/category/${selectedCat.slug}`,
                          label: prev.label || selectedCat.name
                        }));
                        e.target.value = ""; // reset after selection
                      }
                    }
                  }}
                />
                <datalist id="quick-link-categories">
                  {flatCategories.map((c: any) => (
                    <option key={c.id} value={c.displayName} />
                  ))}
                </datalist>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Manually type a URL or select an existing category from the dropdown to auto-fill it.</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={createMenuItem.isPending || updateMenuItem.isPending} className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50">
              {(createMenuItem.isPending || updateMenuItem.isPending) && <Loader2 size={14} className="animate-spin" />}
              {editId ? "Update" : "Create"}
            </button>
            <button onClick={() => { setShowForm(false); setEditId(null); setFormData({ label: "", url: "", parentId: 0, isActive: true }); }} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-sm font-medium text-gray-600">{items.length} top-level items</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setExpandedIds(expandedIds.length >= items.length ? [] : items.map(i => i.id))} 
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            >
              {expandedIds.length >= items.length && items.length > 0 ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-violet-500" /></div>
        ) : (
          items.map(item => renderItem(item, items))
        )}
        {!isLoading && items.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">No menu items found</div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModalId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Menu Item</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to completely delete this menu item? 
                <br /><br />
                <strong className="text-red-500">Note:</strong> If this item has any sub-menu items, they will also be permanently deleted from the navigation structure.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteModalId(null)} disabled={deleting} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2">
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

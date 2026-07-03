"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, ChevronRight, GripVertical, Eye, EyeOff, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useAdminCategoriesAll, 
  useCreateCategory, 
  useUpdateCategory, 
  useDeleteCategory 
} from "@/hooks/useApi";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  children: Category[];
}

export default function AdminCategoriesPage() {
  const { data, isLoading } = useAdminCategoriesAll();
  const categories = data?.data || [];

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", icon: "", parentId: 0 });
  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [deleteModalId, setDeleteModalId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleStatus = async (cat: Category) => {
    try {
      await updateCategory.mutateAsync({ id: cat.id, data: { isActive: !cat.isActive } });
      toast.success("Status updated");
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteModalId) return;
    try {
      setDeleting(true);
      await deleteCategory.mutateAsync(deleteModalId);
      toast.success("Category deleted");
      setDeleteModalId(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Name is required");
      return;
    }
    
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug, // backend will generate if empty
        icon: formData.icon,
        parentId: formData.parentId === 0 ? null : formData.parentId,
      };

      if (editId) {
        await updateCategory.mutateAsync({ id: editId, data: payload });
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync(payload);
        toast.success("Category created");
      }
      
      setShowForm(false);
      setEditId(null);
      setFormData({ name: "", slug: "", icon: "", parentId: 0 });
    } catch (error: any) {
      toast.error(error.message || "Failed to save category");
    }
  };

  // Build tree from flat list if backend returns flat list, or use as is if backend already nests
  // The backend `GET /api/categories/all` uses `with: { children: true }` but only for the top-level?
  // Let's assume the backend returns root categories (where parentId is null) with their children.
  // Wait, the backend does: `db.query.categories.findMany({ with: { children: ... } })`
  // Which returns ALL categories, and their children. That means root categories have children, and child categories also appear at the root level of the array!
  // To fix this display, we should filter to only show ones where parentId is null.
  const rootCategories = categories.filter((c: any) => !c.parentId);

  const renderCategory = (cat: Category, depth: number = 0) => (
    <div key={cat.id}>
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50",
        depth > 0 && "bg-gray-50/50"
      )} style={{ paddingLeft: `${16 + depth * 24}px` }}>
        <GripVertical size={14} className="text-gray-300 cursor-grab shrink-0" />

        {cat.children && cat.children.length > 0 ? (
          <button onClick={() => toggleExpand(cat.id)} className="shrink-0">
            <ChevronRight size={14} className={cn("text-gray-400 transition-transform", expandedIds.includes(cat.id) && "rotate-90")} />
          </button>
        ) : (
          <div className="w-3.5 shrink-0" />
        )}

        <span className="text-lg shrink-0">{cat.icon}</span>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{cat.name}</p>
          <p className="text-xs text-gray-400">/{cat.slug}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => handleToggleStatus(cat)} className={cn("p-1.5 rounded-lg transition-colors", cat.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")}>
            {cat.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100" onClick={() => { setEditId(cat.id); setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon || "", parentId: (cat as any).parentId || 0 }); setShowForm(true); }}>
            <Edit size={14} />
          </button>
          <button onClick={() => setDeleteModalId(cat.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {cat.children && cat.children.length > 0 && expandedIds.includes(cat.id) && (
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (optional)</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="category-slug"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent</label>
              <select value={formData.parentId} onChange={e => setFormData({ ...formData, parentId: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white">
                <option value={0}>None (Root)</option>
                {rootCategories.map((c: any) => c.id !== editId && <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} disabled={createCategory.isPending || updateCategory.isPending} className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-medium disabled:opacity-50 flex items-center gap-2">
              {(createCategory.isPending || updateCategory.isPending) && <Loader2 size={14} className="animate-spin" />}
              {editId ? "Update" : "Create"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {/* Category Tree */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">{rootCategories.length} root categories</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setExpandedIds(expandedIds.length >= rootCategories.length ? [] : rootCategories.map((c: any) => c.id))} 
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
            >
              {expandedIds.length >= rootCategories.length && rootCategories.length > 0 ? "Collapse All" : "Expand All"}
            </button>
          </div>
        </div>
        {isLoading ? (
          <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-violet-500" /></div>
        ) : (
          rootCategories.map((cat: any) => renderCategory(cat))
        )}
        {!isLoading && rootCategories.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-sm">No categories found</div>
        )}
      </div>
      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteModalId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to completely delete this category? 
                <br /><br />
                <strong className="text-red-500">Note:</strong> Any sub-categories will also be deleted automatically. You cannot delete a category if any vendors are currently using it (or its sub-categories) for their services.
              </p>
              
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteModalId(null)} disabled={deleting} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2">
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Delete Category
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

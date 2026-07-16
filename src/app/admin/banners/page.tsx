"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, ExternalLink, Search, X, UploadCloud, ChevronLeft, ChevronRight, Check } from "lucide-react";
import ActionMenu from "@/components/ActionMenu";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

interface Banner {
  id: number;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  sortOrder: number;
  priority: number;
  isActive: boolean;
  position: string;
  startDate?: string;
  endDate?: string;
  visibility?: { desktop: boolean; tablet: boolean; mobile: boolean };
  clicks: number;
  impressions: number;
  createdAt: string;
  updatedAt: string;
}

const positions = ["ALL", "HERO", "SIDEBAR", "FOOTER", "POPUP", "CATEGORY", "HOMEPAGE", "CUSTOM"];
const positionDimensions: Record<string, string> = {
  HERO: "1920x600",
  SIDEBAR: "400x600",
  FOOTER: "1200x300",
  POPUP: "800x800",
  CATEGORY: "1200x400",
  HOMEPAGE: "1600x500",
  CUSTOM: "Any size",
};

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [posFilter, setPosFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState("newest");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [viewBanner, setViewBanner] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [statusChange, setStatusChange] = useState<{id: number, isActive: boolean} | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    position: "HERO",
    link: "",
    sortOrder: 1,
    priority: 0,
    startDate: "",
    endDate: "",
    isActive: true,
    visibility: { desktop: true, tablet: true, mobile: true }
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort,
      });
      if (debouncedSearch) query.append("search", debouncedSearch);
      if (posFilter !== "ALL") query.append("position", posFilter);
      if (statusFilter !== "ALL") query.append("status", statusFilter);

      const res = await api.get<{success: boolean, data: Banner[], meta: any}>(`/banners?${query.toString()}`);
      if (res.success) {
        setBanners(res.data);
        setTotal(res.meta.total);
        setTotalPages(res.meta.totalPages);
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load banners", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset page on search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    fetchBanners();
  }, [page, limit, debouncedSearch, posFilter, statusFilter, sort]);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatus = (banner: Banner) => {
    const now = new Date();
    if (!banner.isActive) return { label: "Inactive", color: "bg-gray-100 text-gray-700" };
    if (banner.endDate && new Date(banner.endDate) < now) return { label: "Expired", color: "bg-red-100 text-red-700" };
    if (banner.startDate && new Date(banner.startDate) > now) return { label: "Scheduled", color: "bg-orange-100 text-orange-700" };
    return { label: "Active", color: "bg-green-100 text-green-700" };
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/banners/${deleteId}`);
      showToast("Banner Deleted Successfully", "success");
      setDeleteId(null);
      
      // If we deleted the last item on a page > 1, go back a page
      if (banners.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        fetchBanners();
      }
    } catch (err: any) {
      showToast(err.message || "Failed to delete banner", "error");
    }
  };

  const handleStatusChange = async () => {
    if (!statusChange) return;
    try {
      await api.patch(`/banners/${statusChange.id}/status`, { isActive: statusChange.isActive });
      showToast(`Banner ${statusChange.isActive ? 'Enabled' : 'Disabled'} Successfully`, "success");
      setStatusChange(null);
      fetchBanners();
    } catch (err: any) {
      showToast(err.message || "Failed to change status", "error");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Banner Title is required";
    if (!formData.position) newErrors.position = "Banner Position is required";
    if (!formData.link.trim()) newErrors.link = "Redirect URL is required";
    if (!imageFile && !imagePreview) newErrors.image = "Banner Image is required";
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.date = "End Date cannot be earlier than Start Date";
    }
    if (isNaN(Number(formData.sortOrder))) newErrors.sortOrder = "Display Order must be numeric";
    
    // Check if the link is a valid URL or path
    try {
      if (formData.link.startsWith("http")) {
        new URL(formData.link);
      } else if (!formData.link.startsWith("/")) {
        newErrors.link = "URL must start with http or /";
      }
    } catch {
      newErrors.link = "Only valid URLs allowed";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setFormLoading(true);
      let imageUrl = "";
      if (imageFile) {
        const fileData = new FormData();
        fileData.append("image", imageFile);
        fileData.append("folder", "banners");
        const uploadRes = await api.uploadFile("/upload/image", fileData);
        imageUrl = uploadRes.data.url;
      }
      
      const payload = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        image: imageUrl,
      };

      await api.post("/banners", payload);
      showToast("Banner Created Successfully", "success");
      setShowForm(false);
      resetForm();
      fetchBanners();
    } catch (err: any) {
      showToast(err.message || "Failed to create banner", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      position: "HERO",
      link: "",
      sortOrder: 1,
      priority: 0,
      startDate: "",
      endDate: "",
      isActive: true,
      visibility: { desktop: true, tablet: true, mobile: true }
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: "Maximum size is 5 MB" });
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setErrors({ ...errors, image: "Supported formats: JPG, PNG, WEBP" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setErrors({ ...errors, image: "" });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Banners</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional banners across the site</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap focus:ring-2 focus:ring-violet-300 outline-none">
          <Plus size={16} /> Add Banner
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        <div className="flex flex-wrap gap-2 w-full xl:w-auto">
          {positions.map(p => (
            <button key={p} onClick={() => {setPosFilter(p); setPage(1);}}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                posFilter === p ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent"
              )}>
              {p === "ALL" ? "All Positions" : p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search banners..." 
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 w-full sm:w-56"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search Banners"
            />
          </div>
          <select 
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 bg-white"
            value={statusFilter}
            onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
            aria-label="Filter by Status"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="UPCOMING">Scheduled</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <select 
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-100 bg-white"
            value={sort}
            onChange={(e) => {setSort(e.target.value); setPage(1);}}
            aria-label="Sort Banners"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title A-Z</option>
            <option value="title_desc">Title Z-A</option>
            <option value="order">Display Order</option>
            <option value="priority">Priority</option>
            <option value="updated">Recently Updated</option>
          </select>
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden h-64"></div>
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <ImageIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-900">No banners found</h3>
          <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or create a new banner to get started.</p>
          {(search || posFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button onClick={() => {setSearch(''); setPosFilter('ALL'); setStatusFilter('ALL');}} className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200">
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map(banner => {
            const status = getStatus(banner);
            return (
              <div key={banner.id} className={cn("group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col", !banner.isActive && "opacity-75 grayscale-[20%]")}>
                <div className="relative h-48 bg-gray-100 flex-shrink-0">
                  {banner.image ? (
                    <img src={banner.image.startsWith('http') ? banner.image : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + banner.image} alt={banner.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400"><ImageIcon size={32} /></div>
                  )}
                  

                  
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase bg-white/95 text-gray-800 shadow-sm backdrop-blur-sm tracking-wider">
                      {banner.position}
                    </span>
                    <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shadow-sm tracking-wider", status.color)}>
                      {status.label}
                    </span>
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2" title={banner.title}>{banner.title}</h3>
                      <ActionMenu>
                        <button onClick={() => { setViewBanner(banner); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Eye size={14}/> View</button>
                        <button onClick={() => { router.push(`/admin/banners/${banner.id}/edit`); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"><Edit size={14}/> Edit</button>
                        <button onClick={() => { setStatusChange({id: banner.id, isActive: !banner.isActive}); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                          {banner.isActive ? <><EyeOff size={14}/> Disable</> : <><Check size={14}/> Enable</>}
                        </button>
                        <button onClick={() => { setDeleteId(banner.id); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 size={14}/> Delete</button>
                      </ActionMenu>
                    </div>
                    {banner.description && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-1">{banner.description}</p>
                    )}
                    <a href={banner.link} target="_blank" rel="noreferrer" className="text-sm text-violet-600 font-medium flex items-center gap-1.5 mt-3 truncate hover:underline inline-block w-full">
                      <ExternalLink size={14} className="shrink-0" /> <span className="truncate">{banner.link}</span>
                    </a>
                  </div>
                  
                  <div className="flex justify-between items-center mt-5 text-xs font-medium text-gray-500 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                    <span className="flex items-center gap-1">Order: <span className="text-gray-900">{banner.sortOrder}</span></span>
                    <span className="flex items-center gap-1">Priority: <span className="text-gray-900">{banner.priority}</span></span>
                    <span title={new Date(banner.createdAt).toLocaleString()}>{new Date(banner.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-5 py-4 border border-gray-100 rounded-xl gap-4">
          <div className="text-sm text-gray-600 font-medium">
            Showing <span className="text-gray-900">{(page - 1) * limit + 1}</span> to <span className="text-gray-900">{Math.min(page * limit, total)}</span> of <span className="text-gray-900">{total}</span> banners
          </div>
          <div className="flex items-center gap-3">
            <select className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-100" 
              value={limit} 
              onChange={(e) => {setLimit(Number(e.target.value)); setPage(1);}}
              aria-label="Rows per page"
            >
              {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v} per page</option>)}
            </select>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:bg-gray-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-colors" aria-label="Previous Page"><ChevronLeft size={18}/></button>
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-gray-200 text-gray-600 disabled:opacity-40 disabled:bg-gray-50 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-100 transition-colors" aria-label="Next Page"><ChevronRight size={18}/></button>
            </div>
          </div>
        </div>
      )}

      {/* Create Banner Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative my-auto">
            <div className="absolute top-0 left-0 w-full bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Banner</h2>
                <p className="text-sm text-gray-500 mt-0.5">Fill out the details below to add a banner.</p>
              </div>
              <button onClick={() => {setShowForm(false); resetForm();}} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200" aria-label="Close"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 pt-24 max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Banner Title <span className="text-red-500">*</span></label>
                    <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={cn("w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:ring-2", errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-violet-400 focus:ring-violet-100")} placeholder="e.g. Summer Sale 2026" />
                    {errors.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.title}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" rows={3} placeholder="Add a short subtitle or description..." />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">Position <span className="text-red-500">*</span></label>
                      <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className={cn("w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:ring-2", errors.position ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-violet-400 focus:ring-violet-100")}>
                        {positions.filter(p => p !== "ALL").map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.position && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.position}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">Redirect URL <span className="text-red-500">*</span></label>
                      <input type="text" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} className={cn("w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:ring-2", errors.link ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-violet-400 focus:ring-violet-100")} placeholder="https:// or /path" />
                      {errors.link && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.link}</p>}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">Display Order</label>
                      <input type="number" min="0" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                      {errors.sortOrder && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.sortOrder}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">Priority</label>
                      <input type="number" min="0" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value)})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">Start Date</label>
                      <input type="datetime-local" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-1.5">End Date</label>
                      <input type="datetime-local" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-colors focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                    </div>
                  </div>
                  {errors.date && <p className="text-red-500 text-xs font-medium">{errors.date}</p>}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Banner Image <span className="text-red-500">*</span></label>
                    <div 
                      className={cn("border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden group", 
                        errors.image ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-violet-400 hover:bg-violet-50/50 bg-gray-50",
                        imagePreview ? "h-64 p-0 border-0 shadow-inner" : "h-64"
                      )}
                      onClick={() => !imagePreview && fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !imagePreview && fileInputRef.current?.click(); } }}
                    >
                      {imagePreview ? (
                        <div className="w-full h-full relative">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                            <button type="button" onClick={(e) => {e.stopPropagation(); fileInputRef.current?.click();}} className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform">Replace</button>
                            <button type="button" onClick={(e) => {e.stopPropagation(); setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value='';}} className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-red-700 hover:scale-105 transition-all">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                            <UploadCloud size={32} strokeWidth={1.5} />
                          </div>
                          <p className="text-base font-bold text-gray-900">Drag & drop or browse</p>
                          <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                          <div className="mt-4 inline-flex items-center gap-2 text-xs text-violet-700 bg-violet-100 px-3 py-1.5 rounded-lg font-semibold shadow-sm">
                            Dimensions: {positionDimensions[formData.position]}
                          </div>
                        </>
                      )}
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,image/webp" aria-label="Upload Image" />
                    </div>
                    {errors.image && <p className="text-red-500 text-xs mt-2 font-medium">{errors.image}</p>}
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                    <label className="block text-sm font-bold text-gray-900 mb-3">Device Visibility</label>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-violet-300 transition-colors shadow-sm flex-1 justify-center">
                        <input type="checkbox" checked={formData.visibility.desktop} onChange={e => setFormData({...formData, visibility: {...formData.visibility, desktop: e.target.checked}})} className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500" /> 
                        <span className="text-sm font-semibold text-gray-700">Desktop</span>
                      </label>
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-violet-300 transition-colors shadow-sm flex-1 justify-center">
                        <input type="checkbox" checked={formData.visibility.tablet} onChange={e => setFormData({...formData, visibility: {...formData.visibility, tablet: e.target.checked}})} className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500" /> 
                        <span className="text-sm font-semibold text-gray-700">Tablet</span>
                      </label>
                      <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-violet-300 transition-colors shadow-sm flex-1 justify-center">
                        <input type="checkbox" checked={formData.visibility.mobile} onChange={e => setFormData({...formData, visibility: {...formData.visibility, mobile: e.target.checked}})} className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500" /> 
                        <span className="text-sm font-semibold text-gray-700">Mobile</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-900">Banner Status</p>
                      <p className="text-xs text-gray-500 mt-1">Activate this banner immediately?</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                      <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 shadow-inner"></div>
                    </label>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3 sticky bottom-0 bg-white pb-2 z-10">
                <button type="button" onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">Reset</button>
                <button type="button" onClick={() => {setShowForm(false); resetForm();}} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">Cancel</button>
                <button type="submit" disabled={formLoading} className="px-8 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold hover:shadow-lg hover:shadow-violet-200 transition-all disabled:opacity-70 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-400">
                  {formLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={18} />}
                  Create Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Drawer */}
      {viewBanner && (
        <>
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] animate-fade-in" onClick={() => setViewBanner(null)}></div>
          <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out flex flex-col translate-x-0">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-xl font-bold text-gray-900">Banner Details</h2>
              <button onClick={() => setViewBanner(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"><X size={20} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <div className="rounded-xl overflow-hidden bg-gray-50 shadow-inner border border-gray-100">
                {viewBanner.image ? (
                  <img src={viewBanner.image.startsWith('http') ? viewBanner.image : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + viewBanner.image} alt={viewBanner.title} className="w-full h-auto object-cover" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center text-gray-400"><ImageIcon size={32}/></div>
                )}
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">{viewBanner.title}</h3>
                {viewBanner.description ? (
                  <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{viewBanner.description}</p>
                ) : (
                  <p className="text-sm text-gray-400 italic">No description provided.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Position</p>
                  <p className="font-bold text-gray-900">{viewBanner.position}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Status</p>
                  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider", getStatus(viewBanner).color)}>
                    {getStatus(viewBanner).label}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Redirect URL</p>
                  <a href={viewBanner.link} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline flex items-center gap-1.5 break-all">
                    <ExternalLink size={14} className="shrink-0" /> {viewBanner.link || "N/A"}
                  </a>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Display Order</p>
                  <p className="font-bold text-gray-900 text-base">{viewBanner.sortOrder}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Priority</p>
                  <p className="font-bold text-gray-900 text-base">{viewBanner.priority}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">Device Visibility</p>
                  <div className="flex gap-2">
                    {viewBanner.visibility?.desktop && <span className="bg-gray-100 text-gray-700 font-semibold text-xs px-2.5 py-1 rounded-md border border-gray-200">Desktop</span>}
                    {viewBanner.visibility?.tablet && <span className="bg-gray-100 text-gray-700 font-semibold text-xs px-2.5 py-1 rounded-md border border-gray-200">Tablet</span>}
                    {viewBanner.visibility?.mobile && <span className="bg-gray-100 text-gray-700 font-semibold text-xs px-2.5 py-1 rounded-md border border-gray-200">Mobile</span>}
                    {!viewBanner.visibility?.desktop && !viewBanner.visibility?.tablet && !viewBanner.visibility?.mobile && <span className="text-gray-400 italic">None</span>}
                  </div>
                </div>
              </div>
                
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Performance & Dates</h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">Start Date</p>
                    <p className="font-bold text-gray-900 text-sm">{viewBanner.startDate ? new Date(viewBanner.startDate).toLocaleString() : "Immediate"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">End Date</p>
                    <p className="font-bold text-gray-900 text-sm">{viewBanner.endDate ? new Date(viewBanner.endDate).toLocaleString() : "Never"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">Total Clicks</p>
                    <p className="font-bold text-gray-900 text-lg">{viewBanner.clicks}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs font-medium mb-1">Total Impressions</p>
                    <p className="font-bold text-gray-900 text-lg">{viewBanner.impressions}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs font-medium mb-1">Click-Through Rate (CTR)</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${viewBanner.impressions > 0 ? Math.min((viewBanner.clicks / viewBanner.impressions) * 100, 100) : 0}%` }}></div>
                      </div>
                      <p className="font-bold text-gray-900 w-12 text-right">
                        {viewBanner.impressions > 0 ? ((viewBanner.clicks / viewBanner.impressions) * 100).toFixed(1) + "%" : "0%"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Activity Timeline</h4>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1">
                    <span className="text-gray-500 font-medium">Created On</span>
                    <span className="font-bold text-gray-900">{new Date(viewBanner.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm gap-1">
                    <span className="text-gray-500 font-medium">Last Modified</span>
                    <span className="font-bold text-gray-900">{new Date(viewBanner.updatedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-gray-100 flex gap-4 bg-white sticky bottom-0 z-10">
              <button onClick={() => setViewBanner(null)} className="flex-1 px-5 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">Close</button>
              <button onClick={() => router.push(`/admin/banners/${viewBanner.id}/edit`)} className="flex-1 px-5 py-3 rounded-xl text-sm font-bold text-white gradient-primary hover:shadow-lg hover:shadow-violet-200 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-400">
                <Edit size={16} /> Edit Banner
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm text-center shadow-2xl relative">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Trash2 size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Banner</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Are you sure you want to permanently delete this banner? This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">Cancel</button>
              <button onClick={handleDelete} className="flex-1 px-5 py-3 rounded-xl bg-red-600 text-white text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-700 hover:shadow-red-300 transition-all focus:outline-none focus:ring-2 focus:ring-red-400">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation */}
      {statusChange && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-7 w-full max-w-sm text-center shadow-2xl">
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner", statusChange.isActive ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600")}>
              {statusChange.isActive ? <Check size={32} strokeWidth={3} /> : <EyeOff size={28} />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{statusChange.isActive ? "Enable" : "Disable"} Banner</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">Are you sure you want to {statusChange.isActive ? "enable" : "disable"} this banner?</p>
            <div className="flex gap-4">
              <button onClick={() => setStatusChange(null)} className="flex-1 px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200">Cancel</button>
              <button onClick={handleStatusChange} className={cn("flex-1 px-5 py-3 rounded-xl text-white text-sm font-bold transition-all shadow-lg focus:outline-none focus:ring-2", 
                statusChange.isActive ? "bg-green-600 hover:bg-green-700 shadow-green-200 focus:ring-green-400" : "bg-orange-600 hover:bg-orange-700 shadow-orange-200 focus:ring-orange-400")}>
                {statusChange.isActive ? "Enable" : "Disable"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-[100] animate-fade-in">
          <div className={cn("px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 border", toast.type === "success" ? "bg-gray-900 text-white border-gray-800" : "bg-red-600 text-white border-red-700")}>
            {toast.type === "success" ? <Check size={20} className="text-green-400" /> : <X size={20} className="text-red-300" />}
            <span className="text-sm font-bold tracking-wide">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

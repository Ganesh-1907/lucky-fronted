"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, UploadCloud, ImageIcon, Trash2, X, Check } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

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
}

const positions = ["HERO", "SIDEBAR", "FOOTER", "POPUP", "CATEGORY", "HOMEPAGE", "CUSTOM"];

export default function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState<Banner>({
    id: 0,
    title: "",
    description: "",
    position: "HERO",
    link: "",
    sortOrder: 1,
    priority: 0,
    startDate: "",
    endDate: "",
    isActive: true,
    image: "",
    visibility: { desktop: true, tablet: true, mobile: true }
  });

  const [initialData, setInitialData] = useState<Banner | null>(null);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanner();
  }, [id]);

  const fetchBanner = async () => {
    try {
      setLoading(true);
      const res = await api.get<{success: boolean, data: Banner}>(`/banners/${id}`);
      if (res.success) {
        const data = res.data;
        // Format dates for datetime-local input
        if (data.startDate) data.startDate = new Date(data.startDate).toISOString().slice(0, 16);
        if (data.endDate) data.endDate = new Date(data.endDate).toISOString().slice(0, 16);
        
        // Handle visibility if missing
        if (!data.visibility) {
          data.visibility = { desktop: true, tablet: true, mobile: true };
        }

        setFormData(data);
        setInitialData(data);
        if (data.image) {
          setImagePreview(data.image.startsWith('http') ? data.image : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + data.image);
        }
      }
    } catch (err: any) {
      showToast(err.message || "Failed to load banner details", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Banner Title is required";
    if (!formData.position) newErrors.position = "Banner Position is required";
    if (formData.link && !formData.link.trim()) newErrors.link = "Redirect URL cannot be just spaces";
    if (!imageFile && !formData.image) newErrors.image = "Banner Image is required";
    
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.date = "End Date cannot be earlier than Start Date";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      setFormLoading(true);
      let imageUrl = formData.image;
      
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

      await api.put(`/banners/${id}`, payload);
      showToast("Banner Updated Successfully", "success");
      
      // Delay navigation so toast is visible
      setTimeout(() => {
        router.push("/admin/banners");
      }, 1000);
    } catch (err: any) {
      showToast(err.message || "Failed to update banner", "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.image) {
        setImagePreview(initialData.image.startsWith('http') ? initialData.image : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + initialData.image);
      } else {
        setImagePreview(null);
      }
      setImageFile(null);
      setErrors({});
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="h-96 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/admin/banners")} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-200">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Edit Banner</h1>
          <p className="text-sm text-gray-500 mt-1">Modify the properties of {initialData?.title}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column - Main Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs">1</span>
                Basic Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Banner Title <span className="text-red-500">*</span></label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className={cn("w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 shadow-sm", errors.title ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-violet-400 focus:ring-violet-100")} />
                  {errors.title && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.title}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description</label>
                  <textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Redirect URL</label>
                  <input type="text" value={formData.link || ""} onChange={e => setFormData({...formData, link: e.target.value})} className={cn("w-full px-4 py-2.5 rounded-xl border bg-white focus:outline-none focus:ring-2 shadow-sm", errors.link ? "border-red-300 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-violet-400 focus:ring-violet-100")} placeholder="https://" />
                  {errors.link && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.link}</p>}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs">2</span>
                Display Settings
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Position</label>
                  <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm">
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Display Order</label>
                  <input type="number" min="0" value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Priority</label>
                  <input type="number" min="0" value={formData.priority} onChange={e => setFormData({...formData, priority: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm" />
                </div>
                <div className="col-span-2 pt-2">
                  <label className="block text-sm font-bold text-gray-900 mb-3">Device Visibility</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-violet-300 transition-colors shadow-sm flex-1 justify-center">
                      <input type="checkbox" checked={formData.visibility?.desktop} onChange={e => setFormData({...formData, visibility: {...(formData.visibility || {desktop:true,tablet:true,mobile:true}), desktop: e.target.checked}})} className="w-4 h-4 rounded text-violet-600" /> 
                      <span className="text-sm font-semibold text-gray-700">Desktop</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-violet-300 transition-colors shadow-sm flex-1 justify-center">
                      <input type="checkbox" checked={formData.visibility?.tablet} onChange={e => setFormData({...formData, visibility: {...(formData.visibility || {desktop:true,tablet:true,mobile:true}), tablet: e.target.checked}})} className="w-4 h-4 rounded text-violet-600" /> 
                      <span className="text-sm font-semibold text-gray-700">Tablet</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-violet-300 transition-colors shadow-sm flex-1 justify-center">
                      <input type="checkbox" checked={formData.visibility?.mobile} onChange={e => setFormData({...formData, visibility: {...(formData.visibility || {desktop:true,tablet:true,mobile:true}), mobile: e.target.checked}})} className="w-4 h-4 rounded text-violet-600" /> 
                      <span className="text-sm font-semibold text-gray-700">Mobile</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs">3</span>
                Scheduling
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">Start Date & Time</label>
                  <input type="datetime-local" value={formData.startDate || ""} onChange={e => setFormData({...formData, startDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1.5">End Date & Time</label>
                  <input type="datetime-local" value={formData.endDate || ""} onChange={e => setFormData({...formData, endDate: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 shadow-sm" />
                </div>
              </div>
              {errors.date && <p className="text-red-500 text-xs mt-2 font-medium">{errors.date}</p>}
            </div>
          </div>

          {/* Right Column - Image & Status */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 h-full max-h-[600px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs">4</span>
                  Media
                </h3>
              </div>
              
              <div className="flex-1 flex flex-col">
                <div 
                  className={cn("flex-1 border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden group min-h-[300px]", 
                    errors.image ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-violet-400 hover:bg-violet-50 bg-white",
                    imagePreview ? "border-0 shadow-inner p-0" : ""
                  )}
                  onClick={() => !imagePreview && fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); !imagePreview && fileInputRef.current?.click(); } }}
                >
                  {imagePreview ? (
                    <div className="w-full h-full relative bg-gray-100">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                        <button type="button" onClick={(e) => {e.stopPropagation(); fileInputRef.current?.click();}} className="px-6 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                          <ImageIcon size={16}/> Replace Image
                        </button>
                        <button type="button" onClick={(e) => {e.stopPropagation(); setImageFile(null); setImagePreview(null); if(fileInputRef.current) fileInputRef.current.value=''; setFormData({...formData, image: ''});}} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-red-700 hover:scale-105 transition-transform flex items-center gap-2">
                          <Trash2 size={16}/> Remove Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <UploadCloud size={32} strokeWidth={1.5} />
                      </div>
                      <p className="text-base font-bold text-gray-900">Drag & drop or browse</p>
                      <p className="text-sm text-gray-500 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                    </>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/jpeg,image/png,image/webp" />
                </div>
                {errors.image && <p className="text-red-500 text-xs mt-3 font-medium text-center">{errors.image}</p>}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <p className="text-sm font-bold text-gray-900">Active Status</p>
                    <p className="text-xs text-gray-500 mt-0.5">Toggle visibility on site</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 p-6 border-t border-gray-100 flex items-center justify-end gap-4">
          <button type="button" onClick={handleReset} className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm">
            Reset Changes
          </button>
          <button type="button" onClick={() => router.push("/admin/banners")} className="px-6 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm">
            Cancel
          </button>
          <button type="submit" disabled={formLoading} className="px-8 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold shadow-lg hover:shadow-violet-200 transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-70 disabled:pointer-events-none">
            {formLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>

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

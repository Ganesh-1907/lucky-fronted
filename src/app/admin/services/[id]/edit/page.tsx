"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader, Briefcase, FileText, IndianRupee, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAdminServices } from "@/hooks/useApi";

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const serviceId = parseInt(resolvedParams.id);
  
  const { data, isLoading } = useAdminServices();
  const services = Array.isArray(data) ? data : (data?.data || []);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    description: "",
    basePrice: "",
    discountPrice: "",
    duration: "60",
    tags: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (services.length > 0) {
      const service = services.find((s: any) => s.id === serviceId);
      if (service) {
        setFormData(prev => ({
          ...prev,
          title: service.title || "",
          categoryId: service.categoryId?.toString() || "",
          description: service.description || "",
          basePrice: (service.basePrice || service.price || "").toString(),
          discountPrice: (service.discountPrice || "").toString(),
        }));
      }
    }
  }, [services, serviceId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Service title is required";
    if (!formData.categoryId) newErrors.categoryId = "Category is required";
    if (!formData.basePrice) newErrors.basePrice = "Base price is required";
    if (isNaN(Number(formData.basePrice)) || Number(formData.basePrice) < 0) newErrors.basePrice = "Valid positive price is required";
    
    if (formData.discountPrice) {
      if (isNaN(Number(formData.discountPrice)) || Number(formData.discountPrice) < 0) {
        newErrors.discountPrice = "Valid positive price is required";
      } else if (Number(formData.discountPrice) >= Number(formData.basePrice)) {
        newErrors.discountPrice = "Discount price must be less than base price";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success("Service updated successfully");
      router.push("/admin/services");
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/services" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Edit Service</h1>
            <p className="text-sm text-gray-500">Update service details and pricing</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/services" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center gap-2 shadow-sm shadow-violet-200">
            {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <Briefcase size={20} className="text-violet-500" />
            <h2 className="font-bold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-full">
              <label className="text-sm font-medium text-gray-700">Service Title *</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
              {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Category *</label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm appearance-none">
                <option value="">Select a category</option>
                <option value="1">Home Cleaning</option>
                <option value="2">Plumbing</option>
                <option value="3">Electrical</option>
                <option value="4">Pest Control</option>
                <option value="5">Appliance Repair</option>
              </select>
              {errors.categoryId && <p className="text-xs text-red-500">{errors.categoryId}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Duration (Minutes)</label>
              <input type="number" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
            </div>

            <div className="space-y-2 col-span-full">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm resize-none"></textarea>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <IndianRupee size={20} className="text-green-500" />
            <h2 className="font-bold text-gray-900">Pricing</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Base Price (₹) *</label>
              <input type="number" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" />
              {errors.basePrice && <p className="text-xs text-red-500">{errors.basePrice}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Discount Price (₹)</label>
              <input type="number" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} placeholder="Optional" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" />
              {errors.discountPrice && <p className="text-xs text-red-500">{errors.discountPrice}</p>}
            </div>
          </div>
        </div>

        {/* Media & Gallery */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <ImageIcon size={20} className="text-blue-500" />
            <h2 className="font-bold text-gray-900">Service Images</h2>
          </div>
          <div className="p-6">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center group hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50/50 relative overflow-hidden">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-gray-100 text-gray-400 group-hover:text-blue-500 transition-colors">
                <ImageIcon size={28} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">Upload Service Images</h3>
              <p className="text-sm text-gray-500">Drag & drop images here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-2">Maximum file size: 5MB. Formats: JPG, PNG, WEBP</p>
              <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}

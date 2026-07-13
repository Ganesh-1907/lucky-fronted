"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader, Briefcase, FileText, IndianRupee, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { useAdminServices } from "@/hooks/useApi";
import api from "@/lib/api";
import NextImage from "next/image";

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

  const [selectedImages, setSelectedImages] = useState<(File | null)[]>([null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null]);

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
        if (service.images && service.images.length > 0) {
          const previews = [null, null, null, null];
          for (let i = 0; i < Math.min(service.images.length, 4); i++) {
            previews[i] = service.images[i];
          }
          setImagePreviews(previews as (string | null)[]);
        }
      }
    }
  }, [services, serviceId]);

  const handleImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const newImages = [...selectedImages];
      newImages[index] = file;
      setSelectedImages(newImages);

      const newPreviews = [...imagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setImagePreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages[index] = null;
    setSelectedImages(newImages);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = null;
    setImagePreviews(newPreviews);
  };

  const getPreviewUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('blob:') || url.startsWith('http')) return url;
    return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${url}`;
  };

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

    try {
      setLoading(true);
      let finalUrls: string[] = [];
      let newlyUploadedUrls: string[] = [];
      const newFiles = selectedImages.map((f, i) => f ? { file: f, index: i } : null).filter(Boolean) as { file: File, index: number }[];
      
      if (newFiles.length > 0) {
        const uploadData = new FormData();
        newFiles.forEach(nf => uploadData.append('images', nf.file));
        uploadData.append('folder', 'services');

        const uploadRes = await api.uploadFile('/upload/images', uploadData);
        if (uploadRes.success && uploadRes.data?.urls) {
          newlyUploadedUrls = uploadRes.data.urls;
        } else {
          toast.error("Failed to upload new images");
          setLoading(false);
          return;
        }
      }

      let uploadIndex = 0;
      for (let i = 0; i < 4; i++) {
        if (selectedImages[i]) {
          finalUrls.push(newlyUploadedUrls[uploadIndex]);
          uploadIndex++;
        } else if (imagePreviews[i] && !imagePreviews[i]?.startsWith('blob:')) {
          finalUrls.push(imagePreviews[i]!);
        }
      }

      // TODO: Replace with actual update API call, e.g. api.put(`/admin/services/${serviceId}`, {...formData, images: finalUrls})
      
      setTimeout(() => {
        setLoading(false);
        toast.success("Service updated successfully");
        router.push("/admin/services");
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Failed to save changes");
    }
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all">
                  {imagePreviews[i] ? (
                    <>
                      <NextImage src={getPreviewUrl(imagePreviews[i])!} alt={`Preview ${i + 1}`} fill className="object-cover" />
                      <button type="button" onClick={() => removeImage(i)} className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-600 z-10 transition-colors">
                        <span className="sr-only">Remove</span>
                        ×
                      </button>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer">
                      <ImageIcon size={24} className="text-gray-400 group-hover:text-blue-500" />
                      <span className="text-xs text-gray-500">{i === 0 ? "Main Image" : `Image ${i + 1}`}</span>
                      <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => handleImageChange(i, e)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">Maximum file size: 5MB per image. Formats: JPG, PNG, WEBP. Square (1:1) aspect ratio recommended.</p>
          </div>
        </div>

      </form>
    </div>
  );
}

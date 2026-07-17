"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Upload, DollarSign,
  Tag, MapPin, Clock, FileText, Info, Loader2, X
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/api";
import NextImage from "next/image";
import { useCategories, useServiceById, useUpdateVendorService } from "@/hooks/useApi";

const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur"];

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const serviceId = parseInt(resolvedParams.id);

  const { data: serviceData, isLoading } = useServiceById(serviceId);
  const service = serviceData?.data?.service || serviceData?.data;
  const updateService = useUpdateVendorService();
  const { data: catData } = useCategories();
  const categories = catData?.data || [];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    shortDesc: "",
    description: "",
    categoryId: "",
    basePrice: "",
    discountPrice: "",
    minAdvancePercent: "50",
    preparationTime: "180",
    serviceDuration: "720",
    cities: [] as string[],
  });
  const [addons, setAddons] = useState([{ name: "", price: "", description: "" }]);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);

  const [selectedImages, setSelectedImages] = useState<(File | null)[]>([null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState<(string | null)[]>([null, null, null, null]);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || "",
        shortDesc: service.shortDesc || "",
        description: service.description || "",
        categoryId: service.categoryId?.toString() || "",
        basePrice: service.basePrice?.toString() || "",
        discountPrice: service.discountPrice?.toString() || "",
        minAdvancePercent: service.minAdvancePercent?.toString() || "50",
        preparationTime: service.preparationTime?.toString() || "180",
        serviceDuration: service.serviceDuration?.toString() || "720",
        cities: typeof service.cities === "string" ? JSON.parse(service.cities) : (service.cities || []),
      });
      if (service.addons && service.addons.length > 0) {
        setAddons(service.addons.map((a: any) => ({ name: a.name, price: a.price?.toString(), description: a.description || "" })));
      }
      if (service.faq && service.faq.length > 0) {
        setFaqs(service.faq.map((f: any) => ({ question: f.question, answer: f.answer })));
      }
      if (service.images && service.images.length > 0) {
        const previews = [null, null, null, null];
        for (let i = 0; i < Math.min(service.images.length, 4); i++) {
          previews[i] = service.images[i];
        }
        setImagePreviews(previews as (string | null)[]);
      }
    }
  }, [service]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCity = (city: string) => {
    setFormData(prev => ({
      ...prev,
      cities: prev.cities.includes(city) ? prev.cities.filter(c => c !== city) : [...prev.cities, city]
    }));
  };

  const addAddon = () => setAddons([...addons, { name: "", price: "", description: "" }]);
  const removeAddon = (i: number) => setAddons(addons.filter((_, idx) => idx !== i));
  const updateAddon = (i: number, field: string, value: string) => {
    const updated = [...addons];
    (updated[i] as any)[field] = value;
    setAddons(updated);
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: string, value: string) => {
    const updated = [...faqs];
    (updated[i] as any)[field] = value;
    setFaqs(updated);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.categoryId || !formData.basePrice || formData.cities.length === 0) {
      toast.error("Please fill all required fields and select at least one city.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      let finalUrls: string[] = [];
      let newlyUploadedUrls: string[] = [];
      const newFiles = selectedImages.map((f, i) => f ? { file: f, index: i } : null).filter(Boolean) as { file: File, index: number }[];
      
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach(nf => formData.append('images', nf.file));
        formData.append('folder', 'services');

        const uploadRes = await api.uploadFile('/upload/images', formData);
        if (uploadRes.success && uploadRes.data?.urls) {
          newlyUploadedUrls = uploadRes.data.urls;
        } else {
          toast.error("Failed to upload new images");
          setIsSubmitting(false);
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

      const payload = {
        ...formData,
        categoryId: parseInt(formData.categoryId),
        basePrice: parseFloat(formData.basePrice),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        minAdvancePercent: parseInt(formData.minAdvancePercent),
        preparationTime: parseInt(formData.preparationTime),
        serviceDuration: parseInt(formData.serviceDuration),
        addons: addons.filter(a => a.name && a.price).map(a => ({ ...a, price: parseFloat(a.price) })),
        faq: faqs.filter(f => f.question && f.answer),
        images: finalUrls
      };

      await updateService.mutateAsync({ id: serviceId, data: payload });
      toast.success("Service updated successfully!");
      router.push("/vendor/services");
    } catch (error: any) {
      toast.error(error.message || "Failed to update service");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading service data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/vendor/services" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Edit Service</h1>
            <p className="text-sm text-gray-500 mt-1">Update details for {service?.title || 'your service'}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/vendor/services" className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-70 transition-opacity shadow-sm">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-50 pb-4">
              <FileText size={18} className="text-gray-400" /> Basic Information
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Title <span className="text-red-500">*</span></label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Premium Birthday Balloon Decoration"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-gray-50/50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Short Description <span className="text-red-500">*</span></label>
                <input type="text" name="shortDesc" value={formData.shortDesc} onChange={handleChange} placeholder="Brief one-liner about the service" maxLength={150}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-gray-50/50 focus:bg-white" />
                <div className="flex justify-end mt-1">
                  <span className="text-[10px] font-medium text-gray-400">{formData.shortDesc.length}/150</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category <span className="text-red-500">*</span></label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-gray-50/50 focus:bg-white transition-colors">
                    <option value="" disabled>Select a category</option>
                    {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Detailed Description <span className="text-red-500">*</span></label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Provide a detailed description of what this service includes..." rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors bg-gray-50/50 focus:bg-white resize-none" />
              </div>
            </div>
          </div>

          {/* Pricing & Timing */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-50 pb-4">
              <DollarSign size={18} className="text-gray-400" /> Pricing & Availability
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Base Price (₹) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Price (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-gray-50/50 focus:bg-white transition-colors" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 border-t border-gray-50 pt-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Min Advance (%)</label>
                <input type="number" name="minAdvancePercent" value={formData.minAdvancePercent} onChange={handleChange} min="10" max="100"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-gray-50/50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prep Time (mins)</label>
                <input type="number" name="preparationTime" value={formData.preparationTime} onChange={handleChange} placeholder="180"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-gray-50/50 focus:bg-white" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration (mins)</label>
                <input type="number" name="serviceDuration" value={formData.serviceDuration} onChange={handleChange} placeholder="120"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 bg-gray-50/50 focus:bg-white" />
              </div>
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Tag size={18} className="text-gray-400" /> Optional Add-ons
              </h2>
              <button onClick={addAddon} className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">
                <Plus size={14} /> Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {addons.map((addon, i) => (
                <div key={i} className="flex flex-col sm:flex-row gap-3 items-start p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                    <input type="text" placeholder="Add-on Name (e.g. Extra 50 Balloons)" value={addon.name} onChange={e => updateAddon(i, "name", e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                    <input type="number" placeholder="Price (₹)" value={addon.price} onChange={e => updateAddon(i, "price", e.target.value)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                    <input type="text" placeholder="Short description" value={addon.description} onChange={e => updateAddon(i, "description", e.target.value)}
                      className="sm:col-span-2 px-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400" />
                  </div>
                  {addons.length > 1 && (
                    <button onClick={() => removeAddon(i)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Info size={18} className="text-gray-400" /> Frequently Asked Questions
              </h2>
              <button onClick={addFaq} className="flex items-center gap-1.5 text-sm font-semibold text-gray-900 hover:text-emerald-600 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg">
                <Plus size={14} /> Add FAQ
              </button>
            </div>
            
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 relative group">
                  <div className="space-y-3">
                    <input type="text" placeholder="Question?" value={faq.question} onChange={e => updateFaq(i, "question", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 font-medium" />
                    <textarea placeholder="Answer" value={faq.answer} onChange={e => updateFaq(i, "answer", e.target.value)} rows={2}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-gray-400 resize-none text-gray-600" />
                  </div>
                  {faqs.length > 1 && (
                    <button onClick={() => removeFaq(i)} className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info (Right) */}
        <div className="space-y-6">
          {/* Images Upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-50 pb-4">
              <ImageIcon size={18} className="text-gray-400" /> Media Gallery
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="relative aspect-square rounded-xl border-2 border-dashed border-gray-200 overflow-hidden bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-all group">
                  {imagePreviews[i] ? (
                    <>
                      <NextImage src={getPreviewUrl(imagePreviews[i])!} alt={`Preview ${i + 1}`} fill className="object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={() => removeImage(i)} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg transform scale-90 group-hover:scale-100">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer p-2 text-center text-gray-400 hover:text-gray-600">
                      <Upload size={20} />
                      <span className="text-[10px] font-medium leading-tight">{i === 0 ? "Main Cover Image" : `Upload Image ${i + 1}`}</span>
                      <input type="file" className="hidden" accept="image/jpeg, image/png, image/webp" onChange={(e) => handleImageChange(i, e)} />
                    </label>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 mt-4 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="font-semibold text-gray-600 block mb-1">Upload Guidelines:</span>
              • First image is the main cover<br/>
              • JPG, PNG, WEBP allowed (Max 5MB)<br/>
              • Square images (1:1 aspect ratio) work best
            </p>
          </div>

          {/* Cities / Locations */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-50 pb-4">
              <MapPin size={18} className="text-gray-400" /> Availability <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-gray-500 mb-4">Select the cities where this service can be booked:</p>
            <div className="flex flex-wrap gap-2">
              {cities.map(city => {
                const isSelected = formData.cities.includes(city);
                return (
                  <button key={city} onClick={() => toggleCity(city)}
                    className={cn("px-3 py-1.5 rounded-lg text-[13px] font-semibold border transition-all",
                      isSelected ? "border-gray-900 bg-gray-900 text-white shadow-sm" : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    )}>
                    {city}
                  </button>
                );
              })}
            </div>
            {formData.cities.length === 0 && (
              <p className="text-xs font-semibold text-red-500 mt-3">Please select at least one city.</p>
            )}
          </div>
          
          <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-900">Important Note</p>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">Major changes to pricing or content may require a brief re-approval from administrators before going live.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Save, Plus, Trash2, Image, Upload, DollarSign,
  Tag, MapPin, Clock, FileText, Info, Loader2
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

import { useCategories, useServiceById, useUpdateVendorService } from "@/hooks/useApi";

const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur"];

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const serviceId = parseInt(resolvedParams.id);

  const { data: serviceData, isLoading } = useServiceById(serviceId);
  const service = serviceData?.data?.service;
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
    }
  }, [service]);

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
    if (!formData.title || !formData.categoryId || !formData.basePrice) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsSubmitting(true);
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
        images: service?.images || [] // Preserve existing images for now
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-emerald-600 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/vendor/services" className="p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Edit Service</h1>
          <p className="text-sm text-gray-500">Update the details of your service</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText size={18} className="text-emerald-600" /> Basic Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Title *</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Premium Birthday Balloon Decoration"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description *</label>
            <input type="text" name="shortDesc" value={formData.shortDesc} onChange={handleChange} placeholder="Brief one-liner about the service" maxLength={150}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
            <p className="text-xs text-gray-400 mt-1">{formData.shortDesc.length}/150 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description *</label>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Detailed description including what's included, setup details, etc." rows={6}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 bg-white">
              <option value="">Select a category</option>
              {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Image size={18} className="text-emerald-600" /> Service Images</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[0, 1, 2, 3].map(i => (
            <label key={i} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/50 transition-all">
              <Upload size={20} className="text-gray-400" />
              <span className="text-xs text-gray-400">{i === 0 ? "Main Image" : `Image ${i + 1}`}</span>
              <input type="file" className="hidden" accept="image/*" />
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">Upload up to 4 images. Square (1:1) images work best. Max 5MB each.</p>
      </div>

      {/* Pricing */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><DollarSign size={18} className="text-emerald-600" /> Pricing</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (₹) *</label>
            <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} placeholder="4999"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Discounted Price (₹)</label>
            <input type="number" name="discountPrice" value={formData.discountPrice} onChange={handleChange} placeholder="3999"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Min Advance (%)</label>
            <input type="number" name="minAdvancePercent" value={formData.minAdvancePercent} onChange={handleChange} min="10" max="100"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
        </div>
      </div>

      {/* Cities */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-emerald-600" /> Available Cities *</h2>
        <div className="flex flex-wrap gap-2">
          {cities.map(city => (
            <button key={city} onClick={() => toggleCity(city)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                formData.cities.includes(city) ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-emerald-200"
              )}>
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Timing */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Clock size={18} className="text-emerald-600" /> Timing</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Preparation Time (minutes)</label>
            <input type="number" name="preparationTime" value={formData.preparationTime} onChange={handleChange} placeholder="180"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Duration (minutes)</label>
            <input type="number" name="serviceDuration" value={formData.serviceDuration} onChange={handleChange} placeholder="720"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
        </div>
      </div>

      {/* Add-ons */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Tag size={18} className="text-emerald-600" /> Add-ons</h2>
          <button onClick={addAddon} className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            <Plus size={14} /> Add More
          </button>
        </div>
        <div className="space-y-3">
          {addons.map((addon, i) => (
            <div key={i} className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl">
              <div className="flex-1 grid grid-cols-3 gap-3">
                <input type="text" placeholder="Addon name" value={addon.name} onChange={e => updateAddon(i, "name", e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
                <input type="number" placeholder="Price (₹)" value={addon.price} onChange={e => updateAddon(i, "price", e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
                <input type="text" placeholder="Description" value={addon.description} onChange={e => updateAddon(i, "description", e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
              </div>
              {addons.length > 1 && (
                <button onClick={() => removeAddon(i)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 shrink-0">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 flex items-center gap-2"><Info size={18} className="text-emerald-600" /> FAQs</h2>
          <button onClick={addFaq} className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            <Plus size={14} /> Add FAQ
          </button>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-2">
              <div className="flex gap-3">
                <input type="text" placeholder="Question" value={faq.question} onChange={e => updateFaq(i, "question", e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400" />
                {faqs.length > 1 && (
                  <button onClick={() => removeFaq(i)} className="p-2 rounded-lg hover:bg-red-50 text-red-500 shrink-0">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <textarea placeholder="Answer" value={faq.answer} onChange={e => updateFaq(i, "answer", e.target.value)} rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 resize-none" />
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
          <p className="text-sm text-amber-700">⚠️ Any changes made will be reviewed by our team before going live if they are major.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:opacity-90 disabled:opacity-60 transition-all">
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <Link href="/vendor/services" className="px-8 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

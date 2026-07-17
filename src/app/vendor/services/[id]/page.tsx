"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Edit, LayoutTemplate, Clock, Trash2, 
  Eye, CheckCircle, Ban, Star, ShoppingBag, 
  MapPin, AlertCircle, Image as ImageIcon, Briefcase, 
  CreditCard, Loader, List, MessageSquare, Plus, Activity
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useServiceById, useUpdateVendorService } from "@/hooks/useApi";
import { toast } from "sonner";
import Image from "next/image";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  REJECTED: "bg-red-100 text-red-700 border-red-200",
  SUSPENDED: "bg-gray-100 text-gray-700 border-gray-200",
};

export default function VendorServiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const serviceId = parseInt(resolvedParams.id, 10);
  const router = useRouter();

  const { data, isLoading, error } = useServiceById(serviceId);
  const updateService = useUpdateVendorService();

  const service = data?.data;

  const toggleStatus = async (currentStatus: boolean) => {
    try {
      await updateService.mutateAsync({ id: serviceId, data: { isActive: !currentStatus } });
      toast.success(`Service ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (err: any) {
      toast.error(err.message || "Failed to update service status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader size={40} className="text-emerald-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading service details...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center max-w-2xl mx-auto mt-12">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h3 className="text-xl font-bold text-red-800 mb-2">Service Not Found</h3>
        <p className="text-red-600 mb-6">The service you are looking for does not exist or you don't have permission to view it.</p>
        <Link href="/vendor/services" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors">
          <ArrowLeft size={18} /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sticky top-[64px] bg-gray-50 z-20 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-4">
          <Link href="/vendor/services" className="p-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-200 text-gray-500 hover:text-gray-900 transition-all shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 line-clamp-1" style={{ fontFamily: "var(--font-outfit)" }}>
                {service.title}
              </h1>
              <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border shrink-0", statusColors[service.status] || statusColors.SUSPENDED)}>
                {service.status}
              </span>
              <span className={cn("text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border shrink-0", service.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200")}>
                {service.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Briefcase size={14} /> {service.category?.name || "Uncategorized"}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/service/${service.slug}`} target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <LayoutTemplate size={16} /> Preview
          </Link>
          <Link href={`/vendor/settings?tab=availability`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Clock size={16} /> Availability
          </Link>
          <button onClick={() => toggleStatus(service.isActive)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm">
            {service.isActive ? <Ban size={16} className="text-red-500" /> : <CheckCircle size={16} className="text-emerald-500" />} 
            {service.isActive ? "Deactivate" : "Activate"}
          </button>
          <Link href={`/vendor/services/${service.id}/edit`} className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm">
            <Edit size={16} /> Edit Service
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Images Gallery Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <ImageIcon size={18} className="text-gray-400" />
              <h2 className="font-bold text-gray-900">Service Gallery</h2>
            </div>
            <div className="p-6">
              {service.images && Array.isArray(service.images) && service.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {service.images.map((img: string, idx: number) => (
                    <div key={idx} className={cn("relative rounded-xl overflow-hidden border border-gray-100 bg-gray-50", idx === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto" : "aspect-square")}>
                      <Image src={img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`} alt={`${service.title} - ${idx}`} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                      {idx === 0 && <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-bold text-gray-900 shadow-sm">Cover</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <ImageIcon size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-900">No images provided</p>
                  <p className="text-xs text-gray-500 mt-1">Add images to attract more customers.</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Details Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <List size={18} className="text-gray-400" />
              <h2 className="font-bold text-gray-900">Service Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Description</h3>
                <div className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl">
                  {service.description || "No detailed description provided."}
                </div>
              </div>
              
              {service.features && Array.isArray(service.features) && service.features.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Key Features</h3>
                  <ul className="grid sm:grid-cols-2 gap-3">
                    {service.features.map((feature: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Packages Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <CreditCard size={18} className="text-gray-400" />
              <h2 className="font-bold text-gray-900">Pricing & Add-ons</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Base Price</p>
                  <p className="text-3xl font-black text-gray-900">{formatPrice(service.discountPrice || service.basePrice || service.price || 0)}</p>
                  {service.discountPrice && service.basePrice && (
                    <p className="text-sm text-gray-500 line-through mt-1">{formatPrice(service.basePrice)} original</p>
                  )}
                </div>
                {service.advancePercentage && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Advance Required</p>
                    <p className="text-3xl font-black text-gray-900">{service.advancePercentage}%</p>
                    <p className="text-sm text-gray-500 mt-1">of total booking amount</p>
                  </div>
                )}
              </div>

              {service.addons && Array.isArray(service.addons) && service.addons.length > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-3">Available Add-ons</h3>
                  <div className="space-y-3">
                    {service.addons.map((addon: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{addon.name || addon.title}</p>
                          <p className="text-xs text-gray-500">{addon.description}</p>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+{formatPrice(addon.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* FAQs Section */}
          {service.faqs && Array.isArray(service.faqs) && service.faqs.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <MessageSquare size={18} className="text-gray-400" />
                <h2 className="font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>
              <div className="p-6 divide-y divide-gray-100">
                {service.faqs.map((faq: any, idx: number) => (
                  <div key={idx} className="py-4 first:pt-0 last:pb-0">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Q: {faq.question}</h3>
                    <p className="text-sm text-gray-600">A: {faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Performance Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <Activity size={18} className="text-gray-400" />
              <h2 className="font-bold text-gray-900">Performance</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total Bookings</p>
                    <p className="text-lg font-bold text-gray-900">{service.bookingCount || service._count?.bookings || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
                    <Star size={20} className="fill-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Average Rating</p>
                    <p className="text-lg font-bold text-gray-900">{service.avgRating > 0 ? service.avgRating : "N/A"}</p>
                  </div>
                </div>
                {service.reviewCount > 0 && <span className="text-xs font-medium text-gray-400">({service.reviewCount} reviews)</span>}
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                    <Eye size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Total Views</p>
                    <p className="text-lg font-bold text-gray-900">{service.viewCount || 0}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <Link href={`/vendor/analytics`} className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex justify-center items-center gap-1">
                View Full Analytics <ArrowLeft size={14} className="rotate-180" />
              </Link>
            </div>
          </div>

          {/* Tags & Visibility */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Visibility Badges</h2>
            </div>
            <div className="p-5 flex flex-wrap gap-2">
              {service.isFeatured ? <span className="text-xs font-medium bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200">⭐ Featured</span> : null}
              {service.isTrending ? <span className="text-xs font-medium bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200">🔥 Trending</span> : null}
              {service.isBestSeller ? <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">🏆 Best Seller</span> : null}
              {service.isNewArrival ? <span className="text-xs font-medium bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200">✨ New Arrival</span> : null}
              
              {!service.isFeatured && !service.isTrending && !service.isBestSeller && !service.isNewArrival && (
                <p className="text-sm text-gray-500">No special visibility badges assigned.</p>
              )}
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <MapPin size={18} className="text-gray-400" />
              <h2 className="font-bold text-gray-900">Service Locations</h2>
            </div>
            <div className="p-5">
              {service.cities && Array.isArray(service.cities) && service.cities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {service.cities.map((city: string, idx: number) => (
                    <span key={idx} className="text-xs font-medium bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg">
                      {city}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Available at all default vendor locations.</p>
              )}
            </div>
          </div>

          {/* Meta Information */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="font-bold text-gray-900">Metadata</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Service ID</span>
                <span className="font-mono text-gray-900">#{service.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created At</span>
                <span className="text-gray-900">{new Date(service.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900">{new Date(service.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

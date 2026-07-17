"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Edit, Star, ShoppingBag, Eye, Clock, 
  MapPin, Tag, Layers, CheckCircle2, FileText, Image as ImageIcon, CheckCircle, Info, ExternalLink, CalendarDays, Zap
} from "lucide-react";
import { useServiceById } from "@/hooks/useApi";
import { formatPrice, cn } from "@/lib/utils";
import Image from "next/image";

const statusColors: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function VendorServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const id = Number(resolvedParams.id);

  const { data, isLoading, error } = useServiceById(id);
  const service = data?.data?.service || data?.data;

  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="w-14 h-14 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin mb-6 shadow-sm"></div>
        <p className="text-gray-500 font-bold tracking-wide">Loading Service Profile...</p>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-white rounded-2xl border border-gray-100 shadow-sm max-w-3xl mx-auto mt-10">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-5 border-4 border-red-100">
          <span className="text-3xl font-bold">!</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">The service profile you are trying to view does not exist or has been removed from the platform.</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm">
          Return to Services
        </button>
      </div>
    );
  }

  const images = service.images || [];
  const displayImages = images.map((img: string) => img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${img}`);
  const hasImages = displayImages.length > 0;

  return (
    <div className="space-y-6 pb-16 max-w-[1400px] mx-auto">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex flex-col items-start">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft size={14} /> Back to Services
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-3" style={{ fontFamily: "var(--font-outfit)" }}>{service.title}</h1>
          
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className={cn("inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide border", statusColors[service.status] || "bg-gray-50 text-gray-700 border-gray-200")}>
              {service.status === 'APPROVED' && <CheckCircle2 size={14} className="mr-1.5" />}
              {service.status}
            </span>
            {service.isActive ? (
              <span className="inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> ACTIVE
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide bg-gray-50 text-gray-600 border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-2"></span> INACTIVE
              </span>
            )}
            <span className="text-gray-300">|</span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <Layers size={14} className="text-gray-400" /> {service.category?.name || service.category || "Uncategorized"}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0">
          <Link href={`/service/${service.slug}`} target="_blank" className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
            <ExternalLink size={16} /> View Public Page
          </Link>
          <Link href={`/vendor/services/${service.id}/edit`} className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity shadow-sm shadow-emerald-500/20">
            <Edit size={16} /> Edit Service
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content (Left, 2 columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Media Gallery (Modern Masonry/Carousel style) */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
              <ImageIcon size={18} className="text-gray-400" /> Service Gallery
            </h2>
            
            {hasImages ? (
              <div className="space-y-3">
                <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                  <Image src={displayImages[activeImage]} alt={service.title} fill className="object-cover transition-all duration-500 hover:scale-105" priority />
                </div>
                
                {displayImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                    {displayImages.map((img: string, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => setActiveImage(i)}
                        className={cn(
                          "relative w-24 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                          activeImage === i ? "border-gray-900 shadow-md scale-105" : "border-transparent opacity-70 hover:opacity-100"
                        )}
                      >
                        <Image src={img} alt={`Thumbnail ${i}`} fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full aspect-[21/9] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={48} className="mb-3 opacity-20" />
                <p className="font-medium text-sm">No images uploaded for this service</p>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-50 pb-4">
              <FileText size={18} className="text-gray-400" /> Description Overview
            </h2>
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Short summary</h3>
              <p className="text-lg font-medium text-gray-900 leading-relaxed">{service.shortDesc}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Full Details</h3>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap p-5 bg-gray-50 rounded-xl border border-gray-100">
                {service.description || <span className="italic">No detailed description provided.</span>}
              </div>
            </div>
          </div>

          {/* Add-ons & Packages */}
          {service.addons && service.addons.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-50 pb-4">
                <Tag size={18} className="text-gray-400" /> Optional Add-ons
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {service.addons.map((addon: any, idx: number) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <h4 className="font-bold text-gray-900 leading-tight">{addon.name}</h4>
                        <span className="font-bold text-emerald-600 shrink-0">{formatPrice(addon.price)}</span>
                      </div>
                      {addon.description && <p className="text-xs text-gray-500 leading-relaxed">{addon.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs */}
          {service.faq && service.faq.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2 border-b border-gray-50 pb-4">
                <Info size={18} className="text-gray-400" /> Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {service.faq.map((faq: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                    <h4 className="font-bold text-gray-900 text-sm mb-2 flex items-start gap-2">
                      <span className="text-emerald-500 shrink-0">Q.</span> {faq.question}
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed ml-5">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sidebar Info (Right Column) */}
        <div className="space-y-6">
          
          {/* Top Performance Stats */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">Performance Metrics</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                <ShoppingBag size={22} className="text-blue-500 mx-auto mb-2" />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{service.bookingCount || service._count?.bookings || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
                <Star size={22} className="text-amber-500 mx-auto mb-2 fill-amber-500" />
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Rating</p>
                <p className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-1.5">
                  {service.avgRating > 0 ? service.avgRating.toFixed(1) : "0"}
                  {service.reviewCount > 0 && <span className="text-[11px] text-gray-400 font-medium">({service.reviewCount})</span>}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye size={22} className="text-violet-500" />
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Views</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{service.viewCount || 0}</span>
            </div>
          </div>

          {/* Pricing Config */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">Pricing Structure</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-end pb-4 border-b border-gray-50">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase mb-1">Base Price</p>
                  <span className="text-2xl font-bold text-gray-900">{formatPrice(service.basePrice || service.price || 0)}</span>
                </div>
                {service.discountPrice && (
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-emerald-500 uppercase mb-1">Discounted</p>
                    <span className="text-xl font-bold text-emerald-600">{formatPrice(service.discountPrice)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-semibold text-gray-600 flex items-center gap-2"><Zap size={16} className="text-amber-500" /> Min Advance</span>
                <span className="font-bold text-gray-900">{service.minAdvancePercent || 50}%</span>
              </div>
            </div>
          </div>

          {/* Logistics */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-5">Logistics & Timing</h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-blue-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Durations</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">Prep: {service.preparationTime || 0}m <span className="mx-2 text-gray-300">|</span> Service: {service.serviceDuration || 0}m</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase">Available Locations</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {service.cities && (typeof service.cities === 'string' ? JSON.parse(service.cities) : service.cities).map((city: string) => (
                      <span key={city} className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-md uppercase border border-gray-200/60">
                        {city}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Timestamps */}
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <CalendarDays size={16} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Created on <span className="font-bold text-gray-700">{new Date(service.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle size={16} className="text-gray-400" />
              <p className="text-xs font-medium text-gray-500">Last updated <span className="font-bold text-gray-700">{new Date(service.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

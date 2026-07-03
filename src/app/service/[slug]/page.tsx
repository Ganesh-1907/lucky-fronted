"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Star, Heart, Share2, MapPin, Clock, Shield, ChevronRight,
  Plus, Minus, Calendar, Check, ShoppingBag, ChevronLeft,
  Truck, Award, MessageCircle, Info
} from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import ServiceCard from "@/components/cards/ServiceCard";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  
  const [service, setService] = useState<any>(null);
  const [similarServices, setSimilarServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await api.get<{success: boolean, data: { service: any, similar: any[], recommended: any[]}}>(`/services/${params.slug}`);
        if (res.success) {
          setService(res.data.service);
          setSimilarServices(res.data.similar);
          if (res.data.service.cities?.length > 0) {
            setSelectedCity(res.data.service.cities[0]);
          }
        } else {
          toast.error("Service not found");
          router.push('/');
        }
      } catch (error) {
        toast.error("Failed to load service");
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) {
      fetchService();
    }
  }, [params.slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading service details...</div>;
  }

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Service not found</div>;
  }

  const discount = calculateDiscount(Number(service.basePrice), Number(service.discountPrice));
  const displayPrice = Number(service.discountPrice) || Number(service.basePrice);

  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = service.addons.find((a: any) => a.id === id);
    return sum + (Number(addon?.price) || 0);
  }, 0);
  
  const totalPrice = displayPrice + addonsTotal;
  const advanceAmount = Math.round((totalPrice * service.minAdvancePercent) / 100);

  const toggleAddon = (id: number) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleBookNow = () => {
    if (!selectedCity) {
      toast.error("Please select a city first");
      return;
    }
    const query = new URLSearchParams();
    query.append("serviceId", service.id.toString());
    query.append("city", selectedCity);
    if (selectedAddons.length > 0) {
      query.append("addons", selectedAddons.join(","));
    }
    router.push(`/booking?${query.toString()}`);
  };

  const placeholderImages = service.images?.length > 0 ? service.images : [
    { color: "from-violet-400 to-purple-500", emoji: "🎈" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight size={14} />
          {service.category?.parent && (
            <>
              <Link href={`/category/${service.category.parent.slug}`} className="hover:text-violet-600">
                {service.category.parent.name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <Link href={`/category/${service.category?.slug}`} className="hover:text-violet-600">
            {service.category?.name}
          </Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium truncate max-w-[200px]">{service.title}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* ==================== LEFT: Image Gallery ==================== */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
              {typeof placeholderImages[selectedImage % placeholderImages.length] === 'string' ? (
                <img src={placeholderImages[selectedImage % placeholderImages.length] as string} alt={service.title} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${(placeholderImages[selectedImage % placeholderImages.length] as any).color} flex items-center justify-center`}>
                  <span className="text-8xl">{(placeholderImages[selectedImage % placeholderImages.length] as any).emoji}</span>
                </div>
              )}

              {/* Tags */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {service.isTrending && (
                  <span className="badge-trending text-xs font-bold px-3 py-1.5 rounded-full">🔥 Trending</span>
                )}
                {service.isBestSeller && (
                  <span className="badge-bestseller text-xs font-bold px-3 py-1.5 rounded-full">⭐ Best Seller</span>
                )}
              </div>

              {/* Discount */}
              {discount > 0 && (
                <div className="absolute top-4 right-4 bg-green-500 text-white font-bold px-3 py-1.5 rounded-xl text-sm">
                  {discount}% OFF
                </div>
              )}

              {/* Actions */}
              <div className="absolute bottom-4 right-4 flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all">
                  <Heart size={18} className="text-gray-600 hover:text-red-500" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all">
                  <Share2 size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Navigation Arrows */}
              {placeholderImages.length > 1 && (
                <>
                  <button onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md hover:bg-white">
                    <ChevronLeft size={20} />
                  </button>
                  <button onClick={() => setSelectedImage(Math.min(placeholderImages.length - 1, selectedImage + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md hover:bg-white">
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {placeholderImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {placeholderImages.map((img: any, i: number) => (
                  <button key={i} onClick={() => setSelectedImage(i)} className={cn("w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all", selectedImage === i ? "border-violet-500 ring-2 ring-violet-200" : "border-gray-100 hover:border-gray-300")}>
                    {typeof img === 'string' ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${img.color} flex items-center justify-center`}>
                        <span className="text-2xl">{img.emoji}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================== RIGHT: Details ==================== */}
          <div className="space-y-6">
            {/* Category */}
            <div className="flex items-center gap-2 text-sm text-violet-600 font-medium">
              {service.category?.parent && <span>{service.category.parent.name} <ChevronRight size={14} className="inline mx-1" /></span>}
              <span>{service.category?.name}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "var(--font-outfit)" }}>
              {service.title}
            </h1>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                <Star size={16} className="text-green-600 fill-green-600" />
                <span className="font-bold text-green-700">{Number(service.avgRating).toFixed(1)}</span>
                <span className="text-sm text-green-600">({service.reviewCount || 0} reviews)</span>
              </div>
              <span className="text-sm text-gray-500">{service.bookingCount || 0}+ bookings</span>
              <span className="text-sm text-gray-500">{service.viewCount || 0}+ views</span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(Number(service.basePrice))}</span>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md mb-1">
                      Save {formatPrice(Number(service.basePrice) - displayPrice)}
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-500">Advance: {formatPrice(advanceAmount)} ({service.minAdvancePercent}%) • Remaining payable after service</p>
            </div>

            {/* Short Description */}
            <p className="text-gray-600 leading-relaxed">{service.shortDesc}</p>

            {/* Vendor Info */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">{service.vendor?.businessName?.[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{service.vendor?.businessName}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" /> {Number(service.vendor?.avgRating || 0).toFixed(1)}
                  </span>
                  <span>{service.vendor?.totalBookings || 0}+ orders</span>
                </div>
              </div>
            </div>

            {/* City Selector */}
            {service.cities?.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  <MapPin size={14} className="inline mr-1" /> Select City
                </label>
                <div className="flex flex-wrap gap-2">
                  {service.cities.map((city: string) => (
                    <button key={city} onClick={() => setSelectedCity(city)}
                      className={cn("px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all", selectedCity === city ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-600 hover:border-violet-200")}>
                      {city}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons */}
            {service.addons?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  <Plus size={14} className="inline mr-1" /> Add-ons (Optional)
                </h3>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {service.addons.map((addon: any) => (
                    <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                      className={cn("w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all", selectedAddons.includes(addon.id) ? "border-violet-500 bg-violet-50" : "border-gray-100 hover:border-violet-200 bg-white")}>
                      <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all", selectedAddons.includes(addon.id) ? "border-violet-500 bg-violet-500" : "border-gray-300")}>
                        {selectedAddons.includes(addon.id) && <Check size={14} className="text-white" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{addon.name}</p>
                        {addon.description && <p className="text-xs text-gray-500">{addon.description}</p>}
                      </div>
                      <span className="font-bold text-sm text-gray-900">+{formatPrice(Number(addon.price))}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown */}
            {selectedAddons.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">{formatPrice(displayPrice)}</span>
                </div>
                {selectedAddons.map(id => {
                  const addon = service.addons.find((a: any) => a.id === id);
                  return addon ? (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{addon.name}</span>
                      <span className="font-medium">+{formatPrice(Number(addon.price))}</span>
                    </div>
                  ) : null;
                })}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-violet-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            )}

            {/* Book Now Button */}
            <div className="flex gap-3">
              <button onClick={handleBookNow} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold text-base hover:opacity-90 transition-all shadow-lg shadow-violet-200">
                <ShoppingBag size={18} /> Book Now — {formatPrice(totalPrice)}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Shield size={18} />, label: "Secure Payment" },
                { icon: <Clock size={18} />, label: "On-time Setup" },
                { icon: <Award size={18} />, label: "Verified Vendor" },
              ].map((badge, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 p-3 bg-gray-50 rounded-xl text-center">
                  <span className="text-violet-500">{badge.icon}</span>
                  <span className="text-[11px] font-medium text-gray-600">{badge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ==================== DESCRIPTION ==================== */}
        <div className="mt-12 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>About This Service</h2>
              <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: service.description || "No description provided." }} />
            </div>

            {/* FAQ */}
            {service.faq?.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {service.faq.map((item: any) => (
                    <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-sm text-gray-900">{item.question}</span>
                        <Plus size={16} className={cn("text-gray-400 transition-transform shrink-0 ml-3", expandedFaq === item.id && "rotate-45")} />
                      </button>
                      {expandedFaq === item.id && <div className="px-4 pb-4 text-sm text-gray-600 animate-fade-in">{item.answer}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {service.reviews?.length > 0 && (
              <div className="bg-white rounded-2xl p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Customer Reviews ({service.reviewCount})</h2>
                  <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                    <Star size={16} className="text-green-600 fill-green-600" />
                    <span className="font-bold text-green-700">{Number(service.avgRating).toFixed(1)}/5</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {service.reviews.map((review: any) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                          <span className="text-white text-sm font-bold">{review.client?.name?.[0] || 'U'}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{review.client?.name || 'Unknown User'}</p>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, j) => <Star key={j} size={11} className="text-amber-400 fill-amber-400" />)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                      {review.title && <p className="font-semibold text-sm text-gray-900 mb-1">{review.title}</p>}
                      <p className="text-sm text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-40">
              <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Service Details</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Setup Time</p>
                    <p className="text-xs text-gray-500">{service.preparationTime} mins before event</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck size={16} className="text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Service Duration</p>
                    <p className="text-xs text-gray-500">{service.serviceDuration} mins</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Advance Payment</p>
                    <p className="text-xs text-gray-500">{service.minAdvancePercent}% to confirm booking</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== SIMILAR SERVICES ==================== */}
        {similarServices.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>Similar Services</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {similarServices.map(sim => (
                <ServiceCard key={sim.id} {...sim} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ==================== MOBILE STICKY BOOK BUTTON ==================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</p>
            {discount > 0 && <p className="text-xs text-gray-400 line-through">{formatPrice(Number(service.basePrice) + addonsTotal)}</p>}
          </div>
          <button onClick={handleBookNow} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm">
            <ShoppingBag size={16} /> Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

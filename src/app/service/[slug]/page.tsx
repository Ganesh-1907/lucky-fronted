"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Star, Heart, Share2, MapPin, Clock, Shield, ChevronRight,
  Plus, Minus, Calendar, Check, ShoppingBag, ChevronLeft,
  Truck, Award, MessageCircle, Info
} from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import ServiceCard from "@/components/cards/ServiceCard";

// Demo data
const demoService = {
  id: 1,
  title: "Premium Birthday Balloon Decoration",
  slug: "premium-birthday-balloon-decoration",
  description: `<p>Transform your space into a celebration paradise with our premium balloon decoration package. Our expert decorators will create a stunning setup that will leave your guests amazed.</p>
  <h3>What's Included:</h3>
  <ul>
    <li>200+ premium quality balloons (metallic, chrome & pastel)</li>
    <li>Customized balloon arch/backdrop</li>
    <li>LED fairy lights</li>
    <li>Personalized name/age banner</li>
    <li>Table centerpiece arrangement</li>
    <li>Floor balloon bouquets (4 nos)</li>
    <li>Setup & cleanup included</li>
  </ul>
  <h3>Additional Details:</h3>
  <ul>
    <li>Setup time: 2-3 hours before event</li>
    <li>Duration: Full day (decorations stay for 12 hours)</li>
    <li>Space required: Minimum 10x10 ft area</li>
    <li>Available for indoor & outdoor setups</li>
  </ul>`,
  shortDesc: "Premium balloon setup with LED lights, backdrop & personalized banner",
  basePrice: 4999,
  discountPrice: 3999,
  images: [],
  avgRating: 4.5,
  reviewCount: 128,
  bookingCount: 456,
  viewCount: 2340,
  minAdvancePercent: 50,
  preparationTime: 180,
  serviceDuration: 720,
  isTrending: true,
  isBestSeller: true,
  cities: ["Mumbai", "Pune", "Delhi", "Bangalore"],
  category: { id: 2, name: "Balloon Decorations", slug: "balloon-decorations", parent: { id: 1, name: "Birthday Decorations", slug: "birthday-decorations" } },
  vendor: { id: 1, businessName: "Dream Decorators", description: "Premium decoration services", avgRating: 4.7, reviewCount: 342, totalBookings: 890, serviceCities: ["Mumbai", "Pune", "Delhi"] },
  addons: [
    { id: 1, name: "Birthday Cake (1kg)", description: "Delicious chocolate/vanilla cake", price: 799, image: null },
    { id: 2, name: "Extra Balloons (50)", description: "Additional premium balloons", price: 499, image: null },
    { id: 3, name: "Fog Machine", description: "Adds dramatic fog effect", price: 999, image: null },
    { id: 4, name: "Confetti Cannon", description: "Party confetti poppers (set of 4)", price: 599, image: null },
    { id: 5, name: "Photo Booth Setup", description: "Backdrop with props for photos", price: 1499, image: null },
  ],
  faq: [
    { id: 1, question: "How much time does the setup take?", answer: "Setup typically takes 2-3 hours. Our team will arrive before your event time to ensure everything is ready." },
    { id: 2, question: "Can I customize the colors?", answer: "Yes! You can choose from our wide range of color themes or specify custom colors during booking." },
    { id: 3, question: "What if I need to reschedule?", answer: "You can reschedule up to 24 hours before the event at no extra charge." },
    { id: 4, question: "Do you provide cleanup after the event?", answer: "Yes, cleanup is included in the package. Our team will remove all decorations after the event." },
  ],
  reviews: [
    { id: 1, rating: 5, title: "Amazing setup!", comment: "The decorations were absolutely stunning. My daughter loved it! The team was very professional and everything was set up on time.", client: { name: "Priya Sharma", avatar: null }, createdAt: "2024-03-15" },
    { id: 2, rating: 4, title: "Great value for money", comment: "Beautiful balloon arch and the LED lights added a magical touch. Would definitely recommend.", client: { name: "Rahul Verma", avatar: null }, createdAt: "2024-03-10" },
    { id: 3, rating: 5, title: "Perfect birthday surprise", comment: "Booked this for my husband's surprise birthday. He was thrilled! Excellent service.", client: { name: "Anita Patel", avatar: null }, createdAt: "2024-03-05" },
  ],
};

const similarServices = [
  { id: 2, title: "Kids Birthday Theme Party", slug: "kids-birthday-theme-party-setup", basePrice: 7999, discountPrice: 5999, images: [], avgRating: 4.6, reviewCount: 72, isTrending: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Dream Decorators", avgRating: 4.7 } },
  { id: 3, title: "Simple Birthday Decoration", slug: "simple-birthday-decoration", basePrice: 2499, discountPrice: 1999, images: [], avgRating: 4.3, reviewCount: 95, isNewArrival: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Party Makers", avgRating: 4.5 } },
  { id: 4, title: "Neon Birthday Setup", slug: "neon-birthday-setup", basePrice: 6999, discountPrice: 5499, images: [], avgRating: 4.7, reviewCount: 45, isFeatured: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Glow Events", avgRating: 4.8 } },
  { id: 5, title: "Ring Light Birthday Decoration", slug: "ring-light-birthday", basePrice: 3999, discountPrice: null, images: [], avgRating: 4.4, reviewCount: 33, isBestSeller: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Dream Decorators", avgRating: 4.7 } },
];

export default function ServiceDetailPage() {
  const params = useParams();
  const service = demoService; // In production, fetch by params.slug

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [showBookingPanel, setShowBookingPanel] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const discount = calculateDiscount(service.basePrice, service.discountPrice);
  const displayPrice = service.discountPrice || service.basePrice;

  // Calculate total with addons
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const addon = service.addons.find(a => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);
  const totalPrice = displayPrice + addonsTotal;
  const advanceAmount = Math.round((totalPrice * service.minAdvancePercent) / 100);

  const toggleAddon = (id: number) => {
    setSelectedAddons(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const placeholderImages = [
    { color: "from-violet-400 to-purple-500", emoji: "🎈" },
    { color: "from-pink-400 to-rose-500", emoji: "🎉" },
    { color: "from-amber-400 to-orange-500", emoji: "🎂" },
    { color: "from-emerald-400 to-teal-500", emoji: "✨" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight size={14} />
          {service.category.parent && (
            <>
              <Link href={`/category/${service.category.parent.slug}`} className="hover:text-violet-600">
                {service.category.parent.name}
              </Link>
              <ChevronRight size={14} />
            </>
          )}
          <Link href={`/category/${service.category.slug}`} className="hover:text-violet-600">
            {service.category.name}
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
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-gray-100">
              <div className={`w-full h-full bg-gradient-to-br ${placeholderImages[selectedImage % 4].color} flex items-center justify-center`}>
                <span className="text-8xl">{placeholderImages[selectedImage % 4].emoji}</span>
              </div>

              {/* Tags */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {service.isTrending && (
                  <span className="badge-trending text-xs font-bold px-3 py-1.5 rounded-full">
                    🔥 Trending
                  </span>
                )}
                {service.isBestSeller && (
                  <span className="badge-bestseller text-xs font-bold px-3 py-1.5 rounded-full">
                    ⭐ Best Seller
                  </span>
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
                  <button
                    onClick={() => setSelectedImage(Math.max(0, selectedImage - 1))}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md hover:bg-white"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedImage(Math.min(placeholderImages.length - 1, selectedImage + 1))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow-md hover:bg-white"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {placeholderImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "w-20 h-20 rounded-xl overflow-hidden border-2 transition-all",
                    selectedImage === i ? "border-violet-500 ring-2 ring-violet-200" : "border-gray-100 hover:border-gray-300"
                  )}
                >
                  <div className={`w-full h-full bg-gradient-to-br ${img.color} flex items-center justify-center`}>
                    <span className="text-2xl">{img.emoji}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ==================== RIGHT: Details ==================== */}
          <div className="space-y-6">
            {/* Category */}
            <div className="flex items-center gap-2 text-sm text-violet-600 font-medium">
              <span>{service.category.parent?.name}</span>
              <ChevronRight size={14} />
              <span>{service.category.name}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "var(--font-outfit)" }}>
              {service.title}
            </h1>

            {/* Rating & Stats */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
                <Star size={16} className="text-green-600 fill-green-600" />
                <span className="font-bold text-green-700">{service.avgRating}</span>
                <span className="text-sm text-green-600">({service.reviewCount} reviews)</span>
              </div>
              <span className="text-sm text-gray-500">{service.bookingCount}+ bookings</span>
              <span className="text-sm text-gray-500">{service.viewCount}+ views</span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">{formatPrice(displayPrice)}</span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-gray-400 line-through mb-1">{formatPrice(service.basePrice)}</span>
                    <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-md mb-1">
                      Save {formatPrice(service.basePrice - displayPrice)}
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
                <span className="text-white font-bold text-lg">{service.vendor.businessName[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{service.vendor.businessName}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" /> {service.vendor.avgRating}
                  </span>
                  <span>{service.vendor.totalBookings}+ orders</span>
                </div>
              </div>
              <Link href={`/vendor/${service.vendor.id}`} className="text-sm font-medium text-violet-600 hover:text-violet-700">
                View Profile →
              </Link>
            </div>

            {/* City Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                <MapPin size={14} className="inline mr-1" /> Select City
              </label>
              <div className="flex flex-wrap gap-2">
                {service.cities.map(city => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                      selectedCity === city
                        ? "border-violet-500 bg-violet-50 text-violet-700"
                        : "border-gray-200 text-gray-600 hover:border-violet-200"
                    )}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Add-ons */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                <Plus size={14} className="inline mr-1" /> Add-ons (Optional)
              </h3>
              <div className="space-y-2">
                {service.addons.map(addon => (
                  <button
                    key={addon.id}
                    onClick={() => toggleAddon(addon.id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                      selectedAddons.includes(addon.id)
                        ? "border-violet-500 bg-violet-50"
                        : "border-gray-100 hover:border-violet-200 bg-white"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                      selectedAddons.includes(addon.id)
                        ? "border-violet-500 bg-violet-500"
                        : "border-gray-300"
                    )}>
                      {selectedAddons.includes(addon.id) && <Check size={14} className="text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">{addon.name}</p>
                      {addon.description && (
                        <p className="text-xs text-gray-500">{addon.description}</p>
                      )}
                    </div>
                    <span className="font-bold text-sm text-gray-900">+{formatPrice(addon.price)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            {selectedAddons.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="font-medium">{formatPrice(displayPrice)}</span>
                </div>
                {selectedAddons.map(id => {
                  const addon = service.addons.find(a => a.id === id);
                  return addon ? (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{addon.name}</span>
                      <span className="font-medium">+{formatPrice(addon.price)}</span>
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
              <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl gradient-primary text-white font-semibold text-base hover:opacity-90 transition-all shadow-lg shadow-violet-200">
                <ShoppingBag size={18} /> Book Now — {formatPrice(totalPrice)}
              </button>
              <button className="px-4 py-4 rounded-xl border-2 border-gray-200 hover:border-violet-300 transition-all">
                <MessageCircle size={20} className="text-gray-600" />
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
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                About This Service
              </h2>
              <div
                className="prose prose-sm max-w-none text-gray-600
                  prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-base
                  prose-li:text-gray-600 prose-ul:space-y-1
                  prose-p:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />
            </div>

            {/* FAQ */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {service.faq.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-sm text-gray-900">{item.question}</span>
                      <Plus
                        size={16}
                        className={cn(
                          "text-gray-400 transition-transform shrink-0 ml-3",
                          expandedFaq === item.id && "rotate-45"
                        )}
                      />
                    </button>
                    {expandedFaq === item.id && (
                      <div className="px-4 pb-4 text-sm text-gray-600 animate-fade-in">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                  Customer Reviews ({service.reviewCount})
                </h2>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                  <Star size={16} className="text-green-600 fill-green-600" />
                  <span className="font-bold text-green-700">{service.avgRating}/5</span>
                </div>
              </div>

              <div className="space-y-4">
                {service.reviews.map(review => (
                  <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{review.client.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900">{review.client.name}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }).map((_, j) => (
                            <Star key={j} size={11} className="text-amber-400 fill-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 ml-auto">{review.createdAt}</span>
                    </div>
                    {review.title && <p className="font-semibold text-sm text-gray-900 mb-1">{review.title}</p>}
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-3 text-sm font-medium text-violet-600 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors">
                View All {service.reviewCount} Reviews
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-40">
              <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
                Service Details
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Setup Time</p>
                    <p className="text-xs text-gray-500">2-3 hours before event</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck size={16} className="text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Service Duration</p>
                    <p className="text-xs text-gray-500">Full day (12 hours)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield size={16} className="text-violet-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Free Cancellation</p>
                    <p className="text-xs text-gray-500">Up to 24 hours before</p>
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

            {/* Need Help */}
            <div className="bg-violet-50 rounded-2xl p-6 border border-violet-100">
              <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">Our support team is here to assist you with your booking.</p>
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors">
                <MessageCircle size={16} /> Chat with Us
              </button>
            </div>
          </div>
        </div>

        {/* ==================== SIMILAR SERVICES ==================== */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
            Similar Services
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {similarServices.map(service => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </section>
      </div>

      {/* ==================== MOBILE STICKY BOOK BUTTON ==================== */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-lg font-bold text-gray-900">{formatPrice(totalPrice)}</p>
            {discount > 0 && (
              <p className="text-xs text-gray-400 line-through">{formatPrice(service.basePrice + addonsTotal)}</p>
            )}
          </div>
          <button className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm">
            <ShoppingBag size={16} /> Book Now
          </button>
        </div>
      </div>
    </div>
  );
}

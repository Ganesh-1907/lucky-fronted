"use client";

import { useState, useEffect, useCallback } from "react";

import Link from "next/link";
import {
  ArrowRight, Sparkles, Star, TrendingUp, Gift, Cake,
  PartyPopper, Heart, Building2, Flower2, ChevronRight,
  Shield, Clock, CheckCircle, Users,
} from "lucide-react";
import ServiceCard from "@/components/cards/ServiceCard";
import { useServices, useCategories } from "@/hooks/useApi";

// Sample data for demo (replaced by API data in production)
const sampleServices = [
  {
    id: 1, title: "Premium Birthday Balloon Decoration", slug: "premium-birthday-balloon-decoration",
    basePrice: 4999, discountPrice: 3999, images: [], avgRating: 4.5, reviewCount: 128,
    isTrending: true, isBestSeller: true, isNewArrival: false, isFeatured: true,
    category: { name: "Balloon Decorations", slug: "balloon-decorations" },
    vendor: { businessName: "Dream Decorators", avgRating: 4.7 },
  },
  {
    id: 2, title: "Romantic Candlelight Dinner Setup", slug: "romantic-candlelight-dinner-setup",
    basePrice: 5999, discountPrice: 4499, images: [], avgRating: 4.8, reviewCount: 89,
    isTrending: true, isBestSeller: false, isNewArrival: true, isFeatured: true,
    category: { name: "Candlelight Dinner", slug: "candlelight-dinner" },
    vendor: { businessName: "Dream Decorators", avgRating: 4.7 },
  },
  {
    id: 3, title: "Royal Wedding Stage Decoration", slug: "royal-wedding-stage-decoration",
    basePrice: 49999, discountPrice: 39999, images: [], avgRating: 4.9, reviewCount: 56,
    isTrending: false, isBestSeller: true, isNewArrival: false, isFeatured: true,
    category: { name: "Wedding Decorations", slug: "wedding-decorations" },
    vendor: { businessName: "Dream Decorators", avgRating: 4.7 },
  },
  {
    id: 4, title: "Kids Birthday Theme Party Setup", slug: "kids-birthday-theme-party-setup",
    basePrice: 7999, discountPrice: 5999, images: [], avgRating: 4.6, reviewCount: 72,
    isTrending: true, isBestSeller: false, isNewArrival: true, isFeatured: false,
    category: { name: "Birthday Decorations", slug: "birthday-decorations" },
    vendor: { businessName: "Dream Decorators", avgRating: 4.7 },
  },
];

const categoryIcons: Record<string, React.ReactNode> = {
  "birthday-decorations": <PartyPopper size={28} />,
  "wedding-decorations": <Heart size={28} />,
  "candlelight-dinner": <Sparkles size={28} />,
  "cakes": <Cake size={28} />,
  "flowers": <Flower2 size={28} />,
  "corporate-events": <Building2 size={28} />,
  "anniversary-celebrations": <Gift size={28} />,
  "surprise-planning": <Sparkles size={28} />,
};

const categoryColors = [
  "from-pink-500 to-rose-500", "from-violet-500 to-purple-500",
  "from-amber-500 to-orange-500", "from-emerald-500 to-teal-500",
  "from-pink-400 to-rose-400", "from-blue-500 to-indigo-500",
  "from-red-500 to-pink-500", "from-purple-500 to-violet-500",
];

const defaultCategories = [
  { name: "Birthday Decorations", slug: "birthday-decorations", count: "250+" },
  { name: "Wedding Decorations", slug: "wedding-decorations", count: "180+" },
  { name: "Candlelight Dinner", slug: "candlelight-dinner", count: "120+" },
  { name: "Cakes", slug: "cakes", count: "300+" },
  { name: "Flowers", slug: "flowers", count: "200+" },
  { name: "Corporate Events", slug: "corporate-events", count: "90+" },
  { name: "Anniversary", slug: "anniversary-celebrations", count: "150+" },
  { name: "Surprise Planning", slug: "surprise-planning", count: "100+" },
];

const stats = [
  { icon: <Users size={24} />, value: "50,000+", label: "Happy Customers" },
  { icon: <Star size={24} />, value: "4.8/5", label: "Average Rating" },
  { icon: <CheckCircle size={24} />, value: "1,200+", label: "Verified Vendors" },
  { icon: <Shield size={24} />, value: "100%", label: "Secure Payments" },
];

export default function HomePage() {
  // Fetch from API — falls back to demo data on error
  const { data: trendingRes } = useServices({ trending: true, limit: 4 });
  const { data: bestsellerRes } = useServices({ bestseller: true, limit: 4 });
  const { data: categoriesRes } = useCategories();

   const trendingServices = (trendingRes as any)?.data?.length ? (trendingRes as any).data : sampleServices;
  const bestsellerServices = (bestsellerRes as any)?.data?.length ? (bestsellerRes as any).data : sampleServices;
  const categories = (categoriesRes as any)?.data?.length
    ? (categoriesRes as any).data.map((c: any, i: number) => ({
        ...c,
        icon: categoryIcons[c.slug] || <Sparkles size={28} />,
        color: categoryColors[i % categoryColors.length],
        count: c._count?.services ? `${c._count.services}+` : "New",
      }))
    : defaultCategories.map((c, i) => ({
        ...c,
        icon: categoryIcons[c.slug] || <Sparkles size={28} />,
        color: categoryColors[i % categoryColors.length],
      }));

  // ─── Hero carousel ───────────────────────────────────────
  const heroSlides = [
    {
      src: "/hero-celebration.png",
      alt: "Beautiful celebration decoration with balloons, flowers and fairy lights",
      emoji: "🎉",
      label: "Celebration Setups",
      sublabel: "1,200+ verified vendors",
    },
    {
      src: "/hero-wedding.png",
      alt: "Luxurious wedding stage decoration with floral arrangements",
      emoji: "💒",
      label: "Wedding Decorations",
      sublabel: "Make your big day magical",
    },
    {
      src: "/hero-birthday.png",
      alt: "Colorful birthday party decoration with balloons and cake",
      emoji: "🎂",
      label: "Birthday Parties",
      sublabel: "250+ themes available",
    },
    {
      src: "/hero-candlelight.png",
      alt: "Romantic candlelight dinner setup with candles and roses",
      emoji: "🕯️",
      label: "Candlelight Dinners",
      sublabel: "Unforgettable romantic evenings",
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % heroSlides.length);
  }, [heroSlides.length]);

  useEffect(() => {
    if (carouselPaused) return;
    const timer = setInterval(nextSlide, 4000);
    return () => clearInterval(timer);
  }, [carouselPaused, nextSlide]);
  return (
    <div className="min-h-screen">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
          {/* Animated background shapes */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" style={{ animation: "pulse-soft 4s infinite" }} />
          <div className="absolute top-40 right-40 w-48 h-48 bg-pink-400/10 rounded-full blur-2xl" style={{ animation: "pulse-soft 6s infinite" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Column — Text & CTA */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm mb-6 border border-white/20">
                <Sparkles size={14} className="text-amber-300" />
                <span>Trusted by 50,000+ customers across India</span>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Make Every
                <br />
                Celebration
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">
                  Unforgettable
                </span>
              </h1>

              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
                Book premium decoration services, event setups, and celebration
                packages. From birthday surprises to grand weddings — all at your
                doorstep.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-violet-700 font-semibold text-base hover:bg-gray-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Explore Services <ArrowRight size={18} />
                </Link>
                <Link
                  href="/auth/register?role=vendor"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-base border border-white/30 hover:bg-white/20 transition-all"
                >
                  Become a Vendor
                </Link>
              </div>
            </div>

            {/* Right Column — Hero Image Carousel */}
            <div className="hidden lg:flex justify-center items-center relative">
              {/* Decorative glow behind the image */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-transparent to-amber-400/20 rounded-full blur-3xl scale-110" />

              {/* Floating decorative dots */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-300/20 rounded-full blur-xl animate-pulse" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-300/20 rounded-full blur-xl" style={{ animation: "pulse-soft 3s infinite" }} />
              <div className="absolute top-1/4 -right-8 w-3 h-3 bg-amber-300 rounded-full" style={{ animation: "pulse-soft 2s infinite" }} />
              <div className="absolute bottom-1/4 -left-4 w-2 h-2 bg-pink-300 rounded-full" style={{ animation: "pulse-soft 2.5s infinite" }} />

              {/* Carousel container */}
              <div
                className="relative w-full max-w-lg rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl"
                style={{
                  transform: "rotate(2deg)",
                  transition: "transform 0.5s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "rotate(0deg) scale(1.02)";
                  setCarouselPaused(true);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "rotate(2deg)";
                  setCarouselPaused(false);
                }}
              >
                {/* Glassmorphic overlay at top */}
                <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/10 to-transparent z-20" />

                {/* Slides */}
                <div className="relative" style={{ aspectRatio: "4/3" }}>
                  {heroSlides.map((slide, i) => (
                    <img
                      key={slide.src}
                      src={slide.src}
                      alt={slide.alt}
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out"
                      style={{ opacity: activeSlide === i ? 1 : 0 }}
                    />
                  ))}
                </div>

                {/* Glassmorphic overlay at bottom with slide caption */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent p-6 z-20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                        {heroSlides[activeSlide].emoji}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{heroSlides[activeSlide].label}</p>
                        <p className="text-white/70 text-xs">{heroSlides[activeSlide].sublabel}</p>
                      </div>
                    </div>

                    {/* Dot indicators */}
                    <div className="flex items-center gap-1.5">
                      {heroSlides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveSlide(i)}
                          className={`rounded-full transition-all duration-300 ${
                            activeSlide === i
                              ? "w-6 h-2 bg-white"
                              : "w-2 h-2 bg-white/40 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full">
            <path d="M0 60L1440 60V30C1440 30 1320 0 1200 0C1080 0 960 30 840 30C720 30 600 0 480 0C360 0 240 30 120 30C60 30 0 15 0 15V60Z" fill="#FAFAFA" />
          </svg>
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <section className="relative -mt-1 mb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3 justify-center">
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                  {stat.icon}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Browse Categories
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Find the perfect service for your celebration from our wide range of categories
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat: any, i: number) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative overflow-hidden rounded-2xl p-5 bg-white border border-gray-100 card-hover"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                {cat.icon}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-violet-600 transition-colors">
                {cat.name}
              </h3>
              <p className="text-xs text-gray-400">{cat.count} services</p>
              <ChevronRight
                size={16}
                className="absolute top-5 right-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all"
              />
            </Link>
          ))}
        </div>
      </section>

      {/* ==================== TRENDING ==================== */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={20} className="text-red-500" />
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                Trending Now
              </h2>
            </div>
            <p className="text-gray-500 text-sm">Most popular services this month</p>
          </div>
          <Link
            href="/services?sort=popular"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 hover:gap-2 transition-all"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {trendingServices.map((service: any, i: number) => (
            <ServiceCard key={service.id} {...service} className="animate-fade-in" />
          ))}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link href="/services?sort=popular" className="text-sm font-medium text-violet-600">
            View All Trending →
          </Link>
        </div>
      </section>

      {/* ==================== BEST SELLERS ==================== */}
      <section className="bg-gradient-to-b from-violet-50/50 to-transparent py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star size={20} className="text-amber-500 fill-amber-500" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                  Best Sellers
                </h2>
              </div>
              <p className="text-gray-500 text-sm">Top rated services loved by our customers</p>
            </div>
            <Link
              href="/services?sort=rating"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 hover:gap-2 transition-all"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {bestsellerServices.map((service: any) => (
              <ServiceCard key={service.id} {...service} />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            How It Works
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Book your celebration in 3 simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Choose a Service",
              desc: "Browse from 1000+ decoration and event services across your city",
              icon: "🔍",
              color: "from-violet-500 to-purple-500",
            },
            {
              step: "02",
              title: "Customize & Book",
              desc: "Select add-ons, pick your date & time, and pay a small advance",
              icon: "📅",
              color: "from-pink-500 to-rose-500",
            },
            {
              step: "03",
              title: "Enjoy Your Event",
              desc: "Our verified vendors will setup everything at your doorstep",
              icon: "🎉",
              color: "from-amber-500 to-orange-500",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="relative text-center p-8 bg-white rounded-2xl border border-gray-100 card-hover"
            >
              <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-3xl shadow-lg`}>
                {item.icon}
              </div>
              <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                Step {item.step}
              </span>
              <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                {item.desc}
              </p>

              {i < 2 && (
                <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight size={24} className="text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="max-w-7xl mx-auto px-4 mb-16">
        <div className="relative rounded-3xl overflow-hidden gradient-primary p-10 md:p-16">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />

          <div className="relative z-10 max-w-2xl">
            <h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              Are You a Decoration Vendor?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join Lucky Marketplace and reach thousands of customers. List your services,
              manage bookings, and grow your business with our powerful vendor dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register?role=vendor"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-violet-700 font-semibold hover:shadow-xl transition-all"
              >
                Register as Vendor <ArrowRight size={18} />
              </Link>
              <Link
                href="/vendor-info"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold border border-white/30 hover:bg-white/20 transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== TESTIMONIALS ==================== */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              What Our Customers Say
            </h2>
            <p className="text-gray-500">Real reviews from real people</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                avatar: "P",
                rating: 5,
                comment: "Absolutely stunning birthday decoration! The team was professional, punctual, and the setup exceeded my expectations. Highly recommend!",
                service: "Premium Birthday Balloon Decoration",
                city: "Mumbai",
              },
              {
                name: "Rahul Verma",
                avatar: "R",
                rating: 5,
                comment: "Planned a surprise candlelight dinner for my wife's anniversary. Everything was perfect — the ambiance, setup, and attention to detail. She loved it!",
                service: "Romantic Candlelight Dinner Setup",
                city: "Delhi",
              },
              {
                name: "Anita Patel",
                avatar: "A",
                rating: 5,
                comment: "Used Lucky Marketplace for our wedding stage decoration. The vendor was amazing and created exactly what we envisioned. Worth every penny!",
                service: "Royal Wedding Stage Decoration",
                city: "Bangalore",
              },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  &ldquo;{review.comment}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{review.avatar}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-400">{review.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CITIES ==================== */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Available Cities
          </h2>
          <p className="text-gray-500">We serve across major cities in India</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {[
            "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
            "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Lucknow",
          ].map((city) => (
            <Link
              key={city}
              href={`/services?city=${city.toLowerCase()}`}
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all"
            >
              📍 {city}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

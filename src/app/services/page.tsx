"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search, Filter, X, ChevronDown, ChevronRight, Star,
  SlidersHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import ServiceCard from "@/components/cards/ServiceCard";
import BannerCarousel from "@/components/BannerCarousel";
import { useServices, useCategories, useBanners } from "@/hooks/useApi";

// Fetched dynamically from API

const priceRanges = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 - ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 - ₹25,000", min: 10000, max: 25000 },
  { label: "Above ₹25,000", min: 25000, max: Infinity },
];

const sortOptions = [
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Rating", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const { data: catData } = useCategories();
  const apiCategories = catData?.data ? [{ name: "All", slug: "All" }, ...catData.data] : [{ name: "All", slug: "All" }];
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "All");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "popular");
  const [selectedRating, setSelectedRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const cityQuery = searchParams.get("city") || undefined;

  const { data: bannerRes } = useBanners("SIDEBAR");
  const banners = bannerRes?.data || [];

  const { data: servicesRes, isLoading } = useServices({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: searchQuery || undefined,
    minPrice: selectedPrice > 0 ? priceRanges[selectedPrice].min : undefined,
    maxPrice: selectedPrice > 0 && priceRanges[selectedPrice].max !== Infinity ? priceRanges[selectedPrice].max : undefined,
    rating: selectedRating > 0 ? selectedRating : undefined,
    sort: selectedSort,
    city: cityQuery,
  });

  const displayServices = servicesRes?.data || [];
  const totalServices = servicesRes?.pagination?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">All Services</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
          Explore Services
        </h1>
        <p className="text-gray-500">Discover premium celebration services</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 cursor-pointer min-w-[180px]"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium"
            >
              <SlidersHorizontal size={16} /> Filters
            </button>

          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="flex gap-8">
          {/* ==================== SIDEBAR FILTERS ==================== */}
          <aside className={cn(
            "w-64 shrink-0 space-y-6",
            showFilters ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto md:static md:bg-transparent md:p-0" : "hidden md:block"
          )}>
            {/* Mobile Header */}
            <div className="flex items-center justify-between md:hidden">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {/* Category Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Category</h3>
              <div className="space-y-1">
                {apiCategories.map((cat: any) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                      selectedCategory === cat.slug
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h3>
              <div className="space-y-1">
                {priceRanges.map((range, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPrice(i)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                      selectedPrice === i
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Rating</h3>
              <div className="space-y-1">
                {[0, 4, 4.5].map(r => (
                  <button
                    key={r}
                    onClick={() => setSelectedRating(r)}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all",
                      selectedRating === r
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    {r === 0 ? "All Ratings" : (
                      <>{r}+ <Star size={12} className="text-amber-500 fill-amber-500" /></>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSelectedCategory("All");
                setSelectedPrice(0);
                setSelectedRating(0);
                setSearchQuery("");
              }}
              className="w-full py-2.5 text-sm font-medium text-violet-600 border border-violet-200 rounded-xl hover:bg-violet-50 transition-colors"
            >
              Clear All Filters
            </button>

            {/* Dynamic Sidebar Banners */}
            {banners.length > 0 && (
              <div className="hidden md:block">
                <BannerCarousel 
                  banners={banners} 
                  className="w-full h-auto shadow-lg hover:scale-[1.01] transition-transform" 
                />
              </div>
            )}
          </aside>

          {/* ==================== RESULTS ==================== */}
          <div className="flex-1">
            {/* Active Filters */}
            {(selectedCategory !== "All" || selectedPrice > 0 || selectedRating > 0 || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-sm text-gray-500">Active filters:</span>
                {selectedCategory !== "All" && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                    {apiCategories.find((c: any) => c.slug === selectedCategory)?.name || selectedCategory}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedCategory("All")} />
                  </span>
                )}
                {selectedPrice > 0 && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                    {priceRanges[selectedPrice].label}
                    <X size={12} className="cursor-pointer" onClick={() => setSelectedPrice(0)} />
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-violet-50 text-violet-700 text-xs font-medium rounded-full">
                    "{searchQuery}"
                    <X size={12} className="cursor-pointer" onClick={() => setSearchQuery("")} />
                  </span>
                )}
              </div>
            )}

            {/* Results Count */}
            <p className="text-sm text-gray-500 mb-4">
              Showing {totalServices} services
            </p>

            {/* Service Grid */}
            {isLoading ? (
              <div className="gap-4 md:gap-5 grid grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white border border-gray-100 rounded-2xl h-80 animate-pulse"></div>
                ))}
              </div>
            ) : displayServices.length > 0 ? (
              <div className="gap-4 md:gap-5 grid grid-cols-2 lg:grid-cols-3">
                {displayServices.map((service: any) => (
                  <ServiceCard key={service.id} {...service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-6xl mb-4">🔍</p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedPrice(0);
                    setSelectedRating(0);
                    setSearchQuery("");
                  }}
                  className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

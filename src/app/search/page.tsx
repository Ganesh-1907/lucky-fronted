"use client";

import { useState, Suspense } from "react";
import { Search, ChevronRight, Star, SlidersHorizontal, MapPin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import ServiceCard from "@/components/cards/ServiceCard";

const searchResults = [
  { id: 1, title: "Premium Birthday Balloon Decoration", slug: "premium-birthday-balloon-decoration", basePrice: 4999, discountPrice: 3999, images: [], avgRating: 4.5, reviewCount: 128, isTrending: true, isBestSeller: true, category: { name: "Balloon Decorations", slug: "balloon-decorations" }, vendor: { businessName: "Dream Decorators", avgRating: 4.7 } },
  { id: 2, title: "Kids Birthday Theme Party Setup", slug: "kids-birthday-theme-party-setup", basePrice: 7999, discountPrice: 5999, images: [], avgRating: 4.6, reviewCount: 72, isTrending: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Party Kings", avgRating: 4.5 } },
  { id: 3, title: "Birthday Cake - Custom Design", slug: "birthday-cake-custom", basePrice: 1999, discountPrice: 1499, images: [], avgRating: 4.4, reviewCount: 234, isBestSeller: true, category: { name: "Cakes", slug: "cakes" }, vendor: { businessName: "Sweet Bliss", avgRating: 4.6 } },
  { id: 4, title: "Neon Birthday Setup", slug: "neon-birthday-setup", basePrice: 6999, discountPrice: 5499, images: [], avgRating: 4.7, reviewCount: 38, isNewArrival: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Glow Events", avgRating: 4.8 } },
  { id: 5, title: "Simple Birthday Decoration", slug: "simple-birthday-decoration", basePrice: 1499, discountPrice: null, images: [], avgRating: 4.2, reviewCount: 89, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Quick Decor", avgRating: 4.3 } },
  { id: 6, title: "Birthday Room Decoration", slug: "birthday-room-decoration", basePrice: 2999, discountPrice: 2499, images: [], avgRating: 4.5, reviewCount: 156, isFeatured: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Dream Decorators", avgRating: 4.7 } },
];

const popularSearches = ["Birthday", "Wedding", "Anniversary", "Candlelight", "Balloon", "Cake", "Surprise"];

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);

  const filtered = query
    ? searchResults.filter(s => s.title.toLowerCase().includes(query.toLowerCase()))
    : searchResults;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for birthday decorations, wedding setups..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-base shadow-sm focus:outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all"
              autoFocus
            />
          </div>

          {/* Popular Searches */}
          <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
            <span className="text-sm text-gray-500">Popular:</span>
            {popularSearches.map(term => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:border-violet-300 hover:text-violet-600 transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {query ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing <strong>{filtered.length}</strong> results for <strong>&ldquo;{query}&rdquo;</strong>
              </p>
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filtered.map(service => (
                  <ServiceCard key={service.id} {...service} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500 text-sm mb-6">Try a different search term or browse our categories</p>
                <Link href="/services" className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm inline-block">
                  Browse All Services
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">✨</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-500 text-sm">Find the perfect service for your celebration</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <SearchContent />
    </Suspense>
  );
}

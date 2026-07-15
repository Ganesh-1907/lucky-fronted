"use client";

import { useState, Suspense } from "react";
import { Search, ChevronRight, Star, SlidersHorizontal, MapPin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import ServiceCard from "@/components/cards/ServiceCard";

const popularSearches = ["Birthday", "Wedding", "Anniversary", "Candlelight", "Balloon", "Cake", "Surprise"];

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);

  const { data, isLoading } = useQuery({
    queryKey: ["search", query],
    queryFn: () => api.get<{ data: any[] }>(`/api/services?search=${encodeURIComponent(query)}&limit=20`),
    enabled: !!query,
  });

  const results = data?.data || [];

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
                Showing <strong>{results.length}</strong> results for <strong>&ldquo;{query}&rdquo;</strong>
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto" />
                <p className="text-gray-500 mt-4">Searching...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {results.map((service: any) => (
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

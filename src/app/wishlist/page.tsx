"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ChevronRight, ShoppingBag, Star, MapPin } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const wishlistItems = [
  { id: 1, title: "Premium Birthday Balloon Decoration", slug: "premium-birthday-balloon-decoration", basePrice: 4999, discountPrice: 3999, images: [], avgRating: 4.5, reviewCount: 128, category: { name: "Balloon Decorations" }, vendor: { businessName: "Dream Decorators" } },
  { id: 2, title: "Romantic Candlelight Dinner Setup", slug: "romantic-candlelight-dinner-setup", basePrice: 5999, discountPrice: 4499, images: [], avgRating: 4.8, reviewCount: 89, category: { name: "Candlelight Dinner" }, vendor: { businessName: "Dream Decorators" } },
  { id: 3, title: "Royal Wedding Stage Decoration", slug: "royal-wedding-stage-decoration", basePrice: 49999, discountPrice: 39999, images: [], avgRating: 4.9, reviewCount: 56, category: { name: "Wedding Decorations" }, vendor: { businessName: "Dream Decorators" } },
];

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const [items, setItems] = useState(wishlistItems);

  const removeItem = (id: number) => {
    setItems(items.filter(i => i.id !== id));
  };

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">Wishlist</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
          <Heart size={24} className="inline text-red-500 fill-red-500 mr-2 mb-1" />
          My Wishlist ({items.length})
        </h1>

        {items.length > 0 ? (
          <div className="space-y-4">
            {items.map(item => {
              const discount = calculateDiscount(item.basePrice, item.discountPrice);
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col sm:flex-row gap-4 hover:shadow-md transition-shadow">
                  <div className="w-full sm:w-32 h-32 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-4xl">🎈</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-violet-600 font-medium uppercase mb-1">{item.category.name}</p>
                    <Link href={`/service/${item.slug}`} className="font-semibold text-gray-900 hover:text-violet-600 transition-colors text-lg">
                      {item.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin size={12} /> {item.vendor.businessName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Star size={13} className="text-amber-500 fill-amber-500" />
                      <span className="text-sm font-medium">{item.avgRating}</span>
                      <span className="text-xs text-gray-400">({item.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-end gap-3 mt-3">
                      <span className="text-xl font-bold text-gray-900">{formatPrice(item.discountPrice || item.basePrice)}</span>
                      {discount > 0 && (
                        <>
                          <span className="text-sm text-gray-400 line-through mb-0.5">{formatPrice(item.basePrice)}</span>
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md mb-0.5">{discount}% OFF</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center gap-2 shrink-0">
                    <Link href={`/service/${item.slug}`} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90">
                      <ShoppingBag size={14} /> Book Now
                    </Link>
                    <button onClick={() => removeItem(item.id)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50">
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-5xl mb-4">💔</p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 text-sm mb-6">Browse services and add your favorites here</p>
            <Link href="/services" className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm inline-block">
              Browse Services
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

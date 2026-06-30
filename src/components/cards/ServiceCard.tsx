"use client";

import Link from "next/link";
import { Heart, Star, MapPin } from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";

interface ServiceCardProps {
  id: number;
  title: string;
  slug: string;
  basePrice: number;
  discountPrice?: number | null;
  images: string[];
  avgRating: number;
  reviewCount: number;
  isTrending?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  category?: { name: string; slug: string };
  vendor?: { businessName: string; avgRating: number };
  className?: string;
}

export default function ServiceCard({
  title, slug, basePrice, discountPrice,
  images, avgRating, reviewCount,
  isTrending, isBestSeller, isNewArrival, isFeatured,
  category, vendor, className,
}: ServiceCardProps) {
  const discount = calculateDiscount(Number(basePrice), discountPrice != null ? Number(discountPrice) : null);
  const displayPrice = discountPrice ? Number(discountPrice) : Number(basePrice);
  const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
  const imageUrl = parsedImages?.[0] || "/placeholder.jpg";

  return (
    <Link
      href={`/service/${slug}`}
      className={cn(
        "group block bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <div
          className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundColor: "#f3f0ff",
          }}
        >
          {/* Gradient placeholder for missing images */}
          {!parsedImages?.length && (
            <div className="w-full h-full gradient-primary opacity-20 flex items-center justify-center">
              <span className="text-6xl">🎉</span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isTrending && (
            <span className="badge-trending text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              🔥 Trending
            </span>
          )}
          {isBestSeller && (
            <span className="badge-bestseller text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              ⭐ Best Seller
            </span>
          )}
          {isNewArrival && (
            <span className="badge-new text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              ✨ New
            </span>
          )}
          {isFeatured && !isTrending && !isBestSeller && (
            <span className="badge-featured text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Featured
            </span>
          )}
        </div>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
            {discount}% OFF
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // TODO: Toggle wishlist
          }}
          className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
        >
          <Heart size={16} className="text-gray-500 hover:text-red-500" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {category && (
          <p className="text-[11px] font-medium text-violet-600 uppercase tracking-wider mb-1">
            {category.name}
          </p>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 mb-2 group-hover:text-violet-600 transition-colors">
          {title}
        </h3>

        {/* Vendor */}
        {vendor && (
          <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
            <MapPin size={11} />
            {vendor.businessName}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5 bg-green-50 px-2 py-0.5 rounded-md">
            <Star size={12} className="text-green-600 fill-green-600" />
            <span className="text-xs font-bold text-green-700">
              {Number(avgRating) > 0 ? Number(avgRating).toFixed(1) : "New"}
            </span>
          </div>
          {reviewCount > 0 && (
            <span className="text-xs text-gray-400">
              ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
            </span>
          )}
        </div>

        {/* Price */}
        <div className="flex items-end gap-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(displayPrice)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through mb-0.5">
              {formatPrice(Number(basePrice))}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

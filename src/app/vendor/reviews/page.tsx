"use client";

import { Star, MessageSquare, ThumbsUp, Flag, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function VendorReviewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["vendor", "reviews"],
    queryFn: () => api.get<any>("/vendors/reviews"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  const d = data || {};
  const statsData = d.stats || {};
  const avgRating = statsData.avgRating || 0;
  const totalReviews = statsData.total || 0;
  const breakdown = statsData.breakdown || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  const reviews: any[] = d.reviews || [];

  const ratingBars = [
    { stars: 5, count: breakdown["5"] || 0 },
    { stars: 4, count: breakdown["4"] || 0 },
    { stars: 3, count: breakdown["3"] || 0 },
    { stars: 2, count: breakdown["2"] || 0 },
    { stars: 1, count: breakdown["1"] || 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">See what your customers say about your services</p>
      </div>

      {/* Rating Overview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Overall */}
          <div className="text-center md:text-left flex flex-col items-center md:items-start justify-center">
            <div className="flex items-end gap-2">
              <span className="text-5xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{avgRating}</span>
              <span className="text-lg text-gray-400 mb-2">/5</span>
            </div>
            <div className="flex items-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className={i < Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
              ))}
            </div>
            <p className="text-sm text-gray-500">{totalReviews} total reviews</p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-2">
            {ratingBars.map(bar => (
              <div key={bar.stars} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-12 flex items-center gap-1">
                  {bar.stars} <Star size={11} className="text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${totalReviews > 0 ? (bar.count / totalReviews) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{bar.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review: any) => (
          <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">{(review.client || review.customer || "?")[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{review.client || review.customer}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={11} className={j < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{review.createdAt || review.date}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{review.service}</span>
            </div>

            <div className="mt-3 ml-[52px]">
              {review.title && <p className="font-semibold text-sm text-gray-900">{review.title}</p>}
              <p className="text-sm text-gray-600 mt-1">{review.comment || review.review}</p>

              {/* Vendor Reply */}
              {review.reply && (
                <div className="mt-3 bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                  <p className="text-xs font-medium text-emerald-700 mb-0.5">Your Reply</p>
                  <p className="text-sm text-emerald-800">{review.reply}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-3">
                {!review.reply && (
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-600 border border-emerald-200 hover:bg-emerald-50">
                    <MessageSquare size={12} /> Reply
                  </button>
                )}
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 border border-gray-200 hover:bg-gray-50">
                  <ThumbsUp size={12} /> Helpful
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

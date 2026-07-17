"use client";

import { Star, MessageSquare, Loader2 } from "lucide-react";
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
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading your reviews...</p>
      </div>
    );
  }

  const d = data?.data || {};
  const stats = d.stats || {};
  const avgRating = Number(stats.avgRating) || 0;
  const totalReviews = Number(stats.totalReviews) || 0;
  const breakdown = stats.breakdown || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const reviews: any[] = d.reviews || [];

  const ratingBars = [
    { stars: 5, count: Number(breakdown["5"]) || 0 },
    { stars: 4, count: Number(breakdown["4"]) || 0 },
    { stars: 3, count: Number(breakdown["3"]) || 0 },
    { stars: 2, count: Number(breakdown["2"]) || 0 },
    { stars: 1, count: Number(breakdown["1"]) || 0 },
  ];

  return (
    <div className="space-y-6 max-w-[900px] mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">See what your customers are saying about your services.</p>
      </div>

      {/* Rating Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="grid md:grid-cols-[1fr_2fr] gap-10 items-center">
          {/* Overall Score */}
          <div className="text-center flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Rating</h2>
            <div className="flex items-end gap-1 mb-3">
              <span className="text-6xl font-bold text-gray-900 leading-none" style={{ fontFamily: "var(--font-outfit)" }}>
                {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-xl text-gray-400 font-medium mb-1">/5</span>
            </div>
            <div className="flex items-center gap-1.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={22} className={cn(
                  i < Math.round(avgRating) ? "text-amber-500 fill-amber-500" : "text-gray-200 fill-gray-100"
                )} />
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">{totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'}</p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-3">
            {ratingBars.map(bar => {
              const percentage = totalReviews > 0 ? (bar.count / totalReviews) * 100 : 0;
              return (
                <div key={bar.stars} className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 w-12 shrink-0">
                    <span className="text-sm font-bold text-gray-700">{bar.stars}</span>
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                  </div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${percentage}%` }} 
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-500 w-10 text-right">{bar.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Recent Reviews</h3>
        
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <Star size={32} className="text-gray-300" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No reviews yet</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">When customers book and complete your services, their reviews will appear here.</p>
          </div>
        ) : (
          reviews.map((review: any) => {
            const clientName = review.client?.name || "Guest User";
            const initial = clientName.charAt(0).toUpperCase();
            
            return (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {review.client?.avatar ? (
                      <img src={review.client.avatar} alt={clientName} className="w-12 h-12 rounded-full object-cover border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 shadow-inner">
                        <span className="text-white text-lg font-bold">{initial}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-sm text-gray-900">{clientName}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={12} className={j < review.rating ? "text-amber-500 fill-amber-500" : "text-gray-200 fill-gray-100"} />
                          ))}
                        </div>
                        <span className="text-gray-300 mx-1">•</span>
                        <span className="text-xs font-medium text-gray-500">{new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  {review.service?.title && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100 hidden sm:block">
                      {review.service.title}
                    </span>
                  )}
                </div>

                <div className="ml-[64px]">
                  {review.title && <p className="font-bold text-sm text-gray-900 mb-1">{review.title}</p>}
                  <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>

                  {/* Vendor Reply Display */}
                  {review.adminReply && (
                    <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100 relative">
                      <div className="absolute -top-2 left-4 w-4 h-4 bg-gray-50 border-t border-l border-gray-100 rotate-45" />
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1 relative z-10">Response from you</p>
                      <p className="text-sm text-gray-700 relative z-10">{review.adminReply}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {!review.adminReply && (
                    <div className="mt-4">
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                        <MessageSquare size={14} /> Reply to Review
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

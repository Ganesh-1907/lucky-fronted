"use client";

import { Star, MessageSquare, ThumbsUp, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = { avgRating: 4.7, totalReviews: 342, fiveStars: 210, fourStars: 80, threeStars: 30, twoStars: 12, oneStars: 10 };

const reviews = [
  { id: 1, rating: 5, title: "Amazing setup!", comment: "The decorations were absolutely stunning. My daughter loved it! The team was very professional and everything was set up on time.", client: "Priya Sharma", service: "Birthday Balloon Decoration", reply: "Thank you so much, Priya! We're glad your daughter loved it 🎉", createdAt: "2024-03-15" },
  { id: 2, rating: 4, title: "Great value", comment: "Beautiful balloon arch. Would have been perfect with more LED lights.", client: "Rahul Verma", service: "Romantic Candlelight Dinner", reply: null, createdAt: "2024-03-10" },
  { id: 3, rating: 5, title: "Perfect wedding!", comment: "Cannot express in words how beautiful our wedding stage looked!", client: "Anita Patel", service: "Royal Wedding Stage", reply: "Your kind words mean the world to us! Wishing you a lifetime of happiness ❤️", createdAt: "2024-03-09" },
  { id: 4, rating: 3, title: "Decent but late", comment: "Setup was good but the team arrived 30 minutes late.", client: "Vikram Singh", service: "Kids Theme Party", reply: null, createdAt: "2024-03-05" },
];

const ratingBars = [
  { stars: 5, count: stats.fiveStars },
  { stars: 4, count: stats.fourStars },
  { stars: 3, count: stats.threeStars },
  { stars: 2, count: stats.twoStars },
  { stars: 1, count: stats.oneStars },
];

export default function VendorReviewsPage() {
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
              <span className="text-5xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{stats.avgRating}</span>
              <span className="text-lg text-gray-400 mb-2">/5</span>
            </div>
            <div className="flex items-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={20} className={i < Math.round(stats.avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
              ))}
            </div>
            <p className="text-sm text-gray-500">{stats.totalReviews} total reviews</p>
          </div>

          {/* Rating Bars */}
          <div className="space-y-2">
            {ratingBars.map(bar => (
              <div key={bar.stars} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600 w-12 flex items-center gap-1">
                  {bar.stars} <Star size={11} className="text-amber-400 fill-amber-400" />
                </span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(bar.count / stats.totalReviews) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{bar.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">{review.client[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{review.client}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={11} className={j < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{review.createdAt}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{review.service}</span>
            </div>

            <div className="mt-3 ml-[52px]">
              {review.title && <p className="font-semibold text-sm text-gray-900">{review.title}</p>}
              <p className="text-sm text-gray-600 mt-1">{review.comment}</p>

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

"use client";

import { useState } from "react";
import { Search, Star, CheckCircle, XCircle, Eye, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

const reviews = [
  { id: 1, rating: 5, title: "Amazing setup!", comment: "The decorations were absolutely stunning. My daughter loved it! The team was very professional.", client: { name: "Priya Sharma" }, service: "Premium Birthday Balloon Decoration", vendor: "Dream Decorators", isApproved: true, isFlagged: false, createdAt: "2024-03-15" },
  { id: 2, rating: 4, title: "Great value for money", comment: "Beautiful balloon arch and the LED lights added a magical touch.", client: { name: "Rahul Verma" }, service: "Romantic Candlelight Dinner", vendor: "Dream Decorators", isApproved: true, isFlagged: false, createdAt: "2024-03-10" },
  { id: 3, rating: 2, title: "Not satisfied", comment: "The setup was late and some balloons were deflated. Expected better quality.", client: { name: "Vikram Singh" }, service: "Kids Theme Party", vendor: "Party Kings", isApproved: false, isFlagged: true, createdAt: "2024-03-14" },
  { id: 4, rating: 5, title: "Perfect wedding!!", comment: "Cannot express in words how beautiful our wedding stage looked. Dream Decorators are the best!", client: { name: "Anita Patel" }, service: "Royal Wedding Stage", vendor: "Dream Decorators", isApproved: false, isFlagged: false, createdAt: "2024-03-09" },
  { id: 5, rating: 1, title: "Terrible experience", comment: "Vendor didn't show up and customer service was unhelpful. Want full refund.", client: { name: "Meera Joshi" }, service: "Simple Anniversary Setup", vendor: "Love Setup Co", isApproved: false, isFlagged: true, createdAt: "2024-03-12" },
];

const filters = ["All", "Pending", "Approved", "Flagged"];

export default function AdminReviewsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = reviews.filter(r => {
    if (activeFilter === "Pending" && r.isApproved) return false;
    if (activeFilter === "Approved" && !r.isApproved) return false;
    if (activeFilter === "Flagged" && !r.isFlagged) return false;
    if (search && !r.client.name.toLowerCase().includes(search.toLowerCase()) && !r.comment.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Review Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Moderate customer reviews</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2">
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeFilter === f ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {f}
                {f === "Pending" && <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{reviews.filter(r => !r.isApproved).length}</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.map(review => (
          <div key={review.id} className={cn("bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow",
            review.isFlagged ? "border-red-200" : "border-gray-100"
          )}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">{review.client.name[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{review.client.name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={12} className={j < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    ))}
                    <span className="text-xs text-gray-400 ml-1">{review.createdAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {review.isFlagged && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                    <Flag size={10} /> Flagged
                  </span>
                )}
                {review.isApproved ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Approved</span>
                ) : (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>
                )}
              </div>
            </div>

            <div className="mt-3 ml-[52px]">
              <p className="text-xs text-gray-500 mb-1">
                <strong>{review.service}</strong> by {review.vendor}
              </p>
              {review.title && <p className="font-semibold text-sm text-gray-900">{review.title}</p>}
              <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
            </div>

            {!review.isApproved && (
              <div className="flex gap-2 mt-3 ml-[52px]">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700">
                  <CheckCircle size={12} /> Approve
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700">
                  <XCircle size={12} /> Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

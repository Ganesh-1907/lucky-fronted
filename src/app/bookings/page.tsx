"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Calendar, Clock, MapPin, Eye, X, Star, Download } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useMyBookings, useCreateReview } from "@/hooks/useApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const statusFilters = ["All", "PENDING", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED: "bg-blue-100 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-violet-100 text-violet-700 border-violet-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-red-100 text-red-700 border-red-200",
};
const emojiMap: Record<string, string> = {
  PENDING: "⏳", CONFIRMED: "✅", IN_PROGRESS: "🔄", COMPLETED: "🎉", CANCELLED: "❌",
};

export default function BookingsPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("All");
  const [reviewModal, setReviewModal] = useState<{ isOpen: boolean; bookingId?: number }>({ isOpen: false });
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  
  const { data, isLoading } = useMyBookings(activeFilter);
  const createReview = useCreateReview();
  const fetchedBookings = data?.data || (data as any)?.pagination ? (data as any).data : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">My Bookings</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
          My Bookings
        </h1>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-6">
          {statusFilters.map(s => (
            <button key={s} onClick={() => setActiveFilter(s)}
              className={cn("px-4 py-2 rounded-full text-sm font-medium transition-all border",
                activeFilter === s ? "bg-violet-100 text-violet-700 border-violet-200" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              )}>
              {s === "All" ? "All Bookings" : `${emojiMap[s] || ""} ${s.replace("_", " ")}`}
            </button>
          ))}
        </div>

        {/* Booking Cards */}
        <div className="space-y-4">
          {fetchedBookings.length > 0 ? fetchedBookings.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Image */}
                  <div className="w-full sm:w-28 h-28 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-4xl">🎈</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <Link href={`/service/${booking.service?.slug}`} className="font-semibold text-gray-900 hover:text-violet-600 transition-colors">
                          {booking.service?.title || "Unknown Service"}
                        </Link>
                        <p className="text-xs text-gray-500 mt-0.5">by {booking.vendor?.businessName}</p>
                      </div>
                      <span className={cn("text-[10px] font-bold px-3 py-1 rounded-full uppercase border shrink-0", statusColors[booking.status] || statusColors.PENDING)}>
                        {booking.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{new Date(booking.bookingDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock size={13} className="text-gray-400" />
                        <span>{booking.timeSlot}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin size={13} className="text-gray-400" />
                        <span>{booking.city}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-bold text-gray-900">{formatPrice(Number(booking.totalAmount))}</span>
                      </div>
                    </div>

                    {/* Payment Progress */}
                    <div className="mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-gray-500">Payment: {formatPrice(Number(booking.advancePaid))} of {formatPrice(Number(booking.totalAmount))}</span>
                        <span className="font-medium text-gray-700">{Math.round((Number(booking.advancePaid) / Number(booking.totalAmount)) * 100) || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${(Number(booking.advancePaid) / Number(booking.totalAmount)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Booking #{booking.bookingNumber} · Booked on {new Date(booking.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    {Number(booking.remainingAmount) > 0 && booking.status !== "CANCELLED" && (
                      <button className="px-4 py-2 rounded-lg gradient-primary text-white text-xs font-medium hover:opacity-90 transition-opacity">
                        Pay Remaining {formatPrice(Number(booking.remainingAmount))}
                      </button>
                    )}
                    {booking.status === "COMPLETED" && !booking.review && (
                      <button 
                        onClick={() => {
                          setReviewModal({ isOpen: true, bookingId: booking.id });
                          setReviewForm({ rating: 5, title: "", comment: "" });
                        }} 
                        className="flex items-center gap-1 px-4 py-2 rounded-lg border border-amber-200 text-amber-700 text-xs font-medium hover:bg-amber-50"
                      >
                        <Star size={12} /> Write Review
                      </button>
                    )}
                    {booking.status === "COMPLETED" && booking.review && (
                      <span className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-50 text-gray-500 text-xs font-medium border border-gray-100">
                        <Star size={12} className="fill-gray-400 text-gray-400" /> Reviewed
                      </span>
                    )}
                    {booking.status === "PENDING" && (
                      <button className="px-4 py-2 rounded-lg border border-red-200 text-red-600 text-xs font-medium hover:bg-red-50">
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-5xl mb-4">📦</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-500 text-sm mb-6">You haven&apos;t made any bookings yet</p>
              <Link href="/services" className="px-6 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm inline-block">
                Browse Services
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewModal({ isOpen: false })} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Write a Review</h3>
                <button onClick={() => setReviewModal({ isOpen: false })} className="p-1 rounded-full hover:bg-gray-100 text-gray-400">
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star size={28} className={cn(star <= reviewForm.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200")} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                  <input 
                    type="text" 
                    value={reviewForm.title} 
                    onChange={e => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="E.g., Amazing service!" 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                  <textarea 
                    rows={4} 
                    value={reviewForm.comment} 
                    onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience with this service..." 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none" 
                  />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3 justify-end">
                <button 
                  onClick={() => setReviewModal({ isOpen: false })} 
                  disabled={createReview.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    try {
                      await createReview.mutateAsync({
                        bookingId: reviewModal.bookingId!,
                        ...reviewForm
                      });
                      toast.success("Review submitted! It will appear once approved.");
                      setReviewModal({ isOpen: false });
                    } catch (err: any) {
                      toast.error(err?.message || "Failed to submit review");
                    }
                  }} 
                  disabled={createReview.isPending || !reviewForm.comment.trim()} 
                  className="px-6 py-2 rounded-xl text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {createReview.isPending ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

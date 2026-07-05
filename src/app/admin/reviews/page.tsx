"use client";

import { useState, useMemo } from "react";
import { Search, Star, CheckCircle, XCircle, Flag, Loader, MessageSquareOff, ChevronLeft, ChevronRight, Ban, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminReviews, useUpdateReviewStatus } from "@/hooks/useApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const filters = ["All", "PENDING", "APPROVED"];

export default function AdminReviewsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalState, setModalState] = useState<{ type: "APPROVE" | "REJECT" | null; reviewId: number | null }>({ type: null, reviewId: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  // Fetch reviews from API
  const { data, isLoading, error } = useAdminReviews();
  const updateReviewStatus = useUpdateReviewStatus();

  const reviews = Array.isArray(data) ? data : (data?.data || []);

  const filteredAndSorted = useMemo(() => {
    let result = reviews.filter((r: any) => {
      // Map API fields, fallback to old mock structure logic just in case
      const status = r.status || (r.isApproved ? "APPROVED" : "PENDING");
      
      if (activeFilter !== "All" && status !== activeFilter) return false;
      
      const clientName = r.user?.name || r.client?.name || "";
      const commentText = r.comment || r.content || "";
      
      if (search && !clientName.toLowerCase().includes(search.toLowerCase()) && !commentText.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sortKey === "highest_rated") result.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
    else if (sortKey === "lowest_rated") result.sort((a: any, b: any) => (a.rating || 0) - (b.rating || 0));
    else result.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    
    return result;
  }, [reviews, search, activeFilter, sortKey]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginated = filteredAndSorted.slice((page - 1) * pageSize, page * pageSize);

  const handleAction = async () => {
    if (!modalState.reviewId || !modalState.type) return;
    
    try {
      setActionLoading(true);
      await updateReviewStatus.mutateAsync({ 
        id: modalState.reviewId, 
        isApproved: modalState.type === "APPROVE"
      });
      toast.success(`Review ${modalState.type.toLowerCase()} successfully`);
      setModalState({ type: null, reviewId: null });
    } catch (err: any) {
      toast.error(err?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Review Moderation</h1>
        <p className="text-sm text-gray-500 mt-1">Moderate and manage customer reviews across all services</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by customer name or review text..." value={search} onChange={e => {setSearch(e.target.value); setPage(1);}}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            {filters.map(f => (
              <button key={f} onClick={() => {setActiveFilter(f); setPage(1);}}
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                  activeFilter === f ? "bg-violet-100 text-violet-700" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                )}>
                {f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
            <select value={sortKey} onChange={e => {setSortKey(e.target.value); setPage(1);}} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-700 focus:outline-none">
              <option value="newest">Newest First</option>
              <option value="highest_rated">Highest Rated (5★)</option>
              <option value="lowest_rated">Lowest Rated (1★)</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex items-center justify-center">
          <div className="text-center">
            <Loader size={32} className="mx-auto mb-3 text-violet-500 animate-spin" />
            <p className="text-gray-500">Loading reviews...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-red-700">Failed to load reviews. Please try again.</p>
        </div>
      )}

      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {paginated.length > 0 ? paginated.map((review: any) => {
            const status = review.status || (review.isApproved ? "APPROVED" : "PENDING");
            const clientName = review.user?.name || review.client?.name || "Unknown User";
            
            return (
              <div key={review.id} className={cn("bg-white rounded-2xl border p-5 hover:shadow-md transition-shadow",
                review.isFlagged ? "border-red-200" : "border-gray-100"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">{clientName[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{clientName}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={12} className={j < (review.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                        ))}
                        <span className="text-xs text-gray-400 ml-1">{new Date(review.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {review.isFlagged && (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Flag size={10} /> Flagged
                      </span>
                    )}
                    {status === "APPROVED" && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Approved</span>}
                    {status === "PENDING" && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Pending</span>}
                    
                    <div className="relative">
                      <button onClick={() => setOpenDropdown(openDropdown === review.id ? null : review.id)} className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={16} />
                      </button>
                      {openDropdown === review.id && (
                        <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                          {status === "PENDING" ? (
                            <button onClick={() => { setModalState({ type: "APPROVE", reviewId: review.id }); setOpenDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center gap-2">
                              <CheckCircle size={14} /> Approve Review
                            </button>
                          ) : (
                            <button onClick={() => { setModalState({ type: "REJECT", reviewId: review.id }); setOpenDropdown(null); }} className="w-full text-left px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2">
                              <Ban size={14} /> Hide Review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-3 ml-[52px]">
                  <p className="text-xs text-gray-500 mb-1">
                    <strong>{(() => {
                      const s = review.service?.title || (typeof review.service === 'string' ? review.service : null);
                      return (!s || s === 'undefined') ? 'Unknown Service' : s;
                    })()}</strong> by {(() => {
                      const v = review.service?.vendor?.businessName || review.vendor?.businessName || (typeof review.vendor === 'string' ? review.vendor : null);
                      return (!v || v === 'undefined') ? 'Unknown Vendor' : v;
                    })()}
                  </p>
                  {review.title && <p className="font-semibold text-sm text-gray-900">{review.title}</p>}
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{review.comment || review.content}</p>
                </div>


              </div>
            );
          }) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
              <MessageSquareOff size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-lg font-medium">No reviews found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredAndSorted.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Rows per page:</span>
                <select value={pageSize} onChange={e => {setPageSize(Number(e.target.value)); setPage(1);}} className="text-sm border border-gray-200 rounded-md p-1 bg-white outline-none">
                  {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, filteredAndSorted.length)} of {filteredAndSorted.length}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 border border-transparent">
                    <ChevronLeft size={16} />
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 border border-transparent">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <MessageSquareOff size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 text-lg font-medium">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">There are no customer reviews on the platform right now.</p>
        </div>
      )}

      {/* Action Modals */}
      <AnimatePresence>
        {modalState.type && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalState({ type: null, reviewId: null })} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {modalState.type === "APPROVE" ? "Approve Review" : "Hide Review"}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {modalState.type === "APPROVE" ? "Are you sure you want to approve this review? It will become visible on the public service page." : 
                 "Are you sure you want to hide this review? It will be hidden from the public platform and put back in the pending queue."}
              </p>
              
              <div className="flex gap-3 justify-end">
                <button onClick={() => setModalState({ type: null, reviewId: null })} disabled={actionLoading} className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAction} disabled={actionLoading} className={cn("px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors flex items-center gap-2", 
                  modalState.type === "APPROVE" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}>
                  {actionLoading && <Loader size={16} className="animate-spin" />}
                  {modalState.type === "APPROVE" ? "Approve Review" : "Hide Review"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

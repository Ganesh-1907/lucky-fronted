"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Copy, ToggleLeft, ToggleRight, X, Loader2, Info } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useAdminCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/hooks/useApi";
import toast from "react-hot-toast";

export default function AdminCouponsPage() {
  const { data, isLoading } = useAdminCoupons();
  const coupons = data?.data || [];

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrder: "",
    maxDiscount: "",
    usageLimit: "",
    validFrom: "",
    validTo: "",
    description: "",
    isActive: true,
  });

  const handleEdit = (coupon: any) => {
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value?.toString() || "",
      minOrder: coupon.minOrder?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : "",
      validTo: coupon.validTo ? new Date(coupon.validTo).toISOString().split('T')[0] : "",
      description: coupon.description || "",
      isActive: coupon.isActive,
    });
    setEditId(coupon.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      type: "PERCENTAGE",
      value: "",
      minOrder: "",
      maxDiscount: "",
      usageLimit: "",
      validFrom: "",
      validTo: "",
      description: "",
      isActive: true,
    });
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.code || !formData.value || !formData.validFrom || !formData.validTo) {
        toast.error("Please fill all required fields");
        return;
      }

      const payload = {
        ...formData,
        code: formData.code.toUpperCase().replace(/\s+/g, ''),
        value: Number(formData.value),
        minOrder: formData.minOrder ? Number(formData.minOrder) : null,
        maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      };

      if (editId) {
        await updateCoupon.mutateAsync({ id: editId, data: payload });
        toast.success("Coupon updated successfully");
      } else {
        await createCoupon.mutateAsync(payload);
        toast.success("Coupon created successfully");
      }
      resetForm();
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    }
  };

  const handleToggle = async (coupon: any) => {
    try {
      await updateCoupon.mutateAsync({ id: coupon.id, data: { isActive: !coupon.isActive } });
      toast.success(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCoupon.mutateAsync(deleteId);
      toast.success("Coupon deleted permanently");
      setDeleteId(null);
    } catch (error: any) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">Manage platform discount codes and offers</p>
        </div>
        <button onClick={() => {resetForm(); setShowForm(!showForm);}} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm animate-fade-in">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-gray-900 text-lg">{editId ? 'Edit' : 'Create New'} Coupon</h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Code *</label>
              <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="e.g. WELCOME20" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Type *</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Value *</label>
              <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} placeholder={formData.type === 'PERCENTAGE' ? "20" : "500"} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum Order Amount</label>
              <input type="number" value={formData.minOrder} onChange={e => setFormData({...formData, minOrder: e.target.value})} placeholder="999" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max Discount (for %)</label>
              <input type="number" value={formData.maxDiscount} onChange={e => setFormData({...formData, maxDiscount: e.target.value})} placeholder="500" disabled={formData.type === 'FIXED'} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 disabled:bg-gray-50 disabled:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usage Limit (Total Users)</label>
              <input type="number" value={formData.usageLimit} onChange={e => setFormData({...formData, usageLimit: e.target.value})} placeholder="1000" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valid From *</label>
              <input type="date" value={formData.validFrom} onChange={e => setFormData({...formData, validFrom: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valid To *</label>
              <input type="date" value={formData.validTo} onChange={e => setFormData({...formData, validTo: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white" />
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Public description shown to users..." className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
          </div>
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100">
            <button onClick={handleSubmit} disabled={createCoupon.isPending || updateCoupon.isPending} className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-bold flex items-center gap-2">
              {(createCoupon.isPending || updateCoupon.isPending) ? <Loader2 size={16} className="animate-spin" /> : null}
              {editId ? 'Save Changes' : 'Create Coupon'}
            </button>
            <button onClick={resetForm} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-violet-500 w-8 h-8" />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {coupons.map((coupon: any) => {
            const isExpired = new Date() > new Date(coupon.validTo);
            const isFullyUsed = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
            const statusClass = !coupon.isActive ? "opacity-60 grayscale-[50%]" : isExpired || isFullyUsed ? "opacity-75" : "";

            return (
              <div key={coupon.id} className={cn("bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all", statusClass)}>
                <div className="flex flex-col sm:flex-row justify-between gap-5">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn("px-4 py-2.5 rounded-xl border-2 border-dashed flex-shrink-0", coupon.isActive && !isExpired ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-gray-50 border-gray-200 text-gray-500")}>
                      <span className="text-lg font-mono font-bold tracking-wider">{coupon.code}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 leading-tight">{coupon.description || "No description provided"}</h4>
                      <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2 text-xs font-medium text-gray-500">
                        <span className="text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md">
                          {coupon.type === "PERCENTAGE" ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                        </span>
                        {coupon.minOrder && <span>Min: {formatPrice(coupon.minOrder)}</span>}
                        {coupon.maxDiscount && coupon.type === 'PERCENTAGE' && <span>Max: {formatPrice(coupon.maxDiscount)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between min-w-[140px] border-l border-gray-100 pl-5">
                    <div className="text-right w-full">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-500 font-medium">Uses</span>
                        <span className="font-bold text-gray-900">{coupon.usedCount} / {coupon.usageLimit || '∞'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${Math.min(((coupon.usedCount / (coupon.usageLimit || 1)) * 100), 100)}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {new Date(coupon.validFrom).toLocaleDateString()} - {new Date(coupon.validTo).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 mt-4">
                      <button onClick={() => {navigator.clipboard.writeText(coupon.code); toast.success("Code copied");}} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title="Copy code">
                        <Copy size={16} />
                      </button>
                      <button onClick={() => handleEdit(coupon)} className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleToggle(coupon)} className={cn("p-2 rounded-lg transition-colors", coupon.isActive ? "text-emerald-600 hover:bg-emerald-50" : "text-gray-400 hover:bg-gray-100")} title="Toggle Status">
                        {coupon.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button onClick={() => setDeleteId(coupon.id)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                
                {(isExpired || isFullyUsed) && (
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2 text-xs font-semibold text-orange-600">
                    <Info size={14} /> 
                    {isExpired ? "This coupon has expired." : "This coupon has reached its usage limit."}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl animate-scale-up text-center">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Coupon?</h3>
            <p className="text-sm text-gray-500 mb-6">This action is permanent and cannot be undone. Users will no longer be able to use this code.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50">Cancel</button>
              <button onClick={handleDelete} disabled={deleteCoupon.isPending} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center justify-center gap-2">
                {deleteCoupon.isPending ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

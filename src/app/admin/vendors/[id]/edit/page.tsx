"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader, UploadCloud, X, Building2, Landmark, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAdminVendors } from "@/hooks/useApi";
import api from "@/lib/api";

export default function EditVendorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const vendorId = parseInt(resolvedParams.id);
  
  const { data, isLoading } = useAdminVendors();
  const vendors = Array.isArray(data) ? data : (data?.data || []);
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    vendorName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    zipCode: "",
    gstNumber: "",
    panNumber: "",
    registrationNumber: "",
    accountHolder: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vendors.length > 0) {
      const vendor = vendors.find((v: any) => v.id === vendorId);
      if (vendor) {
        setFormData(prev => ({
          ...prev,
          businessName: vendor.businessName || "",
          vendorName: vendor.user?.name || "",
          email: vendor.user?.email || "",
          phone: vendor.user?.phone || "",
          address: vendor.user?.address || "",
          city: vendor.user?.city || "",
        }));
      }
    }
  }, [vendors, vendorId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName) newErrors.businessName = "Business name is required";
    if (!formData.vendorName) newErrors.vendorName = "Vendor name is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = "Valid email is required";
    
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Valid 10-digit phone number required";
    
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = "Invalid GST format";
    }
    
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      newErrors.panNumber = "Invalid PAN format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);
      await api.put(`/admin/vendors/${vendorId}`, formData);
      setLoading(false);
      toast.success("Vendor updated successfully");
      router.push("/admin/vendors");
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("Failed to save changes");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size={32} className="text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/vendors" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Edit Vendor</h1>
            <p className="text-sm text-gray-500">Update vendor details and settings</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/vendors" className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={loading} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-colors flex items-center gap-2 shadow-sm shadow-violet-200">
            {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <Building2 size={20} className="text-violet-500" />
            <h2 className="font-bold text-gray-900">Business Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Business Name *</label>
              <input type="text" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
              {errors.businessName && <p className="text-xs text-red-500">{errors.businessName}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Owner Name *</label>
              <input type="text" value={formData.vendorName} onChange={e => setFormData({...formData, vendorName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
              {errors.vendorName && <p className="text-xs text-red-500">{errors.vendorName}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email Address *</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number *</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Address</label>
              <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">State</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">ZIP Code</label>
              <input type="text" value={formData.zipCode} onChange={e => setFormData({...formData, zipCode: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Country</label>
              <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 transition-all text-sm" />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <FileText size={20} className="text-amber-500" />
            <h2 className="font-bold text-gray-900">Tax & Registration</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">GST Number</label>
              <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} placeholder="e.g. 22AAAAA0000A1Z5" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-sm uppercase" />
              {errors.gstNumber && <p className="text-xs text-red-500">{errors.gstNumber}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">PAN Number</label>
              <input type="text" value={formData.panNumber} onChange={e => setFormData({...formData, panNumber: e.target.value})} placeholder="e.g. ABCDE1234F" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-sm uppercase" />
              {errors.panNumber && <p className="text-xs text-red-500">{errors.panNumber}</p>}
            </div>
            <div className="col-span-full space-y-2">
              <label className="text-sm font-medium text-gray-700">Business Registration Number (CIN/LLPIN)</label>
              <input type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100 transition-all text-sm" />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <Landmark size={20} className="text-green-500" />
            <h2 className="font-bold text-gray-900">Bank Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Account Holder Name</label>
              <input type="text" value={formData.accountHolder} onChange={e => setFormData({...formData, accountHolder: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Account Number</label>
              <input type="password" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">IFSC Code</label>
              <input type="text" value={formData.ifscCode} onChange={e => setFormData({...formData, ifscCode: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm uppercase" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Bank Name</label>
              <input type="text" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Branch Name</label>
              <input type="text" value={formData.branchName} onChange={e => setFormData({...formData, branchName: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all text-sm" />
            </div>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center gap-3">
            <UploadCloud size={20} className="text-blue-500" />
            <h2 className="font-bold text-gray-900">Documents</h2>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["GST Certificate", "PAN Card", "Business License", "Aadhaar Card"].map((doc) => (
              <div key={doc} className="border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-center group hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50/50 relative overflow-hidden">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <UploadCloud size={20} />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{doc}</h3>
                <p className="text-xs text-gray-500">Click to upload or drag & drop</p>
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}

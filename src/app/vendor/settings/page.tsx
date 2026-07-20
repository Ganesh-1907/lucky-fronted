"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Save, Building, DollarSign, Settings, Shield, Loader2,
  Camera, Eye, EyeOff, MapPin
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

const TABS = [
  { id: "business", label: "Business Information", icon: <Building size={16} /> },
  { id: "bank", label: "Bank Details", icon: <DollarSign size={16} /> },
  { id: "preferences", label: "Preferences", icon: <Settings size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
];

export default function VendorSettingsPage() {
  const qc = useQueryClient();
  const { fetchUser, user } = useAuthStore();
  
  const displayTabs = TABS;

  const [activeTab, setActiveTab] = useState("business");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [settings, setSettings] = useState({
    businessName: "",
    description: "",
    logo: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    bankName: "",
    bankAccountName: "",
    accountNumber: "",
    ifscCode: "",
    preferences: {
      autoAccept: false,
      instantBooking: true,
      emailNotifications: true,
      smsNotifications: false
    }
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", "profile"],
    queryFn: () => api.get<any>("/vendors/profile"),
  });

  useEffect(() => {
    if (data?.data) {
      setSettings(prev => ({
        ...prev,
        ...data.data,
        preferences: data.data.preferences || prev.preferences
      }));
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (form: typeof settings) => api.put("/vendors/profile", form),
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      qc.invalidateQueries({ queryKey: ["vendor", "profile"] });
      fetchUser();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save settings");
    },
  });

  const passwordMutation = useMutation({
    mutationFn: (form: any) => api.put("/vendors/password", form),
    onSuccess: () => {
      toast.success("Password updated successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update password");
    },
  });

  const handleSave = () => saveMutation.mutate(settings);

  const handlePasswordSave = () => {
    const isSocial = user?.authProvider && user.authProvider !== 'LOCAL';
    if (!isSocial && !passwordForm.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!passwordForm.newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    passwordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("images", file);
    formData.append("folder", "vendors");

    try {
      const res = await api.uploadFile("/upload/images", formData);
      if (res.success && res.data?.urls?.[0]) {
        setSettings(prev => ({ ...prev, logo: res.data.urls[0] }));
        toast.success("Logo uploaded. Don't forget to save changes!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err: any) {
      toast.error(err.message || "Error uploading image");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="text-gray-500 font-medium">Loading your settings...</p>
      </div>
    );
  }

  const renderBusinessInfo = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-8 mb-8 pb-8 border-b border-gray-100">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative w-32 h-32 rounded-full border-4 border-gray-50 bg-gray-100 overflow-hidden group shadow-sm flex items-center justify-center">
            {settings.logo ? (
              <Image src={settings.logo.startsWith('http') ? settings.logo : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${settings.logo}`} alt="Logo" fill className="object-cover" />
            ) : (
              <Building size={40} className="text-gray-300" />
            )}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? <Loader2 size={24} className="text-white animate-spin" /> : <Camera size={24} className="text-white" />}
              <span className="text-white text-xs font-medium mt-1">{isUploading ? "Uploading..." : "Change Logo"}</span>
            </div>
          </div>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          <p className="text-[11px] text-gray-400 font-medium text-center">Max: 2MB (JPG, PNG)</p>
        </div>

        <div className="flex-1 space-y-5 w-full">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Business Name <span className="text-red-500">*</span></label>
            <input type="text" value={settings.businessName} onChange={e => setSettings({...settings, businessName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea value={settings.description} onChange={e => setSettings({...settings, description: e.target.value})} rows={3}
              placeholder="Briefly describe your business..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors resize-none" />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Primary Email</label>
          <input type="email" value={settings.email} disabled title="Contact support to change primary email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number <span className="text-red-500">*</span></label>
          <input type="tel" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Address <span className="text-red-500">*</span></label>
          <textarea value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors resize-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">City / Region <span className="text-red-500">*</span></label>
          <input type="text" value={settings.city} onChange={e => setSettings({...settings, city: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors" />
        </div>
      </div>
    </div>
  );

  const renderBankDetails = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex gap-3 mb-8 text-sm text-emerald-800">
        <Shield size={20} className="shrink-0 text-emerald-600 mt-0.5" />
        <p>Ensure your bank details are correct. All platform earnings will be directly transferred to this account during payout cycles.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Holder Name</label>
          <input type="text" value={settings.bankAccountName} onChange={e => setSettings({...settings, bankAccountName: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors uppercase" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Bank Name</label>
          <input type="text" value={settings.bankName} onChange={e => setSettings({...settings, bankName: e.target.value})} placeholder="e.g. HDFC Bank"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Account Number</label>
          <input type="password" value={settings.accountNumber} onChange={e => setSettings({...settings, accountNumber: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors font-mono" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">IFSC Code</label>
          <input type="text" value={settings.ifscCode} onChange={e => setSettings({...settings, ifscCode: e.target.value})} placeholder="e.g. HDFC0001234"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors uppercase" />
        </div>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          <Settings size={18} className="text-emerald-500" /> Booking Preferences
        </h3>
        <div className="space-y-2">
          {[
            { key: "autoAccept", label: "Auto-Accept Bookings", desc: "Automatically accept new bookings if they fit your schedule. Recommended for saving time." },
            { key: "instantBooking", label: "Allow Instant Booking", desc: "Customers can book instantly without waiting for your manual approval." },
          ].map(pref => (
            <div key={pref.key} className="flex items-start justify-between py-4 border-b border-gray-50 last:border-0 gap-4">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">{pref.label}</p>
                <p className="text-sm text-gray-500">{pref.desc}</p>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, preferences: { ...s.preferences, [pref.key]: !(s.preferences as any)[pref.key] } }))}
                className={cn("w-11 h-6 rounded-full transition-colors relative shrink-0 mt-1", (settings.preferences as any)[pref.key] ? "bg-emerald-500" : "bg-gray-200")}>
                <div className={cn("w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform", (settings.preferences as any)[pref.key] ? "translate-x-[22px]" : "translate-x-0.5")} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ NOTIFICATIONS — HIDDEN for future implementation ═══ */}
      {/* <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
          <Bell size={18} className="text-emerald-500" /> Notification Preferences
        </h3>
        <div className="space-y-2">
          {[
            { key: "emailNotifications", label: "Email Notifications", desc: "Get an email for new bookings, cancellations, and messages." },
            { key: "smsNotifications", label: "SMS Notifications", desc: "Get a text message for urgent booking requests directly to your phone." },
          ].map(pref => (
            <div key={pref.key} className="flex items-start justify-between py-4 border-b border-gray-50 last:border-0 gap-4">
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">{pref.label}</p>
                <p className="text-sm text-gray-500">{pref.desc}</p>
              </div>
              <button onClick={() => setSettings(s => ({ ...s, preferences: { ...s.preferences, [pref.key]: !(s.preferences as any)[pref.key] } }))}
                className={cn("w-11 h-6 rounded-full transition-colors relative shrink-0 mt-1", (settings.preferences as any)[pref.key] ? "bg-emerald-500" : "bg-gray-200")}>
                <div className={cn("w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform", (settings.preferences as any)[pref.key] ? "translate-x-[22px]" : "translate-x-0.5")} />
              </button>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );

  const renderSecurity = () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <Shield size={24} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
          <p className="text-sm text-gray-500 mt-1">Keep your account secure with a strong password.</p>
        </div>

        {(!user?.authProvider || user.authProvider === 'LOCAL') && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showCurrentPassword ? "text" : "password"} value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors" />
              <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
          <div className="relative">
            <input type={showNewPassword ? "text" : "password"} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors" />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm New Password</label>
          <input type={showNewPassword ? "text" : "password"} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50/50 focus:bg-white transition-colors" />
        </div>
        <div className="pt-4">
          <button onClick={handlePasswordSave} disabled={passwordMutation.isPending || ((!user?.authProvider || user.authProvider === 'LOCAL') && !passwordForm.currentPassword) || !passwordForm.newPassword}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 text-white font-bold text-sm hover:bg-gray-800 transition-colors disabled:opacity-50">
            {passwordMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
            Update Password
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your MVP marketplace business settings.</p>
        </div>
        {activeTab !== "security" && (
          <button onClick={handleSave} disabled={saveMutation.isPending}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm hover:opacity-90 disabled:opacity-70 transition-opacity shadow-sm shrink-0"
          >
            {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        )}
      </div>

      {/* Horizontal Navigation */}
      <div className="flex flex-nowrap items-center overflow-x-auto gap-2 border-b border-gray-200 pb-px hide-scrollbar">
        {displayTabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-600" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}>
            <span className={cn(activeTab === tab.id ? "text-emerald-500" : "text-gray-400")}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="pt-2">
        {activeTab === "business" && renderBusinessInfo()}
        {activeTab === "bank" && renderBankDetails()}
        {activeTab === "preferences" && renderPreferences()}
        {activeTab === "security" && renderSecurity()}
      </div>
    </div>
  );
}

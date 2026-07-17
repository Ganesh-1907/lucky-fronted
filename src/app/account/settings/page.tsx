"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, User, Mail, Phone, MapPin, Lock, Camera,
  Save, Bell, Shield, CreditCard, Loader2
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useUpdateProfile, useChangePassword } from "@/hooks/useApi";
import toast from "react-hot-toast";

const tabs = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
];

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const displayTabs = user?.authProvider && user.authProvider !== 'LOCAL'
    ? tabs.filter(t => t.id !== 'security')
    : tabs;

  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  if (!_hasHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  const handleProfileSave = async () => {
    try {
      const res: any = await updateProfile.mutateAsync({
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
      });
      useAuthStore.getState().setUser(res.data);
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.newPass !== passwords.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      await changePassword.mutateAsync({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
      });
      toast.success("Password changed successfully!");
      setPasswords({ current: "", newPass: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">Account Settings</span>
        </nav>

        <h1 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
          Account Settings
        </h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 pb-px">
          {displayTabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{formData.name[0]}</span>
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:bg-gray-50">
                  <Camera size={12} className="text-gray-600" />
                </button>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{formData.name}</p>
                <p className="text-sm text-gray-500">{formData.email}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
            </div>

            <button 
              onClick={handleProfileSave} 
              disabled={updateProfile.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium text-sm disabled:opacity-50"
            >
              {updateProfile.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h3 className="font-bold text-gray-900">Change Password</h3>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} placeholder="Enter current password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={passwords.newPass} onChange={e => setPasswords({...passwords, newPass: e.target.value})} placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} placeholder="Confirm new password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
            </div>
            <button 
              onClick={handlePasswordChange} 
              disabled={changePassword.isPending}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium text-sm disabled:opacity-50"
            >
              {changePassword.isPending ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} 
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Notification Preferences</h3>
            {[
              { label: "Booking Confirmations", desc: "Get notified when your bookings are confirmed", enabled: true },
              { label: "Booking Reminders", desc: "Reminder before your scheduled service", enabled: true },
              { label: "Promotional Offers", desc: "Discounts and deals from vendors", enabled: false },
              { label: "Review Reminders", desc: "Reminder to review completed services", enabled: true },
              { label: "Newsletter", desc: "Weekly newsletter with new services and trends", enabled: false },
            ].map((pref, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{pref.label}</p>
                  <p className="text-xs text-gray-500">{pref.desc}</p>
                </div>
                <button className={`w-11 h-6 rounded-full transition-colors ${pref.enabled ? "bg-violet-600" : "bg-gray-200"} relative`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${pref.enabled ? "right-0.5" : "left-0.5"}`} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

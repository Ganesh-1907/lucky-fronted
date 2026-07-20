"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight, User, Mail, Phone, MapPin, Lock, Camera,
  Save, Shield, CreditCard, Loader2
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useCityStore } from "@/store/city";
import { useUpdateProfile, useChangePassword } from "@/hooks/useApi";
import toast from "react-hot-toast";
import api from "@/lib/api";

const tabs = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "security", label: "Security", icon: <Shield size={16} /> },
  // ═══ NOTIFICATIONS — HIDDEN for future implementation ═══
  // { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
];

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const displayTabs = tabs;

  const [activeTab, setActiveTab] = useState("profile");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    avatar: user?.avatar || "",
  });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const { setCity } = useCityStore();

  useEffect(() => {
    if (_hasHydrated && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [_hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        city: user.city || "",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

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
        avatar: formData.avatar,
      });
      useAuthStore.getState().setUser(res.data);
      if (formData.city) {
        setCity(formData.city);
      }
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    const isSocial = user?.authProvider && user.authProvider !== 'LOCAL';
    if (!isSocial && !passwords.current) {
      toast.error("Please enter your current password");
      return;
    }
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      return;
    }

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append("images", file);
    uploadData.append("folder", "avatars");

    try {
      const res = await api.uploadFile("/upload/images", uploadData);
      if (res.success && res.data?.urls?.[0]) {
        setFormData(prev => ({ ...prev, avatar: res.data.urls[0] }));
        toast.success("Profile picture uploaded. Don't forget to save changes!");
      } else {
        toast.error("Failed to upload image");
      }
    } catch (err: any) {
      toast.error(err.message || "Error uploading image");
    } finally {
      setIsUploading(false);
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
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center overflow-hidden">
                  {formData.avatar ? (
                    <img src={formData.avatar.startsWith('http') ? formData.avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${formData.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white text-2xl font-bold">{formData.name?.[0]?.toUpperCase() || "U"}</span>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer"
                >
                  {isUploading ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
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
                <div className="relative opacity-75 cursor-not-allowed">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" value={formData.email} disabled
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none cursor-not-allowed text-gray-500" />
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
            <h3 className="font-bold text-gray-900">
              {user?.authProvider && user.authProvider !== 'LOCAL' ? 'Set Password' : 'Change Password'}
            </h3>
            <div className="space-y-4 max-w-md">
              {(!user?.authProvider || user.authProvider === 'LOCAL') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="password" value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} placeholder="Enter current password"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                  </div>
                </div>
              )}
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
              disabled={changePassword.isPending || ((!user?.authProvider || user.authProvider === 'LOCAL') && !passwords.current) || !passwords.newPass}
              className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium text-sm disabled:opacity-50"
            >
              {changePassword.isPending ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />} 
              {changePassword.isPending ? "Updating..." : "Update Password"}
            </button>
          </div>
        )}

        {/* ═══ NOTIFICATIONS — HIDDEN for future implementation ═══ */}
        {/* activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <h3 className="font-bold text-gray-900">Notification Preferences</h3>
            <div className="bg-violet-50 border border-violet-100 rounded-xl p-6 text-center">
              <Bell className="mx-auto text-violet-400 mb-3" size={32} />
              <h4 className="font-semibold text-violet-900 mb-1">Coming Soon</h4>
              <p className="text-sm text-violet-700">Detailed notification preferences will be available in a future update.</p>
            </div>
          </div>
        ) */}
      </div>
    </div>
  );
}

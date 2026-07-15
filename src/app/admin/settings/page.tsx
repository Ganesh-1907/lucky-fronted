"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save, Globe, Mail, CreditCard, Shield, Image, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/api";

const settingGroups = [
  { id: "general", label: "General", icon: <Globe size={16} /> },
  { id: "payment", label: "Payment", icon: <CreditCard size={16} /> },
  { id: "email", label: "Email", icon: <Mail size={16} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
  { id: "seo", label: "SEO", icon: <Shield size={16} /> },
];

const defaultSettings = {
  siteName: "",
  siteUrl: "",
  supportEmail: "",
  supportPhone: "",
  commissionRate: "",
  minAdvancePercent: "",
  razorpayKeyId: "",
  razorpayKeySecret: "",
  smtpHost: "",
  smtpPort: "",
  smtpUser: "",
  smtpPass: "",
  seoTitle: "",
  seoDescription: "",
  googleAnalyticsId: "",
  maintenanceMode: false,
  autoApproveVendors: false,
  autoApproveReviews: false,
  emailNotifications: true,
  smsNotifications: false,
};

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState(defaultSettings);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => api.get<any>("/admin/settings"),
  });

  const saveMutation = useMutation({
    mutationFn: (settings: any) => api.put("/admin/settings", settings),
    onSuccess: () => toast.success("Settings saved successfully!"),
    onError: () => toast.error("Failed to save settings"),
  });

  useEffect(() => {
    if (data) {
      const apiSettings = data?.data || data;
      setSettings(prev => ({ ...prev, ...apiSettings }));
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;

  const handleSave = () => saveMutation.mutate(settings);

  const renderInput = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={(settings as any)[key] || ""} placeholder={placeholder}
        onChange={e => setSettings({ ...settings, [key]: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
    </div>
  );

  const renderToggle = (label: string, desc: string, key: string) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button onClick={() => setSettings({ ...settings, [key]: !(settings as any)[key] })}
        className={`w-11 h-6 rounded-full transition-colors ${(settings as any)[key] ? "bg-violet-600" : "bg-gray-200"} relative`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${(settings as any)[key] ? "right-0.5" : "left-0.5"}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure your platform settings</p>
      </div>

      <div className="flex gap-6">
        {/* Tabs */}
        <div className="w-48 shrink-0 hidden md:block space-y-1">
          {settingGroups.map(g => (
            <button key={g.id} onClick={() => setActiveTab(g.id)} className={cn(
              "w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-left transition-all",
              activeTab === g.id ? "bg-violet-50 text-violet-700" : "text-gray-600 hover:bg-gray-50"
            )}>
              {g.icon} {g.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-6">
          {activeTab === "general" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-900">General Settings</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {renderInput("Site Name", "siteName", "text", "Lucky Marketplace")}
                {renderInput("Site URL", "siteUrl", "url", "https://luckymarketplace.com")}
                {renderInput("Support Email", "supportEmail", "email")}
                {renderInput("Support Phone", "supportPhone", "tel")}
                {renderInput("Commission Rate (%)", "commissionRate", "number")}
                {renderInput("Min Advance (%)", "minAdvancePercent", "number")}
              </div>
              {renderToggle("Maintenance Mode", "Put the site in maintenance mode", "maintenanceMode")}
              {renderToggle("Auto-Approve Vendors", "Automatically approve new vendor registrations", "autoApproveVendors")}
              {renderToggle("Auto-Approve Reviews", "Automatically approve customer reviews", "autoApproveReviews")}
            </div>
          )}

          {activeTab === "payment" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-900">Razorpay Settings</h3>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
                ⚠️ Payment gateway is in demo mode. Add your Razorpay keys to enable real payments.
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {renderInput("Razorpay Key ID", "razorpayKeyId", "text", "rzp_live_xxxxx")}
                {renderInput("Razorpay Key Secret", "razorpayKeySecret", "password", "Enter secret key")}
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-900">SMTP Configuration</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {renderInput("SMTP Host", "smtpHost", "text", "smtp.gmail.com")}
                {renderInput("SMTP Port", "smtpPort", "number", "587")}
                {renderInput("SMTP Username", "smtpUser", "email")}
                {renderInput("SMTP Password", "smtpPass", "password")}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
              <h3 className="font-bold text-gray-900 mb-2">Notification Settings</h3>
              {renderToggle("Email Notifications", "Send email notifications for bookings", "emailNotifications")}
              {renderToggle("SMS Notifications", "Send SMS notifications for bookings", "smsNotifications")}
            </div>
          )}

          {activeTab === "seo" && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
              <h3 className="font-bold text-gray-900">SEO & Analytics</h3>
              <div className="space-y-4">
                {renderInput("Default Page Title", "seoTitle")}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Default Meta Description</label>
                  <textarea value={settings.seoDescription || ""} onChange={e => setSettings({ ...settings, seoDescription: e.target.value })} rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none" />
                </div>
                {renderInput("Google Analytics ID", "googleAnalyticsId", "text", "G-XXXXXXXXXX")}
              </div>
            </div>
          )}

          <button onClick={handleSave} disabled={saveMutation.isPending} className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium text-sm">
            <Save size={16} /> {saveMutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

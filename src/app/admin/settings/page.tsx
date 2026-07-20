"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save, Globe, Mail, CreditCard, Shield, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import api from "@/lib/api";

const settingGroups = [
  { id: "general", label: "General", icon: <Globe size={16} /> },
  { id: "payment", label: "Payment", icon: <CreditCard size={16} /> },
  { id: "email", label: "Email", icon: <Mail size={16} /> },
  // ═══ NOTIFICATIONS — HIDDEN for future implementation ═══
  // { id: "notifications", label: "Notifications", icon: <Bell size={16} /> },
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
      const parsedSettings = { ...apiSettings };
      
      // Parse boolean strings back to actual booleans
      Object.keys(parsedSettings).forEach(key => {
        if (parsedSettings[key] === 'true') parsedSettings[key] = true;
        if (parsedSettings[key] === 'false') parsedSettings[key] = false;
      });

      setSettings(prev => ({ ...prev, ...parsedSettings }));
    }
  }, [data]);

  if (isLoading) return <div>Loading...</div>;

  const handleSave = () => saveMutation.mutate(settings);

  const renderInput = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <input type={type} value={(settings as any)[key] || ""} placeholder={placeholder}
        onChange={e => setSettings({ ...settings, [key]: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-gray-50/50 focus:bg-white transition-colors" />
    </div>
  );

  const renderToggle = (label: string, desc: string, key: string) => (
    <div className="flex items-start justify-between py-4 border-b border-gray-50 last:border-0 gap-4">
      <div>
        <p className="text-sm font-bold text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      <button onClick={() => setSettings({ ...settings, [key]: !(settings as any)[key] })}
        className={cn("w-11 h-6 rounded-full transition-colors relative shrink-0 mt-1", (settings as any)[key] ? "bg-violet-600" : "bg-gray-200")}>
        <div className={cn("w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform", (settings as any)[key] ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Configure your platform settings</p>
        </div>
        <button onClick={handleSave} disabled={saveMutation.isPending}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-bold text-sm hover:opacity-90 disabled:opacity-70 transition-opacity shadow-sm shrink-0"
        >
          {saveMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </div>

      {/* Horizontal Navigation */}
      <div className="flex flex-nowrap items-center overflow-x-auto gap-2 border-b border-gray-200 pb-px hide-scrollbar">
        {settingGroups.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id 
                ? "border-violet-600 text-violet-700" 
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}>
            <span className={cn(activeTab === tab.id ? "text-violet-600" : "text-gray-400")}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="pt-2">
        {activeTab === "general" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-4">General Settings</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {renderInput("Site Name", "siteName", "text", "Lucky Marketplace")}
              {renderInput("Site URL", "siteUrl", "url", "https://luckymarketplace.com")}
              {renderInput("Support Email", "supportEmail", "email")}
              {renderInput("Support Phone", "supportPhone", "tel")}
              {renderInput("Commission Rate (%)", "commissionRate", "number")}
              {renderInput("Min Advance (%)", "minAdvancePercent", "number")}
            </div>
            <div className="pt-4 border-t border-gray-100 space-y-2">
              {renderToggle("Maintenance Mode", "Put the site in maintenance mode", "maintenanceMode")}
              {renderToggle("Auto-Approve Vendors", "Automatically approve new vendor registrations", "autoApproveVendors")}
              {renderToggle("Auto-Approve Reviews", "Automatically approve customer reviews", "autoApproveReviews")}
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-4">Razorpay Settings</h3>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700 font-medium">
              ⚠️ Payment gateway is in demo mode. Add your Razorpay keys to enable real payments.
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {renderInput("Razorpay Key ID", "razorpayKeyId", "text", "rzp_live_xxxxx")}
              {renderInput("Razorpay Key Secret", "razorpayKeySecret", "password", "Enter secret key")}
            </div>
          </div>
        )}

        {activeTab === "email" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-4">SMTP Configuration</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {renderInput("SMTP Host", "smtpHost", "text", "smtp.gmail.com")}
              {renderInput("SMTP Port", "smtpPort", "number", "587")}
              {renderInput("SMTP Username", "smtpUser", "email")}
              {renderInput("SMTP Password", "smtpPass", "password")}
            </div>
          </div>
        )}

        {/* ═══ NOTIFICATIONS — HIDDEN for future implementation ═══ */}
        {/* activeTab === "notifications" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-4">Notification Settings</h3>
            <div className="space-y-2">
              {renderToggle("Email Notifications", "Send email notifications for bookings", "emailNotifications")}
              {renderToggle("SMS Notifications", "Send SMS notifications for bookings", "smsNotifications")}
            </div>
          </div>
        ) */}

        {activeTab === "seo" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-base font-bold text-gray-900 mb-2 border-b border-gray-100 pb-4">SEO & Analytics</h3>
            <div className="space-y-6">
              {renderInput("Default Page Title", "seoTitle")}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Default Meta Description</label>
                <textarea value={settings.seoDescription || ""} onChange={e => setSettings({ ...settings, seoDescription: e.target.value })} rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 bg-gray-50/50 focus:bg-white transition-colors resize-none" />
              </div>
              {renderInput("Google Analytics ID", "googleAnalyticsId", "text", "G-XXXXXXXXXX")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

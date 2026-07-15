"use client";

import { useEffect, useState } from "react";
import { Save, Settings, Clock, Shield, Mail, Bell, Globe, DollarSign, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import toast from "react-hot-toast";

const defaultSettings = {
  businessName: "",
  description: "",
  phone: "",
  email: "",
  address: "",
  gstNumber: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  autoAccept: false,
  instantBooking: true,
  emailNotifications: true,
  smsNotifications: false,
};

export default function VendorSettingsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["vendor", "profile"],
    queryFn: () => api.get<any>("/vendors/profile"),
  });

  const saveMutation = useMutation({
    mutationFn: (form: any) => api.put("/vendors/profile", form),
    onSuccess: () => {
      toast.success("Settings saved!");
      qc.invalidateQueries({ queryKey: ["vendor", "profile"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save settings");
    },
  });

  const [settings, setSettings] = useState(defaultSettings);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (data && !initialized) {
      const d = data as any;
      setSettings({
        businessName: d.businessName || "",
        description: d.description || "",
        phone: d.phone || "",
        email: d.email || "",
        address: d.address || "",
        gstNumber: d.gstNumber || "",
        bankName: d.bankName || "",
        accountNumber: d.accountNumber || "",
        ifscCode: d.ifscCode || "",
        autoAccept: d.autoAccept ?? false,
        instantBooking: d.instantBooking ?? true,
        emailNotifications: d.emailNotifications ?? true,
        smsNotifications: d.smsNotifications ?? false,
      });
      setInitialized(true);
    }
  }, [data, initialized]);

  const handleSave = () => saveMutation.mutate(settings);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your business settings</p>
      </div>

      {/* Business Info */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Globe size={16} className="text-emerald-600" /> Business Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
            <input type="text" value={settings.businessName} onChange={e => setSettings({...settings, businessName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Email</label>
            <input type="email" value={settings.email} onChange={e => setSettings({...settings, email: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
            <input type="tel" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">GST Number</label>
            <input type="text" value={settings.gstNumber} onChange={e => setSettings({...settings, gstNumber: e.target.value})} placeholder="Optional"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Description</label>
          <textarea value={settings.description} onChange={e => setSettings({...settings, description: e.target.value})} rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
          <input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2"><DollarSign size={16} className="text-emerald-600" /> Bank Details</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bank Name</label>
            <input type="text" value={settings.bankName} onChange={e => setSettings({...settings, bankName: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Account Number</label>
            <input type="text" value={settings.accountNumber} onChange={e => setSettings({...settings, accountNumber: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">IFSC Code</label>
            <input type="text" value={settings.ifscCode} onChange={e => setSettings({...settings, ifscCode: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100" />
          </div>
        </div>
      </div>

      {/* Booking Preferences */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-2">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2"><Settings size={16} className="text-emerald-600" /> Booking Preferences</h3>
        {[
          { key: "autoAccept", label: "Auto-Accept Bookings", desc: "Automatically accept new booking requests" },
          { key: "instantBooking", label: "Instant Booking", desc: "Allow customers to book without waiting for approval" },
          { key: "emailNotifications", label: "Email Notifications", desc: "Receive booking notifications via email" },
          { key: "smsNotifications", label: "SMS Notifications", desc: "Receive booking notifications via SMS" },
        ].map(pref => (
          <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
            <div>
              <p className="text-sm font-medium text-gray-900">{pref.label}</p>
              <p className="text-xs text-gray-500">{pref.desc}</p>
            </div>
            <button onClick={() => setSettings({ ...settings, [pref.key]: !(settings as any)[pref.key] })}
              className={`w-11 h-6 rounded-full transition-colors ${(settings as any)[pref.key] ? "bg-emerald-600" : "bg-gray-200"} relative`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm absolute top-0.5 transition-transform ${(settings as any)[pref.key] ? "right-0.5" : "left-0.5"}`} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={handleSave} disabled={saveMutation.isPending} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:opacity-90 disabled:opacity-50">
        {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save Settings
      </button>
    </div>
  );
}

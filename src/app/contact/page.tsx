"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, Loader2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            Get in Touch
          </h1>
          <p className="text-lg text-white/80">We&apos;d love to hear from you. Reach out for support, partnerships, or feedback.</p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60L1440 60V30C1440 30 1320 0 1200 0C1080 0 960 30 840 30C720 30 600 0 480 0C360 0 240 30 120 30C60 30 0 15 0 15V60Z" fill="#FAFAFA" /></svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 -mt-1 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            {[
              { icon: <Phone size={20} />, title: "Call Us", info: "+91 98765 43210", sub: "Mon-Sat, 9AM - 8PM IST", color: "from-violet-500 to-purple-500" },
              { icon: <Mail size={20} />, title: "Email Us", info: "support@luckymarketplace.com", sub: "We reply within 24 hours", color: "from-emerald-500 to-teal-500" },
              { icon: <MapPin size={20} />, title: "Visit Us", info: "Mumbai, Maharashtra", sub: "India 400001", color: "from-amber-500 to-orange-500" },
              { icon: <Clock size={20} />, title: "Support Hours", info: "Mon-Sat: 9AM - 8PM", sub: "Sunday: 10AM - 5PM", color: "from-blue-500 to-indigo-500" },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shrink-0`}>
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.title}</p>
                  <p className="text-sm text-gray-700">{item.info}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
              <MessageSquare size={20} className="text-violet-600" /> Send a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Your name" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    placeholder="you@example.com" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject *</label>
                  <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 bg-white">
                    <option value="">Select a topic</option>
                    <option value="booking">Booking Help</option>
                    <option value="vendor">Vendor Inquiry</option>
                    <option value="payment">Payment Issue</option>
                    <option value="feedback">Feedback</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                <textarea value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}
                  placeholder="Describe your inquiry in detail..." rows={5} required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none" />
              </div>
              <button type="submit" disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 disabled:opacity-60 transition-all">
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8" style={{ fontFamily: "var(--font-outfit)" }}>
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto grid gap-4 text-left">
            {[
              { q: "How do I book a service?", a: "Simply browse our services, select one you like, choose your date and time, add any add-ons, and pay the advance amount to confirm your booking." },
              { q: "Can I cancel my booking?", a: "Yes, you can cancel up to 24 hours before the scheduled service for a full refund of the advance amount." },
              { q: "How are vendors verified?", a: "We verify all vendors through document checks, past work review, and quality audits. Only vendors meeting our standards are listed." },
              { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure Razorpay integration." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="font-semibold text-sm text-gray-900 mb-1">{faq.q}</p>
                <p className="text-sm text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

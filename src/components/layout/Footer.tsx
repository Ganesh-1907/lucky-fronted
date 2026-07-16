import Link from "next/link";
import {
  Phone, Mail, MapPin, Globe, MessageSquare, Send, Play,
} from "lucide-react";
import { useBanners, useSettings } from "@/hooks/useApi";
import BannerCarousel from "@/components/BannerCarousel";

const footerLinks = {
  services: [
    { label: "Birthday Decorations", href: "/category/birthday-decorations" },
    { label: "Wedding Decorations", href: "/category/wedding-decorations" },
    { label: "Anniversary", href: "/category/anniversary-celebrations" },
    { label: "Candlelight Dinner", href: "/category/candlelight-dinner" },
    { label: "Corporate Events", href: "/category/corporate-events" },
    { label: "Cakes & Flowers", href: "/category/cakes" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Become a Vendor", href: "/auth/register?role=vendor" },
  ],
  support: [
    { label: "Help Center", href: "/help" },
    { label: "Cancellation Policy", href: "/cancellation-policy" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "FAQs", href: "/faq" },
  ],
};

export default function Footer() {
  const { data: bannerRes } = useBanners("FOOTER");
  const banners = bannerRes?.data || [];
  const { data: settingsRes } = useSettings();
  const settings = settingsRes?.data || {};
  
  const siteName = settings.siteName || "Lucky Marketplace";
  const supportPhone = settings.supportPhone || "+91 98765 43210";
  const supportEmail = settings.supportEmail || "support@luckymarketplace.com";
  
  const dynamicServices = settings.footerServices || footerLinks.services;
  const dynamicCompany = settings.footerCompany || footerLinks.company;
  const dynamicSupport = settings.footerSupport || footerLinks.support;

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Dynamic Footer Banners */}
      {banners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pt-10">
          <BannerCarousel 
            banners={banners} 
            className="w-full h-32 md:h-40 shadow-lg border border-gray-800 transition-transform hover:scale-[1.01]" 
            imageClassName="opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      )}

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-xl" style={{ fontFamily: "var(--font-outfit)" }}>
                  L
                </span>
              </div>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                {siteName}
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Your one-stop destination for premium celebration services. Book decorations,
              events, and celebration packages across 500+ cities in India.
            </p>
            <div className="space-y-2">
              <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Phone size={14} /> {supportPhone}
              </a>
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Mail size={14} /> {supportEmail}
              </a>
              <span className="flex items-center gap-2 text-sm">
                <MapPin size={14} /> Mumbai, India
              </span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              Services
            </h3>
            <ul className="space-y-2.5">
              {dynamicServices.map((link: any) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-violet-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              Company
            </h3>
            <ul className="space-y-2.5">
              {dynamicCompany.map((link: any) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-violet-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
              Support
            </h3>
            <ul className="space-y-2.5">
              {dynamicSupport.map((link: any) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-violet-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Links */}
            <div className="mt-6">
              <h4 className="text-white font-semibold text-sm mb-3">Follow Us</h4>
              <div className="flex items-center gap-3">
                {[
                  { icon: <Globe size={18} />, href: settings.socialWebsite || "#", label: "Website" },
                  { icon: <MessageSquare size={18} />, href: settings.socialChat || "#", label: "Chat" },
                  { icon: <Send size={18} />, href: settings.socialTelegram || "#", label: "Telegram" },
                  { icon: <Play size={18} />, href: settings.socialVideo || "#", label: "Video" },
                ].map((social, i) => (
                  <a
                    key={i}
                    href={social.href}
                    className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center hover:bg-violet-600 hover:text-white transition-all"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>🔒 Secure Payments</span>
            <span>•</span>
            <span>💯 Verified Vendors</span>
            <span>•</span>
            <span>⭐ 4.8/5 Rating</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

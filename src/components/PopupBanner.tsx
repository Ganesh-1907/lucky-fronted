"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useBanners } from "@/hooks/useApi";

export default function PopupBanner() {
  const { data: bannerRes } = useBanners("POPUP");
  const banners = bannerRes?.data || [];
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);

  useEffect(() => {
    // Only show if there's a banner and user hasn't seen it in this session
    if (banners.length > 0 && !hasSeen && !sessionStorage.getItem("popupSeen")) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Wait 3 seconds before showing
      return () => clearTimeout(timer);
    }
  }, [banners, hasSeen]);

  if (!isOpen || banners.length === 0) return null;

  const banner = banners[0]; // Show the first active popup

  const closePopup = () => {
    setIsOpen(false);
    setHasSeen(true);
    sessionStorage.setItem("popupSeen", "true");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up" style={{ animation: "slideUp 0.4s ease-out forwards" }}>
        <button 
          onClick={closePopup} 
          className="absolute top-3 right-3 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-sm"
        >
          <X size={20} />
        </button>
        <a href={banner.link || "#"} onClick={closePopup} className="block group relative">
          <img 
            src={banner.image.startsWith('http') ? banner.image : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${banner.image}`} 
            alt={banner.title} 
            className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
            style={{ maxHeight: '600px' }}
          />
          {(banner.title || banner.description) && (
             <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
               {banner.title && <h3 className="text-xl font-bold text-white mb-1">{banner.title}</h3>}
               {banner.description && <p className="text-white/80 text-sm line-clamp-2">{banner.description}</p>}
             </div>
          )}
        </a>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}} />
    </div>
  );
}

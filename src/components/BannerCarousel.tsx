"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Banner {
  id: number;
  title: string;
  image: string;
  link?: string;
  position: string;
}

interface BannerCarouselProps {
  banners: Banner[];
  className?: string;
  imageClassName?: string;
  delay?: number;
}

export default function BannerCarousel({ 
  banners, 
  className, 
  imageClassName,
  delay = 4000 
}: BannerCarouselProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (paused || banners.length <= 1) return;
    const timer = setInterval(nextSlide, delay);
    return () => clearInterval(timer);
  }, [paused, nextSlide, delay, banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <div 
      className={cn("relative overflow-hidden rounded-2xl group", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {banners.map((banner, index) => {
          const imageSrc = banner.image.startsWith('http') 
            ? banner.image 
            : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${banner.image}`;
            
          return (
            <div key={banner.id || index} className="min-w-full h-full relative">
              {banner.link ? (
                <Link href={banner.link} className="block w-full h-full">
                  <img 
                    src={imageSrc} 
                    alt={banner.title}
                    className={cn("w-full h-full object-cover", imageClassName)}
                  />
                </Link>
              ) : (
                <img 
                  src={imageSrc} 
                  alt={banner.title}
                  className={cn("w-full h-full object-cover", imageClassName)}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={cn(
                "rounded-full transition-all duration-300",
                activeSlide === i
                  ? "w-4 h-1.5 bg-white"
                  : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

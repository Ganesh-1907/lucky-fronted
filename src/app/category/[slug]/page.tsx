"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ServiceCard from "@/components/cards/ServiceCard";
import BannerCarousel from "@/components/BannerCarousel";

import { useCategoryBySlug, useServices, useBanners } from "@/hooks/useApi";

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: catData, isLoading: catLoading } = useCategoryBySlug(slug);
  const { data: servicesData, isLoading: servicesLoading } = useServices({ category: slug });
  
  const category = catData?.data || { name: slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()), description: "Explore our services" };
  const services = servicesData?.data || [];

  const { data: bannerRes } = useBanners("CATEGORY");
  const banners = bannerRes?.data || [];

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-violet-600">Home</Link>
          <ChevronRight size={14} />
          <Link href="/services" className="hover:text-violet-600">Services</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium">{category.name}</span>
        </nav>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <div className="relative rounded-2xl overflow-hidden gradient-primary p-8 md:p-12">
          <div className="absolute top-0 right-0 w-60 h-60 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
            {category.name}
          </h1>
          <p className="text-white/80 max-w-xl">{category.description}</p>
          <p className="text-white/60 text-sm mt-3">{services.length} services available</p>
        </div>
      </div>

      {/* Dynamic Category Banners */}
      {banners.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <BannerCarousel 
            banners={banners} 
            className="w-full h-32 md:h-48 shadow-lg hover:scale-[1.01] transition-transform" 
          />
        </div>
      )}

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {services.map((service: any) => (
            <ServiceCard key={service.id} {...service} />
          ))}
          {!servicesLoading && services.length === 0 && (
            <div className="col-span-full py-20 text-center text-gray-500">
              No services found in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

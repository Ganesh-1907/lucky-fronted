"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ServiceCard from "@/components/cards/ServiceCard";

const categoryData: Record<string, { name: string; description: string }> = {
  "birthday-decorations": { name: "Birthday Decorations", description: "Make birthdays memorable with stunning decoration setups" },
  "wedding-decorations": { name: "Wedding Decorations", description: "Beautiful wedding setups for your special day" },
  "anniversary-celebrations": { name: "Anniversary Celebrations", description: "Celebrate your love with romantic anniversary setups" },
  "candlelight-dinner": { name: "Candlelight Dinner", description: "Romantic candlelight dinner experiences at your location" },
  "cakes": { name: "Cakes", description: "Delicious cakes for every occasion" },
  "flowers": { name: "Flowers", description: "Fresh flower arrangements and bouquets" },
  "corporate-events": { name: "Corporate Events", description: "Professional event setups for businesses" },
  "balloon-decorations": { name: "Balloon Decorations", description: "Creative balloon arrangements for any celebration" },
  "surprise-planning": { name: "Surprise Planning", description: "Let us help you plan the perfect surprise" },
  "romantic-setup": { name: "Romantic Setup", description: "Beautiful romantic setups for special moments" },
};

const demoServices = [
  { id: 1, title: "Premium Balloon Decoration", slug: "premium-birthday-balloon-decoration", basePrice: 4999, discountPrice: 3999, images: [], avgRating: 4.5, reviewCount: 128, isTrending: true, isBestSeller: true, category: { name: "Balloon Decorations", slug: "balloon-decorations" }, vendor: { businessName: "Dream Decorators", avgRating: 4.7 } },
  { id: 2, title: "Simple Birthday Setup", slug: "simple-birthday-setup", basePrice: 1999, discountPrice: 1499, images: [], avgRating: 4.2, reviewCount: 87, isNewArrival: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Party Kings", avgRating: 4.5 } },
  { id: 3, title: "Theme Party Setup", slug: "kids-birthday-theme-party-setup", basePrice: 7999, discountPrice: 5999, images: [], avgRating: 4.6, reviewCount: 72, isTrending: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Dream Decorators", avgRating: 4.7 } },
  { id: 4, title: "LED Neon Decoration", slug: "neon-birthday-setup", basePrice: 6999, discountPrice: 5499, images: [], avgRating: 4.7, reviewCount: 38, isFeatured: true, isNewArrival: true, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Glow Events", avgRating: 4.8 } },
  { id: 5, title: "Golden Anniversary Setup", slug: "golden-anniversary-setup", basePrice: 8999, discountPrice: 6999, images: [], avgRating: 4.8, reviewCount: 34, isBestSeller: true, category: { name: "Anniversary", slug: "anniversary-celebrations" }, vendor: { businessName: "Love Setup Co", avgRating: 4.6 } },
  { id: 6, title: "Budget Friendly Decoration", slug: "budget-decoration", basePrice: 999, discountPrice: null, images: [], avgRating: 4.1, reviewCount: 156, category: { name: "Birthday", slug: "birthday-decorations" }, vendor: { businessName: "Quick Decor", avgRating: 4.3 } },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = categoryData[slug] || { name: slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()), description: "Explore our services" };

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
          <p className="text-white/60 text-sm mt-3">{demoServices.length} services available</p>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {demoServices.map(service => (
            <ServiceCard key={service.id} {...service} />
          ))}
        </div>
      </div>
    </div>
  );
}

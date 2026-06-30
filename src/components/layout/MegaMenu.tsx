"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles, PartyPopper, Heart, Cake, Flower2, Building2 } from "lucide-react";

interface MenuCategory {
  label: string;
  href: string;
  icon?: React.ReactNode;
  children?: {
    column: string;
    items: { label: string; href: string }[];
  }[];
}

const menuData: MenuCategory[] = [
  {
    label: "Decorations",
    href: "/category/decorations",
    icon: <PartyPopper size={16} />,
    children: [
      {
        column: "By Type",
        items: [
          { label: "Balloon Decorations", href: "/category/balloon-decorations" },
          { label: "Theme Decorations", href: "/category/theme-decorations" },
          { label: "Simple Decorations", href: "/category/simple-decorations" },
          { label: "Premium Decorations", href: "/category/premium-decorations" },
          { label: "LED/Light Decorations", href: "/category/led-decorations" },
        ],
      },
      {
        column: "By Occasion",
        items: [
          { label: "Birthday Decorations", href: "/category/birthday-decorations" },
          { label: "Anniversary Decorations", href: "/category/anniversary-celebrations" },
          { label: "Baby Shower", href: "/category/baby-shower" },
          { label: "Proposal Setup", href: "/category/surprise-planning" },
          { label: "House Party", href: "/category/house-party" },
        ],
      },
      {
        column: "Trending",
        items: [
          { label: "Neon Sign Decoration", href: "/services?tags=neon" },
          { label: "Ring Light Setup", href: "/services?tags=ringlight" },
          { label: "Photo Wall Setup", href: "/services?tags=photowall" },
          { label: "Car Boot Decoration", href: "/services?tags=carboot" },
        ],
      },
    ],
  },
  {
    label: "Weddings",
    href: "/category/wedding-decorations",
    icon: <Heart size={16} />,
    children: [
      {
        column: "Decoration",
        items: [
          { label: "Mandap Decoration", href: "/category/mandap-decoration" },
          { label: "Stage Decoration", href: "/category/stage-decoration" },
          { label: "Car Decoration", href: "/category/car-decoration" },
          { label: "Entrance Decoration", href: "/category/entrance-decoration" },
        ],
      },
      {
        column: "Functions",
        items: [
          { label: "Haldi Setup", href: "/category/haldi-mehendi" },
          { label: "Mehendi Setup", href: "/category/haldi-mehendi" },
          { label: "Sangeet Setup", href: "/category/sangeet" },
          { label: "Reception Setup", href: "/category/reception" },
        ],
      },
    ],
  },
  {
    label: "Cakes",
    href: "/category/cakes",
    icon: <Cake size={16} />,
    children: [
      {
        column: "By Type",
        items: [
          { label: "Birthday Cakes", href: "/category/birthday-cakes" },
          { label: "Wedding Cakes", href: "/category/wedding-cakes" },
          { label: "Custom Cakes", href: "/category/custom-cakes" },
          { label: "Photo Cakes", href: "/category/photo-cakes" },
          { label: "Cupcakes", href: "/category/cupcakes" },
        ],
      },
    ],
  },
  {
    label: "Flowers",
    href: "/category/flowers",
    icon: <Flower2 size={16} />,
    children: [
      {
        column: "Arrangements",
        items: [
          { label: "Bouquets", href: "/category/bouquets" },
          { label: "Flower Baskets", href: "/category/flower-baskets" },
          { label: "Flower Decoration", href: "/category/flower-decoration" },
          { label: "Car Flowers", href: "/category/car-flowers" },
        ],
      },
    ],
  },
  {
    label: "Events",
    href: "/category/events",
    icon: <Sparkles size={16} />,
    children: [
      {
        column: "Services",
        items: [
          { label: "Candlelight Dinner", href: "/category/candlelight-dinner" },
          { label: "Surprise Planning", href: "/category/surprise-planning" },
          { label: "Romantic Setup", href: "/category/romantic-setup" },
          { label: "Party Setup", href: "/category/party-setup" },
        ],
      },
    ],
  },
  {
    label: "Corporate",
    href: "/category/corporate-events",
    icon: <Building2 size={16} />,
  },
];

export default function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="flex items-center gap-0.5 h-11">
      {menuData.map((item) => (
        <div
          key={item.label}
          className="relative menu-trigger"
          onMouseEnter={() => setActiveMenu(item.label)}
          onMouseLeave={() => setActiveMenu(null)}
        >
          <Link
            href={item.href}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-700 hover:text-violet-600 font-medium rounded-lg hover:bg-violet-50/50 transition-all"
          >
            <span className="text-violet-500 hidden lg:block">{item.icon}</span>
            {item.label}
            {item.children && <ChevronDown size={14} className="text-gray-400 ml-0.5" />}
          </Link>

          {/* Mega Menu Dropdown */}
          {item.children && activeMenu === item.label && (
            <div className="mega-menu absolute left-0 top-full pt-2 z-50" style={{ opacity: 1, visibility: "visible", transform: "translateY(0)" }}>
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 min-w-[400px]">
                <div className="flex gap-8">
                  {item.children.map((col) => (
                    <div key={col.column} className="min-w-[160px]">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {col.column}
                      </h3>
                      <ul className="space-y-0.5">
                        {col.items.map((subItem) => (
                          <li key={subItem.label}>
                            <Link
                              href={subItem.href}
                              className="block px-2 py-1.5 text-sm text-gray-600 hover:text-violet-600 hover:bg-violet-50 rounded-md transition-colors"
                            >
                              {subItem.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-violet-600 hover:text-violet-700"
                  >
                    View all {item.label} →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

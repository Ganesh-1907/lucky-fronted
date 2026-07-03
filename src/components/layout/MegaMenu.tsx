"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Sparkles, PartyPopper, Heart, Cake, Flower2, Building2 } from "lucide-react";
import { useMenu } from "@/hooks/useApi";

const defaultIcon = <Sparkles size={16} />;

const mapIcon = (slug: string) => {
  if (slug.includes("birthday") || slug.includes("decoration")) return <PartyPopper size={16} />;
  if (slug.includes("wedding") || slug.includes("anniversary") || slug.includes("romantic")) return <Heart size={16} />;
  if (slug.includes("cake")) return <Cake size={16} />;
  if (slug.includes("flower")) return <Flower2 size={16} />;
  if (slug.includes("corporate")) return <Building2 size={16} />;
  return defaultIcon;
};

export default function MegaMenu() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { data } = useMenu();
  const menuItems = data?.data || [];

  // Transform backend menu builder items into layout structure
  const menuData = menuItems.map((item: any) => ({
    id: item.id,
    label: item.label,
    href: item.url || "#",
    icon: mapIcon(item.url || ""),
    children: item.children?.length > 0 ? [{
      column: "Quick Links",
      items: item.children.map((child: any) => ({
        id: child.id,
        label: child.label,
        href: child.url || "#"
      }))
    }] : undefined
  }));

  if (!menuData.length) return null;

  return (
    <nav className="flex items-center gap-0.5 h-11">
      {menuData.slice(0, 6).map((item: any) => (
        <div
          key={item.id}
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
                  {item.children.map((col: any) => (
                    <div key={col.column} className="min-w-[160px]">
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        {col.column}
                      </h3>
                      <ul className="space-y-0.5">
                        {col.items.map((subItem: any) => (
                          <li key={subItem.id}>
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

"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search, MapPin, User, Heart, ShoppingBag, Menu, X, ChevronDown,
  LogOut, Settings, Bell, LayoutDashboard
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { useCityStore } from "@/store/city";
import CitySelector from "./CitySelector";
import MegaMenu from "./MegaMenu";
import { cn } from "@/lib/utils";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();
  const { selectedCity, openModal } = useCityStore();

  // Hide header on admin/vendor dashboard pages
  const isDashboard = pathname?.startsWith("/admin") || pathname?.startsWith("/vendor");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  if (isDashboard) return null;

  const getDashboardLink = () => {
    if (!user) return "/auth/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "VENDOR") return "/vendor";
    return "/account";
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-white/95 backdrop-blur-md shadow-md"
            : "bg-white"
        )}
      >
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs py-1.5">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <p className="hidden sm:block">🎉 Get 20% off on your first booking! Use code <strong>WELCOME20</strong></p>
            <p className="sm:hidden text-center w-full">🎉 Use code <strong>WELCOME20</strong> for 20% off!</p>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/about" className="hover:underline">About</Link>
              <Link href="/contact" className="hover:underline">Contact</Link>
              {isAuthenticated && (
                <Link href={getDashboardLink()} className="hover:underline">
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-[72px]">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>L</span>
              </div>
              <span
                className="text-xl font-bold hidden sm:block"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                <span className="gradient-text">Lucky</span>
              </span>
            </Link>

            {/* City Selector */}
            <button
              onClick={openModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-50 border border-gray-200 text-sm ml-4 transition-colors"
            >
              <MapPin size={16} className="text-violet-600" />
              <span className="text-gray-600 max-w-[100px] truncate">
                {selectedCity || "Select City"}
              </span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {/* Search Bar — Desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-6">
              <div className="relative w-full">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search for decorations, events, cakes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 transition-all"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Search */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search size={20} />
              </button>

              {/* Mobile City */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={openModal}
              >
                <MapPin size={20} className="text-violet-600" />
              </button>

              {/* Wishlist */}
              {isAuthenticated && (
                <Link
                  href="/wishlist"
                  className="p-2 rounded-lg hover:bg-gray-100 relative hidden sm:flex"
                >
                  <Heart size={20} className="text-gray-600" />
                </Link>
              )}

              {/* Notifications */}
              {isAuthenticated && (
                <Link
                  href="/notifications"
                  className="p-2 rounded-lg hover:bg-gray-100 relative hidden sm:flex"
                >
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>
              )}

              {/* User Menu */}
              {!_hasHydrated ? (
                /* Show subtle placeholder while auth state is loading */
                <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse" />
              ) : isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:pl-3 sm:pr-2 rounded-xl hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                  >
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[80px] truncate">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {user?.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        href={getDashboardLink()}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700"
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                      <Link
                        href="/bookings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700"
                      >
                        <ShoppingBag size={16} /> My Bookings
                      </Link>
                      <Link
                        href="/wishlist"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700"
                      >
                        <Heart size={16} /> Wishlist
                      </Link>
                      <Link
                        href="/account/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 text-gray-700"
                      >
                        <Settings size={16} /> Settings
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={logout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 w-full"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-violet-600 hidden sm:block transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg gradient-primary hover:opacity-90 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Bar with Mega Menu */}
        <nav className="hidden md:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <MegaMenu />
          </div>
        </nav>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden p-4 border-t border-gray-100 animate-fade-in">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-violet-400"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 md:hidden overflow-y-auto animate-fade-in shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold" style={{ fontFamily: "var(--font-outfit)" }}>L</span>
                </div>
                <span className="font-bold text-lg gradient-text" style={{ fontFamily: "var(--font-outfit)" }}>
                  Lucky
                </span>
              </Link>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            {isAuthenticated && (
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            )}

            <div className="p-4 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Categories</p>
              {["Birthday Decorations", "Wedding Decorations", "Anniversary", "Cakes", "Flowers", "Corporate Events"].map(
                (item) => (
                  <Link
                    key={item}
                    href={`/category/${item.toLowerCase().replace(/\s+/g, "-")}`}
                    className="block px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-violet-50 hover:text-violet-600 transition-colors"
                  >
                    {item}
                  </Link>
                )
              )}
            </div>

            <div className="p-4 border-t border-gray-100 space-y-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Quick Links</p>
              <Link href="/services" className="block px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50">
                All Services
              </Link>
              <Link href="/about" className="block px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50">
                About Us
              </Link>
              <Link href="/contact" className="block px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-gray-50">
                Contact
              </Link>
            </div>

            {!isAuthenticated && (
              <div className="p-4 border-t border-gray-100 space-y-2">
                <Link
                  href="/auth/login"
                  className="block w-full text-center px-4 py-2.5 text-sm font-medium border border-violet-600 text-violet-600 rounded-lg hover:bg-violet-50"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block w-full text-center px-4 py-2.5 text-sm font-medium text-white rounded-lg gradient-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-600 rounded-lg hover:bg-red-50 w-full"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* City Selector Modal */}
      <CitySelector />

      {/* Spacer for fixed header */}
      <div className={cn("h-[106px] md:h-[140px]", isDashboard && "h-0 md:h-0")} />
    </>
  );
}

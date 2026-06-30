"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Clock, MapPin, Phone, Download, Home, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Suspense } from "react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id") || "LM7X8K2A";

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce-slow">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
            Booking Confirmed! 🎉
          </h1>
          <p className="text-gray-500">Your booking has been successfully placed</p>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="gradient-primary p-6 text-white text-center">
            <p className="text-sm opacity-80">Booking ID</p>
            <p className="text-2xl font-mono font-bold tracking-wider mt-1">{bookingId}</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                <span className="text-xl">🎈</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">Premium Birthday Balloon Decoration</p>
                <p className="text-xs text-gray-500">by Dream Decorators</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Calendar size={16} className="text-violet-600" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">Mar 20, 2024</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Clock size={16} className="text-violet-600" />
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-sm font-medium text-gray-900">10:00 AM</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
              <MapPin size={16} className="text-violet-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Delivery Address</p>
                <p className="text-sm text-gray-900">Flat 12, Dream Apartments, Andheri West, Mumbai 400058</p>
              </div>
            </div>

            {/* Payment */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium text-gray-900">{formatPrice(4718)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Advance Paid</span>
                <span className="font-bold text-green-600">{formatPrice(2359)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining (pay after service)</span>
                <span className="font-medium text-amber-600">{formatPrice(2359)}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="px-6 pb-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-sm font-medium text-emerald-800 mb-1">📞 Vendor will contact you</p>
              <p className="text-xs text-emerald-600">Dream Decorators will reach out within 2 hours to confirm the setup details.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Link href="/bookings" className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-medium text-sm">
            <ShoppingBag size={16} /> View My Bookings
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50">
            <Home size={16} /> Home
          </Link>
        </div>

        {/* WhatsApp Share */}
        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">Share booking details via</p>
          <div className="flex justify-center gap-2 mt-2">
            <button className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700">
              WhatsApp
            </button>
            <button className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200">
              <Download size={12} className="inline mr-1" /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Calendar, Clock, MapPin, Phone, Download, Home, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Suspense, useEffect, useState } from "react";
import api from "@/lib/api";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("id");
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await api.get<{success: boolean, data: any}>(`/bookings/${bookingId}`);
        if (res.success) {
          setBooking(res.data);
        } else {
          setError("Failed to fetch booking details");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p>Loading booking details...</p></div>;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link href="/" className="text-violet-600 underline">Return Home</Link>
        </div>
      </div>
    );
  }

  const { service, vendor, client } = booking;
  const bookingDate = new Date(booking.bookingDate).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
  const totalAmount = Number(booking.totalAmount);
  const advancePaid = Number(booking.advancePaid);
  const remainingAmount = Number(booking.remainingAmount);

  const handleWhatsAppShare = () => {
    const message = `🎉 *Booking Confirmed!* 🎉\n\n` +
      `*Service:* ${service?.title || 'Service'}\n` +
      `*Vendor:* ${vendor?.businessName || 'Vendor'}\n` +
      `*Date:* ${bookingDate}\n` +
      `*Time:* ${booking.timeSlot}\n` +
      `*Total:* ${formatPrice(totalAmount)}\n` +
      `*Advance Paid:* ${formatPrice(advancePaid)}\n\n` +
      `*Booking ID:* ${booking.bookingNumber}\n` +
      `Thank you for choosing Lucky Marketplace!`;
      
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4 py-10">
      <div className="max-w-lg w-full">
        {/* Success Animation */}
        <div className="text-center mb-8 print:hidden">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce-slow">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
            Booking Confirmed! 🎉
          </h1>
          <p className="text-gray-500">Your booking has been successfully placed</p>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * { visibility: hidden; }
            #receipt, #receipt * { visibility: visible; }
            #receipt { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}} />

        {/* Booking Card */}
        <div id="receipt" className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="gradient-primary p-6 text-white text-center">
            <p className="text-sm opacity-80">Booking ID</p>
            <p className="text-2xl font-mono font-bold tracking-wider mt-1">{booking.bookingNumber}</p>
          </div>

          {/* Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3 p-3 bg-violet-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                <span className="text-xl">🎈</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900">{service?.title || "Service"}</p>
                <p className="text-xs text-gray-500">by {vendor?.businessName || "Vendor"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Calendar size={16} className="text-violet-600" />
                <div>
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="text-sm font-medium text-gray-900">{bookingDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                <Clock size={16} className="text-violet-600" />
                <div>
                  <p className="text-xs text-gray-500">Time</p>
                  <p className="text-sm font-medium text-gray-900">{booking.timeSlot}</p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
              <MapPin size={16} className="text-violet-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">Delivery Address</p>
                <p className="text-sm text-gray-900">{booking.address}, {booking.city} {booking.pincode}</p>
              </div>
            </div>

            {/* Payment */}
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium text-gray-900">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Advance Paid</span>
                <span className="font-bold text-green-600">{formatPrice(advancePaid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining (pay after service)</span>
                <span className="font-medium text-amber-600">{formatPrice(remainingAmount)}</span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="px-6 pb-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <p className="text-sm font-medium text-emerald-800 mb-1">📞 Vendor will contact you</p>
              <p className="text-xs text-emerald-600">{vendor?.businessName || "Vendor"} will reach out within 2 hours to confirm the setup details.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 print:hidden">
          <Link href="/bookings" className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-medium text-sm hover:opacity-90 transition-opacity">
            <ShoppingBag size={16} /> View My Bookings
          </Link>
          <Link href="/" className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors">
            <Home size={16} /> Home
          </Link>
        </div>

        {/* WhatsApp Share */}
        <div className="text-center mt-4 print:hidden">
          <p className="text-xs text-gray-400">Share booking details via</p>
          <div className="flex justify-center gap-2 mt-2">
            <button onClick={handleWhatsAppShare} className="px-4 py-2 rounded-lg bg-green-600 text-white text-xs font-medium hover:bg-green-700 transition-colors">
              WhatsApp
            </button>
            <button onClick={handleDownloadPDF} className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200 transition-colors">
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

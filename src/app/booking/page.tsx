"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Calendar, Clock, MapPin, CheckCircle,
  Plus, Minus, CreditCard, Shield, ArrowRight, Star, ChevronDown
} from "lucide-react";
import { cn, formatPrice, calculateDiscount } from "@/lib/utils";
import toast from "react-hot-toast";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const timeSlots = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM", "08:00 PM",
];

// Demo service data — in production this comes from API
const service = {
  id: 1,
  title: "Premium Birthday Balloon Decoration",
  slug: "premium-birthday-balloon-decoration",
  basePrice: 4999,
  discountPrice: 3999,
  minAdvancePercent: 50,
  images: [],
  avgRating: 4.5,
  reviewCount: 128,
  vendor: { businessName: "Dream Decorators", avgRating: 4.7 },
  category: { name: "Balloon Decorations" },
};

const addons = [
  { id: 1, name: "LED String Lights", price: 499, description: "Warm white fairy lights (20ft)" },
  { id: 2, name: "Photo Banner", price: 299, description: "Custom printed birthday banner" },
  { id: 3, name: "Flower Bouquet", price: 399, description: "Mixed flower bouquet with ribbon" },
  { id: 4, name: "Cake Table Setup", price: 599, description: "Decorated cake table with backdrop" },
  { id: 5, name: "Number Foil Balloon", price: 199, description: "Gold/Silver foil age number" },
];

const blockedDates = ["2024-03-25", "2024-04-01"];

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [address, setAddress] = useState({ name: "", phone: "", line1: "", city: "Mumbai", pincode: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState<"FULL" | "ADVANCE">("ADVANCE");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const formatDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const toggleAddon = (id: number) => {
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const servicePrice = service.discountPrice || service.basePrice;
  const addonsTotal = selectedAddons.reduce((sum, id) => {
    const a = addons.find(x => x.id === id);
    return sum + (a?.price || 0);
  }, 0);
  const subtotal = servicePrice + addonsTotal;
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;
  const advance = Math.round(total * (service.minAdvancePercent / 100));

  const canProceed = (s: number) => {
    if (s === 1) return !!selectedDate && !!selectedTime;
    if (s === 2) return true; // addons optional
    if (s === 3) return address.name && address.phone && address.line1 && address.city && address.pincode;
    return true;
  };

  const handlePayment = () => {
    toast.success("Redirecting to payment gateway...");
    setTimeout(() => {
      router.push(`/booking/confirmation?id=LM${Date.now().toString(36).toUpperCase()}`);
    }, 1500);
  };

  const steps = [
    { num: 1, label: "Date & Time" },
    { num: 2, label: "Add-ons" },
    { num: 3, label: "Address" },
    { num: 4, label: "Payment" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href={`/service/${service.slug}`} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Book Service</h1>
            <p className="text-sm text-gray-500">{service.title}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {steps.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                  step > s.num ? "bg-green-500 text-white" :
                  step === s.num ? "gradient-primary text-white" :
                  "bg-gray-100 text-gray-400"
                )}>
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
                <span className={cn("text-xs font-medium hidden sm:block", step >= s.num ? "text-gray-900" : "text-gray-400")}>{s.label}</span>
                {i < steps.length - 1 && <div className={cn("w-8 sm:w-16 h-0.5 rounded-full ml-2", step > s.num ? "bg-green-500" : "bg-gray-200")} />}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Date & Time */}
            {step === 1 && (
              <>
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-violet-600" /> Select Date
                  </h2>
                  <div className="flex items-center justify-between mb-4">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-gray-100"><ChevronLeft size={16} /></button>
                    <h3 className="font-semibold text-gray-900">{MONTHS[month]} {year}</h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-gray-100"><ChevronRight size={16} /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {DAYS.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-2">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                      const day = i + 1;
                      const dateStr = formatDateStr(day);
                      const dateObj = new Date(year, month, day);
                      const isPast = dateObj <= today;
                      const isBlocked = blockedDates.includes(dateStr);
                      const isSelected = selectedDate === dateStr;
                      const disabled = isPast || isBlocked;

                      return (
                        <button key={day} disabled={disabled} onClick={() => setSelectedDate(dateStr)}
                          className={cn(
                            "aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all",
                            disabled ? "text-gray-300 cursor-not-allowed" :
                            isSelected ? "bg-violet-600 text-white shadow-lg shadow-violet-200" :
                            "text-gray-700 hover:bg-violet-50 hover:text-violet-700"
                          )}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-violet-600" /> Select Time Slot
                  </h2>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {timeSlots.map(slot => (
                      <button key={slot} onClick={() => setSelectedTime(slot)}
                        className={cn(
                          "px-3 py-3 rounded-xl text-sm font-medium border-2 transition-all",
                          selectedTime === slot
                            ? "border-violet-500 bg-violet-50 text-violet-700"
                            : "border-gray-200 text-gray-600 hover:border-violet-200"
                        )}>
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Add-ons */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-1">Enhance Your Experience</h2>
                <p className="text-sm text-gray-500 mb-4">Optional add-ons to make your celebration extra special</p>
                <div className="space-y-3">
                  {addons.map(addon => {
                    const isSelected = selectedAddons.includes(addon.id);
                    return (
                      <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                        className={cn(
                          "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                          isSelected ? "border-violet-500 bg-violet-50" : "border-gray-200 hover:border-violet-200"
                        )}>
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all",
                          isSelected ? "border-violet-600 bg-violet-600" : "border-gray-300"
                        )}>
                          {isSelected && <CheckCircle size={14} className="text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{addon.name}</p>
                          <p className="text-xs text-gray-500">{addon.description}</p>
                        </div>
                        <span className="text-sm font-bold text-violet-600">+{formatPrice(addon.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Address */}
            {step === 3 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-violet-600" /> Delivery Address
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input type="text" value={address.name} onChange={e => setAddress({...address, name: e.target.value})} placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                    <input type="tel" value={address.phone} onChange={e => setAddress({...address, phone: e.target.value})} placeholder="+91 98765 43210"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
                    <input type="text" value={address.line1} onChange={e => setAddress({...address, line1: e.target.value})} placeholder="Flat/Building, Street"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                    <input type="text" value={address.city} onChange={e => setAddress({...address, city: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                    <input type="text" value={address.pincode} onChange={e => setAddress({...address, pincode: e.target.value})} placeholder="400001"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Notes</label>
                    <textarea value={address.notes} onChange={e => setAddress({...address, notes: e.target.value})} placeholder="Any special instructions for the vendor..." rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Payment */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-6">
                  <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard size={18} className="text-violet-600" /> Payment Option
                  </h2>
                  <div className="space-y-3">
                    <button onClick={() => setPaymentMethod("ADVANCE")}
                      className={cn("w-full p-4 rounded-xl border-2 text-left transition-all",
                        paymentMethod === "ADVANCE" ? "border-violet-500 bg-violet-50" : "border-gray-200"
                      )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Pay Advance ({service.minAdvancePercent}%)</p>
                          <p className="text-xs text-gray-500">Pay the remaining after service completion</p>
                        </div>
                        <span className="text-lg font-bold text-violet-600">{formatPrice(advance)}</span>
                      </div>
                    </button>
                    <button onClick={() => setPaymentMethod("FULL")}
                      className={cn("w-full p-4 rounded-xl border-2 text-left transition-all",
                        paymentMethod === "FULL" ? "border-violet-500 bg-violet-50" : "border-gray-200"
                      )}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">Pay Full Amount</p>
                          <p className="text-xs text-gray-500">Complete payment now — no balance remaining</p>
                        </div>
                        <span className="text-lg font-bold text-violet-600">{formatPrice(total)}</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-3">
                  <Shield size={18} className="text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">100% Secure Payment</p>
                    <p className="text-xs text-green-600">Payments are secured by Razorpay. Your money is safe.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between">
              {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  ← Back
                </button>
              ) : (
                <Link href={`/service/${service.slug}`} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
                  ← Back to Service
                </Link>
              )}
              {step < 4 ? (
                <button onClick={() => canProceed(step) && setStep(step + 1)} disabled={!canProceed(step)}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all">
                  Continue <ArrowRight size={14} />
                </button>
              ) : (
                <button onClick={handlePayment}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                  <CreditCard size={16} /> Pay {formatPrice(paymentMethod === "FULL" ? total : advance)}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <h3 className="font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Order Summary</h3>
              <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center shrink-0">
                  <span className="text-2xl">🎈</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{service.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">by {service.vendor.businessName}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium">{service.avgRating}</span>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              {selectedDate && (
                <div className="mb-4 pb-4 border-b border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={13} className="text-violet-500" />
                    <span className="text-gray-700">{selectedDate}</span>
                  </div>
                  {selectedTime && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={13} className="text-violet-500" />
                      <span className="text-gray-700">{selectedTime}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium text-gray-900">{formatPrice(servicePrice)}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Add-ons ({selectedAddons.length})</span>
                    <span className="font-medium text-gray-900">+{formatPrice(addonsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium text-gray-900">{formatPrice(gst)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">{formatPrice(total)}</span>
                </div>
                {service.discountPrice && (
                  <p className="text-xs text-green-600 text-right font-medium">
                    You save {formatPrice(service.basePrice - service.discountPrice)} 🎉
                  </p>
                )}
              </div>

              {step === 4 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{paymentMethod === "FULL" ? "Paying now" : "Advance"}</span>
                    <span className="font-bold text-violet-600">{formatPrice(paymentMethod === "FULL" ? total : advance)}</span>
                  </div>
                  {paymentMethod === "ADVANCE" && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pay after service</span>
                      <span className="font-medium text-gray-500">{formatPrice(total - advance)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <BookingContent />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle, TrendingUp, Users, Shield, DollarSign } from "lucide-react";

export default function VendorInfoPage() {
  const benefits = [
    { icon: <TrendingUp className="text-violet-500" />, title: "Grow Your Business", desc: "Reach thousands of customers looking for premium decoration and event services." },
    { icon: <DollarSign className="text-emerald-500" />, title: "Zero Upfront Fees", desc: "List your services for free. We only charge a small commission when you get a booking." },
    { icon: <Users className="text-amber-500" />, title: "Manage Easily", desc: "Use our dedicated vendor dashboard to manage bookings, services, and earnings in one place." },
    { icon: <Shield className="text-blue-500" />, title: "Secure Payments", desc: "Get paid securely and on time directly to your registered bank account." },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold mb-6">Vendor Partner Program</span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ fontFamily: "var(--font-outfit)" }}>
            Turn Your Creativity Into a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">Thriving Business</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the Lucky Marketplace network of elite decorators and event planners. Showcase your talent, reach more clients, and scale your business effortlessly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/auth/register?role=vendor" className="px-8 py-4 bg-white text-violet-900 rounded-xl font-bold text-lg hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
              Start Selling Today <ArrowRight size={20} />
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-white/10 border border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-7xl mx-auto px-4 mt-[-40px] relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center hover:-translate-y-1 transition-transform">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                {benefit.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{benefit.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="max-w-5xl mx-auto px-4 py-20 mt-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>How It Works</h2>
          <p className="text-gray-500">Getting started is completely free and takes only 5 minutes.</p>
        </div>
        
        <div className="space-y-12">
          {[
            { step: "1", title: "Create Your Account", desc: "Register your business details, upload your KYC documents, and set up your vendor profile." },
            { step: "2", title: "List Your Services", desc: "Add your decoration packages, set your pricing, and upload beautiful photos of your past work." },
            { step: "3", title: "Receive Bookings", desc: "Customers find you and book your services. You get notified instantly on your dashboard." },
            { step: "4", title: "Fulfill & Get Paid", desc: "Complete the decoration, make the customer smile, and receive your payment directly to your bank account." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 shrink-0 bg-violet-100 text-violet-600 rounded-2xl flex items-center justify-center text-2xl font-bold">
                {item.step}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto px-4 text-center pb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to expand your decoration business?</h2>
        <Link href="/auth/register?role=vendor" className="inline-flex px-8 py-4 bg-violet-600 text-white rounded-xl font-bold text-lg hover:bg-violet-700 hover:shadow-lg transition-all items-center gap-2">
          Register as Vendor Now <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
}

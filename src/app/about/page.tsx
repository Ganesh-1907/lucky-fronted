import Link from "next/link";
import {
  Users, Award, Shield, Heart, Star, Sparkles,
  CheckCircle, ArrowRight, ChevronRight
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
            About Lucky Marketplace
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            We&apos;re on a mission to make every celebration unforgettable by connecting customers with the best event service providers across India.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60L1440 60V30C1440 30 1320 0 1200 0C1080 0 960 30 840 30C720 30 600 0 480 0C360 0 240 30 120 30C60 30 0 15 0 15V60Z" fill="#FAFAFA" /></svg>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-5xl mx-auto px-4 -mt-1 mb-16">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "50,000+", label: "Happy Customers" },
            { value: "1,200+", label: "Verified Vendors" },
            { value: "500+", label: "Cities Covered" },
            { value: "4.8/5", label: "Average Rating" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-bold gradient-text" style={{ fontFamily: "var(--font-outfit)" }}>{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Our Story</h2>
          <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto">
            Lucky Marketplace was born from a simple idea: everyone deserves a beautiful celebration, regardless of budget or location. We noticed that finding reliable decoration and event service providers was a challenge — quality was inconsistent, pricing opaque, and options were limited.
          </p>
          <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto mt-4">
            So we built a platform that brings together the best vendors across India, ensuring quality through verification, transparent pricing, and customer reviews. Whether it&apos;s a simple birthday balloon setup or an extravagant wedding decoration, we make sure every celebration is special.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10" style={{ fontFamily: "var(--font-outfit)" }}>
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Shield size={24} />, title: "Trust & Transparency", desc: "Every vendor is verified. Every price is upfront. No hidden charges, no surprises.", color: "from-violet-500 to-purple-500" },
              { icon: <Award size={24} />, title: "Quality First", desc: "We maintain high standards through regular quality audits and customer feedback.", color: "from-emerald-500 to-teal-500" },
              { icon: <Heart size={24} />, title: "Customer Obsession", desc: "Your satisfaction is our priority. From booking to completion, we ensure a seamless experience.", color: "from-pink-500 to-rose-500" },
            ].map((val, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-gray-100 text-center card-hover">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${val.color} flex items-center justify-center text-white`}>
                  {val.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-sm text-gray-600">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: "var(--font-outfit)" }}>
          Ready to Celebrate?
        </h2>
        <p className="text-gray-500 mb-8">Join thousands of happy customers who trust Lucky Marketplace</p>
        <div className="flex justify-center gap-4">
          <Link href="/services" className="px-8 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity">
            Explore Services
          </Link>
          <Link href="/auth/register?role=vendor" className="px-8 py-3 rounded-xl border border-violet-200 text-violet-600 font-medium hover:bg-violet-50 transition-colors">
            Become a Vendor
          </Link>
        </div>
      </section>
    </div>
  );
}

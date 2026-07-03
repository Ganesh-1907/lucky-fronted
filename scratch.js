const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const newReturn = `
  if (!homepageSections || homepageSections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const renderSection = (section: any, idx: number) => {
    switch (section.type) {
      case 'banner':
        return (
          <div key={section.id}>
            {/* HERO SECTION */}
            <section className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-400/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" style={{ animation: "pulse-soft 4s infinite" }} />
                <div className="absolute top-40 right-40 w-48 h-48 bg-pink-400/10 rounded-full blur-2xl" style={{ animation: "pulse-soft 6s infinite" }} />
              </div>
              <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 lg:py-32">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm mb-6 border border-white/20">
                      <Sparkles size={14} className="text-amber-300" />
                      <span>Trusted by 50,000+ customers across India</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6" style={{ fontFamily: "var(--font-outfit)" }}>
                      Make Every<br />Celebration<br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-300">Unforgettable</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl leading-relaxed">
                      Book premium decoration services, event setups, and celebration packages. From birthday surprises to grand weddings — all at your doorstep.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/services" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-violet-700 font-semibold text-base hover:bg-gray-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                        Explore Services <ArrowRight size={18} />
                      </Link>
                      <Link href="/auth/register?role=vendor" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-semibold text-base border border-white/30 hover:bg-white/20 transition-all">
                        Become a Vendor
                      </Link>
                    </div>
                  </div>
                  <div className="hidden lg:flex justify-center items-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-transparent to-amber-400/20 rounded-full blur-3xl scale-110" />
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-amber-300/20 rounded-full blur-xl animate-pulse" />
                    <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-pink-300/20 rounded-full blur-xl" style={{ animation: "pulse-soft 3s infinite" }} />
                    <div className="absolute top-1/4 -right-8 w-3 h-3 bg-amber-300 rounded-full" style={{ animation: "pulse-soft 2s infinite" }} />
                    <div className="absolute bottom-1/4 -left-4 w-2 h-2 bg-pink-300 rounded-full" style={{ animation: "pulse-soft 2.5s infinite" }} />
                    <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl" style={{ transform: "rotate(2deg)", transition: "transform 0.5s ease" }} onMouseEnter={(e) => { e.currentTarget.style.transform = "rotate(0deg) scale(1.02)"; setCarouselPaused(true); }} onMouseLeave={(e) => { e.currentTarget.style.transform = "rotate(2deg)"; setCarouselPaused(false); }}>
                      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-white/10 to-transparent z-20" />
                      <div className="relative" style={{ aspectRatio: "4/3" }}>
                        {heroSlides.map((slide: any, i: number) => (
                          <div key={i} className="absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out cursor-pointer" style={{ opacity: activeSlide === i ? 1 : 0 }} onClick={() => slide.link && router.push(slide.link)}>
                            <img src={slide.src} alt={slide.alt} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent p-6 z-20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                              {heroSlides[activeSlide]?.emoji}
                            </div>
                            <div>
                              <p className="text-white text-sm font-semibold">{heroSlides[activeSlide]?.label}</p>
                              <p className="text-white/70 text-xs">{heroSlides[activeSlide]?.sublabel}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {heroSlides.map((_: any, i: number) => (
                              <button key={i} onClick={() => setActiveSlide(i)} className={\`rounded-full transition-all duration-300 \${activeSlide === i ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/60"}\`} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 60" fill="none" className="w-full">
                  <path d="M0 60L1440 60V30C1440 30 1320 0 1200 0C1080 0 960 30 840 30C720 30 600 0 480 0C360 0 240 30 120 30C60 30 0 15 0 15V60Z" fill="#FAFAFA" />
                </svg>
              </div>
            </section>
            
            {/* STATS BAR */}
            <section className="relative -mt-1 mb-12">
              <div className="max-w-5xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="flex items-center gap-3 justify-center">
                      <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        );
      
      case 'categories':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 mb-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-outfit)" }}>{section.title || "Browse Categories"}</h2>
              <p className="text-gray-500 max-w-xl mx-auto">{section.subtitle || "Find the perfect service for your celebration"}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat: any, i: number) => (
                <Link key={cat.slug} href={\`/category/\${cat.slug}\`} className="group relative overflow-hidden rounded-2xl p-5 bg-white border border-gray-100 card-hover" style={{ animationDelay: \`\${i * 0.05}s\` }}>
                  <div className={\`w-14 h-14 rounded-2xl bg-gradient-to-br \${cat.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-300\`}>
                    {cat.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-violet-600 transition-colors">{cat.name}</h3>
                  <p className="text-xs text-gray-400">{cat.count} services</p>
                  <ChevronRight size={16} className="absolute top-5 right-5 text-gray-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        );

      case 'services':
        const displayServices = section.data?.length ? section.data : (section.name === 'trending' ? trendingServices : bestsellerServices);
        return (
          <section key={section.id} className={\`\${section.name === 'best_sellers' ? 'bg-gradient-to-b from-violet-50/50 to-transparent py-16 mb-16' : 'max-w-7xl mx-auto px-4 mb-16'}\`}>
            <div className={\`\${section.name === 'best_sellers' ? 'max-w-7xl mx-auto px-4' : ''}\`}>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {section.name === 'trending' ? <TrendingUp size={20} className="text-red-500" /> : <Star size={20} className="text-amber-500 fill-amber-500" />}
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{section.title}</h2>
                  </div>
                  <p className="text-gray-500 text-sm">{section.subtitle}</p>
                </div>
                <Link href={\`/services?sort=\${section.name === 'trending' ? 'popular' : 'rating'}\`} className="hidden sm:flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700 hover:gap-2 transition-all">
                  View All <ArrowRight size={16} />
                </Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {displayServices.map((service: any) => (
                  <ServiceCard key={service.id} {...service} className="animate-fade-in" />
                ))}
              </div>
            </div>
          </section>
        );

      case 'how_it_works':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-outfit)" }}>{section.title}</h2>
              <p className="text-gray-500 max-w-xl mx-auto">{section.subtitle || "Book your celebration in 3 simple steps"}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Choose a Service", desc: "Browse from 1000+ decoration and event services across your city", icon: "🔍", color: "from-violet-500 to-purple-500" },
                { step: "02", title: "Customize & Book", desc: "Select add-ons, pick your date & time, and pay a small advance", icon: "📅", color: "from-pink-500 to-rose-500" },
                { step: "03", title: "Enjoy Your Event", desc: "Our verified vendors will setup everything at your doorstep", icon: "🎉", color: "from-amber-500 to-orange-500" }
              ].map((item, i) => (
                <div key={i} className="relative text-center p-8 bg-white rounded-2xl border border-gray-100 card-hover">
                  <div className={\`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br \${item.color} flex items-center justify-center text-3xl shadow-lg\`}>{item.icon}</div>
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">Step {item.step}</span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight size={24} className="text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'vendor_cta':
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 mb-16">
            <div className="relative rounded-3xl overflow-hidden gradient-primary p-10 md:p-16">
              <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/3" />
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>{section.title}</h2>
                <p className="text-lg text-white/80 mb-8">{section.subtitle || "Join Lucky Marketplace and reach thousands of customers."}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/auth/register?role=vendor" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-violet-700 font-semibold hover:shadow-xl transition-all">
                    Register as Vendor <ArrowRight size={18} />
                  </Link>
                  <Link href="/vendor-info" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 text-white font-semibold border border-white/30 hover:bg-white/20 transition-all">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </section>
        );

      case 'testimonials':
        const displayReviews = section.data?.length ? section.data : [
          { name: "Priya Sharma", avatar: "P", rating: 5, comment: "Absolutely stunning birthday decoration!", service: { title: "Premium Birthday Balloon Decoration" }, client: { name: "Priya Sharma" } },
          { name: "Rahul Verma", avatar: "R", rating: 5, comment: "Everything was perfect — the ambiance, setup, and attention to detail.", service: { title: "Romantic Candlelight Dinner Setup" }, client: { name: "Rahul Verma" } },
        ];
        return (
          <section key={section.id} className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-outfit)" }}>{section.title}</h2>
                <p className="text-gray-500">{section.subtitle}</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {displayReviews.map((review: any, i: number) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-1 mb-3">
                      {Array.from({ length: review.rating || 5 }).map((_, j) => (
                        <Star key={j} size={14} className="text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{review.comment}&rdquo;</p>
                    <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                      <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                        {(review.client?.name || review.name || "U")[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{review.client?.name || review.name}</p>
                        <p className="text-xs text-gray-400">{review.service?.title || "Service"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'cities':
        const displayCities = section.data?.length ? section.data.map((c:any)=>c.name) : ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Jaipur", "Ahmedabad", "Lucknow"];
        return (
          <section key={section.id} className="max-w-7xl mx-auto px-4 py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3" style={{ fontFamily: "var(--font-outfit)" }}>{section.title}</h2>
              <p className="text-gray-500">{section.subtitle}</p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {displayCities.map((city: string) => (
                <Link key={city} href={\`/services?city=\${city.toLowerCase()}\`} className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 transition-all">
                  📍 {city}
                </Link>
              ))}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      {homepageSections.map((section: any, idx: number) => renderSection(section, idx))}
    </div>
  );
`;

const replaceRegex = /return \(\s*<div className="min-h-screen">[\s\S]*?\);\s*}\s*$/;
const newCode = content.replace(replaceRegex, newReturn + '\n}');
fs.writeFileSync('src/app/page.tsx', newCode);
console.log('Done replacement');

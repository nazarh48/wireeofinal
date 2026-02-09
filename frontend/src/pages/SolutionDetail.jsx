import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiService, getImageUrl } from "../services/api";

// Dummy feature grid items (used when solution has fewer than 6 features)
const DEFAULT_FEATURE_GRID = [
  { icon: "⚙️", title: "Centralized Control", desc: "Manage all systems from one intuitive interface." },
  { icon: "👤", title: "User Management", desc: "Role-based access and permissions for your team." },
  { icon: "☁️", title: "Cloud Ready", desc: "Secure cloud sync and remote access." },
  { icon: "📄", title: "Reports & Analytics", desc: "Insights and reporting at your fingertips." },
  { icon: "🔌", title: "Integration", desc: "Connect with KNX, Modbus, and more." },
  { icon: "🛡️", title: "Security", desc: "Enterprise-grade security and compliance." },
];

// Alternating highlight blocks (dummy content like reference page)
const HIGHLIGHT_BLOCKS = [
  { title: "Universal IoT Gateway", desc: "Connect and integrate all your devices and protocols through a single, powerful gateway. Seamless interoperability for your smart building.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", imageLeft: false },
  { title: "Cloud Infrastructure", desc: "Scalable, secure cloud infrastructure that grows with your needs. Real-time data sync and analytics across all your sites.", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80", imageLeft: true },
  { title: "Smart Automation", desc: "Intelligent scenarios and schedules that adapt to occupancy and conditions. Save energy and enhance comfort automatically.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80", imageLeft: false },
  { title: "Energy Efficiency", desc: "Monitor consumption, identify savings, and integrate renewables. Meet sustainability goals with actionable insights.", image: "https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?w=800&q=80", imageLeft: true },
  { title: "Building Data & Reporting", desc: "Centralized dashboards and reports for all your building data. Export and share with stakeholders effortlessly.", image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", imageLeft: false },
  { title: "Integrated Security", desc: "Access control, surveillance, and alarm integration in one platform. Keep your people and assets safe.", image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80", imageLeft: true },
];

export default function SolutionDetail() {
  const { id } = useParams();
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    apiService.solutions
      .getById(id)
      .then((res) => {
        if (!cancelled) setSolution(res?.solution ?? null);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message || "Failed to load solution");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !solution) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Solution not found</h1>
          <p className="text-gray-600 mb-4">{error || "The solution you're looking for doesn't exist."}</p>
          <Link to="/solutions" className="text-blue-600 font-semibold hover:text-blue-700">
            Back to Solutions
          </Link>
        </div>
      </div>
    );
  }

  const imageUrls = [
    ...(solution.image && typeof solution.image === "string" ? [solution.image] : []),
    ...(Array.isArray(solution.images)
      ? solution.images.map((i) => (typeof i === "string" ? i : i?.url)).filter(Boolean)
      : []),
  ].filter(Boolean);
  const mainImage = imageUrls[0] ? getImageUrl(imageUrls[0]) : "";
  const downloadableFiles = Array.isArray(solution.downloadableFiles) ? solution.downloadableFiles : [];
  const downloadSolutionUrl = downloadableFiles.length > 0
    ? (typeof downloadableFiles[0] === "string" ? downloadableFiles[0] : downloadableFiles[0]?.url)
    : null;

  let features = [];
  if (Array.isArray(solution.features)) {
    features = solution.features;
  } else if (typeof solution.features === "string" && solution.features.trim()) {
    try {
      const parsed = JSON.parse(solution.features);
      features = Array.isArray(parsed) ? parsed : [solution.features];
    } catch {
      features = solution.features.split(/\n|,/).map((s) => s.trim()).filter(Boolean);
    }
  }
  const featureGridItems = Array.from({ length: 6 }, (_, i) => {
    const def = DEFAULT_FEATURE_GRID[i];
    const f = features[i];
    const title = f != null ? (typeof f === "string" ? f : f?.title || def?.title) : def?.title;
    return { icon: def?.icon || "✓", title: title || "", desc: def?.desc || "" };
  });

  const solutionTitle = solution.title || "Solution";
  const solutionDesc = solution.description || "Experience the future of automation with our seamless, powerful, and intelligent solution.";

  const titleParts = solutionTitle.split(" ").filter(Boolean);
  const mainTitlePart = titleParts.length > 1 ? titleParts.slice(0, -1).join(" ") : solutionTitle;
  const accentTitlePart = titleParts.length > 1 ? titleParts[titleParts.length - 1] : "";

  return (
    <div className="solution-detail">
      {/* ——— HERO SECTION - Top Section with Background Image ——— */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden">
        {/* Background Image with Overlay */}
        {mainImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={mainImage}
              alt={solutionTitle}
              className="w-full h-full object-cover opacity-20"
              onError={(e) => e.target.style.opacity = "0"}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/95 via-indigo-900/90 to-purple-900/95" />
          </div>
        )}

        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        {/* Decorative gradient orbs */}
        <div className="absolute top-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl z-0" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl z-0" />

        {/* Content */}
        <div className="relative z-20 pt-24 pb-16 min-h-[90vh] flex flex-col justify-center">
          <div className="container mx-auto px-4">
            <Link to="/solutions" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors text-sm font-medium mb-8 group">
              <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
              </svg>
              Back to Solutions
            </Link>

            {solution.category && (
              <div className="mb-6">
                <span className="inline-block px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold text-white shadow-lg">
                  {solution.category}
                </span>
              </div>
            )}

            {/* Two Column Layout: Text Left, Image Right */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-white">
                  {mainTitlePart}{" "}
                  {accentTitlePart && (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300">
                      {accentTitlePart}
                    </span>
                  )}
                </h1>
                <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed">
                  {solutionDesc}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transform text-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start for free
                  </Link>
                  {downloadSolutionUrl && (
                    <a
                      href={getImageUrl(downloadSolutionUrl)}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl transition-all duration-300 hover:border-white/50 text-lg"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download brochure
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column - Solution Image */}
              <div className="hidden lg:block">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm transform hover:scale-105 transition-transform duration-500">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {mainImage ? (
                      <img
                        src={mainImage}
                        alt={solutionTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className={`absolute inset-0 ${mainImage ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm`}
                      style={{ display: mainImage ? 'none' : 'flex' }}
                    >
                      <div className="text-center text-white">
                        <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-semibold">Solution Preview</p>
                      </div>
                    </div>

                    {/* Gradient overlay for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solid Separator with Wave Effect */}
        <div className="relative h-24 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 z-10">
          <svg className="absolute bottom-0 w-full h-24" preserveAspectRatio="none" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white" />
          </svg>
        </div>
      </section>


      {/* ——— Why Choose This Solution ——— */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Our Solution</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Built with cutting-edge technology to deliver exceptional performance and reliability for your business needs
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: "⚡", title: "High Performance", desc: "Lightning-fast processing with optimized algorithms for maximum efficiency" },
              { icon: "🔒", title: "Secure & Reliable", desc: "Enterprise-grade security with 99.9% uptime guarantee" },
              { icon: "🌐", title: "Global Reach", desc: "Deploy anywhere in the world with multi-region support" },
              { icon: "📊", title: "Advanced Analytics", desc: "Real-time insights and comprehensive reporting dashboards" },
              { icon: "🔄", title: "Easy Integration", desc: "Seamless connection with your existing tools and workflows" },
              { icon: "👥", title: "Expert Support", desc: "24/7 dedicated support team ready to help you succeed" }
            ].map((item, idx) => (
              <div key={idx} className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:border-blue-200 hover:-translate-y-2 transition-all duration-500">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 shadow-lg">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Smart Automation ——— */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-blue-600" />
                Smart Automation
              </p>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Automate Everything <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Seamlessly</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Transform your workflow with intelligent automation that adapts to your needs. Our advanced AI-powered system learns from your patterns and optimizes processes automatically.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Learn More
              </Link>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80"
                  alt="Smart Automation"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Real-Time Monitoring ——— */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-2xl bg-gray-50 p-2">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                <img
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"
                  alt="Real-Time Monitoring"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Monitor <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">In Real-Time</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Keep track of everything with our powerful real-time monitoring dashboard. Get instant alerts, visualize data trends, and make informed decisions faster than ever before.
              </p>
              <Link to="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 transform">
                Get Started
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Advanced Features Showcase ——— */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 space-y-24 md:space-y-32">
          {[
            {
              title: "Intelligent Data Processing",
              desc: "Process massive amounts of data with our cutting-edge algorithms that deliver results in milliseconds. Scale effortlessly as your needs grow.",
              image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80",
              imageLeft: false
            },
            {
              title: "Cloud-Native Architecture",
              desc: "Built from the ground up for the cloud. Enjoy automatic scaling, high availability, and global distribution without any infrastructure headaches.",
              image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80",
              imageLeft: true
            },
            {
              title: "Seamless Collaboration",
              desc: "Work together in real-time with your team. Share insights, collaborate on projects, and stay synchronized across all your devices.",
              image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
              imageLeft: false
            },
            {
              title: "Enterprise Security",
              desc: "Your data is protected with military-grade encryption, multi-factor authentication, and compliance with industry standards including GDPR and SOC 2.",
              image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
              imageLeft: true
            }
          ].map((block, index) => (
            <div key={index} className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center max-w-6xl mx-auto`}>
              <div className={block.imageLeft ? "order-2 md:order-1" : "order-1"}>
                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                  {block.title}
                </h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">{block.desc}</p>
                <Link to="/contact" className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 text-lg group">
                  Explore Feature
                  <svg className="w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              <div className={block.imageLeft ? "order-1 md:order-2" : "order-2"}>
                <div className="rounded-3xl overflow-hidden shadow-2xl bg-white p-2 hover:shadow-blue-200/50 transition-shadow duration-500">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img src={block.image} alt={block.title} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ——— CTA Section ——— */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
              Ready to Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Operations?</span>
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of satisfied customers who have revolutionized their business with {solutionTitle}. Start your journey today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact" className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transform text-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Start Free Trial
              </Link>
              <Link to="/contact" className="inline-flex items-center gap-2 px-10 py-5 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-800 font-bold rounded-xl transition-all duration-300 shadow-lg text-lg">
                Schedule Demo
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Key Features - Solution Specific ——— */}
      {features.length > 0 && (
        <section className="py-20 md:py-28 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />

          <div className="absolute top-10 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Everything You Need in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">{solutionTitle}</span>
              </h2>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                Comprehensive features designed to streamline your workflow and maximize productivity
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
              {features.map((feature, idx) => {
                const featureText = typeof feature === "string" ? feature : feature?.title || "";
                return (
                  <div key={idx} className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur group-hover:blur-md transition-all duration-300" />
                    <div className="relative flex items-start gap-4 p-6 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/30 rounded-2xl transition-all duration-300">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium text-lg leading-relaxed">{featureText}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ——— Download + Integration ——— */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">
            {downloadSolutionUrl && (
              <a
                href={getImageUrl(downloadSolutionUrl)}
                className="inline-flex items-center gap-3 px-10 py-5 bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-gray-800 hover:text-blue-700 font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Product Brochure
              </a>
            )}
            <div className="text-center">
              <p className="text-gray-500 font-medium mb-3">Compatible with leading platforms</p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
                {['KNX', 'Modbus', 'Home Assistant', 'Node-RED', 'Grafana'].map((tech) => (
                  <span key={tech} className="px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-700 font-medium shadow-sm">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

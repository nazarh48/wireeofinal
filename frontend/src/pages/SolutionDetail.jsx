import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiService, getImageUrl, getSolutionImageUrl } from "../services/api";

// Base path for solution page assets (from PDF / Solution folder). Public assets are served at root in Vite.
const SOLUTION_ASSET = (filename) => `/assets/Solution/${encodeURIComponent(filename)}`;

// Wireeo Hospitality – content from PDF "Content wireeo hospitality solution - 13_02_2026 - Copie.pdf"
const WHY_CHOOSE_ITEMS = [
  {
    title: "Seamless Access Flow",
    desc: "Eliminates bottlenecks with instant validation and smooth entry processes.",
    icon: "Seamless Access Flow.png",
  },
  {
    title: "Advanced Access Protection",
    desc: "Ensures controlled access, protected data, and compliance with modern security standards.",
    icon: "Advanced Access Protection.png",
  },
  {
    title: "Centralized Multi-Site Control",
    desc: "Enables unified management of multiple locations from a single interface.",
    icon: "Centralized Multi-Site Control.png",
  },
  {
    title: "Effortless Integration",
    desc: "Connects seamlessly with existing infrastructure and business systems.",
    icon: "Effortless Integration.png",
  },
  {
    title: "Actionable Real-Time Insights",
    desc: "Transforms operational data into clear reports and performance indicators.",
    icon: "Actionable Real-Time Insights.png",
  },
  {
    title: "Reliable Ongoing Support",
    desc: "Provides continuous technical guidance to ensure uninterrupted operations.",
    icon: "Reliable Ongoing Support.png",
  },
];

const ECOSYSTEM_ITEMS = [
  {
    title: "Field Infrastructure",
    desc: "Native KNX devices for access control and room automation — architecturally integrated and engineered for long-term reliability.",
  },
  {
    title: "Cloud Core",
    desc: "Microsoft Azure–based management platform enabling centralized control across one or multiple hotel locations.",
  },
  {
    title: "Mobile Interaction",
    desc: "Guest and staff applications delivering secure access, service interaction, and operational efficiency — from anywhere.",
  },
];

export default function SolutionDetail() {
  const { id } = useParams();
  const [solution, setSolution] = useState(null);
  const [sections, setSections] = useState([]);
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

  useEffect(() => {
    if (!solution?._id) return;
    let cancelled = false;
    apiService.solutionDetails
      .list({ solutionId: solution._id, status: "active" })
      .then((res) => {
        if (!cancelled) setSections(res?.details || []);
      })
      .catch(() => {
        if (!cancelled) setSections([]);
      });
    return () => {
      cancelled = true;
    };
  }, [solution?._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4" />
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
          <Link to="/solutions" className="text-teal-600 font-semibold hover:text-teal-700">
            Back to Solutions
          </Link>
        </div>
      </div>
    );
  }

  const mainImageResolved = getSolutionImageUrl(solution);
  const mainImage = mainImageResolved || SOLUTION_ASSET("picture 2_1.png");
  const downloadableFiles = Array.isArray(solution.downloadableFiles) ? solution.downloadableFiles : [];
  const downloadBrochureUrl = downloadableFiles.length > 0
    ? (typeof downloadableFiles[0] === "string" ? downloadableFiles[0] : downloadableFiles[0]?.url)
    : null;

  const solutionTitle = solution.title || "Wireeo Hospitality";
  const solutionDesc =
    solution.description ||
    "Wireeo Hospitality is a structured automation ecosystem built on KNX technology, combining field equipment, cloud services, and mobile applications to enhance guest comfort while optimizing hotel operations. Designed for scalability and long-term reliability, the solution unifies access control, room management, and service interaction into a single intelligent platform.";

  return (
    <div className="solution-detail">
      {/* ——— HERO (PDF page 1): Wireeo Hospitality — Smart KNX Automation for Hotels & Hospitality ——— */}
      <section className="relative min-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
        {mainImage && (
          <div className="absolute inset-0 z-0">
            <img
              src={mainImage}
              alt={solutionTitle}
              className="w-full h-full object-cover opacity-20"
              onError={(e) => (e.target.style.opacity = "0")}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95" />
          </div>
        )}
        <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="absolute top-20 right-10 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl z-0" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl z-0" />

        <div className="relative z-20 pt-24 pb-16 min-h-[90vh] flex flex-col justify-center">
          <div className="container mx-auto px-4">
            <Link to="/solutions" className="inline-flex items-center gap-2 text-teal-200 hover:text-white transition-colors text-sm font-medium mb-8 group">
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

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight text-white">
                  Wireeo Hospitality
                </h1>
                <p className="text-xl md:text-2xl text-teal-200 font-semibold mb-6">
                  Smart KNX Automation for Hotels & Hospitality
                </p>
                <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                  {solutionDesc}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-teal-500/50 hover:scale-105 transform text-lg"
                  >
                    Contact Wireeo
                  </Link>

                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 backdrop-blur-sm transform hover:scale-105 transition-transform duration-500">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img src={mainImage} alt={solutionTitle} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = "flex"; }} />
                    <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm" style={{ display: "none" }}>
                      <span className="text-white text-lg">Solution</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative h-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 z-10">
          <svg className="absolute bottom-0 w-full h-24" preserveAspectRatio="none" viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L60 73.3C120 66.7 240 53.3 360 46.7C480 40 600 40 720 46.7C840 53.3 960 66.7 1080 70C1200 73.3 1320 66.7 1380 63.3L1440 60V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ——— Why Choose Our Solution (PDF page 2) ——— */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Our Solution</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
              Designed to optimize access management through security, efficiency, and full operational visibility.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {WHY_CHOOSE_ITEMS.map((item, idx) => (
              <div key={idx} className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl hover:border-teal-200 hover:-translate-y-2 transition-all duration-500">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mb-5 overflow-hidden">
                  <img src={SOLUTION_ASSET(item.icon)} alt={item.title} className="w-full h-full object-contain p-2" onError={(e) => { e.target.style.display = "none"; }} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Dynamic sections from admin (replaces hardcoded ecosystem block) ——— */}
      {sections.map((section, index) => {
        const isImageLeft = index % 2 === 1;
        const imgSrc = section.image ? getImageUrl(section.image) : mainImage;
        return (
          <section
            key={section._id || index}
            className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl" />
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                {section.subtitle && (
                  <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
                    {section.subtitle}
                  </p>
                )}
              </div>
              <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                {isImageLeft && (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2 order-1 md:order-1">
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={section.title}
                        className="w-full h-auto object-cover rounded-2xl"
                      />
                    )}
                  </div>
                )}
                <div className={isImageLeft ? "order-2 md:order-2" : "order-1 md:order-1"}>
                  <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                    {section.body && (
                      <p className="whitespace-pre-line">
                        {section.body}
                      </p>
                    )}
                    {Array.isArray(section.points) && section.points.length > 0 && (
                      <ul className="space-y-8">
                        {section.points.map((item, i) => (
                          <li key={i} className="flex gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold">
                              {i + 1}
                            </div>
                            <div>
                              {item.title && (
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                  {item.title}
                                </h3>
                              )}
                              {item.desc && (
                                <p className="text-gray-700 leading-relaxed">
                                  {item.desc}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                {!isImageLeft && (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2 order-2 md:order-2">
                    {imgSrc && (
                      <img
                        src={imgSrc}
                        alt={section.title}
                        className="w-full h-auto object-cover rounded-2xl"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );
      })}

      {/* ——— Intelligent Access. Elevated Experience. (PDF page 4) ——— */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Intelligent Access. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Elevated Experience.</span>
              </h2>
              <p className="text-gray-700 text-lg mb-6">Wireeo Hospitality supports:</p>
              <ul className="space-y-3 text-gray-700 text-lg mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600" /> NFC (card & mobile)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600" /> PIN code
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600" /> QR code
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-600" /> Mobile wallet integration
                </li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                All governed by centralized cloud logic and advanced security procedures. Access becomes part of a larger operational strategy — not a standalone function.
              </p>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-50 p-2">
              <img src={SOLUTION_ASSET("picture 2_2.png")} alt="Intelligent Access" className="w-full h-auto object-cover rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ——— Designed for Architecture (PDF page 5) ——— */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2">
              <img src={SOLUTION_ASSET("pictrues 2_3.png")} alt="Designed for Architecture" className="w-full h-auto object-cover rounded-2xl" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Designed for <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Architecture</span>
              </h2>
              <ul className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <li>Flush trimless installation.</li>
                <li>Premium aluminum and acrylic finishes.</li>
                <li>Custom branding and personalization.</li>
                <li>Technology that adapts to the space — never the opposite.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Built to Scale (PDF page 6) ——— */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Built to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Scale</span>
              </h2>
              <p className="text-gray-700 text-lg mb-8">
                From boutique hotels to large facilities with thousands of rooms, the architecture remains stable, structured, and future-ready.
              </p>
              <ul className="space-y-4 text-gray-700 text-lg">
                <li className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 font-bold flex items-center justify-center">✓</span>
                  Up to 9,999 rooms per hotel.
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 font-bold flex items-center justify-center">✓</span>
                  200 KNX functions per room.
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 font-bold flex items-center justify-center">✓</span>
                  Multi-site management without limitation.
                </li>
              </ul>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-50 p-2">
              <img src={SOLUTION_ASSET("picture 2_4.png")} alt="Built to Scale" className="w-full h-auto object-cover rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ——— Open. Structured. KNX. (PDF page 7) ——— */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div className="order-2 md:order-1 relative rounded-3xl overflow-hidden shadow-2xl bg-white p-2">
              <img src={SOLUTION_ASSET("picture 2_5.png")} alt="Open Structured KNX" className="w-full h-auto object-cover rounded-2xl" />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Open. Structured. <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">KNX.</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                Fully compatible with KNX standards and configured via ETS, Wireeo Hospitality ensures interoperability, long-term viability, and professional integration flexibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— A New Generation of Hospitality Infrastructure (PDF page 8) ——— */}
      <section className="py-20 md:py-28 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                A New Generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Hospitality Infrastructure</span>
              </h2>
              <ul className="space-y-4 text-gray-700 text-lg leading-relaxed">
                <li>Developed and manufactured in Romania.</li>
                <li>Built on KNX discipline.</li>
                <li>Engineered for hotels that value precision.</li>
              </ul>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-50 p-2">
              <img src={SOLUTION_ASSET("picture 2_5.png")} alt="Hospitality Infrastructure" className="w-full h-auto object-cover rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ——— CTA: Ready to Redefine... Contact Wireeo + Download Brochure (PDF page 9) ——— */}
      <section className="py-20 md:py-28 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-50 to-cyan-50 opacity-50" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
              Ready to Redefine Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">Hospitality Infrastructure?</span>
            </h2>
            <p className="text-gray-700 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
              Contact Wireeo to get started.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-teal-500/50 hover:scale-105 transform text-lg uppercase tracking-wider"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact Wireeo
              </Link>

              {downloadBrochureUrl && (
                <a
                  href={getImageUrl(downloadBrochureUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-teal-500/50 hover:scale-105 transform text-lg uppercase tracking-wider"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Brochure
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ——— Download + compatibility (optional footer) ——— */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center gap-8 max-w-4xl mx-auto">

            {/* <div className="text-center">
              <p className="text-gray-500 font-medium mb-3">KNX · ETS · Azure · Hospitality</p>
            </div> */}
          </div>
        </div>
      </section>
    </div>
  );
}

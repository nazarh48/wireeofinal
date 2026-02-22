import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService, getImageUrl } from "../services/api";
import { useCatalog } from "../hooks/useCatalog";

const RESOURCE_CATEGORIES = [
  {
    title: "Catalogues & Brochures",
    description: "Product Overviews & Solution Materials",
    longDescription:
      "This section includes official Wireeo catalogues and solution brochures, providing a structured presentation of product ranges and hospitality systems.",
    image: "https://images.unsplash.com/photo-1568667256549-094345857637?w=400&h=300&fit=crop",
  },
  {
    title: "Technical Manuals",
    description: "Installation Guides & Technical Specifications",
    longDescription:
      "Detailed documentation for professional installation and integration. Access technical specifications, installation guides, wiring diagrams, and KNX configuration references aligned with current production standards.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop",
  },
  {
    title: "Software",
    description: "ETS Files, Firmware & Configuration Tools",
    longDescription:
      "Official software and system-related files. Download ETS product databases, firmware packages, and configuration tools required for proper integration and system deployment.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=300&fit=crop",
  },
];

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null); // "success" | "error" | null
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  // Filtering & Pagination states
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(6);

  const { ranges: publicRanges = [], loadPublicCatalog, loaded: catalogLoaded, loading: catalogLoading } = useCatalog();
  const shortcutRanges = (publicRanges || []).slice(0, 3);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await apiService.pdfMaterials.list({ status: "active" });
        if (res?.materials) {
          setResources(res.materials);
        }
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    if (!catalogLoaded && !catalogLoading) loadPublicCatalog();
  }, [catalogLoaded, catalogLoading, loadPublicCatalog]);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    const email = newsletterEmail.trim();
    if (!email) return;
    setNewsletterSubmitting(true);
    setNewsletterStatus(null);
    try {
      await apiService.newsletter.subscribe(email);
      setNewsletterStatus("success");
      setNewsletterEmail("");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message || err?.message;
      const isNetwork = !err?.response && err?.message;
      if (status === 404 || isNetwork) {
        setNewsletterStatus("Server unavailable. Ensure the backend is running (e.g. npm run dev in backend folder) and try again.");
      } else if (msg) {
        setNewsletterStatus(msg);
      } else {
        setNewsletterStatus("Something went wrong. Please try again later.");
      }
    } finally {
      setNewsletterSubmitting(false);
    }
  };

  // Filter Logic
  const filteredResources = resources.filter((res) => {
    const matchesCategory = selectedCategory === "All" || res.type === selectedCategory;
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.shortDescription && res.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const displayedResources = filteredResources.slice(0, visibleCount);
  const hasMore = visibleCount < filteredResources.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 6);
  };

  const scrollToDocs = () => {
    const section = document.getElementById("technical-documentation");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section – with provided image (Picture 3_1) per PDF */}
      <section className="relative overflow-hidden">
        <div className="relative min-h-[420px] md:min-h-[520px] flex flex-col">
          {/* Provided Resources image as hero visual */}
          <div className="absolute inset-0">
            <img
              src="/assets/Resources/picture3_1.png"
              alt="Resources: Catalogues & Brochures, Technical Manuals, Software"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/50 to-transparent" />
          </div>

        </div>
      </section>

      {/* Three categories */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RESOURCE_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.title;
              return (
                <div
                  key={cat.title}
                  onClick={() => {
                    setSelectedCategory(cat.title);
                    setVisibleCount(6);
                    scrollToDocs();
                  }}
                  className={`bg-white rounded-2xl shadow-premium hover:shadow-xl overflow-hidden border transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 ${isActive ? "ring-2 ring-blue-500 border-transparent shadow-xl" : "border-gray-100"
                    }`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {isActive && (
                      <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-fade-in">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                        ACTIVE
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className={`text-xl font-bold mb-2 transition-colors ${isActive ? "text-blue-600" : "text-gray-900"}`}>{cat.title}</h3>
                    <p className="text-sm font-medium text-blue-600 mb-3 border-b border-gray-100 pb-2">{cat.description}</p>
                    <p className="text-gray-600 text-sm leading-relaxed">{cat.longDescription}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <button
              onClick={() => {
                setSelectedCategory("All");
                setVisibleCount(6);
              }}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 flex items-center gap-2 ${selectedCategory === "All"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                : "bg-white text-gray-700 border border-gray-200 hover:border-blue-400 hover:text-blue-600"
                }`}
            >
              {selectedCategory === "All" && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Show All Resources
            </button>
          </div>
        </div>
      </section>

      {/* Downloads – PDF materials */}
      <section id="technical-documentation" className="py-16 md:py-20 bg-gradient-to-r from-blue-50/50 to-purple-50/50 scroll-mt-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Technical Documentation</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Download comprehensive guides, manuals, and technical specifications for professional installations.
            </p>

            {/* Search and Quick Filters */}
            <div className="max-w-4xl mx-auto bg-white p-4 rounded-2xl shadow-premium border border-gray-100 mb-12">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search documents by title or description..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setVisibleCount(6);
                    }}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-xl outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <div className="hidden md:flex bg-gray-100 p-1 rounded-xl">
                    {["All", "Catalogues & Brochures", "Technical Manuals", "Software"].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setVisibleCount(6);
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                          }`}
                      >
                        {cat === "All" ? "All" : cat.split(" ")[0]}
                      </button>
                    ))}
                  </div>
                  {/* Mobile Select */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      setVisibleCount(6);
                    }}
                    className="md:hidden w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl outline-none"
                  >
                    {["All", "Catalogues & Brochures", "Technical Manuals", "Software"].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12 text-slate-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p>Loading resources...</p>
              </div>
            ) : displayedResources.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We couldn't find any documents matching your current filters. Try adjusting your search or category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory("All");
                    setSearchQuery("");
                  }}
                  className="mt-6 text-blue-600 font-semibold hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              displayedResources.map((resource, index) => (
                <div
                  key={resource._id || index}
                  className="bg-white rounded-2xl shadow-premium hover:shadow-2xl p-6 transition-all duration-500 border border-gray-50 flex flex-col h-full group"
                >
                  {resource.photo && (
                    <div className="mb-6 overflow-hidden rounded-xl h-48 relative">
                      <img
                        src={getImageUrl(resource.photo)}
                        alt={`${resource.name} thumbnail`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                      📄
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {resource.type || "Guide"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {resource.name}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed text-sm flex-grow">
                    {resource.shortDescription || "Access the latest technical documentation and guides for this project."}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6 pb-6 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 uppercase">PDF</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{resource.size || "MB"}</span>
                    </div>
                  </div>
                  <a
                    href={resource.fileUrl ? getImageUrl(resource.fileUrl) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-blue-100 hover:shadow-blue-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    DOWNLOAD NOW
                  </a>
                </div>
              ))
            )}
          </div>

          {hasMore && (
            <div className="mt-16 text-center">
              <button
                onClick={handleLoadMore}
                className="inline-flex items-center gap-2 px-10 py-4 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-xl shadow-blue-50"
              >
                LOAD MORE DOCUMENTS
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Product Ranges shortcut – 3 ranges */}
      {shortcutRanges.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Product Ranges</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Quick access to our product ranges. Select a range to explore and configure.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {shortcutRanges.map((range) => (
                <Link
                  key={range.id}
                  to="/products/ranges"
                  state={{ rangeId: range.id }}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-xl p-6 border border-gray-100 transition-all duration-300 flex flex-col items-center text-center"
                >
                  {range.image ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden mb-4">
                      <img
                        src={range.image}
                        alt={range.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mb-4">
                      {range.name.charAt(0)}
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{range.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{range.description || "View products"}</p>
                  <span className="mt-3 text-blue-600 font-medium text-sm flex items-center gap-1">
                    Explore range
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter – functional with backend */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest insights, trends, and exclusive content delivered to your inbox.
          </p>
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={newsletterSubmitting}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-70"
                required
              />
              <button
                type="submit"
                disabled={newsletterSubmitting}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-70 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 whitespace-nowrap"
              >
                {newsletterSubmitting ? "Subscribing…" : "Subscribe"}
              </button>
            </div>
            {newsletterStatus === "success" && (
              <p className="mt-3 text-green-400 text-sm">Thank you! You have been subscribed.</p>
            )}
            {newsletterStatus && newsletterStatus !== "success" && (
              <p className="mt-3 text-red-400 text-sm max-w-md mx-auto">{newsletterStatus}</p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export default Resources;

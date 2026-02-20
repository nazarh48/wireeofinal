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
            {RESOURCE_CATEGORIES.map((cat) => (
              <div
                key={cat.title}
                className="bg-white rounded-2xl shadow-premium hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.title}</h3>
                  <p className="text-sm font-medium text-blue-600 mb-3 border-b border-gray-100 pb-2">{cat.description}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{cat.longDescription}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloads – PDF materials */}
      <section className="py-16 md:py-20 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Technical Documentation</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Download comprehensive guides, manuals, and technical specifications for professional installations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <div className="col-span-full text-center py-12 text-slate-500">Loading resources...</div>
            ) : resources.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-500">No resources available at the moment.</div>
            ) : (
              resources.map((resource, index) => (
                <div
                  key={resource._id || index}
                  className="bg-white rounded-2xl shadow-premium hover:shadow-xl p-6 transition-all duration-300"
                >
                  {resource.photo && (
                    <div className="mb-4 overflow-hidden rounded-xl">
                      <img
                        src={getImageUrl(resource.photo)}
                        alt={`${resource.name} thumbnail`}
                        className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">📄</div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      {resource.type || "Guide"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{resource.name}</h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">{resource.shortDescription}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>PDF</span>
                    <span>{resource.size}</span>
                  </div>
                  <a
                    href={resource.fileUrl ? getImageUrl(resource.fileUrl) : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                </div>
              ))
            )}
          </div>
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

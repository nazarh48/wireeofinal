import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiService, getImageUrl } from "../services/api";

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading…</p>
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
          <Link to="/solutions" className="text-blue-600 font-semibold hover:underline">
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
  const mainImage = imageUrls[0] || "";
  const downloadableFiles = Array.isArray(solution.downloadableFiles) ? solution.downloadableFiles : [];
  const downloadSolutionUrl = downloadableFiles.length > 0
    ? (typeof downloadableFiles[0] === "string" ? downloadableFiles[0] : downloadableFiles[0]?.url)
    : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Image and Content */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white pt-32 pb-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        </div>
        <div className="relative container mx-auto px-4">
          <div className="mb-6">
            <Link
              to="/solutions"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Solutions
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Image on Left */}
            <div className="order-2 lg:order-1">
              {mainImage ? (
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <img
                    src={getImageUrl(mainImage)}
                    alt={solution.title}
                    className="w-full h-auto min-h-[280px] object-contain bg-gray-50"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const parent = e.target.parentElement;
                      if (parent && !parent.querySelector(".solution-img-placeholder")) {
                        const placeholder = document.createElement("div");
                        placeholder.className = "solution-img-placeholder w-full min-h-[280px] flex items-center justify-center bg-gray-100 text-gray-400";
                        placeholder.innerHTML = '<svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="w-full min-h-[280px] bg-white rounded-2xl flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Content on Right */}
            <div className="order-1 lg:order-2">
              {solution.icon && (
                <div className="text-5xl mb-4">{solution.icon}</div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {solution.title}
              </h1>
              {solution.description && (
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  {solution.description}
                </p>
              )}
              {downloadSolutionUrl && (
                <a
                  href={getImageUrl(downloadSolutionUrl)}
                  download={typeof downloadableFiles[0] === "object" ? (downloadableFiles[0]?.originalName || downloadableFiles[0]?.filename) : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Solution
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover how our solutions can enhance your operations and improve efficiency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              View Products
            </Link>
            <Link
              to="/contact"
              className="px-10 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-all duration-300"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

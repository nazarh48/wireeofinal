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
        if (!cancelled) setSolution(res?.solution || null);
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

  const images = [
    ...(solution.image ? [solution.image] : []),
    ...(Array.isArray(solution.images) ? solution.images.map((i) => i?.url || i) : []),
  ].filter(Boolean);
  const features = Array.isArray(solution.features) ? solution.features : [];
  const downloadableFiles = Array.isArray(solution.downloadableFiles) ? solution.downloadableFiles : [];

  return (
    <div className="min-h-screen">
      {/* Hero - homepage-like */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40" />
        {solution.image && (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{ backgroundImage: `url(${getImageUrl(solution.image)})` }}
          />
        )}
        <div className="relative container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            {solution.title}
          </h1>
          {solution.description && (
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {solution.description}
            </p>
          )}
          <div className="mt-8">
            <Link
              to="/solutions"
              className="inline-block px-6 py-3 border-2 border-white text-white hover:bg-white hover:text-gray-900 rounded-lg font-semibold transition-all"
            >
              Back to Solutions
            </Link>
          </div>
        </div>
      </section>

      {/* Description */}
      {solution.description && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Overview</h2>
              <p className="text-xl text-gray-600 leading-relaxed">{solution.description}</p>
            </div>
          </div>
        </section>
      )}

      {/* Photos */}
      {images.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Photos</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {images.map((src, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={getImageUrl(src)}
                    alt={`${solution.title} ${idx + 1}`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {features.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            </div>
            <ul className="max-w-2xl mx-auto space-y-3">
              {features.map((f, idx) => (
                <li key={idx} className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Downloadable files */}
      {downloadableFiles.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Downloads</h2>
              <p className="text-gray-600">Download resources related to this solution.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
              {downloadableFiles.map((file, idx) => {
                const url = getImageUrl(file?.url || file);
                const label = file?.label || file?.originalName || `Download ${idx + 1}`;
                return (
                  <a
                    key={idx}
                    href={url}
                    download={file?.originalName || file?.filename}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {label}
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA - homepage-like */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Discover how our solutions can enhance your operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              View Products
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

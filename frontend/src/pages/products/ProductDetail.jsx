import { useMemo, useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { getImageUrl } from '../../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isProFlow = searchParams.get('pro') === 'true';
  const { getNormalProductById, getConfigurableProductById, getRangeById, loadPublicCatalog, loading, loaded } = useCatalog();

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const product = useMemo(
    () => (isProFlow ? getConfigurableProductById(id) : getNormalProductById(id)),
    [id, isProFlow, getConfigurableProductById, getNormalProductById]
  );
  const range = useMemo(
    () => (product ? getRangeById(product.rangeId) : null),
    [product, getRangeById]
  );

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : product.baseImageUrl
        ? [product.baseImageUrl]
        : [];
    return list.map((src) => (typeof src === 'string' ? getImageUrl(src) : getImageUrl(src?.url || src)));
  }, [product]);

  const mainImageUrl = galleryImages[selectedImageIndex] || product?.baseImageUrl
    ? getImageUrl(galleryImages[selectedImageIndex] || product.baseImageUrl)
    : '';

  if (loading && !loaded) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600 text-lg">Loading product details...</p>
      </div>
    </div>
  );

  if (loaded && !product) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Product Not Found</h1>
        <p className="text-slate-600 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg"
        >
          Back to Products
        </Link>
      </div>
    </div>
  );

  const heroBgUrl = range?.image ? getImageUrl(range.image) : product?.baseImageUrl ? getImageUrl(product.baseImageUrl) : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80';
  const tagline = product.description?.split('.')[0]?.trim() || product.name;
  const mainFunctions = product.mainFunctions && Array.isArray(product.mainFunctions)
    ? product.mainFunctions
    : [
      'High-quality electrical component',
      'Durable and reliable performance',
      'Easy installation and maintenance',
      'Professional grade materials',
      'Industry standard specifications',
    ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Beautiful gradient background */}
      <section className="relative min-h-[420px] md:min-h-[500px] flex flex-col justify-end bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${heroBgUrl})` }}
        />
        <div className="absolute inset-0 bg-black opacity-40" />

        <div className="relative z-10 container mx-auto px-4 md:px-6 pb-10 md:pb-16 pt-28">
          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-x-2 text-sm text-white/90 mb-6">
            <Link to="/" className="hover:text-white transition-colors font-medium">Home</Link>
            <span className="text-white/50">›</span>
            <Link to="/products" className="hover:text-white transition-colors font-medium">Products</Link>
            {isProFlow && range && (
              <>
                <span className="text-white/50">›</span>
                <Link to="/products/ranges" className="hover:text-white transition-colors font-medium">Pro</Link>
                <span className="text-white/50">›</span>
                <Link to={`/products/range/${product.rangeId}`} className="hover:text-white transition-colors font-medium">{range.name}</Link>
              </>
            )}
            {range && !isProFlow && (
              <>
                <span className="text-white/50">›</span>
                <span className="text-white/90 font-medium">{range.name}</span>
              </>
            )}
            <span className="text-white/50">›</span>
            <span className="text-white font-semibold truncate max-w-[200px] md:max-w-none">{product.name}</span>
          </nav>

          {/* Premium Badge & Title */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold text-white mb-6 shadow-lg">
            {product.configurable ? (
              <>
                <svg className="w-4 h-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Configurable Product</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Premium Product</span>
              </>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-4xl mb-4">
            {product.name}
          </h1>
          {range && (
            <p className="text-lg md:text-xl text-blue-200 font-semibold">{range.name}</p>
          )}
        </div>
      </section>

      {/* Product Details Section */}
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Right column FIRST on desktop: product image + thumbnails (moved to be visually at top) */}
          <div className="order-2 lg:order-1">
            {/* Main Product Image */}
            <div className="sticky top-6">
              <div className="bg-gradient-to-br from-slate-50 to-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100 overflow-hidden group">
                <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-inner relative">
                  <img
                    src={mainImageUrl || getImageUrl(product.baseImageUrl)}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700"
                  />
                  {product.configurable && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg">
                        ⚙️ Configurable
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Thumbnail Gallery */}
              {galleryImages.length > 1 && (
                <div className="mt-6 flex gap-3 flex-wrap">
                  {galleryImages.map((src, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 hover:scale-105 ${selectedImageIndex === idx
                          ? 'border-blue-600 ring-4 ring-blue-100 shadow-lg'
                          : 'border-gray-200 hover:border-blue-300 shadow-md'
                        }`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Left column: description + main functions */}
          <div className="order-1 lg:order-2">
            {/* Tagline */}
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Product
                </span>{' '}
                Overview
              </h2>
              <p className="text-xl text-slate-700 leading-relaxed font-medium">{tagline}</p>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-100">
                <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Description
                </h3>
                <p className="text-slate-700 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Main Functions */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Key Features
              </h3>
              <div className="space-y-3">
                {mainFunctions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300"
                  >
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0 flex items-center justify-center shadow-md">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="text-slate-700 font-medium leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              {product?.configurable && (
                <Link
                  to="/products/ranges"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Configure Product
                </Link>
              )}
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-blue-600 hover:bg-blue-600 text-blue-600 hover:text-white px-8 py-4 rounded-xl font-bold transition-all shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Request Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Product Downloads Section */}
      {product?.downloadableFiles?.length > 0 && (
        <section className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-200 py-16 md:py-20">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700 mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                </svg>
                <span>Available Downloads</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Product</span> Resources
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">Technical documentation, datasheets, and product resources</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {product.downloadableFiles.map((file, idx) => {
                const fileUrl = getImageUrl(file?.url || file);
                const label = file?.label || file?.originalName || `Download ${idx + 1}`;
                return (
                  <a
                    key={idx}
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-md hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 truncate mb-1">{label}</p>
                      <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-semibold group-hover:gap-2 transition-all">
                        Download
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;

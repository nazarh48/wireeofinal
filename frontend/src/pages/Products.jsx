import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '../services/api';

const PRODUCT_RANGE_COLORS = [
  'from-blue-500 to-blue-600',
  'from-purple-500 to-purple-600',
  'from-indigo-500 to-indigo-600',
  'from-emerald-500 to-emerald-600',
  'from-amber-500 to-amber-600',
  'from-cyan-500 to-cyan-600',
];

const Products = () => {
  const [selectedRangeId, setSelectedRangeId] = useState(null);
  const { loadPublicCatalog, loading: catalogLoading, loaded: catalogLoaded, ranges: publicRanges = [], normalProducts = [], configurableProducts = [] } = useCatalog();
  const isUserLoggedIn = useAuthStore((s) => s.isUserAuthenticated());

  useEffect(() => {
    if (!catalogLoaded && !catalogLoading) loadPublicCatalog();
  }, [catalogLoaded, catalogLoading, loadPublicCatalog]);

  // Filter products by selected range when a range is chosen
  const displaySimpleProducts = selectedRangeId
    ? (normalProducts || []).filter((p) => p.rangeId === selectedRangeId)
    : (normalProducts || []);
  const displayFeaturedProducts = selectedRangeId
    ? (configurableProducts || []).filter((p) => p.rangeId === selectedRangeId)
    : (configurableProducts || []);
  const selectedRange = selectedRangeId && Array.isArray(publicRanges) ? publicRanges.find((r) => r.id === selectedRangeId) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="relative container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-semibold text-white mb-8 shadow-lg">
              <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Premium Products</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
              Electrical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automation</span> Products
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              Professional-grade electrical automation solutions for industrial, commercial, and infrastructure applications worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
              <Link
                to="/products/ranges"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Products Pro
              </Link>
              <Link
                to="/products/browse"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all shadow-lg"
              >
                Browse Catalog
              </Link>
              <Link
                to="/solutions"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border-2 border-white/80 text-white font-semibold rounded-xl hover:bg-white hover:text-slate-900 transition-all"
              >
                Custom Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Product Ranges - from backend with images */}
      <section className="py-16 md:py-20 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Product Ranges</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Select a range to view its products. Add and manage range images in the admin panel.
            </p>
          </div>

          {(!publicRanges || publicRanges.length === 0) && !catalogLoading ? (
            <div className="text-center py-14 text-slate-500 bg-white rounded-2xl border border-slate-200">
              <p>No ranges yet. Add ranges and images from Admin → Ranges Management.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
              {(publicRanges || []).map((range, index) => {
                const isSelected = selectedRangeId === range.id;
                const colorClass = PRODUCT_RANGE_COLORS[index % PRODUCT_RANGE_COLORS.length];
                const rangeImageUrl = getImageUrl(range.image || '');
                return (
                  <div
                    key={range.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedRangeId(isSelected ? null : range.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setSelectedRangeId(isSelected ? null : range.id);
                    }}
                    className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer border-2 transform hover:-translate-y-1 ${isSelected ? 'border-blue-600 ring-4 ring-blue-100 shadow-2xl' : 'border-gray-100 hover:border-blue-200'}`}
                  >
                    <div className={`relative h-64 overflow-hidden ${!rangeImageUrl ? `bg-gradient-to-br ${colorClass}` : ''}`}>
                      {rangeImageUrl ? (
                        <img
                          src={rangeImageUrl}
                          alt={range.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => { e.target.onerror = null; }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute top-5 right-5 w-12 h-12 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {isSelected ? (
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="text-lg font-extrabold text-slate-700">{range.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="absolute bottom-5 left-5 text-white">
                        <span className="text-base font-bold tracking-wide drop-shadow-lg">{range.name}</span>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-extrabold text-slate-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                        {range.name}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2 mb-3">{range.description || 'View products in this range.'}</p>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        <span className={isSelected ? 'text-blue-600' : 'text-slate-400'}>
                          {isSelected ? '✓ Active Selection' : 'Click to explore'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedRange && (
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              <span className="text-slate-600">Showing products for:</span>
              <span className="font-semibold text-slate-900">{selectedRange.name}</span>
              <button
                type="button"
                onClick={() => setSelectedRangeId(null)}
                className="text-sm px-4 py-2 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Selected range image and title above products */}
      {selectedRange && (displaySimpleProducts.length > 0 || displayFeaturedProducts.length > 0) && (
        <section className="bg-white border-b border-slate-200">
          <div className="container mx-auto px-6 py-8">
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 shadow-md">
              {selectedRange.image ? (
                <img
                  src={getImageUrl(selectedRange.image)}
                  alt={selectedRange.name}
                  className="w-full h-44 md:h-56 object-cover"
                />
              ) : (
                <div className="w-full h-44 md:h-56 bg-gradient-to-br from-blue-600 to-slate-700 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white/90">{selectedRange.name.charAt(0)}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h2 className="text-2xl md:text-3xl font-bold">{selectedRange.name}</h2>
                {selectedRange.description && (
                  <p className="mt-1 text-white/90 text-sm max-w-2xl">{selectedRange.description}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Products Section - Only Simple (Non-Configurable) Products */}
      {(selectedRangeId && displaySimpleProducts.length === 0 && displayFeaturedProducts.length === 0) && (
        <section className="py-14 bg-white">
          <div className="container mx-auto px-6 text-center">
            <p className="text-slate-600">
              No products in this range yet. {selectedRange && `"${selectedRange.name}" has no products.`}
            </p>
            <button
              type="button"
              onClick={() => setSelectedRangeId(null)}
              className="mt-4 text-blue-600 font-semibold hover:underline"
            >
              View all products
            </button>
          </div>
        </section>
      )}
      {displaySimpleProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Products</h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                {selectedRangeId ? `Standard products in ${selectedRange?.name || 'this range'}.` : 'Browse our standard electrical automation products.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displaySimpleProducts.slice(0, 12).map((product) => {
                const imgSrc = product.baseImageUrl?.startsWith('http') ? product.baseImageUrl : getImageUrl(product.baseImageUrl || '');
                const detailUrl = `/products/detail/${product.id}`;
                return (
                  <Link key={product.id} to={detailUrl} className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl hover:border-blue-200 transition-all duration-500 transform hover:-translate-y-2 shadow-md">
                    <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 relative">
                      <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                    <div className="p-5">
                      <p className="text-xs font-semibold text-blue-600 mb-2 uppercase tracking-wider">{product.range?.name || 'Product'}</p>
                      <h3 className="font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">{product.name}</h3>
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                        View Details
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {displaySimpleProducts.length > 12 && (
              <div className="text-center mt-10">
                <Link to="/products/browse" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
                  Browse all products
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section - Only Configurable Products */}
      {displayFeaturedProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-semibold text-blue-700 mb-4">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>Featured Products</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Configurable</span> Solutions
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto mb-6">
                {selectedRangeId ? `Configurable products in ${selectedRange?.name || 'this range'}.` : 'Discover our configurable electrical automation solutions.'}
              </p>
              <Link
                to="/products/ranges"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manage Pro Products
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayFeaturedProducts.map((product) => {
                const imgSrc = product.baseImageUrl?.startsWith('http') ? product.baseImageUrl : getImageUrl(product.baseImageUrl || '');
                const detailUrl = `/products/detail/${product.id}?pro=true`;
                return (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                      <img src={imgSrc} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 text-white shadow-lg">
                          ⚙️ Configurable
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-blue-600 font-bold mb-2 uppercase tracking-wider">{product.range?.name || 'Product'}</p>
                      <h3 className="text-xl font-extrabold text-slate-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">{product.name}</h3>
                      <p className="text-slate-600 text-sm mb-5 line-clamp-3 leading-relaxed">{product.description || 'Professional electrical automation solution.'}</p>
                      <Link
                        to={detailUrl}
                        className="inline-flex items-center justify-center w-full gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
                      >
                        View Product
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-20 bg-slate-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Need Custom Solutions?</h2>
          <p className="text-slate-300 max-w-2xl mx-auto mb-8">
            Our engineering team can design and manufacture custom electrical automation solutions tailored to your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Link to="/products/ranges" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              </svg>
              Go to Tabbed Ranges
            </Link>
            <Link to="/contact" className="inline-flex items-center justify-center px-6 py-3.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-all">
              Request Quote
            </Link>
            <Link to="/resources" className="inline-flex items-center justify-center px-6 py-3.5 border-2 border-white/80 text-white font-semibold rounded-xl hover:bg-white hover:text-slate-900 transition-all">
              Download Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
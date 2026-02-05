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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Electrical <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Automation</span> Products
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Professional-grade electrical automation solutions for industrial, commercial, and infrastructure applications worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
              <Link
                to="/products/ranges"
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Products Pro
              </Link>
              <Link
                to="/products/browse"
                className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block text-center"
              >
                Browse Catalog
              </Link>
              <Link
                to="/solutions"
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold rounded-lg transition-all duration-300 inline-block text-center"
              >
                Custom Solutions
              </Link>
            </div>
          </div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400/20 rounded-full animate-pulse animation-delay-1000"></div>
      </section>

      {/* Product Ranges - from backend with images */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Product Ranges</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select a range to view its products. Add and manage range images in the admin panel.
            </p>
          </div>

          {(!publicRanges || publicRanges.length === 0) && !catalogLoading ? (
            <div className="text-center py-12 text-gray-500">
              <p>No ranges yet. Add ranges and images from Admin → Ranges Management.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedRangeId(isSelected ? null : range.id); } }}
                    className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 border-2 ${isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-transparent'}`}
                  >
                    <div className={`relative h-48 overflow-hidden ${!rangeImageUrl ? `bg-gradient-to-br ${colorClass}` : ''}`}>
                      {rangeImageUrl ? (
                        <img
                          src={rangeImageUrl}
                          alt={range.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.add('bg-gradient-to-br', ...colorClass.split(' ')); }}
                        />
                      ) : null}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div className={`w-12 h-12 bg-white/90 rounded-xl flex items-center justify-center text-gray-700 text-xl shadow-lg`}>
                          {isSelected ? (
                            <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <span className="text-lg font-bold">{range.name.charAt(0)}</span>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="text-sm font-medium opacity-90">{range.name}</div>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {range.name}
                      </h3>
                      <p className="text-gray-600 mb-2 text-sm leading-relaxed line-clamp-2">{range.description || 'View products in this range.'}</p>
                      <p className="text-xs text-slate-500">
                        {isSelected ? 'Showing products in this range' : 'Click to view products'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {selectedRange && (
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <span className="text-gray-600">Showing products for:</span>
              <span className="font-semibold text-gray-900">{selectedRange.name}</span>
              <button
                type="button"
                onClick={() => setSelectedRangeId(null)}
                className="text-sm px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Selected range image and title above products */}
      {selectedRange && (displaySimpleProducts.length > 0 || displayFeaturedProducts.length > 0) && (
        <section className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-8">
            <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-lg">
              {selectedRange.image ? (
                <img
                  src={getImageUrl(selectedRange.image)}
                  alt={selectedRange.name}
                  className="w-full h-48 md:h-64 object-cover"
                />
              ) : (
                <div className="w-full h-48 md:h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
        <section className="py-12 bg-white">
          <div className="container mx-auto px-6 text-center">
            <p className="text-gray-600">
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
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {selectedRangeId ? `Standard products in ${selectedRange?.name || 'this range'}.` : 'Browse our standard electrical automation products.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displaySimpleProducts.slice(0, 12).map((product) => {
                const imgSrc = product.baseImageUrl?.startsWith('http') ? product.baseImageUrl : getImageUrl(product.baseImageUrl || '');
                const detailUrl = `/products/detail/${product.id}`;
                return (
                  <Link key={product.id} to={detailUrl} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <img src={imgSrc} alt={product.name} className="w-full h-40 object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-4">
                      <p className="text-xs text-gray-500 mb-1">{product.range?.name || 'Product'}</p>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                      <span className="text-blue-600 font-semibold text-sm hover:underline">
                        View Details →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
            {displaySimpleProducts.length > 12 && (
              <div className="text-center mt-8">
                <Link to="/products/browse" className="text-blue-600 font-semibold hover:underline">
                  Browse all products →
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Products Section - Only Configurable Products */}
      {displayFeaturedProducts.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                {selectedRangeId ? `Configurable products in ${selectedRange?.name || 'this range'}.` : 'Discover our configurable electrical automation solutions.'}
              </p>
              <Link
                to="/products/ranges"
                className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manage Pro Products
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayFeaturedProducts.map((product) => {
                const imgSrc = product.baseImageUrl?.startsWith('http') ? product.baseImageUrl : getImageUrl(product.baseImageUrl || '');
                const detailUrl = `/products/detail/${product.id}?pro=true`;
                return (
                  <div key={product.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                    <div className="relative">
                      <img
                        src={imgSrc}
                        alt={product.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Configurable
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-sm text-blue-600 font-medium mb-1">{product.range?.name || 'Product'}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{product.description || 'Professional electrical automation solution.'}</p>
                      <div className="flex flex-col gap-2">
                        <Link
                          to={detailUrl}
                          className="flex-1 text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Need Custom Solutions?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Our engineering team can design and manufacture custom electrical automation solutions tailored to your specific requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
            <Link to="/products/ranges" className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              </svg>
              Go to Tabbed Ranges
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-white text-blue-900 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
              Request Quote
            </Link>
            <Link to="/resources" className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold rounded-lg transition-all duration-300">
              Download Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
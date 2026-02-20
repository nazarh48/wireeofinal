// src/pages/ProductPage.jsx
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';

const ProductPage = () => {
  const { rangeId } = useParams();
  const navigate = useNavigate();
  const { getConfigurableProductsByRange, getRangeById, loadPublicCatalog, loading, loaded } = useCatalog();

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const range = getRangeById(rangeId);
  const products = getConfigurableProductsByRange(rangeId);

  const handleProductSelect = (productId) => {
    navigate(`/editor/${productId}`);
  };

  if (loading && !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading…</p>
        </div>
      </div>
    );
  }

  if (!range) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Range not found</h2>
          <button
            onClick={() => navigate('/ranges')}
            className="text-teal-600 hover:text-teal-700 font-semibold"
          >
            ← Back to Ranges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-100/30 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100/30 rounded-full blur-3xl" />
      
      <div className="relative py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12">
            <button
              onClick={() => navigate('/ranges')}
              className="group inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold mb-6 transition-colors"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Ranges
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600">{range.name}</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">{range.description}</p>
            </div>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No products available in this range</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-100 hover:border-teal-200 hover:-translate-y-2"
                  onClick={() => handleProductSelect(product.id)}
                >
                  <div className="relative h-56 bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
                    <img
                      src={product.baseImageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed line-clamp-2">{product.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-500 font-medium">ID: {product.id}</span>
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-gradient-to-r from-teal-500 to-cyan-500 text-white group-hover:from-teal-600 group-hover:to-cyan-600 transition-all shadow-md group-hover:shadow-lg">
                        Design
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;

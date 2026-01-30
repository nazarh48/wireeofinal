// src/pages/ProductsBrowse.jsx
import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';

const ProductsBrowse = () => {
  const { ranges, normalProducts, getNormalProductsByRange, loadPublicCatalog, loading, loaded, error } = useCatalog();
  const [rangeFilter, setRangeFilter] = useState('');

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const filtered = useMemo(() => {
    if (!rangeFilter) return normalProducts;
    return getNormalProductsByRange(rangeFilter);
  }, [normalProducts, rangeFilter, getNormalProductsByRange]);

  if (loading && !loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading products…</p>
        </div>
      </div>
    );
  }

  if (error && !loaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-lg mx-auto p-6 bg-white rounded-xl shadow border border-gray-200">
          <p className="text-gray-700 font-semibold mb-2">Failed to load products</p>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => loadPublicCatalog()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
          >
            ← Back to Products Menu
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Standard Products</h1>
          <p className="text-xl text-gray-600 mb-4">Browse our complete catalog of normal (non-configurable) products</p>
          {ranges.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="range-filter" className="text-sm font-medium text-gray-700">Filter by range:</label>
              <select
                id="range-filter"
                value={rangeFilter}
                onChange={(e) => setRangeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All ranges</option>
                {ranges.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow border border-gray-200">
            <p className="text-gray-500 text-lg">No standard products found.</p>
            <Link to="/products" className="mt-4 inline-block text-blue-600 hover:text-blue-800 font-medium">
              Back to Products
            </Link>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.baseImageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">ID: {product.id}</span>
                  <Link
                    to={`/products/detail/${product.id}`}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    View Details →
                  </Link>
            </div>
          </div>
        </div>
      ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default ProductsBrowse;
// src/pages/ProductsRanges.jsx
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';

const ProductsRanges = () => {
  const { ranges, loadPublicCatalog, loading, loaded } = useCatalog();

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Ranges</h1>
          <p className="text-xl text-gray-600">Choose a product range to explore and configure</p>
        </div>

        {loading && !loaded ? (
          <div className="text-center py-16">Loading…</div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ranges.map((range, idx) => (
            <div
              key={range.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className={`w-full h-48 bg-gradient-to-br ${idx % 3 === 0 ? 'from-green-100 to-emerald-200' : idx % 3 === 1 ? 'from-indigo-100 to-purple-200' : 'from-cyan-100 to-teal-200'} flex items-center justify-center`}>
                <span className="text-3xl font-bold text-gray-700">{range.name?.slice(0, 1) || 'R'}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{range.name}</h3>
                <p className="text-gray-600">{range.description}</p>
                <div className="mt-4">
                  <Link
                    to={`/products/range/${range.id}`}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    View Products →
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

export default ProductsRanges;
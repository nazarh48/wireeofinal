// src/pages/ProductsInRange.jsx
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCatalog } from '../hooks/useCatalog';

const ProductsInRange = () => {
  const { rangeId } = useParams();
  const { getConfigurableProductsByRange, getRangeById, loadPublicCatalog, loading, loaded } = useCatalog();

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const range = getRangeById(rangeId);
  const products = rangeId ? getConfigurableProductsByRange(rangeId) : [];

  if (loading && !loaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!range) {
    return <div className="min-h-screen flex items-center justify-center">Range not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/products/ranges"
            className="text-blue-600 hover:text-blue-800 font-medium mb-4 inline-block"
          >
            ← Back to Ranges
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{range.name}</h1>
          <p className="text-xl text-gray-600">{range.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
                    to={`/products/detail/${product.id}?pro=true`}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Configure →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsInRange;
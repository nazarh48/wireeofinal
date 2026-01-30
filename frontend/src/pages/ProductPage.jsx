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
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!range) {
    return <div className="min-h-screen flex items-center justify-center">Range not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/ranges')}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Ranges
          </button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{range.name}</h1>
          <p className="text-xl text-gray-600">{range.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleProductSelect(product.id)}
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Design →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
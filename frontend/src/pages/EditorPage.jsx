// src/pages/EditorPage.jsx
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { useCatalog } from '../hooks/useCatalog';
import useStore from '../store/useStore';
import Configurator from '../components/configurator/Configurator';

const EditorPage = () => {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getConfigurableProductById, getRangeById, loadPublicCatalog, loading, loaded } = useCatalog();
  const setProduct = useStore((s) => s.setProduct);

  const instanceId = searchParams.get('instanceId') || null;

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const product = getConfigurableProductById(productId);
  const range = product ? getRangeById(product.rangeId) : null;

  const isFromProjects = window.location.search.includes('from=projects');

  useEffect(() => {
    if (product) {
      setProduct(product, instanceId);
    }
  }, [product, setProduct, productId, instanceId]);

  if (loading && !loaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  if (!product || !range) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <div className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => navigate(isFromProjects ? '/products/ranges?tab=projects' : '/products/ranges?tab=collection')}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base flex-shrink-0"
              >
                ← Back
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">{product.name}</h1>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{range.name} • {product.description}</p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 flex-shrink-0 ml-2 hidden sm:block">
              ID: {product.id}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <Configurator navigate={navigate} isFromProjects={isFromProjects} instanceId={instanceId} />
      </div>
    </div>
  );
};

export default EditorPage;
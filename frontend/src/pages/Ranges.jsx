import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { useCatalog } from '../hooks/useCatalog';
import AddButton from '../components/AddButton';
import Toast from '../components/Toast';

const Ranges = () => {
  const { ranges, getConfigurableProductsByRange, getRangeById, loadPublicCatalog, loading, loaded } = useCatalog();
  const [activeTab, setActiveTab] = useState(ranges[0]?.id ?? '');
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const addToPending = useStore((state) => state.addToPending);
  const toastState = useStore((state) => state.toast);
  const closeToast = useStore((state) => state.closeToast);
  const pendingCollection = useStore((state) => state.pendingCollection);
  const savePendingAsPdf = useStore((state) => state.savePendingAsPdf);

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  useEffect(() => {
    if (!activeTab && ranges.length > 0) setActiveTab(ranges[0].id);
  }, [activeTab, ranges]);

  const activeRange = getRangeById(activeTab);
  const activeProducts = activeTab ? getConfigurableProductsByRange(activeTab) : [];

  const handleAddProduct = (product) => {
    const mappedProduct = {
      ...product,
      id: product.id,
      name: product.name,
      description: product.description,
      baseImageUrl: product.baseImageUrl || product.image,
      configurable: true,
    };
    addToPending(mappedProduct);
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddSelectedProducts = () => {
    const productsToAdd = activeProducts.filter(product => selectedProducts.has(product.id));
    productsToAdd.forEach(product => {
      const mappedProduct = {
        ...product,
        baseImageUrl: product.baseImageUrl || product.image,
        configurable: true,
      };
      addToPending(mappedProduct);
    });
    setSelectedProducts(new Set());
  };
  const handleToastClose = () => closeToast();

  if (ranges.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Product Ranges</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
            <p className="text-lg">No ranges available. Add ranges from the Admin Dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Product Ranges</h1>
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {ranges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setActiveTab(range.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === range.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {range.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 relative">
          {/* Toast and Modal are now inside the product cards section */}
          {toastState.open && (
            <Toast
              message={toastState.message}
              actionLabel={toastState.actionLabel}
              onAction={toastState.onAction}
              onClose={handleToastClose}
              position="bottom"
            />
          )}
          {pendingCollection && pendingCollection.length > 0 && (
            <div className="fixed right-6 bottom-6 z-50">
              <button
                onClick={() => savePendingAsPdf()}
                className="flex items-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-full shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a2 2 0 00-2 2v2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H8zM9 9V4h2v5h3l-4 4-4-4h3z" />
                </svg>
                <span>Save as PDF ({pendingCollection.length})</span>
              </button>
            </div>
          )}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">{activeRange?.name ?? '—'}</h2>
            <AddButton
              onClick={handleAddSelectedProducts}
              disabled={selectedProducts.size === 0}
            >
              Add ({selectedProducts.size})
            </AddButton>
          </div>
          <p className="text-gray-600 mb-6">{activeRange.description}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProducts.map((product) => (
              <div key={product.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <img
                      src={product.baseImageUrl || product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-md mb-4"
                    />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => handleProductSelect(product.id)}
                    className="mt-2 mr-2 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <AddButton onClick={() => handleAddProduct(product)}>
                  Add
                </AddButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ranges;
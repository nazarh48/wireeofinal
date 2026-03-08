import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { useCatalog } from '../hooks/useCatalog';
import Toast from '../components/Toast';
import ProjectSelectionModal from '../components/ProjectSelectionModal';
import EditedProductPreview from '../components/EditedProductPreview';
import { useAuthStore } from '../store/authStore';
import { generateProductPDF, generateProjectPDF } from '../utils/pdfGenerator';
import { sanitizePdfEditsSnapshot } from '../utils/pdfSnapshot';
import { apiService, API_ORIGIN, IMAGE_BASE_URL } from '../services/api';

const FALLBACK_IMAGE = '/test.png';

const TabbedRanges = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'selection');
  const { loadPublicCatalog, loading: catalogLoading, loaded: catalogLoaded } = useCatalog();
  const toast = useStore((state) => state.toast);
  const closeToast = useStore((state) => state.closeToast);
  const collection = useStore((state) => state.collection);
  const removeFromCollection = useStore((state) => state.removeFromCollection);
  const pendingPdfCollection = useStore((state) => state.pendingPdfCollection);
  const savePendingAsPdf = useStore((state) => state.savePendingAsPdf);
  const fetchCollection = useStore((state) => state.fetchCollection);
  const fetchProjects = useStore((state) => state.fetchProjects);
  const collectionLoading = useStore((state) => state.collectionLoading);
  const collectionError = useStore((state) => state.collectionError);
  const projectsLoading = useStore((state) => state.projectsLoading);
  const projectsError = useStore((state) => state.projectsError);

  useEffect(() => {
    if (!catalogLoaded && !catalogLoading) loadPublicCatalog();
  }, [catalogLoaded, catalogLoading, loadPublicCatalog]);

  useEffect(() => {
    if (activeTab === 'collection') fetchCollection();
  }, [activeTab, fetchCollection]);

  useEffect(() => {
    if (activeTab === 'projects') fetchProjects();
  }, [activeTab, fetchProjects]);

  useEffect(() => {
    const handleNavigateToProjectsTab = () => {
      setActiveTab('projects');
    };

    window.addEventListener('navigateToProjectsTab', handleNavigateToProjectsTab);
    return () => window.removeEventListener('navigateToProjectsTab', handleNavigateToProjectsTab);
  }, []);

  const tabs = [
    { id: 'selection', label: 'Selection' },
    { id: 'collection', label: 'Collection' },
    { id: 'projects', label: 'Projects' },
    { id: 'pdf-configurations', label: 'Exported projects' },
  ];

  const duplicateProductInCollection = useStore((state) => state.duplicateProductInCollection);

  const duplicateProduct = (item) => {
    duplicateProductInCollection(item, item._instanceId);
  };

  const deleteProduct = (instanceId) => {
    removeFromCollection(instanceId);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'selection':
        return <SelectionContent />;
      case 'collection':
        return (
          <CollectionContent
            collection={collection}
            loading={collectionLoading}
            error={collectionError}
            onDuplicate={duplicateProduct}
            onDelete={deleteProduct}
            onRetry={fetchCollection}
          />
        );
      case 'projects':
        return (
          <ProjectsContent
            loading={projectsLoading}
            error={projectsError}
            onRetry={fetchProjects}
            setActiveTab={setActiveTab}
            initialSelectedProjectId={searchParams.get('projectId')}
          />
        );
      case 'pdf-configurations':
        return <PDFConfigurationsContent />;
      default:
        return null;
    }
  };

  const handleToastAction = () => {
    if (toast.onAction) toast.onAction();
    if (toast.actionLabel === 'Go to Collections') {
      setActiveTab('collection');
      closeToast();
    }
    if (toast.actionLabel === 'Go to Projects') {
      setActiveTab('projects');
      closeToast();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 mb-2">
            Graphic Configurator
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Discover and customize your perfect product collection with selection, collection, projects, and PDF configurations.
          </p>
        </div>
        <div className="mb-12">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <nav className="-mb-px flex justify-center p-3 sm:p-4 space-x-2 sm:space-x-4" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === tab.id
                    ? tab.id === 'pdf-configurations'
                      ? 'text-white bg-emerald-600 shadow-lg'
                      : 'text-white bg-gradient-to-r from-teal-600 to-cyan-600 shadow-lg'
                    : tab.id === 'pdf-configurations'
                      ? 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className={`absolute inset-0 rounded-lg opacity-20 ${tab.id === 'pdf-configurations'
                      ? 'bg-emerald-600'
                      : 'bg-gradient-to-r from-teal-600 to-cyan-600'
                      }`}></div>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-12">
          {renderContent()}
        </div>
        {toast.open && (
          <Toast
            message={toast.message}
            actionLabel={toast.actionLabel}
            onAction={handleToastAction}
            onClose={closeToast}
            position="bottom"
          />
        )}
        {pendingPdfCollection.length > 0 && (activeTab === 'projects' || activeTab === 'pdf-configurations') && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={savePendingAsPdf}
              className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 text-sm"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export PDF ({pendingPdfCollection.length})</span>
            </button>
          </div>
        )}
        {/* Modal removed, direct add now handled in product card */}
      </div>
    </div>
  );
};

const SelectionContent = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { ranges, getConfigurableProductsByRange, getRangeById } = useCatalog();
  const [selectedRange, setSelectedRange] = useState('');
  const addToPending = useStore((s) => s.addToPending);
  const productEdits = useStore((s) => s.productEdits);
  const getProductEdits = useStore((s) => s.getProductEdits);

  useEffect(() => {
    // Check if rangeId is in URL params (from returning from editor)
    const rangeIdFromUrl = searchParams.get('rangeId');
    if (rangeIdFromUrl) {
      setSelectedRange(rangeIdFromUrl);
    } else if (!selectedRange && ranges.length > 0) {
      setSelectedRange(ranges[0].id);
    }
  }, [ranges, selectedRange, searchParams]);

  const selectedRangeData = getRangeById(selectedRange);
  const selectedProducts = selectedRange ? getConfigurableProductsByRange(selectedRange) : [];

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-3 shadow-lg">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-2">
          Product selection
        </h2>
        <p className="text-sm text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Start by choosing a range, then pick the products you want to configure in the Collection tab.
        </p>
      </div>

      {/* Range selector */}
      <div className="mb-8 flex justify-center">
        <div className="relative w-full max-w-2xl">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl blur opacity-20" />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-teal-100">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mb-2 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <label htmlFor="range-select" className="block text-sm font-semibold text-gray-900 mb-1">
                Choose a range
              </label>
              <p className="text-gray-500 text-xs">This controls which products are shown below.</p>
            </div>
            <select
              id="range-select"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="block w-full px-4 py-3 text-sm font-medium border border-teal-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-gradient-to-r from-white to-teal-50/50 transition-all duration-200 hover:shadow-md"
            >
              {ranges.length === 0 ? (
                <option value="">No ranges available</option>
              ) : (
                <>
                  <option value="" className="text-base py-2">
                    Select range
                  </option>
                  {ranges.map((range) => (
                    <option key={range.id} value={range.id} className="text-base py-2">
                      {range.name}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
        </div>
      </div>

      {!selectedRangeData ? (
        <div className="text-center py-10 bg-white/90 rounded-xl border border-teal-100">
          <p className="text-gray-600 text-sm">
            Select a range above to view configurable products.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl blur opacity-15" />
          <div className="relative bg-gradient-to-br from-teal-50/50 via-cyan-50/30 to-white rounded-2xl p-6 lg:p-8 shadow-xl border border-teal-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedRangeData.name}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Browse the products in this range and add them to your collection.
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-600 lg:text-right">
                <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/80 border border-teal-100 text-teal-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Configurable products: {selectedProducts.length}
                </span>
              </div>
            </div>

            {/* Products grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {selectedProducts.map((product) => {
                const edits = getProductEdits(product.id);
                return (
                  <div key={product.id} className="group relative bg-white rounded-lg border border-gray-200 hover:border-teal-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    {/* Compact Image Preview */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {edits && ((edits.elements && edits.elements.length > 0) || edits.configuration?.backgroundImage) ? (
                        <EditedProductPreview product={product} edits={edits} width={300} height={300} />
                      ) : (
                        <img
                          src={
                            product.baseDeviceImageUrl
                            || product.configuratorImageUrl
                            || product.baseImageUrl
                            || product.images?.[0]
                            || FALLBACK_IMAGE
                          }
                          alt={product.imageAlt || `${product.name} - High Quality Product`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                      )}
                      {/* Edited Badge */}
                      {edits && edits.elements && edits.elements.length > 0 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 z-10">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Edited
                        </div>
                      )}
                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          onClick={() => addToPending(product)}
                          className="p-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-white transition-colors"
                          title="Add to Collection"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Compact Info */}
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">{product.name}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs text-teal-600 font-medium">Add to Collection, then configure in Collection tab</span>
                        <button
                          onClick={() => addToPending(product)}
                          className="p-1.5 hover:bg-teal-50 rounded text-teal-600 transition-colors"
                          title="Add to Collection"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CollectionContent = ({ collection, loading, error, onRetry, onDuplicate, onDelete }) => {
  const {
    addProductsToProject,
    editsByInstanceId,
  } = useStore();
  const { getConfigurableProductById } = useCatalog();
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [productsToAdd, setProductsToAdd] = useState([]);

  const handleStartEditing = (item) => {
    const params = new URLSearchParams({ from: 'collection' });
    if (item._instanceId) params.set('instanceId', item._instanceId);
    navigate(`/editor/${item.id}?${params.toString()}`);
  };

  const handleDeleteItem = (item) => {
    const confirmed = window.confirm(
      `Delete "${item?.name || 'this product'}" from your collection?`,
    );
    if (!confirmed) return;
    onDelete(item._instanceId || item.id);
  };

  const handleToggleSelection = (item) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      const key = item._instanceId || item.id;
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const handleAddToProjects = (item = null) => {
    // If single item, add just that one; otherwise use selected products
    const products = item
      ? [item]
      : collection.filter(p => selectedProducts.has(p._instanceId || p.id));

    if (products.length === 0) {
      return;
    }

    setProductsToAdd(products);
    setShowProjectModal(true);
  };

  const handleConfirmAddToProject = async (products, projectId, projectName = null) => {
    const ok = await addProductsToProject(products, projectId, projectName);
    if (ok) {
      setSelectedProducts(new Set());
      setShowProjectModal(false);
      setProductsToAdd([]);
    }
    return ok;
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4 shadow-xl">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-2">
          Your Collection
        </h2>
        <p className="text-sm text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Manage and customize your selected products. Edit, duplicate, or organize them into projects.
        </p>
      </div>

      {loading && !collection?.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading collection…</p>
        </div>
      ) : error && !collection?.length ? (
        <div className="text-center py-12 rounded-xl bg-red-50 border border-red-200 max-w-xl mx-auto">
          <p className="text-red-700 font-medium text-sm mb-2">Failed to load collection</p>
          <p className="text-red-600 text-xs mb-4">{error}</p>
          <button onClick={onRetry} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
            Retry
          </button>
        </div>
      ) : collection.length === 0 ? (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl blur opacity-20"></div>
          <div className="relative text-center py-16 bg-gradient-to-br from-teal-50/50 via-cyan-50/30 to-white rounded-2xl border-2 border-dashed border-teal-200 shadow-xl">
            <div className="text-6xl mb-6">📦</div>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mb-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">Your collection is empty</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-2xl mx-auto leading-relaxed">
              No products added to collection yet. Start by selecting products from the Selection tab.
            </p>
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-teal-100">
                <p className="text-teal-700 font-semibold text-sm">💡 Tip: Click &quot;Add to Collection&quot; on products you like!</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Compact Icon-Based Bulk Actions Bar */}
          {selectedProducts.size > 0 && (
            <div className="mb-6 p-3 bg-white border-2 border-teal-200 rounded-xl shadow-sm flex items-center justify-between">
              <div className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedProducts.size} selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToProjects()}
                  className="p-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors"
                  title="Add to Project"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedProducts(new Set())}
                  className="p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                  title="Clear Selection"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {collection.filter(item => item).map((item, idx) => {
              const itemKey = item._instanceId || item.id;
              const isSelected = selectedProducts.has(itemKey);
              const catalogProduct = getConfigurableProductById?.(item.id) || null;
              const resolvedBaseDeviceImageUrl =
                item.baseDeviceImageUrl || catalogProduct?.baseDeviceImageUrl || "";
              const resolvedConfiguratorImageUrl =
                item.configuratorImageUrl || catalogProduct?.configuratorImageUrl || "";
              const itemEdits =
                item.edits ||
                (item._instanceId ? editsByInstanceId[item._instanceId] : null);
              const hasVisualEdits =
                !!itemEdits?.editedImage ||
                (Array.isArray(itemEdits?.elements) && itemEdits.elements.length > 0) ||
                !!itemEdits?.configuration?.backgroundImage;
              const previewProductBase = {
                ...item,
                baseDeviceImageUrl:
                  resolvedBaseDeviceImageUrl ||
                  item.baseDeviceImageUrl ||
                  item.configuratorImageUrl ||
                  item.baseImageUrl ||
                  (Array.isArray(item.images) ? item.images[0] : null),
                configuratorImageUrl:
                  resolvedConfiguratorImageUrl ||
                  item.configuratorImageUrl ||
                  resolvedBaseDeviceImageUrl ||
                  item.baseDeviceImageUrl ||
                  item.baseImageUrl,
                baseImageUrl:
                  item.baseImageUrl ||
                  item.configuratorImageUrl ||
                  (Array.isArray(item.images) ? item.images[0] : null),
              };
              const previewProduct = itemEdits?.editedImage
                ? { ...previewProductBase, editedImage: itemEdits.editedImage }
                : previewProductBase;
              return (
                <div key={`${item._instanceId || item.id}_${idx}`} className={`group relative ${isSelected ? 'ring-4 ring-teal-500' : ''}`}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
                  <div className={`relative bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 border ${isSelected ? 'border-teal-500' : 'border-slate-200'} overflow-hidden`}>

                    {/* Selection Checkbox */}
                    <div className="absolute top-3 left-3 z-20">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelection(item)}
                        className="w-5 h-5 text-teal-600 bg-white border-2 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                      />
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M5 12h.01M12 12h.01M12 12h.01M19 12h.01M19 12h.01M5 19h.01M5 19h.01M12 19h.01M12 19h.01M19 19h.01M19 19h.01M5 5h.01M5 5h.01M12 5h.01M12 5h.01M19 5h.01M19 5h.01" />
                        </svg>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl mb-5 aspect-[4/3] bg-slate-50">
                      {hasVisualEdits ? (
                        <div className="w-full h-full rounded-2xl shadow-sm overflow-hidden border border-slate-100 flex items-center justify-center">
                          <EditedProductPreview product={previewProduct} edits={itemEdits} width={277} height={208} />
                        </div>
                      ) : (
                        <img
                          src={
                            previewProduct.baseDeviceImageUrl
                            || previewProduct.configuratorImageUrl
                            || previewProduct.baseImageUrl
                            || item.images?.[0]
                            || FALLBACK_IMAGE
                          }
                          alt={item.imageAlt || `${item.name} - High Quality Product`}
                          className="w-full h-full object-contain rounded-2xl shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-500"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-3 left-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-lg">
                          <span className="text-xs font-bold text-teal-600">#{idx + 1}</span>
                        </div>
                      </div>
                      {hasVisualEdits && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 z-10 shadow-lg">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Edited
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <h4 className="text-base font-bold text-gray-800 mb-0.5 group-hover:text-teal-600 transition-colors duration-300">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleStartEditing(item)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors"
                            title="Edit Product"
                            aria-label="Edit product"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDuplicate(item)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors"
                            title="Duplicate Product"
                            aria-label="Duplicate product"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Delete Product"
                            aria-label="Delete product"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAddToProjects(item)}
                            className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-600 transition-colors"
                            title="Add to Project"
                            aria-label="Add to project"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <span className="text-xs font-medium text-slate-500">Add to project</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project Selection Modal */}
          <ProjectSelectionModal
            isOpen={showProjectModal}
            onClose={() => {
              setShowProjectModal(false);
              setProductsToAdd([]);
            }}
            products={productsToAdd}
            onConfirm={handleConfirmAddToProject}
          />
        </>
      )}
    </div>
  );
};

const ProjectsContent = ({ loading, error, onRetry, setActiveTab, initialSelectedProjectId = null }) => {
  const {
    projects,
    collection,
    productEdits,
    editsByInstanceId,
    addProductsToPdf,
    savePendingAsPdf,
    showToast,
    duplicateProject,
    deleteProject,
    fetchPdfConfigurations,
    removeProductFromProject,
    updateProjectName,
  } = useStore();
  const { getConfigurableProductById } = useCatalog();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [exportingProjectId, setExportingProjectId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  const projectsWithProducts = projects.filter((p) => p.products && p.products.length > 0);

  useEffect(() => {
    if (
      initialSelectedProjectId &&
      projectsWithProducts.some((p) => p.id === initialSelectedProjectId) &&
      selectedProjectId !== initialSelectedProjectId
    ) {
      setSelectedProjectId(initialSelectedProjectId);
      return;
    }

    if (!selectedProjectId && projectsWithProducts.length > 0) {
      setSelectedProjectId(projectsWithProducts[0].id);
    }
    if (selectedProjectId && !projectsWithProducts.some((p) => p.id === selectedProjectId)) {
      setSelectedProjectId(projectsWithProducts[0]?.id || null);
    }
  }, [initialSelectedProjectId, projectsWithProducts, selectedProjectId]);

  const handleAddProjectToPdf = (project) => {
    const added = addProductsToPdf(project?.products || [], project?.name, project?.id);
    if (added > 0) {
      showToast(
        `${added} product${added !== 1 ? 's' : ''} added to PDF list. Export from Exported projects tab.`,
        'Go to Exported projects',
        () => typeof setActiveTab === 'function' && setActiveTab('pdf-configurations'),
      );
    }
  };

  const handleDuplicateProject = async (project) => {
    setDuplicatingId(project.id);
    try {
      await duplicateProject(project);
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDeleteProject = (project) => {
    setDeleteConfirm(project);
  };

  const confirmDeleteProject = async () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm.id;
    setDeleteConfirm(null);
    await deleteProject(id);
  };

  const handleAddProductToPdf = (product) => {
    const added = addProductsToPdf([product]);
    if (added > 0) {
      showToast(
        `${added} product${added !== 1 ? 's' : ''} added to PDF configuration.`,
        'Save as PDF',
        savePendingAsPdf,
      );
    }
  };

  // Build product with edits + editedImage (use project snapshot so re-editing in collection does not change project/PDF)
  const getEnhancedProductForPdf = (product) => {
    const instanceEdits = product._instanceId ? editsByInstanceId[product._instanceId] : null;
    const edits = product.edits || (instanceEdits ? { elements: instanceEdits.elements || [], configuration: instanceEdits.configuration || {} } : null) || productEdits[product.id] || null;
    const editedImage = product.editedImage ?? instanceEdits?.editedImage ?? null;
    const collectionItem = (collection || []).find((c) => c._instanceId === product._instanceId);
    const catalogProduct = getConfigurableProductById?.(product.id) || null;
    const baseImg =
      collectionItem?.baseDeviceImageUrl ||
      catalogProduct?.baseDeviceImageUrl ||
      collectionItem?.configuratorImageUrl ||
      catalogProduct?.configuratorImageUrl ||
      collectionItem?.baseImageUrl ||
      catalogProduct?.baseImageUrl;
    return {
      ...product,
      edits: edits || null,
      editedImage: editedImage || null,
      baseDeviceImageUrl: baseImg || product.baseDeviceImageUrl || product.configuratorImageUrl || product.baseImageUrl,
      configuratorImageUrl: baseImg || product.configuratorImageUrl || product.baseImageUrl,
      baseImageUrl: baseImg ? (collectionItem?.baseImageUrl || baseImg) : (product.baseImageUrl || product.configuratorImageUrl),
    };
  };

  // Safely resolve a product's MongoDB ObjectId string from any product shape
  const resolveProductId = (p) => {
    const raw = p?._id ?? p?.id ?? p?.product?._id ?? p?.product?.id ?? p?.product;
    if (!raw) return null;
    const str = typeof raw === 'object' ? (raw.toString?.() ?? null) : String(raw);
    // Must look like a 24-char hex ObjectId
    return str && /^[a-f\d]{24}$/i.test(str) ? str : null;
  };

  const handleExportProjectPdf = async (project) => {
    if (!project?.products || project.products.length === 0) {
      showToast('No products available to export.');
      return;
    }
    try {
      setExportingProjectId(project.id);
      const enhancedProducts = project.products.map(getEnhancedProductForPdf);
      await generateProjectPDF({ ...project, products: enhancedProducts }, { user });
      // Build snapshot – only include products with a resolvable MongoDB ObjectId
      const snapshot = (project.products || [])
        .map((p) => ({ productId: resolveProductId(p), p }))
        .filter(({ productId }) => !!productId)
        .map(({ productId, p }) => ({
          product: productId,
          instanceId: p._instanceId || null,
          edits: sanitizePdfEditsSnapshot(p.edits),
        }));
      if (snapshot.length === 0) {
        showToast('Could not resolve product IDs – please refresh and try again.');
        return;
      }
      await apiService.pdf.create({
        projectId: project.id,
        projectName: project.name || 'Unnamed Project',
        productCount: snapshot.length,
        products: snapshot,
      });
      await fetchPdfConfigurations();
      showToast(
        'PDF exported and added to Exported projects.',
        'View exports',
        () => typeof setActiveTab === 'function' && setActiveTab('pdf-configurations'),
      );
      if (typeof setActiveTab === 'function') setActiveTab('pdf-configurations');
    } catch (e) {
      showToast(e?.message || 'Failed to generate or save project PDF.');
    } finally {
      setExportingProjectId(null);
    }
  };

  const handleExportSingleProductPdf = async (project, product) => {
    try {
      const productWithEdits = getEnhancedProductForPdf(product);
      const productId = resolveProductId(product);
      if (!productId) {
        showToast('Could not resolve product ID – please refresh and try again.');
        return;
      }
      await generateProductPDF([productWithEdits], {
        user,
        projectName: `${project?.name || 'Project'} - ${product?.name || 'Product'}`,
      });
      await apiService.pdf.create({
        projectId: project?.id || null,
        projectName: `${project?.name || 'Project'} - ${product?.name || 'Product'}`,
        productCount: 1,
        products: [
          {
            product: productId,
            instanceId: product?._instanceId || null,
            edits: sanitizePdfEditsSnapshot(productWithEdits.edits),
          },
        ],
      });
      await fetchPdfConfigurations();
      showToast(
        'Single product PDF exported and saved to Exported projects.',
        'View exports',
        () => typeof setActiveTab === 'function' && setActiveTab('pdf-configurations'),
      );
      if (typeof setActiveTab === 'function') setActiveTab('pdf-configurations');
    } catch (e) {
      showToast(e?.message || 'Failed to export product PDF.');
    }
  };

  const handleRemoveProduct = async (projectId, product) => {
    const removeKey = product?._instanceId || product?.instanceId || product?.id || product?._id || null;
    if (!removeKey) {
      showToast('Could not remove product: missing identifier.');
      return;
    }
    const confirmed = window.confirm(
      `Remove "${product?.name || 'this product'}" from this project?`,
    );
    if (!confirmed) return;
    await removeProductFromProject(projectId, removeKey);
  };

  const handleRenameProject = async (project) => {
    const nextName = window.prompt('Rename project', project?.name || '');
    if (!nextName || !nextName.trim() || nextName.trim() === project?.name) return;
    await updateProjectName(project.id, nextName.trim());
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full mb-4 shadow-xl">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-2">
          Your Projects
        </h2>
        <p className="text-sm text-gray-700 max-w-3xl mx-auto leading-relaxed">
          View and manage your saved projects. Edit products, generate PDFs, and organize your work efficiently.
        </p>
      </div>

      {loading && !projectsWithProducts.length ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading projects…</p>
        </div>
      ) : error && !projectsWithProducts.length ? (
        <div className="text-center py-12 rounded-xl bg-red-50 border border-red-200 max-w-xl mx-auto">
          <p className="text-red-700 font-medium text-sm mb-2">Failed to load projects</p>
          <p className="text-red-600 text-xs mb-4">{error}</p>
          <button onClick={onRetry} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm">
            Retry
          </button>
        </div>
      ) : projectsWithProducts.length === 0 ? (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl blur opacity-20"></div>
          <div className="relative text-center py-16 bg-gradient-to-br from-teal-50/50 via-cyan-50/30 to-white rounded-2xl border-2 border-dashed border-teal-200 shadow-xl">
            <div className="text-6xl mb-6">🚀</div>
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mb-4 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">No projects yet</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-2xl mx-auto leading-relaxed">
              Start building your projects by adding edited products from your collection.
            </p>
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-teal-100">
                <p className="text-teal-700 font-semibold text-sm">💡 Tip: Edit products in your collection and add them to projects!</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="text-left p-4 font-semibold">Description</th>
                  <th className="text-left p-4 font-semibold">Content</th>
                  <th className="text-left p-4 font-semibold">Created</th>
                  <th className="text-left p-4 font-semibold">Owner</th>
                  <th className="text-left p-4 font-semibold">Actions</th>
                  <th className="text-left p-4 font-semibold">Select</th>
                </tr>
              </thead>
              <tbody>
                {projectsWithProducts.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`border-t cursor-pointer ${selectedProjectId === project.id ? 'bg-teal-50' : 'bg-white hover:bg-teal-50/40'}`}
                  >
                    <td className="p-4 font-medium text-gray-900">{project.name}</td>
                    <td className="p-4 text-gray-700">{project.products.length} Articles</td>
                    <td className="p-4 text-gray-600">{new Date(project.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="p-4 text-gray-600">Personal</td>
                    <td className="p-4">
                      <button
                        onClick={() => {
                          setSelectedProjectId(project.id);
                          handleRenameProject(project);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProjectId(project.id);
                        }}
                        className={`w-9 h-9 rounded-full text-lg leading-none transition-colors ${selectedProjectId === project.id
                          ? 'bg-teal-500 text-white'
                          : 'bg-teal-500/80 text-white hover:bg-teal-600'
                          }`}
                        title={selectedProjectId === project.id ? 'Project selected' : 'Select project'}
                      >
                        {selectedProjectId === project.id ? '✓' : '+'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projectsWithProducts.filter((p) => p.id === selectedProjectId).map((project) => (
            <div key={project.id} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 to-cyan-500 rounded-2xl blur opacity-15"></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-teal-100 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-600 p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-0.5">{project.name}</h3>
                      <p className="text-teal-100 text-xs">{project.products.length} Articles</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button onClick={() => handleAddProjectToPdf(project)} className="p-2 bg-white/90 hover:bg-white text-teal-700 rounded-lg transition-colors" title="Add project to PDF list">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      </button>
                      <button onClick={() => handleExportProjectPdf(project)} disabled={exportingProjectId === project.id} className="p-2 bg-teal-700 hover:bg-teal-800 disabled:bg-teal-400 text-white rounded-lg transition-colors" title="Export complete project PDF">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </button>
                      <button onClick={() => handleDuplicateProject(project)} disabled={duplicatingId === project.id} className="p-2 bg-amber-400/90 hover:bg-amber-400 text-teal-900 rounded-lg transition-colors disabled:opacity-60" title="Duplicate project">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      </button>
                      <button onClick={() => handleDeleteProject(project)} className="p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors" title="Delete project">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.products.map((product, idx) => {
                      // Use project snapshot (product.edits) so re-editing in collection does not change project
                      const instanceEdits = product._instanceId ? editsByInstanceId[product._instanceId] : null;
                      const edits = product.edits || (instanceEdits ? { elements: instanceEdits.elements || [], configuration: instanceEdits.configuration || {} } : null) || productEdits[product.id] || null;
                      const editedImage = product.editedImage ?? instanceEdits?.editedImage ?? null;
                      const productWithEdits = edits ? { ...product, edits } : product;
                      const collectionItem = (collection || []).find((c) => c._instanceId === product._instanceId);
                      const catalogProduct = getConfigurableProductById?.(product.id) || null;
                      const baseImg =
                        collectionItem?.baseDeviceImageUrl ||
                        catalogProduct?.baseDeviceImageUrl ||
                        collectionItem?.configuratorImageUrl ||
                        catalogProduct?.configuratorImageUrl ||
                        collectionItem?.baseImageUrl ||
                        catalogProduct?.baseImageUrl;
                      const previewProduct = {
                        ...product,
                        editedImage: editedImage || null,
                        baseDeviceImageUrl: baseImg || product.baseDeviceImageUrl || product.configuratorImageUrl || product.baseImageUrl,
                        configuratorImageUrl: baseImg || product.configuratorImageUrl || product.baseImageUrl,
                        baseImageUrl: baseImg ? (collectionItem?.baseImageUrl || baseImg) : (product.baseImageUrl || product.configuratorImageUrl),
                      };
                      return (
                        <div key={`${product._instanceId || product.id}_${idx}`} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-violet-300 transition-all group">
                          <div className="mb-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">{product.name}</h4>
                            <p className="text-sm text-gray-600 font-medium">Code: {product.productCode || product.sku || "—"}</p>
                          </div>
                          <div className="mb-4 bg-white rounded-lg p-2 border border-gray-200">
                            <EditedProductPreview key={`preview_${product._instanceId || product.id}_${idx}`} product={previewProduct} edits={edits} width={280} height={180} />
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                            <button onClick={() => handleExportSingleProductPdf(project, productWithEdits)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors" title="Export this product PDF">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            </button>
                            <button onClick={() => handleAddProductToPdf(productWithEdits)} className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors" title="Add to PDF list">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            </button>
                            <button
                              onClick={() => handleRemoveProduct(project.id, product)}
                              className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                              title="Remove from project"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-project-title">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 id="delete-project-title" className="text-xl font-bold text-gray-900 mb-2">Delete project?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{deleteConfirm.name}&quot;? This will remove it from your projects and from the PDF configuration list.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProject}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PDFConfigurationsContent = () => {
  const {
    pdfConfigurations,
    pendingPdfCollection,
    removeFromPdfCollection,
    clearPendingPdfCollection,
    savePendingAsPdf,
    fetchPdfConfigurations,
    deletePdfConfiguration,
    showToast,
    editsByInstanceId,
    productEdits,
  } = useStore();
  const [reExportingId, setReExportingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPdfConfigurations();
  }, [fetchPdfConfigurations]);

  const handleExportCurrentPdf = () => {
    savePendingAsPdf();
  };

  const formatDate = (d) => {
    if (!d) return "—";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  const handleReExportPdf = async (config) => {
    if (!config._id) return;
    setReExportingId(config._id);
    try {
      const res = await apiService.pdf.getById(config._id);
      const fullConfig = res?.config || res;
      let rawProducts = fullConfig?.products ?? [];
      if (rawProducts.length === 0 && fullConfig?.projectId) {
        const projectRes = await apiService.projects.getById(fullConfig.projectId);
        const projectData = projectRes?.project || projectRes;
        rawProducts = (projectData?.products ?? []).map((item) => ({
          product: item.product || item,
          instanceId: item.instanceId ?? item._instanceId,
          edits: item.edits || {},
        }));
      }
      if (rawProducts.length === 0) {
        showToast("No products in this export.");
        setReExportingId(null);
        return;
      }
      const normalizeUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http") || url.startsWith("data:")) return url;
        const path = url.startsWith("/") ? url : `/${url}`;
        // /uploads/ paths must go through IMAGE_BASE_URL (includes /api in production)
        if (path.startsWith("/uploads/")) return `${IMAGE_BASE_URL}${path}`;
        return `${API_ORIGIN}${path}`;
      };

      const products = rawProducts.map((item) => {
        const p = item.product || item;
        const instanceId = item.instanceId || p._instanceId;
        const instanceEdits = instanceId ? editsByInstanceId[instanceId] : null;
        const edits = instanceEdits
          ? { elements: instanceEdits.elements || [], configuration: instanceEdits.configuration || {} }
          : item.edits || productEdits[p?._id ?? p?.id] || p.edits || null;
        const editedImage = instanceEdits?.editedImage || null;
        return {
          ...p,
          id: p?._id ?? p?.id,
          _instanceId: instanceId,
          name: p?.name,
          description: p?.description,
          sku: p?.sku,
          category: p?.category,
          baseDeviceImageUrl: normalizeUrl(p?.baseDeviceImageUrl || p?.configuratorImageUrl || p?.baseImageUrl || p?.image),
          baseImageUrl: normalizeUrl(p?.baseImageUrl || p?.image),
          configuratorImageUrl: normalizeUrl(p?.configuratorImageUrl || p?.baseImageUrl || p?.image),
          images: Array.isArray(p?.images) ? p.images.map((img) => typeof img === 'string' ? normalizeUrl(img) : (img?.url ? normalizeUrl(img.url) : img)) : [],
          edits: edits ? { elements: edits.elements || [], configuration: edits.configuration || {} } : null,
          editedImage,
        };
      });
      window.dispatchEvent(
        new CustomEvent("generatePdf", { detail: { products, projectName: config.projectName || fullConfig.projectName } }),
      );
      await apiService.pdf.updateLastExported(config._id);
      showToast("PDF re-exported. Last exported date updated.");
    } catch (e) {
      console.error("[PDF] Re-export error:", e);
      showToast(e?.message || "Re-export failed.");
    } finally {
      setReExportingId(null);
    }
  };

  const handleDeleteConfig = (config) => {
    setDeleteConfirm(config);
  };

  const confirmDeleteConfig = async () => {
    if (!deleteConfirm?._id) return;
    const id = deleteConfirm._id;
    setDeleteConfirm(null);
    await deletePdfConfiguration(id);
  };

  const entries = Array.isArray(pendingPdfCollection) ? pendingPdfCollection.filter((e) => e && e.product) : [];
  // Show all exports that were saved (any product count >= 1)
  const displayPDFs = Array.isArray(pdfConfigurations)
    ? pdfConfigurations.filter((c) => (c.productCount ?? c.amount ?? 0) >= 1)
    : [];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl mb-3 shadow-lg">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 mb-1">
          Exported projects
        </h2>
        <p className="text-sm text-gray-600 max-w-2xl mx-auto">
          Projects you have exported to PDF. Re-export any time with the latest configuration.
        </p>
      </div>

      {/* Current PDF list (cart) – items added via "Add to PDF" from Projects */}
      {entries.length > 0 && (
        <div className="mb-12">
          <div className="relative">
            <div className="absolute -inset-1 rounded-3xl bg-emerald-600 blur opacity-15" />
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="bg-emerald-600 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Current PDF list</h3>
                  <p className="mt-1 text-sm text-emerald-100">{entries.length} item{entries.length !== 1 ? 's' : ''} ready to export</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      clearPendingPdfCollection();
                      showToast("PDF list cleared.");
                    }}
                    className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium"
                  >
                    Clear list
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCurrentPdf}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
              <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                {entries.map((entry) => (
                  <li key={entry.entryId} className="flex items-center justify-between gap-4 p-4 hover:bg-gray-50">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-gray-900">{entry.product?.name ?? "Product"}</span>
                      {entry.projectName && (
                        <span className="ml-2 text-sm text-gray-500">({entry.projectName})</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        removeFromPdfCollection(entry.entryId);
                        showToast("Removed from PDF list.");
                      }}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      title="Remove from PDF list"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {entries.length === 0 && displayPDFs.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/80 py-20 px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No exported projects yet</h3>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Export a project from the <strong>Projects</strong> tab (Export PDF button on a project) and it will appear here. You can re-export any project at any time.
          </p>
          <p className="text-sm text-gray-500">
            Go to Projects → choose a project → click the green Export PDF icon.
          </p>
        </div>
      ) : displayPDFs.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Exported projects</h3>
            <span className="text-emerald-100 text-sm font-medium">{displayPDFs.length} project{displayPDFs.length !== 1 ? 's' : ''}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Products</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last exported</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayPDFs.map((pdf) => (
                  <tr key={pdf._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">{pdf.projectName ?? pdf.description ?? "—"}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(pdf.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium">{pdf.productCount ?? pdf.amount ?? 0}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(pdf.lastExportedAt)}</td>
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDeleteConfig(pdf)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete configuration"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReExportPdf(pdf)}
                        disabled={reExportingId === pdf._id}
                        className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {reExportingId === pdf._id ? (
                          <svg className="w-4 h-4 animate-spin mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                        Export PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="delete-config-title">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 id="delete-config-title" className="text-xl font-bold text-gray-900 mb-2">Delete configuration?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete &quot;{deleteConfirm.projectName || deleteConfirm.description || "this configuration"}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteConfig}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabbedRanges;
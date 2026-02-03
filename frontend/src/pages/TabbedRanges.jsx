import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore';
import { useCatalog } from '../hooks/useCatalog';
import Toast from '../components/Toast';
import ProjectSelectionModal from '../components/ProjectSelectionModal';
import EditedProductPreview from '../components/EditedProductPreview';
import { useAuthStore } from '../store/authStore';
import { generateProjectPDF } from '../utils/pdfGenerator';

const FALLBACK_IMAGE = '/test.png';

const TabbedRanges = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'selection');
  const { loadPublicCatalog, loading: catalogLoading, loaded: catalogLoaded } = useCatalog();
  const toast = useStore((state) => state.toast);
  const closeToast = useStore((state) => state.closeToast);
  const collection = useStore((state) => state.collection);
  const removeFromCollection = useStore((state) => state.removeFromCollection);
  const pendingCollection = useStore((state) => state.pendingCollection);
  const addToCollection = useStore((state) => state.addToCollection);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-4 animate-pulse">
            Graphic Configurator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and customize your perfect product collection with selection, collection, projects, and PDF configurations.
          </p>
        </div>
        <div className="mb-16">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <nav className="-mb-px flex justify-center p-6 space-x-12" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-8 py-4 text-xl font-bold rounded-xl transition-all duration-500 transform ${activeTab === tab.id
                    ? 'text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow-xl scale-105'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-105'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 animate-pulse"></div>
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
        {pendingCollection.length > 0 && activeTab !== 'selection' && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={savePendingAsPdf}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Save as PDF ({pendingCollection.length})</span>
            </button>
          </div>
        )}
        {pendingPdfCollection.length > 0 && (activeTab === 'projects' || activeTab === 'pdf-configurations') && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={savePendingAsPdf}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-3"
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
  const [selectedRange, setSelectedRange] = useState("");
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
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-full mb-6 shadow-2xl animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 mb-6 animate-pulse">
          Product Selection
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Discover our premium collection of products. Choose from different ranges and customize your perfect selection.
        </p>
      </div>

      <div className="mb-16 flex justify-center">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl blur opacity-30 animate-pulse"></div>
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <label htmlFor="range-select" className="block text-2xl font-bold text-gray-800 mb-2">
                Choose Your Range
              </label>
              <p className="text-gray-600 text-lg">Select a product category to explore</p>
            </div>
            <select
              id="range-select"
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value)}
              className="block w-full px-8 py-5 text-xl font-semibold border-3 border-emerald-200 rounded-2xl shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:border-emerald-500 bg-gradient-to-r from-white to-emerald-50 transition-all duration-300 hover:shadow-xl"
            >
              {ranges.length === 0 ? (
                <option value="">No ranges available</option>
              ) : (
                <>
                  <option value="" className="text-lg py-2">Select range</option>
                  {ranges.map((range) => (
                    <option key={range.id} value={range.id} className="text-lg py-2">
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
        <div className="text-center py-16 bg-white/80 rounded-2xl border border-emerald-100">
          <p className="text-gray-600 text-lg">Select a range above to view configurable products.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl blur opacity-20"></div>
          <div className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-3xl p-12 shadow-2xl border border-emerald-100">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl mb-6 shadow-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-4">{selectedRangeData.name}</h3>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">{selectedRangeData.description}</p>
            </div>

            {/* Compact Jung Group Style Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {selectedProducts.map((product) => {
                const edits = getProductEdits(product.id);
                return (
                  <div key={product.id} className="group relative bg-white rounded-lg border border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all duration-200 overflow-hidden">
                    {/* Compact Image Preview */}
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      {edits && edits.elements && edits.elements.length > 0 ? (
                        <EditedProductPreview product={product} edits={edits} width={300} height={300} />
                      ) : (
                        <img
                          src={product.baseImageUrl || product.images?.[0] || FALLBACK_IMAGE}
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
                          className="p-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors"
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
                        <span className="text-xs text-emerald-600 font-medium">Add to Collection, then configure in Collection tab</span>
                        <button
                          onClick={() => addToPending(product)}
                          className="p-1.5 hover:bg-emerald-50 rounded text-emerald-600 transition-colors"
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
  const { addProductsToProject, getProductEdits } = useStore();
  const navigate = useNavigate();
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [productsToAdd, setProductsToAdd] = useState([]);

  const handleStartEditing = (item) => {
    const params = new URLSearchParams({ from: 'collection' });
    if (item._instanceId) params.set('instanceId', item._instanceId);
    navigate(`/editor/${item.id}?${params.toString()}`);
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
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-full mb-6 shadow-2xl animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-6 animate-pulse">
          Your Collection
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          Manage and customize your selected products. Edit, duplicate, or organize them into projects.
        </p>
      </div>

      {loading && !collection?.length ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading collection…</p>
        </div>
      ) : error && !collection?.length ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-200 max-w-xl mx-auto">
          <p className="text-red-700 font-medium mb-2">Failed to load collection</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button onClick={onRetry} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Retry
          </button>
        </div>
      ) : collection.length === 0 ? (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-3xl blur opacity-30"></div>
          <div className="relative text-center py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border-2 border-dashed border-indigo-200 shadow-2xl">
            <div className="text-9xl mb-8 animate-bounce">📦</div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-6">Your collection is empty</h3>
            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              No products added to collection yet. Start by selecting products from the Selection tab.
            </p>
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-white/50">
                <p className="text-indigo-600 font-semibold text-lg">💡 Tip: Click &quot;Add to Collection&quot; on products you like!</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Compact Icon-Based Bulk Actions Bar */}
          {selectedProducts.size > 0 && (
            <div className="mb-6 p-3 bg-white border-2 border-blue-200 rounded-xl shadow-sm flex items-center justify-between">
              <div className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedProducts.size} selected
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToProjects()}
                  className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
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
              return (
                <div key={`${item._instanceId || item.id}_${idx}`} className={`group relative ${isSelected ? 'ring-4 ring-blue-500' : ''}`}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                  <div className={`relative bg-white rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-3 hover:scale-105 border-2 ${isSelected ? 'border-blue-500' : 'border-gray-100'} overflow-hidden`}>

                    {/* Selection Checkbox */}
                    <div className="absolute top-4 left-4 z-20">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelection(item)}
                        className="w-6 h-6 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    <div className="absolute top-4 right-4 z-10">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M5 12h.01M12 12h.01M12 12h.01M19 12h.01M19 12h.01M5 19h.01M5 19h.01M12 19h.01M12 19h.01M19 19h.01M19 19h.01M5 5h.01M5 5h.01M12 5h.01M12 5h.01M19 5h.01M19 5h.01" />
                        </svg>
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl mb-6 -mx-2 -mt-2">
                      {item.edits && item.edits.elements && item.edits.elements.length > 0 ? (
                        <div className="w-full h-56 rounded-2xl shadow-lg overflow-hidden">
                          <EditedProductPreview product={item} edits={item.edits} width={500} height={224} />
                        </div>
                      ) : (
                        <img
                          src={item.baseImageUrl || item.images?.[0] || FALLBACK_IMAGE}
                          alt={item.imageAlt || `${item.name} - High Quality Product`}
                          className="w-full h-56 object-cover rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-700"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-4 left-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-1 shadow-lg">
                          <span className="text-sm font-bold text-indigo-600">#{idx + 1}</span>
                        </div>
                      </div>
                      {item.edits && item.edits.elements && item.edits.elements.length > 0 && (
                        <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1 z-10 shadow-lg">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Edited
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors duration-300">{item.name}</h4>
                        <p className="text-gray-600 text-base leading-relaxed">{item.description}</p>
                      </div>

                      {/* Compact Icon-Based Actions */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleStartEditing(item)}
                            className="p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors group relative"
                            title="Edit Product"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDuplicate(item)}
                            className="p-2.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition-colors group relative"
                            title="Duplicate Product"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => onDelete(item._instanceId || item.id)}
                            className="p-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors group relative"
                            title="Delete Product"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleAddToProjects(item)}
                            className="p-2.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors group relative"
                            title="Add to Project"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleAddProductToPdf(item)}
                            className="p-2.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors group relative"
                            title="Add to PDF"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </button>
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

const ProjectsContent = ({ loading, error, onRetry, setActiveTab }) => {
  const { projects, productEdits, addProductsToPdf, savePendingAsPdf, showToast, duplicateProject, deleteProject, fetchPdfConfigurations } = useStore();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [exportingProjectId, setExportingProjectId] = useState(null);
  const [duplicatingId, setDuplicatingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const projectsWithProducts = projects.filter((p) => p.products && p.products.length > 0);

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

  const handleExportProjectPdf = async (project) => {
    if (!project?.products || project.products.length === 0) {
      showToast('No products available to export.');
      return;
    }
    try {
      setExportingProjectId(project.id);
      await generateProjectPDF(project, { user });
      await apiService.pdf.create({
        projectId: project.id,
        projectName: project.name || 'Unnamed Project',
        productCount: project.products.length,
      });
      await fetchPdfConfigurations();
      showToast('PDF exported and added to Exported projects.');
    } catch (e) {
      showToast(e?.message || 'Failed to generate or save project PDF.');
    } finally {
      setExportingProjectId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-full mb-6 shadow-2xl animate-bounce">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 mb-6 animate-pulse">
          Your Projects
        </h2>
        <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
          View and manage your saved projects. Edit products, generate PDFs, and organize your work efficiently.
        </p>
      </div>

      {loading && !projectsWithProducts.length ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading projects…</p>
        </div>
      ) : error && !projectsWithProducts.length ? (
        <div className="text-center py-16 rounded-2xl bg-red-50 border border-red-200 max-w-xl mx-auto">
          <p className="text-red-700 font-medium mb-2">Failed to load projects</p>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <button onClick={onRetry} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">
            Retry
          </button>
        </div>
      ) : projectsWithProducts.length === 0 ? (
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-600 rounded-3xl blur opacity-30"></div>
          <div className="relative text-center py-24 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 rounded-3xl border-2 border-dashed border-indigo-200 shadow-2xl">
            <div className="text-9xl mb-8 animate-bounce">🚀</div>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl mb-6 shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-6">No projects yet</h3>
            <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Start building your projects by adding edited products from your collection.
            </p>
            <div className="flex justify-center">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 shadow-lg border border-white/50">
                <p className="text-indigo-600 font-semibold text-lg">💡 Tip: Edit products in your collection and add them to projects!</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {projectsWithProducts.map((project) => (
            <div key={project.id} className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-600 rounded-3xl blur opacity-20"></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
                {/* Project Header */}
                <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-600 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">{project.name}</h3>
                      <p className="text-violet-100 text-sm">{project.products.length} product{project.products.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleAddProjectToPdf(project)}
                        className="p-2.5 bg-white/90 hover:bg-white text-violet-700 rounded-lg transition-colors"
                        title="Add Project to PDF"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDuplicateProject(project)}
                        disabled={duplicatingId === project.id}
                        className="p-2.5 bg-amber-400/90 hover:bg-amber-400 text-violet-900 rounded-lg transition-colors disabled:opacity-60"
                        title="Duplicate Project"
                      >
                        {duplicatingId === project.id ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleExportProjectPdf(project)}
                        disabled={exportingProjectId === project.id}
                        className="p-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white rounded-lg transition-colors"
                        title="Export Project PDF"
                      >
                        {exportingProjectId === project.id ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-2.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors"
                        title="Delete Project"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Products Grid - WYSIWYG Display */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {project.products.map((product, idx) => {
                      const edits = product.edits || productEdits[product.id] || null;
                      const productWithEdits = edits ? { ...product, edits } : product;
                      return (
                        <div key={`${product._instanceId || product.id}_${idx}`} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-violet-300 transition-all group">
                          <div className="mb-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-violet-600 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-600">{product.description}</p>
                          </div>

                          {/* Visual Preview of Edited Product */}
                          <div className="mb-4 bg-white rounded-lg p-2 border border-gray-200">
                            <EditedProductPreview
                              product={product}
                              edits={edits}
                              width={280}
                              height={180}
                            />
                          </div>

                          {/* Action: Add to PDF only (configurator is only in Collection tab) */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200">
                            <button
                              onClick={() => handleAddProductToPdf(productWithEdits)}
                              className="p-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors"
                              title="Add to PDF"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </button>
                          </div>

                          {/* Edit Status Badge */}
                          {edits && (
                            <div className="mt-2 text-xs text-green-600 font-medium flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              Edited ({edits.elements?.length || 0} elements)
                            </div>
                          )}
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
    showToast,
    editsByInstanceId,
    productEdits,
  } = useStore();
  const [reExportingId, setReExportingId] = useState(null);

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
      const fullConfig = await apiService.pdf.getById(config._id);
      let rawProducts = fullConfig?.products ?? [];
      if (rawProducts.length === 0 && fullConfig?.projectId) {
        const projectRes = await apiService.projects.getById(fullConfig.projectId);
        rawProducts = (projectRes?.project?.products ?? projectRes?.products ?? []).map((item) => ({
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
      const normalizeUrl = (url) => (!url ? "" : url.startsWith("/") ? `${API_ORIGIN}${url}` : url);
      const products = rawProducts.map((item) => {
        const p = item.product || item;
        const instanceId = item.instanceId || p._instanceId;
        const instanceEdits = instanceId ? editsByInstanceId[instanceId] : null;
        const edits = instanceEdits
          ? { elements: instanceEdits.elements || [], configuration: instanceEdits.configuration || {} }
          : item.edits || productEdits[p?._id ?? p?.id] || p.edits || null;
        const editedImage = instanceEdits?.editedImage || null;
        return {
          id: p?._id ?? p?.id,
          _instanceId: instanceId,
          name: p?.name,
          baseImageUrl: normalizeUrl(p?.baseImageUrl || p?.image),
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

  const entries = Array.isArray(pendingPdfCollection) ? pendingPdfCollection.filter((e) => e && e.product) : [];
  const displayPDFs = Array.isArray(pdfConfigurations) ? pdfConfigurations : [];

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-2xl mb-4 shadow-xl">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Exported projects
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Projects you have exported to PDF. Re-export any time with the latest configuration.
        </p>
      </div>

      {/* Current PDF list (cart) – items added via "Add to PDF" from Projects */}
      {entries.length > 0 && (
        <div className="mb-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 rounded-3xl blur opacity-20" />
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Current PDF list</h3>
                  <p className="text-blue-100 text-sm mt-1">{entries.length} item{entries.length !== 1 ? 's' : ''} ready to export</p>
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
                    <td className="px-6 py-4 text-right">
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
    </div>
  );
};

export default TabbedRanges;
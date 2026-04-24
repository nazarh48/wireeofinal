import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { useAuthStore } from '../store/authStore';
import { generateProjectPDF } from '../utils/pdfGenerator';

const FALLBACK_IMAGE = '/test.png';

const Projects = () => {
  const navigate = useNavigate();
  const projects = useStore((state) => state.projects);
  const projectsLoading = useStore((state) => state.projectsLoading);
  const collection = useStore((state) => state.collection);
  const editsByInstanceId = useStore((state) => state.editsByInstanceId);
  // productEdits (product-level map) intentionally not used – all lookups are by instanceId.
  const fetchProjects = useStore((state) => state.fetchProjects);
  const deleteProject = useStore((state) => state.deleteProject);
  const removeProductFromProject = useStore((state) => state.removeProductFromProject);
  const addProductsToPdf = useStore((state) => state.addProductsToPdf);
  const savePendingAsPdf = useStore((state) => state.savePendingAsPdf);
  const showToast = useStore((state) => state.showToast);

  const [loadingPdf, setLoadingPdf] = useState(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const userProjects = useMemo(() => {
    const currentUserId = user?._id || user?.id || null;
    const currentUserEmail = user?.email?.toLowerCase?.() || null;

    return projects
      .filter((project) => {
        if (!user) return true;

        const ownerId = project?.createdBy?._id || project?.createdBy?.id || null;
        const ownerEmail = project?.createdBy?.email?.toLowerCase?.() || project?.ownerEmail?.toLowerCase?.() || null;

        if (currentUserId && ownerId) {
          return String(currentUserId) === String(ownerId);
        }

        if (currentUserEmail && ownerEmail) {
          return currentUserEmail === ownerEmail;
        }

        return true;
      })
      .map((project) => ({
        ...project,
        title: project.name,
        icon: '📋',
      }));
  }, [projects, user]);

  const handleEditProject = (projectId) => {
    if (!projectId) return;
    navigate(`/products/ranges?tab=projects&projectId=${encodeURIComponent(projectId)}`);
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(projectId);
    }
  };

  const handleEditProjectProduct = (product) => {
    if (!product?.id) return;

    const params = new URLSearchParams({ from: 'projects' });
    // Use canonical instanceId (no underscore); fall back to legacy _instanceId for old records.
    const instId = product.instanceId || product._instanceId;
    if (instId) params.set('instanceId', instId);

    navigate(`/editor/${product.id}?${params.toString()}`);
  };

  const handleRemoveProjectProduct = async (projectId, product) => {
    // Always remove by instanceId – never by product.id to avoid removing the wrong instance.
    const removeKey = product?.instanceId || product?._instanceId || product?.id || product?._id;
    if (!removeKey) return;

    const confirmed = window.confirm(
      `Remove "${product?.name || 'this product'}" from this project?`,
    );
    if (!confirmed) return;

    await removeProductFromProject(projectId, removeKey);
  };

  // Enhance products with edits + editedImage + correct image so PDF shows edited images.
  const getEnhancedProductForPdf = (product) => {
    const instanceId = product.instanceId || product._instanceId; // support legacy field
    const instanceEdits = instanceId ? editsByInstanceId[instanceId] : null;
    // Never fall back to productEdits[product.id] – that map is shared across all instances.
    const edits = (instanceEdits ? { elements: instanceEdits.elements || [], configuration: instanceEdits.configuration || {} } : null)
      || product.edits || null;
    const editedImage = instanceEdits?.editedImage ?? product.editedImage ?? null;
    const collectionItem = (collection || []).find((c) => (c.instanceId || c._instanceId) === instanceId);
    const baseImg = collectionItem?.configuratorImageUrl || collectionItem?.baseImageUrl;
    return {
      ...product,
      edits: edits || null,
      editedImage: editedImage || null,
      configuratorImageUrl: baseImg || product.configuratorImageUrl || product.baseImageUrl,
      baseImageUrl: baseImg ? (collectionItem?.baseImageUrl || baseImg) : (product.baseImageUrl || product.configuratorImageUrl),
    };
  };

  const handleDownloadPDF = async (project) => {
    try {
      setLoadingPdf(project.id);
      if (!project?.products || project.products.length === 0) {
        alert('No products available to export.');
        setLoadingPdf(null);
        return;
      }
      const enhancedProducts = project.products.map(getEnhancedProductForPdf);
      await generateProjectPDF({ ...project, products: enhancedProducts }, { user });
      setLoadingPdf(null);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      setLoadingPdf(null);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleAddProjectToPdf = (project) => {
    const added = addProductsToPdf(project?.products || []);
    if (added > 0) {
      showToast(
        `${added} product${added !== 1 ? 's' : ''} added to PDF.`,
        'Export Configuration Sheet',
        savePendingAsPdf,
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }} aria-hidden="true"></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent"></div>
        <div className="relative container mx-auto px-4 text-center z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Graphic Product Configurator</span>
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto mb-6 rounded-full" />
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-3">
            Define the visual identity of your Wireeo devices.
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto mb-4">
            Personalize engraving, interface layout, and background elements within controlled production parameters.
          </p>
          <p className="text-sm font-semibold tracking-wide text-teal-300 uppercase">
            Structured. Validated. Manufacturable.
          </p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-teal-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" aria-hidden="true" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-50 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" aria-hidden="true" />
        <div className="container mx-auto px-4 relative z-10">
          {projectsLoading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading configurations…</p>
            </div>
          ) : userProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Configurations Yet</h3>
              <p className="text-gray-600 mb-8">Define the visual identity of your Wireeo devices. Personalize engraving, layout, and backgrounds to create your first configuration.</p>
              <Link
                to="/products/ranges?tab=selection"
                className="inline-flex items-center bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Create New Configuration
                <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {userProjects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl overflow-hidden group transition-all duration-300 border border-gray-200 hover:border-teal-300"
                >
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={project.image || project.products?.[0]?.baseImageUrl || FALLBACK_IMAGE}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 left-4 text-4xl">{project.icon}</div>
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      Product Configuration
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                      {project.name || project.title}
                    </h3>

                    {project.configurationNumber && (
                      <div className="mb-2 text-xs font-mono bg-teal-50 text-teal-800 px-2 py-1 rounded inline-block border border-teal-200 shadow-sm">
                        {project.configurationNumber}
                      </div>
                    )}

                    <p className="text-gray-600 text-sm mb-4">
                      {project.description || 'Product personalization file · Configured Wireeo device'}
                    </p>

                    {project.products && project.products.length > 0 && (
                      <div className="mb-4 p-3 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                        <p className="text-xs font-semibold text-teal-700 mb-2">
                          Products ({project.products.length})
                        </p>
                        <ul className="space-y-1">
                          {project.products.slice(0, 3).map((product, idx) => (
                            <li
                              key={product.instanceId || product._instanceId || product.id || idx}
                              className="flex items-center justify-between gap-2 rounded-lg bg-white/70 px-2 py-1.5"
                            >
                              <div className="min-w-0 flex items-center text-xs text-gray-700">
                                <span className="inline-block w-1.5 h-1.5 bg-teal-600 rounded-full mr-2 flex-shrink-0"></span>
                                <span className="truncate">
                                  {product.name || product.baseProductName || 'Product'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleEditProjectProduct(product)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-teal-100 text-teal-700 transition-colors hover:bg-teal-200"
                                  title="Edit product"
                                  aria-label={`Edit ${product.name || product.baseProductName || 'product'}`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveProjectProduct(project.id, product)}
                                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-red-100 text-red-700 transition-colors hover:bg-red-200"
                                  title="Remove product from project"
                                  aria-label={`Remove ${product.name || product.baseProductName || 'product'} from project`}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </li>
                          ))}
                          {project.products.length > 3 && (
                            <li className="text-xs text-gray-600 italic">
                              +{project.products.length - 3} more
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleEditProject(project.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-teal-100 text-teal-700 hover:bg-teal-200 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 font-semibold py-2 px-3 rounded-lg transition-colors text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>

                    {project.products?.length > 0 && (
                      <div className="space-y-3">
                       
                        <button
                          onClick={() => handleDownloadPDF(project)}
                          disabled={loadingPdf === project.id}
                          className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          {loadingPdf === project.id ? (
                            <>
                              <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Generating...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Export Configuration Sheet
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {userProjects.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" aria-hidden="true" />
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Create Another <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Configuration?</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-teal-500 to-cyan-500 mx-auto mb-6 rounded-full" />
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Personalize additional Wireeo devices and generate structured configuration sheets for your project.
            </p>
            <Link
              to="/products/ranges?tab=selection"
              className="inline-flex items-center bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Create New Configuration
              <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </Link>
          </div>
        </section>
      )}

    </div>
  );
};

export default Projects;

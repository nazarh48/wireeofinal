import { useMemo, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../../hooks/useCatalog';
import { useAuthStore } from '../../store/authStore';
import { getImageUrl } from '../../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isProFlow = searchParams.get('pro') === 'true';
  const { getNormalProductById, getConfigurableProductById, getRangeById, loadPublicCatalog, loading, loaded } = useCatalog();
  const isUserLoggedIn = useAuthStore((s) => s.isUserAuthenticated());

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const product = useMemo(
    () => (isProFlow ? getConfigurableProductById(id) : getNormalProductById(id)),
    [id, isProFlow, getConfigurableProductById, getNormalProductById]
  );
  const range = useMemo(
    () => (product ? getRangeById(product.rangeId) : null),
    [product, getRangeById]
  );

  if (loading && !loaded) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading product details...</p>
      </div>
    </div>
  );

  if (loaded && !product) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Not Found</h1>
        <p className="text-gray-600 mb-8">The product you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/products"
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          Back to Products
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-16">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link to="/" className="text-green-600 hover:text-green-700 font-medium">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="text-green-600 hover:text-green-700 font-medium">Products</Link>
          {isProFlow && (
            <>
              <span className="mx-2 text-gray-400">/</span>
              <Link to="/products/ranges" className="text-green-600 hover:text-green-700 font-medium">Pro</Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link to={`/products/range/${product.rangeId}`} className="text-green-600 hover:text-green-700 font-medium">{range?.name}</Link>
            </>
          )}
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="animate-fade-in-left">
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <img
                src={product.baseImageUrl}
                alt={product.name}
                className="w-full h-96 object-cover rounded-xl"
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="animate-fade-in-right">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {range?.name || 'Product'}
                </span>
                {isProFlow && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Pro Configurable
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-xl text-gray-600 leading-relaxed mb-6">{product.description}</p>
            </div>

            {/* Key Benefits */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Key Benefits</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 leading-relaxed">High-quality electrical component</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 leading-relaxed">Durable and reliable performance</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 leading-relaxed">Easy installation and maintenance</span>
                </div>
              </div>
            </div>

            {/* Technical Highlights */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Technical Highlights</h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 leading-relaxed">Professional grade materials</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700 leading-relaxed">Industry standard specifications</span>
                </div>
              </div>
            </div>

            {/* Downloadable files */}
            {product?.downloadableFiles?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Downloads</h3>
                <div className="flex flex-wrap gap-3">
                  {product.downloadableFiles.map((file, idx) => (
                    <a
                      key={idx}
                      href={getImageUrl(file?.url || file)}
                      download={file?.originalName || file?.filename}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {file?.label || file?.originalName || `Download ${idx + 1}`}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Manage Pro Products button - Only for configurable products */}
              {product?.configurable && (
                <Link
                  to="/products/ranges"
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center text-center"
                >
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Manage Pro Products
                </Link>
              )}
              <Link
                to="/contact"
                className="flex-1 bg-white border-2 border-gray-300 hover:border-green-500 text-gray-700 hover:text-green-600 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center text-center"
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact for Inquiry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
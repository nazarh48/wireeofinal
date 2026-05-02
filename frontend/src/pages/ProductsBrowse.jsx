import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";
import { buildResponsiveImageProps } from "../utils/imageVariants";
import { getPublicProductPath } from "../utils/catalogPaths";

const ProductsBrowse = () => {
  const {
    ranges,
    standardProducts,
    getStandardProductsByRange,
    loadPublicCatalog,
    loading,
    loaded,
    error,
  } = useCatalog();
  const [rangeFilter, setRangeFilter] = useState("");

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  const filtered = useMemo(() => {
    if (!rangeFilter) return standardProducts;
    return getStandardProductsByRange(rangeFilter);
  }, [getStandardProductsByRange, rangeFilter, standardProducts]);

  if (loading && !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && !loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-lg rounded-xl border border-gray-200 bg-white p-6 text-center shadow">
          <p className="mb-2 font-semibold text-gray-700">Failed to load products</p>
          <p className="mb-4 text-gray-500">{error}</p>
          <button
            type="button"
            onClick={() => loadPublicCatalog()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            to="/products"
            className="mb-4 inline-block font-medium text-blue-600 hover:text-blue-800"
          >
            Back to Products Menu
          </Link>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Standard Products</h1>
          <p className="mb-4 text-xl text-gray-600">
            Browse our complete catalog of standard products.
          </p>
          {ranges.length > 0 && (
            <div className="flex items-center gap-2">
              <label htmlFor="range-filter" className="text-sm font-medium text-gray-700">
                Filter by range:
              </label>
              <select
                id="range-filter"
                value={rangeFilter}
                onChange={(event) => setRangeFilter(event.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All ranges</option>
                {ranges.map((range) => (
                  <option key={range.id} value={range.id}>
                    {range.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center shadow">
            <p className="text-lg text-gray-500">No standard products found.</p>
            <Link
              to="/products"
              className="mt-4 inline-block font-medium text-blue-600 hover:text-blue-800"
            >
              Back to Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => {
              const { src, srcSet, sizes, loading: imageLoading, decoding } =
                buildResponsiveImageProps(product.baseImagePath || product.baseImageUrl || "");

              return (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-lg bg-white shadow-md transition-shadow hover:shadow-lg"
                >
                  <img
                    src={src}
                    srcSet={srcSet}
                    sizes={sizes}
                    loading={imageLoading}
                    decoding={decoding}
                    alt={product.name}
                    className="h-48 w-full object-cover"
                  />
                  <div className="p-6">
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="mb-4 text-gray-600">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">ID: {product.id}</span>
                      <Link
                        to={getPublicProductPath(product)}
                        className="inline-flex items-center rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsBrowse;

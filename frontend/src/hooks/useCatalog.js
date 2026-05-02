import { useMemo } from "react";
import { useCatalogStore } from "../store/catalogStore";

/**
 * User-facing catalog: only active ranges and products.
 * Standard/configurable split for strict separation in UI.
 */
export function useCatalog() {
  const ranges = useCatalogStore((s) => s.publicRanges) ?? [];
  const products = useCatalogStore((s) => s.publicProducts) ?? [];
  const publicLoading = useCatalogStore((s) => s.publicLoading);
  const publicLoaded = useCatalogStore((s) => s.publicLoaded);
  const publicError = useCatalogStore((s) => s.publicError);
  const loadPublicCatalog = useCatalogStore((s) => s.loadPublicCatalog);

  const standardProducts = useMemo(
    () => (Array.isArray(products) ? products : []).filter((p) => p.productType === "standard"),
    [products]
  );

  const configurableProducts = useMemo(
    () => (Array.isArray(products) ? products : []).filter((p) => p.configurable),
    [products]
  );

  const getRangeById = useCatalogStore((s) => s.getPublicRangeById);
  const getRangeBySlug = useCatalogStore((s) => s.getPublicRangeBySlug);
  const getRangeByIdentifier = useCatalogStore((s) => s.getPublicRangeByIdentifier);
  const fetchRangeByIdentifier = useCatalogStore((s) => s.fetchRangeByIdentifier);
  const getStandardProductById = useCatalogStore((s) => s.getStandardProductById);
  const getConfigurableProductById = useCatalogStore((s) => s.getConfigurableProductById);
  const getProductByIdentifier = useCatalogStore((s) => s.getProductByIdentifier);
  const fetchProductByIdentifier = useCatalogStore((s) => s.fetchProductByIdentifier);
  const getStandardProductsByRange = useCatalogStore((s) => s.getStandardProductsByRange);
  const getConfigurableProductsByRange = useCatalogStore((s) => s.getConfigurableProductsByRange);
  const getProductsByRangeIdentifier = useCatalogStore((s) => s.getProductsByRangeIdentifier);
  const getFeaturedProducts = useCatalogStore((s) => s.getFeaturedProducts);
  const getNonFeaturedProducts = useCatalogStore((s) => s.getNonFeaturedProducts);

  const featuredProducts = useMemo(() => getFeaturedProducts(), [products]);
  const nonFeaturedProducts = useMemo(() => getNonFeaturedProducts(), [products]);

  return {
    ranges,
    products,
    standardProducts,
    configurableProducts,
    featuredProducts,
    nonFeaturedProducts,
    getRangeById,
    getRangeBySlug,
    getRangeByIdentifier,
    fetchRangeByIdentifier,
    getStandardProductById,
    getConfigurableProductById,
    getProductByIdentifier,
    fetchProductByIdentifier,
    getStandardProductsByRange,
    getConfigurableProductsByRange,
    getProductsByRangeIdentifier,
    getFeaturedProducts,
    getNonFeaturedProducts,
    // Legacy aliases kept so existing consumers keep working during the rename.
    normalProducts: standardProducts,
    getNormalProductById: getStandardProductById,
    getNormalProductsByRange: getStandardProductsByRange,
    loading: publicLoading,
    loaded: publicLoaded,
    error: publicError,
    loadPublicCatalog,
  };
}

export default useCatalog;

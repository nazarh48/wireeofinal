import { useMemo } from "react";
import { useCatalogStore } from "../store/catalogStore";

/**
 * User-facing catalog: only active ranges and products.
 * Normal/configurable split for strict separation in UI.
 */
export function useCatalog() {
  const ranges = useCatalogStore((s) => s.publicRanges) ?? [];
  const products = useCatalogStore((s) => s.publicProducts) ?? [];
  const publicLoading = useCatalogStore((s) => s.publicLoading);
  const publicLoaded = useCatalogStore((s) => s.publicLoaded);
  const publicError = useCatalogStore((s) => s.publicError);
  const loadPublicCatalog = useCatalogStore((s) => s.loadPublicCatalog);

  const normalProducts = useMemo(
    () => (Array.isArray(products) ? products : []).filter((p) => !p.configurable),
    [products]
  );

  const configurableProducts = useMemo(
    () => (Array.isArray(products) ? products : []).filter((p) => p.configurable),
    [products]
  );

  const getRangeById = useCatalogStore((s) => s.getPublicRangeById);
  const getRangeBySlug = useCatalogStore((s) => s.getPublicRangeBySlug);
  const getRangeByIdentifier = useCatalogStore((s) => s.getPublicRangeByIdentifier);
  const getNormalProductById = useCatalogStore((s) => s.getNormalProductById);
  const getConfigurableProductById = useCatalogStore((s) => s.getConfigurableProductById);
  const getProductByIdentifier = useCatalogStore((s) => s.getProductByIdentifier);
  const getNormalProductsByRange = useCatalogStore((s) => s.getNormalProductsByRange);
  const getConfigurableProductsByRange = useCatalogStore((s) => s.getConfigurableProductsByRange);
  const getProductsByRangeIdentifier = useCatalogStore((s) => s.getProductsByRangeIdentifier);
  const getFeaturedProducts = useCatalogStore((s) => s.getFeaturedProducts);
  const getNonFeaturedProducts = useCatalogStore((s) => s.getNonFeaturedProducts);

  const featuredProducts = useMemo(() => getFeaturedProducts(), [products]);
  const nonFeaturedProducts = useMemo(() => getNonFeaturedProducts(), [products]);

  return {
    ranges,
    normalProducts,
    configurableProducts,
    featuredProducts,
    nonFeaturedProducts,
    getRangeById,
    getRangeBySlug,
    getRangeByIdentifier,
    getNormalProductById,
    getConfigurableProductById,
    getProductByIdentifier,
    getNormalProductsByRange,
    getConfigurableProductsByRange,
    getProductsByRangeIdentifier,
    getFeaturedProducts,
    getNonFeaturedProducts,
    loading: publicLoading,
    loaded: publicLoaded,
    error: publicError,
    loadPublicCatalog,
  };
}

export default useCatalog;

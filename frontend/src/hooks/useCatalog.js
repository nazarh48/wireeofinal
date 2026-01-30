import { useMemo } from "react";
import { useCatalogStore } from "../store/catalogStore";

/**
 * User-facing catalog: only active ranges and products.
 * Normal/configurable split for strict separation in UI.
 */
export function useCatalog() {
  const ranges = useCatalogStore((s) => s.publicRanges);
  const products = useCatalogStore((s) => s.publicProducts);
  const publicLoading = useCatalogStore((s) => s.publicLoading);
  const publicLoaded = useCatalogStore((s) => s.publicLoaded);
  const publicError = useCatalogStore((s) => s.publicError);
  const loadPublicCatalog = useCatalogStore((s) => s.loadPublicCatalog);

  const normalProducts = useMemo(
    () => products.filter((p) => !p.configurable),
    [products]
  );

  const configurableProducts = useMemo(
    () => products.filter((p) => p.configurable),
    [products]
  );

  const getRangeById = useCatalogStore((s) => s.getPublicRangeById);
  const getNormalProductById = useCatalogStore((s) => s.getNormalProductById);
  const getConfigurableProductById = useCatalogStore((s) => s.getConfigurableProductById);
  const getNormalProductsByRange = useCatalogStore((s) => s.getNormalProductsByRange);
  const getConfigurableProductsByRange = useCatalogStore((s) => s.getConfigurableProductsByRange);

  return {
    ranges,
    normalProducts,
    configurableProducts,
    getRangeById,
    getNormalProductById,
    getConfigurableProductById,
    getNormalProductsByRange,
    getConfigurableProductsByRange,
    loading: publicLoading,
    loaded: publicLoaded,
    error: publicError,
    loadPublicCatalog,
  };
}

export default useCatalog;

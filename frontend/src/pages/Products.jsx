import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";
import { buildResponsiveImageProps } from "../utils/imageVariants";
import {
  getConfiguratorHubPath,
  getPublicProductPath,
} from "../utils/catalogPaths";

const PRODUCT_TYPE_OPTIONS = [
  { value: "all", label: "All Products" },
  { value: "standard", label: "Standard Products" },
  { value: "configurable", label: "Configurable Products" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "az", label: "A-Z" },
  { value: "za", label: "Z-A" },
  { value: "standard-first", label: "Standard First" },
  { value: "configurable-first", label: "Configurable First" },
];

const PRODUCT_TYPE_META = {
  standard: {
    label: "Standard",
    badgeClass:
      "bg-gradient-to-r from-slate-700 to-slate-900 text-white shadow-lg",
  },
  configurable: {
    label: "Configurable",
    badgeClass:
      "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg",
  },
};

function getProductTypeMeta(productType) {
  return PRODUCT_TYPE_META[productType] || PRODUCT_TYPE_META.standard;
}

function getTimestamp(value) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function getCatalogSortOrder(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function compareTypePriority(a, b, weights) {
  const weightA = weights[a?.productType] ?? 99;
  const weightB = weights[b?.productType] ?? 99;
  if (weightA !== weightB) return weightA - weightB;
  return 0;
}

const Products = () => {
  const [selectedRangeId, setSelectedRangeId] = useState(null);
  const [productTypeFilter, setProductTypeFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const initialRangeAppliedRef = useRef(false);
  const {
    loadPublicCatalog,
    loading: catalogLoading,
    loaded: catalogLoaded,
    error: catalogError,
    ranges: publicRanges = [],
    products: publicProducts = [],
  } = useCatalog();

  useEffect(() => {
    if (!catalogLoaded && !catalogLoading) loadPublicCatalog();
  }, [catalogLoaded, catalogLoading, loadPublicCatalog]);

  useEffect(() => {
    if (publicRanges.length === 0) {
      initialRangeAppliedRef.current = false;
      setSelectedRangeId(null);
      return;
    }

    if (!initialRangeAppliedRef.current) {
      setSelectedRangeId(publicRanges[0].id);
      initialRangeAppliedRef.current = true;
      return;
    }

    if (selectedRangeId && !publicRanges.some((range) => range.id === selectedRangeId)) {
      setSelectedRangeId(null);
    }
  }, [publicRanges, selectedRangeId]);

  const activeRangeId =
    selectedRangeId && publicRanges.some((range) => range.id === selectedRangeId)
      ? selectedRangeId
      : null;

  const selectedRange = useMemo(
    () =>
      activeRangeId && Array.isArray(publicRanges)
        ? publicRanges.find((range) => range.id === activeRangeId) || null
        : null,
    [activeRangeId, publicRanges],
  );

  const clearRangeSelection = () => {
    setSelectedRangeId(null);
  };

  const toggleRangeSelection = (rangeId) => {
    setSelectedRangeId((current) => (current === rangeId ? null : rangeId));
  };

  const rangeCounts = useMemo(() => {
    const counts = {};
    (publicProducts || []).forEach((product) => {
      if (!product?.rangeId) return;
      counts[product.rangeId] = (counts[product.rangeId] || 0) + 1;
    });
    return counts;
  }, [publicProducts]);

  const scopedProducts = useMemo(() => {
    if (!activeRangeId) return [];
    return (publicProducts || []).filter((product) => product.rangeId === activeRangeId);
  }, [activeRangeId, publicProducts]);

  const displayedProducts = useMemo(() => {
    if (activeRangeId) return scopedProducts;
    return publicProducts || [];
  }, [activeRangeId, publicProducts, scopedProducts]);

  const selectedRangeTypeCounts = useMemo(
    () => ({
      all: displayedProducts.length,
      standard: displayedProducts.filter((product) => product.productType === "standard").length,
      configurable: displayedProducts.filter((product) => product.productType === "configurable").length,
    }),
    [displayedProducts],
  );

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return displayedProducts.filter((product) => {
      if (productTypeFilter !== "all" && product.productType !== productTypeFilter) {
        return false;
      }

      if (!query) return true;

      const haystack = `${product.name || ""} ${product.description || ""}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [displayedProducts, productTypeFilter, searchQuery]);

  const visibleProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const sortOrderA = getCatalogSortOrder(a?.sortOrder);
      const sortOrderB = getCatalogSortOrder(b?.sortOrder);

      if (sortOrderA !== null && sortOrderB !== null && sortOrderA !== sortOrderB) {
        return sortOrderA - sortOrderB;
      }
      if (sortOrderA !== null && sortOrderB === null) return -1;
      if (sortOrderA === null && sortOrderB !== null) return 1;

      switch (sortOption) {
        case "oldest": {
          const byOldest = getTimestamp(a?.createdAt) - getTimestamp(b?.createdAt);
          if (byOldest !== 0) return byOldest;
          break;
        }
        case "az": {
          const byName = String(a?.name || "").localeCompare(String(b?.name || ""));
          if (byName !== 0) return byName;
          break;
        }
        case "za": {
          const byName = String(b?.name || "").localeCompare(String(a?.name || ""));
          if (byName !== 0) return byName;
          break;
        }
        case "standard-first": {
          const byType = compareTypePriority(a, b, {
            standard: 0,
            configurable: 1,
          });
          if (byType !== 0) return byType;
          break;
        }
        case "configurable-first": {
          const byType = compareTypePriority(a, b, {
            configurable: 0,
            standard: 1,
          });
          if (byType !== 0) return byType;
          break;
        }
        default: {
          const byNewest = getTimestamp(b?.createdAt) - getTimestamp(a?.createdAt);
          if (byNewest !== 0) return byNewest;
          break;
        }
      }

      return String(a?.name || "").localeCompare(String(b?.name || ""));
    });
  }, [filteredProducts, sortOption]);

  const clearFilters = () => {
    setProductTypeFilter("all");
    setSortOption("newest");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 py-24 text-white md:py-32">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-30" />
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="relative container mx-auto px-6 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur-md">
              <svg className="h-4 w-4 text-emerald-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>Premium Products</span>
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-tight tracking-tight md:text-6xl lg:text-6xl">
              Premium
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                {" "}
                KNX Devices Structured by Engineering
              </span>{" "}
              Defined by Design.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
              Wireeo products are engineered as part of a unified ecosystem -
              ensuring consistency across projects and generations.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to={getConfiguratorHubPath({ tab: "selection" })}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-7 py-3.5 font-semibold text-white shadow-lg transition-all hover:bg-emerald-700"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Graphic Configurator
              </Link>
              <Link
                to="/products/browse"
                className="inline-flex items-center justify-center rounded-md bg-white px-7 py-3.5 font-semibold text-slate-900 shadow-lg transition-all hover:bg-slate-100"
              >
                Browse Catalog
              </Link>
              <Link
                to="/solutions"
                className="inline-flex items-center justify-center rounded-md border-2 border-white/80 px-7 py-3.5 font-semibold text-white transition-all hover:bg-white hover:text-slate-900"
              >
                Custom Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mb-8 flex flex-col gap-4 md:mb-10 lg:flex-row lg:items-end lg:justify-between">
            
            
          </div>

          {catalogLoading && !catalogLoaded ? (
            <div className="rounded-[8px] border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
              <p className="mt-4 text-slate-500">Loading the catalog...</p>
            </div>
          ) : catalogError && !catalogLoaded ? (
            <div className="rounded-[8px] border border-red-200 bg-white px-6 py-16 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Unable to load products</h3>
              <p className="mt-3 text-slate-500">{catalogError}</p>
              <button
                type="button"
                onClick={() => loadPublicCatalog()}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-emerald-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Retry
              </button>
            </div>
          ) : publicRanges.length === 0 ? (
            <div className="rounded-[8px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">No product ranges available yet</h3>
              <p className="mt-3 text-slate-500">
                Publish at least one range and product from the admin panel to populate
                this catalog.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 lg:hidden">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-500">
                    Product Ranges
                  </h3>
                  <span className="text-sm font-semibold text-emerald-700">
                    {selectedRange?.name || "All Products"}
                  </span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  <button
                    type="button"
                    onClick={clearRangeSelection}
                    className={`min-w-[220px] rounded-md border px-4 py-4 text-left shadow-sm transition-all ${
                      !activeRangeId
                        ? "border-emerald-300 bg-white ring-2 ring-emerald-100"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`font-semibold ${!activeRangeId ? "text-emerald-700" : "text-slate-900"}`}>
                        All Products
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {publicProducts.length} products
                      </p>
                    </div>
                  </button>
                  {publicRanges.map((range) => {
                    const isActive = activeRangeId === range.id;
                    return (
                      <button
                        key={range.id}
                        type="button"
                        onClick={() => toggleRangeSelection(range.id)}
                        className={`min-w-[220px] rounded-md border px-4 py-4 text-left shadow-sm transition-all ${
                          isActive
                            ? "border-emerald-300 bg-white ring-2 ring-emerald-100"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className={`font-semibold ${isActive ? "text-emerald-700" : "text-slate-900"}`}>
                            {range.name}
                          </p>
                          <p className="mt-1 text-sm text-slate-500">
                            {rangeCounts[range.id] || 0} products
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[320px,minmax(0,1fr)] xl:gap-10">
                <aside className="hidden lg:block">
                  <div className="sticky top-24 overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
                    <div className="border-b border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 px-6 py-6 text-white">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200">
                        Product Ranges
                      </p>
                      <h3 className="mt-3 text-2xl font-bold">Choose a collection</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-200">
                        Switch ranges to reveal the related catalog on the right.
                      </p>
                    </div>

                    <div className="space-y-3 p-4">
                      <button
                        type="button"
                        onClick={clearRangeSelection}
                        className={`w-full rounded-[8px] border p-4 text-left transition-all ${
                          !activeRangeId
                            ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm ring-2 ring-emerald-100"
                            : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <span
                              className={`font-semibold ${
                                !activeRangeId ? "text-emerald-700" : "text-slate-900"
                              }`}
                            >
                              All Products
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                !activeRangeId
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {publicProducts.length}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                            Browse the full catalog without a range filter.
                          </p>
                        </div>
                      </button>

                      {publicRanges.map((range) => {
                        const isActive = activeRangeId === range.id;
                        return (
                          <button
                            key={range.id}
                            type="button"
                            onClick={() => toggleRangeSelection(range.id)}
                            className={`w-full rounded-[8px] border p-4 text-left transition-all ${
                              isActive
                                ? "border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-sm ring-2 ring-emerald-100"
                                : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-slate-50"
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-3">
                                <span
                                  className={`font-semibold ${
                                    isActive ? "text-emerald-700" : "text-slate-900"
                                  }`}
                                >
                                  {range.name}
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    isActive
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {rangeCounts[range.id] || 0}
                                </span>
                              </div>
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                                {range.description || "Browse products in this range."}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </aside>

                <div className="min-w-0">
                  <div className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)]">
                    <div className="relative border-b border-slate-200 px-6 py-6 md:px-8">
                      {selectedRange?.image ? (
                        <>
                          <div
                            className="absolute inset-0 bg-cover bg-center"
                            style={{ backgroundImage: `url(${selectedRange.image})` }}
                          />
                          <div className="absolute inset-0 bg-white/80" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/60" />
                      )}
                      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                        <div className="max-w-3xl">
                          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600">
                            {selectedRange?.name || "All Products"}
                          </p>
                          <h3 className="mt-3 text-3xl font-extrabold text-slate-900 md:text-4xl">
                            {selectedRange?.name || "Catalog"}
                          </h3>
                          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                            {selectedRange?.description ||
                              "Explore the full catalog, or select a range to narrow the result set."}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                              Total
                            </div>
                            <div className="mt-1 text-xl font-extrabold text-slate-900">
                              {selectedRangeTypeCounts.all}
                            </div>
                          </div>
                          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                              Standard
                            </div>
                            <div className="mt-1 text-xl font-extrabold text-slate-900">
                              {selectedRangeTypeCounts.standard}
                            </div>
                          </div>
                          <div className="rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                              Configurable
                            </div>
                            <div className="mt-1 text-xl font-extrabold text-slate-900">
                              {selectedRangeTypeCounts.configurable}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-b border-slate-200 px-6 py-6 md:px-8">
                      <div className="grid gap-4 xl:grid-cols-[220px,220px,minmax(0,1fr)]">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-700">
                            Product Type
                          </span>
                          <select
                            value={productTypeFilter}
                            onChange={(event) => setProductTypeFilter(event.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {PRODUCT_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-700">
                            Sort
                          </span>
                          <select
                            value={sortOption}
                            onChange={(event) => setSortOption(event.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          >
                            {SORT_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-700">
                            Search
                          </span>
                          <div className="relative">
                            <svg
                              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.5 5.5a7.5 7.5 0 0011.15 11.15z"
                              />
                            </svg>
                            <input
                              type="search"
                              value={searchQuery}
                              onChange={(event) => setSearchQuery(event.target.value)}
                              placeholder="Search by product name or description"
                              className="w-full rounded-md border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm text-slate-900 transition-shadow focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </label>
                      </div>
                    </div>

                    <div className="px-6 py-6 md:px-8">
                      {visibleProducts.length === 0 ? (
                        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9.172 9.172a4 4 0 115.656 5.656M15 15l6 6m-6-6A8.966 8.966 0 0112 16c-4.971 0-9-4.029-9-9s4.029-9 9-9 9 4.029 9 9c0 1.071-.187 2.098-.53 3.05"
                              />
                            </svg>
                          </div>
                          <h4 className="mt-6 text-xl font-bold text-slate-900">
                            {activeRangeId ? "No products found in this range." : "No products found."}
                          </h4>
                          <p className="mx-auto mt-3 max-w-lg text-slate-500">
                            {activeRangeId
                              ? `Try a different product type, remove the search term, or reset the filters to see everything available in ${selectedRange?.name ? ` ${selectedRange.name}` : " this range"}.`
                              : "Try a different product type, remove the search term, or reset the filters to see all products."}
                          </p>
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="mt-6 inline-flex items-center justify-center rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 font-semibold text-white shadow-md transition-all hover:from-emerald-700 hover:to-teal-700"
                          >
                            Clear Filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
                          {visibleProducts.map((product) => {
                            const {
                              src,
                              srcSet,
                              sizes,
                              loading,
                              decoding,
                            } = buildResponsiveImageProps(
                              product.baseImagePath || product.baseImageUrl || "",
                            );
                            const detailUrl = getPublicProductPath(product);
                            const typeMeta = getProductTypeMeta(product.productType);

                            return (
                              <article
                                key={product.id}
                                className="group overflow-hidden rounded-md border border-gray-100 bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                              >
                                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100">
                                  {src ? (
                                    <img
                                      src={src}
                                      srcSet={srcSet}
                                      sizes={sizes}
                                      loading={loading}
                                      decoding={decoding}
                                      alt={product.name}
                                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-teal-100">
                                      <span className="text-4xl font-bold text-emerald-700/80">
                                        {product.name?.charAt(0) || "P"}
                                      </span>
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                  <div className="absolute left-4 top-4">
                                    <span
                                      className={`rounded-lg px-3 py-1.5 text-xs font-bold ${typeMeta.badgeClass}`}
                                    >
                                      {typeMeta.label}
                                    </span>
                                  </div>
                                </div>

                                <div className="p-6">
                                  <p className="mb-2 text-sm font-bold uppercase tracking-wider text-emerald-600">
                                    {product.range?.name || selectedRange?.name || "Product"}
                                  </p>
                                  <h4 className="mb-3 line-clamp-2 text-xl font-extrabold text-slate-900 transition-all group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-teal-600 group-hover:bg-clip-text group-hover:text-transparent">
                                    {product.name}
                                  </h4>
                                  <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-slate-600">
                                    {product.description ||
                                      "Open this product to explore specifications, visuals, and downloadable resources."}
                                  </p>
                                  <Link
                                    to={detailUrl}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 font-bold text-white shadow-md transition-all hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg"
                                  >
                                    View Product
                                    <svg
                                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                                      />
                                    </svg>
                                  </Link>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white md:py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Need Custom Solutions?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-slate-300">
            Our engineering team can design and manufacture custom electrical
            automation solutions tailored to your specific requirements.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to={getConfiguratorHubPath({ tab: "selection" })}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-6 py-3.5 font-semibold text-white transition-all hover:bg-emerald-700"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Go to Graphic Configurator
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3.5 font-semibold text-slate-900 transition-all hover:bg-slate-100"
            >
              Contact us
            </Link>
            <Link
              to="/resources"
              className="inline-flex items-center justify-center rounded-md border-2 border-white/80 px-6 py-3.5 font-semibold text-white transition-all hover:bg-white hover:text-slate-900"
            >
              Download Catalog
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;

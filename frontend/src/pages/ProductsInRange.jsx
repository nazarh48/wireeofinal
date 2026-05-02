import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";
import { buildResponsiveImageProps } from "../utils/imageVariants";
import {
  getConfiguratorHubPath,
  getPublicProductPath,
  getPublicRangesPath,
} from "../utils/catalogPaths";

const FILTERS = [
  { id: "all", label: "All Products" },
  { id: "standard", label: "Standard" },
  { id: "configurable", label: "Configurable" },
];

const ProductsInRange = () => {
  const { rangeSlug, rangeId } = useParams();
  const navigate = useNavigate();
  const identifier = rangeSlug || rangeId || "";
  const {
    getRangeByIdentifier,
    fetchRangeByIdentifier,
    getProductsByRangeIdentifier,
    loadPublicCatalog,
    loading,
    loaded,
    error,
  } = useCatalog();
  const [filter, setFilter] = useState("all");
  const [directRange, setDirectRange] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState("");
  const [directAttempted, setDirectAttempted] = useState(false);

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loaded, loading, loadPublicCatalog]);

  const catalogRange = getRangeByIdentifier(identifier);
  const range = catalogRange || directRange;

  useEffect(() => {
    if (range?.id && rangeId !== range.id) {
      navigate(`/products/range/${encodeURIComponent(range.id)}`, {
        replace: true,
      });
    }
  }, [navigate, range?.id, rangeId]);

  useEffect(() => {
    let cancelled = false;

    setDirectRange(null);
    setDirectError("");
    setDirectAttempted(false);

    if (!identifier || catalogRange || (!loaded && !error)) {
      setDirectLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setDirectLoading(true);
    fetchRangeByIdentifier(identifier)
      .then((nextRange) => {
        if (!cancelled) setDirectRange(nextRange || null);
      })
      .catch((err) => {
        if (!cancelled) {
          setDirectError(err?.message || "Failed to load product range");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDirectLoading(false);
          setDirectAttempted(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    catalogRange,
    error,
    fetchRangeByIdentifier,
    identifier,
    loaded,
  ]);

  const allProducts = useMemo(
    () => (range?.id ? getProductsByRangeIdentifier(range.id) : []),
    [getProductsByRangeIdentifier, range?.id],
  );

  const counts = useMemo(
    () => ({
      all: allProducts.length,
      standard: allProducts.filter((product) => product.productType === "standard").length,
      configurable: allProducts.filter((product) => product.configurable).length,
    }),
    [allProducts],
  );

  const filteredProducts = useMemo(() => {
    switch (filter) {
      case "standard":
        return allProducts.filter((product) => product.productType === "standard");
      case "configurable":
        return allProducts.filter((product) => product.configurable);
      default:
        return allProducts;
    }
  }, [allProducts, filter]);

  const waitingForCatalog = !range && !loaded && !error;
  const waitingForDirectLookup =
    !range &&
    !!identifier &&
    !catalogRange &&
    (loaded || !!error) &&
    (!directAttempted || directLoading);

  if (waitingForCatalog || waitingForDirectLookup) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          <p className="mt-4 text-slate-500">Loading products in this range...</p>
        </div>
      </div>
    );
  }

  if (!range && directError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Unable to load range</h1>
          <p className="mt-4 text-slate-500">{directError}</p>
          <button
            type="button"
            onClick={() => {
              setDirectAttempted(false);
              setDirectError("");
              loadPublicCatalog();
            }}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!range) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Range not found</h1>
          <p className="mt-4 text-slate-500">
            The requested product range is unavailable or the link is no longer valid.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to={getPublicRangesPath()}
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Back to Product Ranges
            </Link>
            <Link
              to={getConfiguratorHubPath({ tab: "selection" })}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open Graphic Configurator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const heroImage = range.imagePath || range.image || "";

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 text-white">
        {heroImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${range.image})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.18),_transparent_35%)]" />
        <div className="relative container mx-auto px-6 py-24 md:py-28">
          <Link
            to={getPublicRangesPath()}
            className="inline-flex items-center text-sm font-semibold text-teal-200 transition-colors hover:text-white"
          >
            Back to all ranges
          </Link>
          <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 backdrop-blur">
                {counts.all} products in this range
              </span>
              <h1 className="mt-5 text-4xl font-extrabold md:text-5xl">{range.name}</h1>
              <p className="mt-5 text-lg text-slate-200">
                {range.description || "Browse the products available in this Wireeo range."}
              </p>
            </div>
            <Link
              to={getConfiguratorHubPath({ tab: "selection", rangeId: range.id })}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
            >
              Configure Products From This Range
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-14 md:py-16">
        <div className="container mx-auto px-6">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Browse Products
              </h2>
              <p className="mt-2 text-slate-600">
                Switch between all products, standard products, and configurable products.
              </p>
            </div>
            <div className="inline-flex flex-wrap rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    filter === item.id
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  <span className="ml-2 text-xs opacity-80">
                    {counts[item.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">
                {filter === "standard"
                  ? "No standard products in this range"
                  : filter === "configurable"
                    ? "No configurable products in this range"
                    : "No products in this range yet"}
              </h3>
              <p className="mt-3 text-slate-500">
                {filter === "all"
                  ? "Products will appear here as soon as they are published."
                  : "Try another filter to explore the rest of this range."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((product) => {
                const { src, srcSet, sizes, loading: imageLoading, decoding } =
                  buildResponsiveImageProps(product.baseImagePath || product.baseImageUrl || "");
                const productTypeLabel =
                  product.productType === "configurable"
                    ? "Configurable"
                    : "Standard";

                return (
                  <article
                    key={product.id}
                    className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_-35px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_65px_-36px_rgba(15,118,110,0.28)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                      {src ? (
                        <img
                          src={src}
                          srcSet={srcSet}
                          sizes={sizes}
                          loading={imageLoading}
                          decoding={decoding}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : null}
                      <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
                        {productTypeLabel}
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                        {range.name}
                      </p>
                      <h3 className="mt-3 text-2xl font-bold text-slate-900">
                        {product.name}
                      </h3>
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                        {product.description || "Open this product to view details and documentation."}
                      </p>
                      <div className="mt-6 flex items-center justify-between gap-4">
                        <div className="text-xs text-slate-500">
                          {product.resources?.length || 0} downloads available
                        </div>
                        <Link
                          to={getPublicProductPath(product)}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProductsInRange;

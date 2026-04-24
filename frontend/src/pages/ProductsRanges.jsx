import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCatalog } from "../hooks/useCatalog";
import { buildResponsiveImageProps } from "../utils/imageVariants";
import {
  getConfiguratorHubPath,
  getPublicProductPath,
  getPublicRangePath,
} from "../utils/catalogPaths";

const RANGE_GRADIENTS = [
  "from-emerald-500/90 via-teal-500/90 to-cyan-500/90",
  "from-slate-800/90 via-slate-700/90 to-emerald-700/90",
  "from-cyan-600/90 via-teal-600/90 to-slate-800/90",
];

const ProductsRanges = () => {
  const {
    ranges,
    loadPublicCatalog,
    loading,
    loaded,
    getProductsByRangeIdentifier,
  } = useCatalog();

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loaded, loading, loadPublicCatalog]);

  const featuredRange = ranges[0] || null;
  const featuredProduct =
    featuredRange && getProductsByRangeIdentifier(featuredRange.id)[0]
      ? getProductsByRangeIdentifier(featuredRange.id)[0]
      : null;

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.18),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.14),_transparent_30%)]" />
        <div className="relative container mx-auto px-6 py-24 md:py-28">
          <div className="max-w-4xl">
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 backdrop-blur">
              Product Catalog
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
              Explore Wireeo product ranges with a cleaner path from range to product.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-200">
              Browse each range as its own landing page, jump into standard or configurable
              products, and open every product on a dedicated detail page with documentation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to={getConfiguratorHubPath({ tab: "selection" })}
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
              >
                Open Graphic Configurator
              </Link>
              {featuredProduct ? (
                <Link
                  to={getPublicProductPath(featuredProduct)}
                  className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  View Featured Product
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16 md:py-20">
        <div className="container mx-auto px-6">
          <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Product Ranges</h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                Each range now opens its own product-list page, with the same Wireeo visual
                language and a simpler browsing structure.
              </p>
            </div>
            <Link
              to="/products/browse"
              className="inline-flex items-center text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
            >
              Browse standard products
            </Link>
          </div>

          {loading && !loaded ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
              <p className="mt-4 text-slate-500">Loading product ranges...</p>
            </div>
          ) : ranges.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">No ranges available yet</h3>
              <p className="mt-3 text-slate-500">
                Product ranges will appear here as soon as they are published in the admin
                panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {ranges.map((range, index) => {
                const { src, srcSet, sizes, loading: imageLoading, decoding } =
                  buildResponsiveImageProps(range.imagePath || range.image || "");
                const rangeProducts = getProductsByRangeIdentifier(range.id);

                return (
                  <article
                    key={range.id}
                    className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_50px_-34px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_70px_-36px_rgba(13,148,136,0.32)]"
                  >
                    <div className="relative h-72 overflow-hidden">
                      {src ? (
                        <img
                          src={src}
                          srcSet={srcSet}
                          sizes={sizes}
                          loading={imageLoading}
                          decoding={decoding}
                          alt={range.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className={`h-full w-full bg-gradient-to-br ${RANGE_GRADIENTS[index % RANGE_GRADIENTS.length]}`}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
                              Range
                            </p>
                            <h3 className="mt-2 text-3xl font-bold">{range.name}</h3>
                          </div>
                          <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right backdrop-blur">
                            <p className="text-xs uppercase tracking-[0.22em] text-slate-200">
                              Products
                            </p>
                            <p className="mt-1 text-2xl font-bold">{rangeProducts.length}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 md:p-7">
                      <p className="text-sm leading-6 text-slate-600">
                        {range.description || "Explore the products available in this range."}
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span className="inline-flex h-2.5 w-2.5 rounded-full bg-teal-500" />
                          Dedicated range page with standard/configurable filter
                        </div>
                        <Link
                          to={getPublicRangePath(range)}
                          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                        >
                          View Range
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

export default ProductsRanges;

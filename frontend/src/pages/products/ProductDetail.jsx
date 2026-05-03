import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useCatalog } from "../../hooks/useCatalog";
import { getImageUrl } from "../../services/api";
import { buildResponsiveImageProps } from "../../utils/imageVariants";
import {
  getPublicProductPath,
  getPublicRangePath,
  getPublicRangesPath,
} from "../../utils/catalogPaths";

const toImageUrl = (src) => {
  if (!src || typeof src !== "string") return "";
  return src.startsWith("http") || src.startsWith("data:") ? src : getImageUrl(src);
};

const uniqueImageUrls = (sources) => {
  const seen = new Set();
  return sources
    .map((src) => (typeof src === "string" ? src : src?.url || ""))
    .map(toImageUrl)
    .filter(Boolean)
    .filter((src) => {
      if (seen.has(src)) return false;
      seen.add(src);
      return true;
    });
};

const getProductThumbnailSource = (product) =>
  product?.baseImageUrl ||
  product?.configuratorImageUrl ||
  product?.baseDeviceImageUrl ||
  product?.baseImagePath ||
  product?.imagePaths?.[0] ||
  product?.configuratorImagePath ||
  product?.baseDeviceImagePath ||
  "";

const ProductDetail = () => {
  const { id, productSlug } = useParams();
  const navigate = useNavigate();
  const identifier = productSlug || id || "";
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const {
    getProductByIdentifier,
    getRangeByIdentifier,
    loadPublicCatalog,
    loading,
    loaded,
    error,
    fetchProductByIdentifier,
    products: publicProducts = [],
  } = useCatalog();
  const [directProduct, setDirectProduct] = useState(null);
  const [directLoading, setDirectLoading] = useState(false);
  const [directError, setDirectError] = useState("");
  const [directAttempted, setDirectAttempted] = useState(false);

  useEffect(() => {
    if (!loaded && !loading) loadPublicCatalog();
  }, [loadPublicCatalog, loaded, loading]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [identifier]);

  const catalogProduct = useMemo(
    () => (identifier ? getProductByIdentifier(identifier) : null),
    [getProductByIdentifier, identifier],
  );
  const product = catalogProduct || directProduct;

  useEffect(() => {
    if (product?.id && id !== product.id) {
      navigate(`/products/detail/${encodeURIComponent(product.id)}`, {
        replace: true,
      });
    }
  }, [id, navigate, product?.id]);

  useEffect(() => {
    let cancelled = false;

    setDirectProduct(null);
    setDirectError("");
    setDirectAttempted(false);

    if (!identifier || catalogProduct || (!loaded && !error)) {
      setDirectLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setDirectLoading(true);
    fetchProductByIdentifier(identifier)
      .then((nextProduct) => {
        if (!cancelled) setDirectProduct(nextProduct || null);
      })
      .catch((err) => {
        if (!cancelled) {
          setDirectError(err?.message || "Failed to load product details");
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
    catalogProduct,
    error,
    fetchProductByIdentifier,
    identifier,
    loaded,
  ]);

  const range = useMemo(
    () => (product ? getRangeByIdentifier(product.rangeId) || product.range || null : null),
    [getRangeByIdentifier, product],
  );

  const galleryImages = useMemo(() => {
    if (!product) return [];

    return uniqueImageUrls([
      ...(Array.isArray(product.imagePaths) ? product.imagePaths : []),
      ...(Array.isArray(product.images) ? product.images : []),
      product.baseImagePath,
      product.baseImageUrl,
      product.configuratorImagePath,
      product.configuratorImageUrl,
      product.baseDeviceImagePath,
      product.baseDeviceImageUrl,
    ]);
  }, [product]);

  const heroImage =
    range?.image ||
    product?.configuratorImageUrl ||
    product?.baseImageUrl ||
    galleryImages[0] ||
    "";
  const resources = Array.isArray(product?.resources) ? product.resources : [];

  const sameRangeProducts = useMemo(() => {
    if (!product?.rangeId) return product ? [product] : [];

    const matches = (publicProducts || []).filter(
      (item) => item?.rangeId === product.rangeId,
    );

    if (matches.some((item) => item?.id === product.id)) {
      return matches;
    }

    return [...matches, product];
  }, [product, publicProducts]);

  const waitingForCatalog = !product && !loaded && !error;
  const waitingForDirectLookup =
    !product &&
    !!identifier &&
    !catalogProduct &&
    (loaded || !!error) &&
    (!directAttempted || directLoading);

  if (waitingForCatalog || waitingForDirectLookup) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />
          <p className="mt-4 text-slate-500">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product && directError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Unable to load product</h1>
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

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-20">
        <div className="mx-auto max-w-3xl rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
          <h1 className="text-3xl font-bold text-slate-900">Product not found</h1>
          <p className="mt-4 text-slate-500">
            The requested product is unavailable or the link is no longer valid.
          </p>
          <Link
            to={getPublicRangesPath()}
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
          >
            Back to Product Ranges
          </Link>
        </div>
      </div>
    );
  }

  const mainImage =
    galleryImages[selectedImageIndex] ||
    product.configuratorImageUrl ||
    product.baseImageUrl ||
    "";
  const productTypeLabel =
    product.productType === "configurable"
      ? "Configurable Product"
      : "Standard Product";

  return (
    <div className="min-h-screen bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 text-white">
        {heroImage ? (
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        ) : null}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(45,212,191,0.18),_transparent_35%)]" />
        <div className="relative container mx-auto px-6 py-24 md:py-28">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
            <Link to="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span>/</span>
            <Link to="/products" className="transition-colors hover:text-white">
              Products
            </Link>
            <span>/</span>
            <Link to={getPublicRangesPath()} className="transition-colors hover:text-white">
              Product Ranges
            </Link>
            {range ? (
              <>
                <span>/</span>
                <Link
                  to={getPublicRangePath(range)}
                  className="transition-colors hover:text-white"
                >
                  {range.name}
                </Link>
              </>
            ) : null}
          </nav>

          <div className="mt-8 max-w-4xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 backdrop-blur">
                {productTypeLabel}
              </span>
              {product.productCode ? (
                <span className="inline-flex items-center rounded-full border border-teal-300/20 bg-teal-400/10 px-4 py-2 text-sm font-semibold text-teal-100">
                  {product.productCode}
                </span>
              ) : null}
            </div>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl lg:text-6xl">
              {product.name}
            </h1>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {product.configurable ? (
                <Link
                  to={`/editor/${product.id}?from=selection&rangeId=${product.rangeId}`}
                  className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600"
                >
                  Configure Product
                </Link>
              ) : null}
              <Link
                to="/products"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Back to Products
              </Link>
              <Link
                to={range ? getPublicRangePath(range) : getPublicRangesPath()}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Back to Range
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-16">
        <div className="container mx-auto grid grid-cols-1 gap-10 px-6 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-[0_22px_55px_-40px_rgba(15,23,42,0.35)]">
              <div className="aspect-square overflow-hidden rounded-[22px] bg-white">
                {mainImage ? (
                  <img
                    key={mainImage}
                    src={mainImage}
                    alt={product.name}
                    className="h-full w-full object-contain"
                  />
                ) : null}
              </div>
            </div>

            {galleryImages.length > 1 ? (
              <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
                {galleryImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`overflow-hidden rounded-2xl border-2 transition-all ${
                      selectedImageIndex === index
                        ? "border-teal-600 shadow-lg shadow-teal-100"
                        : "border-slate-200 hover:border-teal-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt=""
                      className="h-20 w-20 object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div>
            <div className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.35)]">
              <h2 className="text-3xl font-bold text-slate-900">Overview</h2>
              <div className="mt-6 grid divide-y divide-slate-200 border-y border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="py-4 sm:pr-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Product Name
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {product.name}
                  </p>
                </div>
                <div className="py-4 sm:px-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Product Code
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {product.productCode || "Not assigned"}
                  </p>
                </div>
                <div className="py-4 sm:pl-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Product Range
                  </p>
                  <p className="mt-2 text-base font-bold text-slate-900">
                    {range?.name || "Unassigned"}
                  </p>
                </div>
              </div>
              <p className="mt-5 text-base leading-7 text-slate-600">
                {product.description || "No overview has been added for this product yet."}
              </p>
            </div>

            <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.28)]">
              <h3 className="text-2xl font-bold text-slate-900">Technical Details</h3>
              <div className="mt-5 whitespace-pre-line text-base leading-7 text-slate-600">
                {product.technicalDetails || "Technical details will appear here once they are published."}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-14 md:py-16">
        <div className="container mx-auto px-6">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            
            {resources.length > 0 ? (
              <Link
                to="/resources"
                className="inline-flex items-center text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
              >
                Browse all resources
              </Link>
            ) : null}
          </div>

          {resources.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-slate-900">
                No documentation linked yet
              </h3>
              <p className="mt-3 text-slate-500">
                Downloads will appear here once resources are linked to this product in the admin
                panel.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {resources.map((resource) => (
                <a
                  key={resource.id}
                  href={resource.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.28)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_26px_60px_-40px_rgba(13,148,136,0.28)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                      <svg
                        className="h-7 w-7"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {resource.type || "Documentation"}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-900 transition-colors group-hover:text-teal-700">
                    {resource.title || resource.name}
                  </h3>
                  {resource.shortDescription ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {resource.shortDescription}
                    </p>
                  ) : null}
                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                    <div className="text-sm text-slate-500">
                      {resource.size || "Open resource"}
                    </div>
                    <span className="text-sm font-semibold text-teal-700">
                      Download
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-14 md:py-16">
        <div className="container mx-auto px-6">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-700">
                {range?.name || "Product Range"}
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">
                Products in This Range
              </h2>
            </div>
            <Link
              to={range ? getPublicRangePath(range) : getPublicRangesPath()}
              className="inline-flex items-center text-sm font-semibold text-teal-700 transition-colors hover:text-teal-800"
            >
              View range
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {sameRangeProducts.map((rangeProduct) => {
              const imageProps = buildResponsiveImageProps(
                getProductThumbnailSource(rangeProduct),
              );
              const isCurrentProduct = rangeProduct.id === product.id;
              const productRangeName = rangeProduct.range?.name || range?.name || "Product";

              return (
                <article
                  key={rangeProduct.id}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_18px_45px_-35px_rgba(15,23,42,0.32)] transition-all duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-[0_28px_65px_-38px_rgba(15,118,110,0.28)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                    {imageProps.src ? (
                      <img
                        src={imageProps.src}
                        srcSet={imageProps.srcSet}
                        sizes={imageProps.sizes}
                        loading={imageProps.loading}
                        decoding={imageProps.decoding}
                        alt={rangeProduct.name}
                        className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-50 via-white to-slate-100">
                        <span className="text-4xl font-bold text-teal-700/70">
                          {rangeProduct.name?.charAt(0) || "P"}
                        </span>
                      </div>
                    )}
                    {isCurrentProduct ? (
                      <span className="absolute left-4 top-4 rounded-full border border-teal-200 bg-white/95 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-sm">
                        Current Product
                      </span>
                    ) : null}
                  </div>

                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                      {productRangeName}
                    </p>
                    <h3 className="mt-3 line-clamp-2 text-xl font-bold text-slate-900">
                      {rangeProduct.name}
                    </h3>
                    {rangeProduct.productCode ? (
                      <p className="mt-2 text-sm font-semibold text-slate-500">
                        {rangeProduct.productCode}
                      </p>
                    ) : null}
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                      {rangeProduct.description ||
                        "Open this product to explore specifications, visuals, and documentation."}
                    </p>
                    <Link
                      to={getPublicProductPath(rangeProduct)}
                      className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
                    >
                      {isCurrentProduct ? "Viewing Product" : "View Product"}
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;

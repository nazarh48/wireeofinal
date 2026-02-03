import { create } from "zustand";
import { apiService, IMAGE_BASE_URL } from "../services/api";

/** Resolve relative image paths (e.g. /uploads/products/xxx) to absolute URL. Uses IMAGE_BASE_URL so deployed images work under /api/uploads when proxy only forwards /api. */
const toAbsoluteImageUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  const base = IMAGE_BASE_URL || (typeof window !== "undefined" ? window.location.origin : "");
  if (!base) return url;
  const path = url.startsWith("/") ? url : `/${url}`;
  // IMAGE_BASE_URL already contains /api in production, so just append the path
  return `${base}${path}`;
};

const mapRange = (r) => ({
  id: r?._id || r?.id,
  name: r?.name || "",
  description: r?.description || "",
  status: r?.status || "active",
  createdAt: r?.createdAt || null,
  updatedAt: r?.updatedAt || null,
});

const mapProduct = (p) => {
  const rangeId =
    (p?.range && (p.range._id || p.range.id)) || p?.rangeId || p?.range || null;
  const rawImages = Array.isArray(p?.images) ? p.images : [];
  const images = rawImages
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean)
    .map(toAbsoluteImageUrl);
  const baseImageUrlRaw = p?.baseImageUrl || images[0] || "";
  const baseImageUrl = toAbsoluteImageUrl(baseImageUrlRaw) || images[0] || "";

  // Get range name for SEO-friendly alt text
  const rangeName = p?.range?.name || "";
  const productName = p?.name || "Product";

  // Create SEO-optimized alt text
  const imageAlt = rangeName
    ? `${productName} - ${rangeName} - High Quality Wire Products`
    : `${productName} - High Quality Wire Products`;

  const downloadableFiles = Array.isArray(p?.downloadableFiles)
    ? p.downloadableFiles.map((f) => ({
        url: typeof f === "string" ? toAbsoluteImageUrl(f) : toAbsoluteImageUrl(f?.url),
        filename: f?.filename || "",
        originalName: f?.originalName || "",
        label: f?.label || f?.originalName || "",
      }))
    : [];

  return {
    id: p?._id || p?.id,
    name: productName,
    description: p?.description || "",
    rangeId,
    range: p?.range && typeof p.range === "object" ? mapRange(p.range) : null,
    baseImageUrl,
    images,
    imageAlt,
    configurable:
      p?.productType === "configurable" || p?.isConfigurable === true,
    status: p?.status || "active",
    featured: p?.featured === true,
    downloadableFiles,
    createdAt: p?.createdAt || null,
    updatedAt: p?.updatedAt || null,
  };
};

export const useCatalogStore = create((set, get) => ({
  // Public catalog (user-facing): active only
  publicRanges: [],
  publicProducts: [],
  publicLoading: false,
  publicLoaded: false,
  publicError: null,

  // Admin catalog (management): all statuses
  adminRanges: [],
  adminProducts: [],
  adminLoading: false,
  adminLoaded: false,
  adminError: null,

  loadPublicCatalog: async () => {
    set({ publicLoading: true, publicError: null });
    try {
      const [rangesRes, normalRes, configurableRes] = await Promise.all([
        apiService.ranges.list({ status: "active" }),
        apiService.products.listNormal({}),
        apiService.products.listConfigurable({}),
      ]);
      const ranges = (rangesRes?.ranges || []).map(mapRange);
      const products = [
        ...(normalRes?.products || []),
        ...(configurableRes?.products || []),
      ].map(mapProduct);
      set({
        publicRanges: ranges,
        publicProducts: products,
        publicLoading: false,
        publicLoaded: true,
      });
      return { ranges, products };
    } catch (e) {
      set({
        publicError: e?.message || "Failed to load catalog",
        publicLoading: false,
        publicLoaded: false,
      });
      return null;
    }
  },

  loadAdminCatalog: async () => {
    set({ adminLoading: true, adminError: null });
    try {
      const [rangesRes, productsRes] = await Promise.all([
        apiService.ranges.list(),
        apiService.products.list(),
      ]);
      const ranges = (rangesRes?.ranges || []).map(mapRange);
      const products = (productsRes?.products || []).map(mapProduct);
      set({
        adminRanges: ranges,
        adminProducts: products,
        adminLoading: false,
        adminLoaded: true,
      });
      return { ranges, products };
    } catch (e) {
      set({
        adminError: e?.message || "Failed to load admin catalog",
        adminLoading: false,
        adminLoaded: false,
      });
      return null;
    }
  },

  // Admin mutations
  createRange: async (payload) => {
    const res = await apiService.ranges.create(payload);
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return res?.range;
  },
  updateRange: async (id, payload) => {
    const res = await apiService.ranges.update(id, payload);
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return res?.range;
  },
  deleteRange: async (id) => {
    const res = await apiService.ranges.remove(id);
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return res;
  },

  createProduct: async (payload) => {
    const { rangeId, configurable, featured, imagesFiles, ...rest } = payload;
    const range = rangeId ?? payload.range;
    const isConfigurable = configurable ?? payload.isConfigurable;

    const hasFiles = Array.isArray(imagesFiles) ? imagesFiles.length > 0 : !!imagesFiles;
    const body = hasFiles ? new FormData() : { ...rest, range, isConfigurable, featured: !!featured, status: rest.status || "active" };

    if (hasFiles) {
      body.append("name", rest.name || "");
      body.append("description", rest.description || "");
      body.append("range", range);
      body.append("isConfigurable", String(!!isConfigurable));
      body.append("featured", String(!!featured));
      body.append("status", rest.status || "active");
      const files = Array.isArray(imagesFiles) ? imagesFiles : Array.from(imagesFiles || []);
      files.forEach((f) => body.append("images", f));
    }

    const res = await apiService.products.create(
      body,
      hasFiles ? { headers: { "Content-Type": "multipart/form-data" } } : undefined
    );
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return res?.product;
  },
  updateProduct: async (id, payload) => {
    const { rangeId, configurable, featured, imagesFiles, ...rest } = payload;
    const hasFiles = Array.isArray(imagesFiles) ? imagesFiles.length > 0 : !!imagesFiles;

    let body;
    let config;
    if (hasFiles) {
      body = new FormData();
      if (rest.name !== undefined) body.append("name", rest.name);
      if (rest.description !== undefined) body.append("description", rest.description);
      if (rangeId !== undefined) body.append("range", rangeId);
      if (configurable !== undefined) body.append("isConfigurable", String(!!configurable));
      if (featured !== undefined) body.append("featured", String(!!featured));
      if (rest.status !== undefined) body.append("status", rest.status);
      const files = Array.isArray(imagesFiles) ? imagesFiles : Array.from(imagesFiles || []);
      files.forEach((f) => body.append("images", f));
      config = { headers: { "Content-Type": "multipart/form-data" } };
    } else {
      body = { ...rest };
      if (rangeId !== undefined) body.range = rangeId;
      if (configurable !== undefined) body.isConfigurable = configurable;
      if (featured !== undefined) body.featured = featured;
      config = undefined;
    }

    const res = await apiService.products.update(id, body, config);
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return res?.product;
  },
  deleteProduct: async (id) => {
    const res = await apiService.products.remove(id);
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return res;
  },

  // Public getters (in-memory)
  getPublicRangeById: (id) => get().publicRanges.find((r) => r.id === id),
  getPublicProductById: (id) => get().publicProducts.find((p) => p.id === id),

  // Admin getters (use adminRanges / adminProducts)
  getAdminRangeById: (id) => get().adminRanges.find((r) => r.id === id),

  // Helpers for UI separation
  getNormalProducts: () => get().publicProducts.filter((p) => !p.configurable),
  getConfigurableProducts: () => get().publicProducts.filter((p) => p.configurable),
  getNormalProductsByRange: (rangeId) =>
    get().publicProducts.filter((p) => !p.configurable && p.rangeId === rangeId),
  getConfigurableProductsByRange: (rangeId) =>
    get().publicProducts.filter((p) => p.configurable && p.rangeId === rangeId),
  getNormalProductById: (id) => {
    const p = get().getPublicProductById(id);
    return p && !p.configurable ? p : null;
  },
  getConfigurableProductById: (id) => {
    const p = get().getPublicProductById(id);
    return p && p.configurable ? p : null;
  },
  getFeaturedProducts: () => get().publicProducts.filter((p) => p.featured),
  getNonFeaturedProducts: () => get().publicProducts.filter((p) => !p.featured),
}));

export default useCatalogStore;

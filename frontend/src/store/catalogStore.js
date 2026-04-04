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

const mapRange = (r) => {
  const rawImage = r?.image || "";
  const imagePath = typeof rawImage === "string" ? rawImage : "";
  return {
    id: r?._id || r?.id,
    name: r?.name || "",
    description: r?.description || "",
    image: imagePath ? toAbsoluteImageUrl(imagePath) : "",
    imagePath,
    status: r?.status || "active",
    createdAt: r?.createdAt || null,
    updatedAt: r?.updatedAt || null,
  };
};

const mapProduct = (p) => {
  const rangeId =
    (p?.range && (p.range._id || p.range.id)) || p?.rangeId || p?.range || null;
  const rawImages = Array.isArray(p?.images) ? p.images : [];
  const imagePaths = rawImages
    .map((img) => (typeof img === "string" ? img : img?.url))
    .filter(Boolean);
  const images = imagePaths.map(toAbsoluteImageUrl);
  const baseImagePath = typeof p?.baseImageUrl === "string" ? p.baseImageUrl : "";
  const baseImageUrlRaw = baseImagePath || images[0] || "";
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
    productCode: p?.productCode ?? "",
    description: p?.description || "",
    technicalDetails: p?.technicalDetails ?? "",
    rangeId,
    range: p?.range && typeof p.range === "object" ? mapRange(p.range) : null,
    baseImageUrl,
    baseImagePath,
    configuratorImageUrl: p?.configuratorImageUrl ? toAbsoluteImageUrl(p.configuratorImageUrl) : "",
    baseDeviceImageUrl: p?.baseDeviceImageUrl ? toAbsoluteImageUrl(p.baseDeviceImageUrl) : "",
    engravingMaskImageUrl: p?.engravingMaskImageUrl ? toAbsoluteImageUrl(p.engravingMaskImageUrl) : "",
    printAreaBackgroundImageUrl: p?.printAreaBackgroundImageUrl ? toAbsoluteImageUrl(p.printAreaBackgroundImageUrl) : "",
    images,
    imagePaths,
    imageAlt,
    configurable:
      p?.productType === "configurable" || p?.isConfigurable === true,
    printingEnabled: p?.printingEnabled !== undefined ? !!p.printingEnabled : true,
    laserEnabled: p?.laserEnabled !== undefined ? !!p.laserEnabled : true,
    backgroundCustomizable: p?.backgroundCustomizable !== undefined ? !!p.backgroundCustomizable : true,
    // Printing-only admin toggles (optional; undefined = legacy/backward compatible).
    backgroundEnabled: p?.backgroundEnabled !== undefined ? !!p.backgroundEnabled : undefined,
    iconsTextEnabled: p?.iconsTextEnabled !== undefined ? !!p.iconsTextEnabled : undefined,
    photoCroppingEnabled: p?.photoCroppingEnabled !== undefined ? !!p.photoCroppingEnabled : undefined,
    photoCroppingHeightPx:
      p?.photoCroppingHeightPx !== undefined && p?.photoCroppingHeightPx !== null
        ? (Number.isFinite(Number(p.photoCroppingHeightPx)) ? Number(p.photoCroppingHeightPx) : undefined)
        : undefined,
    photoCroppingWidthPx:
      p?.photoCroppingWidthPx !== undefined && p?.photoCroppingWidthPx !== null
        ? (Number.isFinite(Number(p.photoCroppingWidthPx)) ? Number(p.photoCroppingWidthPx) : undefined)
        : undefined,
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

  // Admin mutations. When image file is included: create with JSON first (so validation passes), then PATCH with image only (multer doesn't put other fields in req.body).
  createRange: async (payload, imageFile = null) => {
    const jsonBody = {
      name: payload.name || "",
      description: payload.description != null ? payload.description : "",
      status: payload.status != null ? payload.status : "active",
    };
    const res = await apiService.ranges.create(jsonBody);
    const range = res?.range;
    const rangeId = range && (range.id || range._id);
    if (rangeId && imageFile && (imageFile instanceof File || (imageFile instanceof Blob && imageFile.name))) {
      const formData = new FormData();
      formData.append("image", imageFile);
      await apiService.ranges.update(rangeId, formData);
    }
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return range ? get().adminRanges.find((r) => r.id === rangeId || r.id === range.id || r.id === range._id) || range : range;
  },
  updateRange: async (id, payload, imageFile = null) => {
    const jsonBody = {
      ...(payload.name != null && { name: payload.name }),
      ...(payload.description != null && { description: payload.description }),
      ...(payload.status != null && { status: payload.status }),
    };
    if (Object.keys(jsonBody).length > 0) {
      await apiService.ranges.update(id, jsonBody);
    }
    if (imageFile && (imageFile instanceof File || (imageFile instanceof Blob && imageFile.name))) {
      const formData = new FormData();
      formData.append("image", imageFile);
      await apiService.ranges.update(id, formData);
    }
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    const updated = get().adminRanges.find((r) => r.id === id);
    return updated || null;
  },
  deleteRange: async (id) => {
    const res = await apiService.ranges.remove(id);
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return res;
  },

  createProduct: async (payload) => {
    const {
      rangeId,
      configurable,
      featured,
      imagesFiles,
      configuratorImageFile,
      downloadFiles,
      baseDeviceImageFile,
      engravingMaskImageFile,
      printingEnabled,
      laserEnabled,
      backgroundCustomizable,
      backgroundEnabled,
      iconsTextEnabled,
      photoCroppingEnabled,
      photoCroppingHeightPx,
      photoCroppingWidthPx,
      printAreaBackgroundImageFile,
      printAreaBackgroundImageUrl,
      ...rest
    } = payload;
    const range = rangeId ?? payload.range;
    // Always resolve so non-configurable products are saved as productType "normal" and show on Products page
    const isConfigurable = configurable ?? payload.isConfigurable ?? false;

    const hasImages = Array.isArray(imagesFiles) ? imagesFiles.length > 0 : !!imagesFiles;
    const hasConfiguratorImage = configuratorImageFile && (configuratorImageFile instanceof File || (configuratorImageFile instanceof Blob && configuratorImageFile.name));
    const hasDownloadFiles = Array.isArray(downloadFiles) && downloadFiles.length > 0;
    const hasBaseDevice = baseDeviceImageFile && (baseDeviceImageFile instanceof File || (baseDeviceImageFile instanceof Blob && baseDeviceImageFile.name));
    const hasEngravingMask = engravingMaskImageFile && (engravingMaskImageFile instanceof File || (engravingMaskImageFile instanceof Blob && engravingMaskImageFile.name));
    const hasPrintAreaBackgroundImage =
      printAreaBackgroundImageFile &&
      (printAreaBackgroundImageFile instanceof File ||
        (printAreaBackgroundImageFile instanceof Blob &&
          printAreaBackgroundImageFile.name));
    const hasFiles = hasImages || hasConfiguratorImage || hasDownloadFiles || hasBaseDevice || hasEngravingMask || hasPrintAreaBackgroundImage;
    const body = hasFiles
      ? new FormData()
      : {
          ...rest,
          range,
          isConfigurable: !!isConfigurable,
          featured: !!featured,
          status: rest.status || "active",
          printingEnabled: printingEnabled !== undefined ? !!printingEnabled : undefined,
          laserEnabled: laserEnabled !== undefined ? !!laserEnabled : undefined,
          backgroundCustomizable: backgroundCustomizable !== undefined ? !!backgroundCustomizable : undefined,
          backgroundEnabled: backgroundEnabled !== undefined ? !!backgroundEnabled : undefined,
          iconsTextEnabled: iconsTextEnabled !== undefined ? !!iconsTextEnabled : undefined,
          photoCroppingEnabled: photoCroppingEnabled !== undefined ? !!photoCroppingEnabled : undefined,
          photoCroppingHeightPx: photoCroppingHeightPx !== undefined ? photoCroppingHeightPx : undefined,
          photoCroppingWidthPx: photoCroppingWidthPx !== undefined ? photoCroppingWidthPx : undefined,
          printAreaBackgroundImageUrl:
            printAreaBackgroundImageUrl !== undefined
              ? printAreaBackgroundImageUrl
              : undefined,
        };

    if (hasFiles) {
      body.append("name", rest.name || "");
      body.append("productCode", rest.productCode ?? "");
      body.append("description", rest.description ?? "");
      body.append("technicalDetails", rest.technicalDetails ?? "");
      body.append("range", range);
      body.append("isConfigurable", String(!!isConfigurable));
      body.append("featured", String(!!featured));
      body.append("status", rest.status || "active");
      if (printingEnabled !== undefined) body.append("printingEnabled", String(!!printingEnabled));
      if (laserEnabled !== undefined) body.append("laserEnabled", String(!!laserEnabled));
      if (backgroundCustomizable !== undefined) body.append("backgroundCustomizable", String(!!backgroundCustomizable));
      if (backgroundEnabled !== undefined) body.append("backgroundEnabled", String(!!backgroundEnabled));
      if (iconsTextEnabled !== undefined) body.append("iconsTextEnabled", String(!!iconsTextEnabled));
      if (photoCroppingEnabled !== undefined) body.append("photoCroppingEnabled", String(!!photoCroppingEnabled));
      if (photoCroppingHeightPx !== undefined) body.append("photoCroppingHeightPx", String(photoCroppingHeightPx));
      if (photoCroppingWidthPx !== undefined) body.append("photoCroppingWidthPx", String(photoCroppingWidthPx));
      if (printAreaBackgroundImageUrl !== undefined) body.append("printAreaBackgroundImageUrl", String(printAreaBackgroundImageUrl || ""));
      if (hasImages) {
        const files = Array.isArray(imagesFiles) ? imagesFiles : Array.from(imagesFiles || []);
        files.forEach((f) => body.append("images", f));
      }
      if (hasConfiguratorImage) body.append("configuratorImage", configuratorImageFile);
      if (hasBaseDevice) body.append("baseDeviceImage", baseDeviceImageFile);
      if (hasEngravingMask) body.append("engravingMaskImage", engravingMaskImageFile);
      if (hasPrintAreaBackgroundImage) body.append("printAreaBackgroundImage", printAreaBackgroundImageFile);
      if (hasDownloadFiles) {
        downloadFiles.forEach((d) => d && d.file && body.append("files", d.file));
        const labels = downloadFiles.map((d) => (d && d.label) || (d && d.file && d.file.name) || "Download");
        body.append("fileLabels", JSON.stringify(labels));
      }
    }

    const res = await apiService.products.create(
      body,
      hasFiles ? { timeout: 120000 } : undefined
    );
    await get().loadAdminCatalog();
    await get().loadPublicCatalog();
    return res?.product;
  },
  updateProduct: async (id, payload) => {
    const {
      rangeId,
      configurable,
      featured,
      imagesFiles,
      existingImages,
      configuratorImageFile,
      downloadFiles,
      baseDeviceImageFile,
      engravingMaskImageFile,
      printingEnabled,
      laserEnabled,
      backgroundCustomizable,
      backgroundEnabled,
      iconsTextEnabled,
      photoCroppingEnabled,
      photoCroppingHeightPx,
      photoCroppingWidthPx,
      printAreaBackgroundImageFile,
      printAreaBackgroundImageUrl,
      ...rest
    } = payload;
    const hasImageFiles = Array.isArray(imagesFiles) ? imagesFiles.length > 0 : !!imagesFiles;
    const hasConfiguratorImage = configuratorImageFile && (configuratorImageFile instanceof File || (configuratorImageFile instanceof Blob && configuratorImageFile.name));
    const hasDownloadFiles = Array.isArray(downloadFiles) && downloadFiles.length > 0;
    const hasBaseDevice = baseDeviceImageFile && (baseDeviceImageFile instanceof File || (baseDeviceImageFile instanceof Blob && baseDeviceImageFile.name));
    const hasEngravingMask = engravingMaskImageFile && (engravingMaskImageFile instanceof File || (engravingMaskImageFile instanceof Blob && engravingMaskImageFile.name));
    const hasPrintAreaBackgroundImage =
      printAreaBackgroundImageFile &&
      (printAreaBackgroundImageFile instanceof File ||
        (printAreaBackgroundImageFile instanceof Blob &&
          printAreaBackgroundImageFile.name));
    const existingDownloadableFiles = Array.isArray(rest.downloadableFiles) ? rest.downloadableFiles : [];
    // Always use FormData when there are new image files; also use it when existingImages
    // list has changed so we can send the kept URLs to the backend for merging.
    const existingImagesChanged = Array.isArray(existingImages);
    const useFormData =
      hasImageFiles ||
      hasConfiguratorImage ||
      hasDownloadFiles ||
      existingImagesChanged ||
      hasBaseDevice ||
      hasEngravingMask ||
      printingEnabled !== undefined ||
      laserEnabled !== undefined ||
      backgroundCustomizable !== undefined ||
      backgroundEnabled !== undefined ||
      iconsTextEnabled !== undefined ||
      photoCroppingEnabled !== undefined ||
      photoCroppingHeightPx !== undefined ||
      photoCroppingWidthPx !== undefined ||
      hasPrintAreaBackgroundImage ||
      printAreaBackgroundImageUrl !== undefined;

    let body;
    let config;
    if (useFormData) {
      body = new FormData();
      if (rest.name !== undefined) body.append("name", rest.name);
      if (rest.productCode !== undefined) body.append("productCode", rest.productCode);
      if (rest.description !== undefined) body.append("description", rest.description);
      if (rest.technicalDetails !== undefined) body.append("technicalDetails", rest.technicalDetails);
      if (rangeId !== undefined) body.append("range", rangeId);
      if (configurable !== undefined) body.append("isConfigurable", String(!!configurable));
      if (featured !== undefined) body.append("featured", String(!!featured));
      if (rest.status !== undefined) body.append("status", rest.status);
      // Send the kept existing image URLs so backend can merge them with newly uploaded ones
      if (existingImagesChanged) {
        body.append("existingImages", JSON.stringify(existingImages));
      }
      if (hasImageFiles) {
        const files = Array.isArray(imagesFiles) ? imagesFiles : Array.from(imagesFiles || []);
        files.forEach((f) => body.append("images", f));
      }
      if (hasConfiguratorImage) body.append("configuratorImage", configuratorImageFile);
      if (hasBaseDevice) body.append("baseDeviceImage", baseDeviceImageFile);
      if (hasEngravingMask) body.append("engravingMaskImage", engravingMaskImageFile);
      if (printingEnabled !== undefined) body.append("printingEnabled", String(!!printingEnabled));
      if (laserEnabled !== undefined) body.append("laserEnabled", String(!!laserEnabled));
      if (backgroundCustomizable !== undefined) body.append("backgroundCustomizable", String(!!backgroundCustomizable));
      if (backgroundEnabled !== undefined) body.append("backgroundEnabled", String(!!backgroundEnabled));
      if (iconsTextEnabled !== undefined) body.append("iconsTextEnabled", String(!!iconsTextEnabled));
      if (photoCroppingEnabled !== undefined) body.append("photoCroppingEnabled", String(!!photoCroppingEnabled));
      if (photoCroppingHeightPx !== undefined) body.append("photoCroppingHeightPx", String(photoCroppingHeightPx));
      if (photoCroppingWidthPx !== undefined) body.append("photoCroppingWidthPx", String(photoCroppingWidthPx));
      if (printAreaBackgroundImageUrl !== undefined) body.append("printAreaBackgroundImageUrl", String(printAreaBackgroundImageUrl || ""));
      body.append("downloadableFiles", JSON.stringify(existingDownloadableFiles));
      if (hasDownloadFiles) {
        const labels = downloadFiles.map((d) => (d && d.label) || (d && d.file && d.file.name) || "Download");
        downloadFiles.forEach((d) => d && d.file && body.append("files", d.file));
        body.append("fileLabels", JSON.stringify(labels));
      }
      if (hasPrintAreaBackgroundImage) body.append("printAreaBackgroundImage", printAreaBackgroundImageFile);
      config = { timeout: 120000 };
    } else {
      body = { ...rest };
      if (rangeId !== undefined) body.range = rangeId;
      if (configurable !== undefined) body.isConfigurable = configurable;
      if (featured !== undefined) body.featured = featured;
      if (printingEnabled !== undefined) body.printingEnabled = !!printingEnabled;
      if (laserEnabled !== undefined) body.laserEnabled = !!laserEnabled;
      if (backgroundCustomizable !== undefined) body.backgroundCustomizable = !!backgroundCustomizable;
      if (backgroundEnabled !== undefined) body.backgroundEnabled = !!backgroundEnabled;
      if (iconsTextEnabled !== undefined) body.iconsTextEnabled = !!iconsTextEnabled;
      if (photoCroppingEnabled !== undefined) body.photoCroppingEnabled = !!photoCroppingEnabled;
      if (photoCroppingHeightPx !== undefined) body.photoCroppingHeightPx = photoCroppingHeightPx;
      if (photoCroppingWidthPx !== undefined) body.photoCroppingWidthPx = photoCroppingWidthPx;
      if (printAreaBackgroundImageUrl !== undefined) body.printAreaBackgroundImageUrl = printAreaBackgroundImageUrl;
      if (existingDownloadableFiles.length > 0) body.downloadableFiles = existingDownloadableFiles;
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

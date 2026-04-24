// src/controllers/productController.js
import path from "path";
import { Product } from "../models/Product.js";
import { Range } from "../models/Range.js";
import { Resource } from "../models/Resource.js";
import { optimizeImageAtUrl } from "../services/imageService.js";
import { parseProductFormBody, firstFormValue } from "../utils/productBodyParser.js";
import { createUniqueSlug } from "../utils/slug.js";

const RANGE_POPULATE_FIELDS = "name slug description status image order";
const RESOURCE_POPULATE_FIELDS =
  "name shortDescription type photo fileUrl fileFilename size order status createdAt updatedAt";

// ------------------------
// Type parsers
// ------------------------
function parseBool(value, fallback = false) {
  if (value === undefined) return fallback;
  if (typeof value === "boolean") return value;
  return value === "true" || value === "1" || value === 1;
}

function parseNumber(value, fallback = null) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isNaN(n) ? fallback : n;
}

function buildProductListFilter(req, enforcedFilter = {}) {
  const filter = {};

  if (req.query.range) filter.range = req.query.range;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.productType) filter.productType = req.query.productType;
  if (req.query.featured !== undefined) filter.featured = parseBool(req.query.featured);

  return { ...filter, ...enforcedFilter };
}

function normalizeStoredUploadUrl(rawValue) {
  let value = rawValue;

  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "object") value = value.url || value.fileUrl || "";
  if (typeof value !== "string") return "";

  let normalized = value.trim();
  if (!normalized) return "";

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      normalized = new URL(normalized).pathname || normalized;
    } catch {
      return normalized;
    }
  }

  if (normalized.startsWith("/api/uploads/")) {
    return normalized.replace(/^\/api/, "");
  }

  return normalized;
}

function parseStringArrayField(rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === "") return [];

  if (Array.isArray(rawValue)) {
    return rawValue.flatMap((item) => parseStringArrayField(item));
  }

  if (typeof rawValue === "string") {
    const trimmed = rawValue.trim();
    if (!trimmed) return [];

    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parseStringArrayField(parsed) : [];
      } catch {
        return [];
      }
    }

    return [trimmed];
  }

  return [];
}

function parseObjectIdArray(rawValue) {
  const list = parseStringArrayField(firstFormValue(rawValue))
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  return [...new Set(list)];
}

function buildStoredImageFromUrl(rawValue) {
  const url = normalizeStoredUploadUrl(rawValue);
  if (!url) return null;

  const filename = path.basename(url);
  return {
    url,
    filename,
    originalName: filename,
  };
}

function toProductFile(file, dir = "products") {
  const base = dir === "products" ? "/uploads/products" : "/uploads/product-files";
  return {
    url: `${base}/${file.filename}`,
    filename: file.filename,
    originalName: file.originalname || "",
    label:
      file.originalname ||
      file.filename ||
      "Download",
  };
}

function normalizeLegacyDownloadable(item) {
  const rawUrl = typeof item === "string" ? item : item?.url || item?.fileUrl || "";
  const url = normalizeStoredUploadUrl(rawUrl);
  if (!url) return null;

  const filename =
    (typeof item === "object" && item?.filename) || path.basename(url) || "";
  const originalName =
    (typeof item === "object" && item?.originalName) || filename;
  const label =
    (typeof item === "object" && item?.label) || originalName || filename || "Download";

  return {
    url,
    filename,
    originalName,
    label,
  };
}

function serializeResource(resource) {
  if (!resource || typeof resource !== "object") return null;

  return {
    _id: resource._id || resource.id,
    id: resource._id?.toString?.() || resource.id?.toString?.() || "",
    name: resource.name || "",
    shortDescription: resource.shortDescription || "",
    type: resource.type || "Guide",
    photo: normalizeStoredUploadUrl(resource.photo),
    fileUrl: normalizeStoredUploadUrl(resource.fileUrl),
    fileFilename: resource.fileFilename || "",
    size: resource.size || "",
    order: resource.order ?? 0,
    status: resource.status || "active",
    createdAt: resource.createdAt || null,
    updatedAt: resource.updatedAt || null,
  };
}

function resourceToDownloadable(resource) {
  if (!resource?.fileUrl) return null;

  return {
    url: resource.fileUrl,
    filename: resource.fileFilename || path.basename(resource.fileUrl) || "",
    originalName: resource.name || resource.fileFilename || "",
    label: resource.name || resource.fileFilename || "Download",
    type: resource.type || "Guide",
  };
}

function mergeDownloadables(primary, secondary) {
  const merged = [];
  const seen = new Set();

  for (const item of [...primary, ...secondary]) {
    if (!item?.url) continue;
    const key = `${item.url}|${item.label || ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(item);
  }

  return merged;
}

function serializeProduct(product) {
  if (!product) return product;

  const out = { ...product };
  const populatedResources = Array.isArray(out.resourceIds)
    ? out.resourceIds
        .filter((resource) => resource && typeof resource === "object" && (resource._id || resource.id))
        .map(serializeResource)
        .filter(Boolean)
    : [];
  const resourceIds = Array.isArray(out.resourceIds)
    ? out.resourceIds
        .map((resource) =>
          typeof resource === "object" ? resource?._id?.toString?.() || resource?.id?.toString?.() : String(resource || ""),
        )
        .filter(Boolean)
    : [];
  const legacyDownloadables = Array.isArray(out.downloadableFiles)
    ? out.downloadableFiles.map(normalizeLegacyDownloadable).filter(Boolean)
    : [];
  const resourceDownloads = populatedResources
    .map(resourceToDownloadable)
    .filter(Boolean);

  out.resources = populatedResources;
  out.resourceIds = resourceIds;
  out.downloadableFiles = mergeDownloadables(resourceDownloads, legacyDownloadables);

  return out;
}

async function assertValidResourceIds(rawValue) {
  const resourceIds = parseObjectIdArray(rawValue);
  if (rawValue === undefined) return undefined;
  if (resourceIds.length === 0) return [];

  const resources = await Resource.find({ _id: { $in: resourceIds } })
    .select("_id")
    .lean();

  if (resources.length !== resourceIds.length) {
    const found = new Set(resources.map((resource) => String(resource._id)));
    const missing = resourceIds.filter((id) => !found.has(id));
    const err = new Error(`Invalid resource reference(s): ${missing.join(", ")}`);
    err.statusCode = 400;
    throw err;
  }

  return resourceIds;
}

async function populateProductQuery(query) {
  return query
    .populate("range", RANGE_POPULATE_FIELDS)
    .populate("resourceIds", RESOURCE_POPULATE_FIELDS);
}

async function sendProductList(req, res, next, enforcedFilter = {}) {
  try {
    const filter = buildProductListFilter(req, enforcedFilter);
    const query = Product.find(filter).sort({ createdAt: -1 }).lean();
    const products = await populateProductQuery(query);

    return res.status(200).json({
      success: true,
      products: products.map(serializeProduct),
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------
// Resolve mutually exclusive modes
// ------------------------
function resolveModes(printingEnabledRaw, laserEnabledRaw) {
  const laserEnabled = parseBool(laserEnabledRaw, false);
  const printingEnabled = laserEnabled ? false : parseBool(printingEnabledRaw, true);
  const backgroundCustomizable = printingEnabled;
  return { printingEnabled, laserEnabled, backgroundCustomizable };
}

function ensureProductResourcesAreCentralized(req) {
  const directFiles = Array.isArray(req.files?.files) ? req.files.files : [];
  if (directFiles.length === 0) return null;

  const err = new Error(
    "Upload documentation from the Resources / Documentation Attachments area and link the resource to the product instead of uploading files on the product form.",
  );
  err.statusCode = 400;
  return err;
}

// ------------------------
// CREATE PRODUCT
// ------------------------
export async function create(req, res, next) {
  try {
    const directResourceError = ensureProductResourcesAreCentralized(req);
    if (directResourceError) throw directResourceError;

    const p = parseProductFormBody(req.body);

    const range = await Range.findById(p.range).lean();
    if (!range) {
      return res.status(400).json({ success: false, message: "Range not found" });
    }

    const resourceIds = await assertValidResourceIds(req.body?.resourceIds);
    const { printingEnabled, laserEnabled, backgroundCustomizable } = resolveModes(
      p.printingEnabled,
      p.laserEnabled,
    );

    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : [];
    const configuratorFile = req.files?.configuratorImage?.[0] || null;
    const baseDeviceFile = req.files?.baseDeviceImage?.[0] || null;
    const engravingMaskFile = req.files?.engravingMaskImage?.[0] || null;
    const printAreaBackgroundFile = req.files?.printAreaBackgroundImage?.[0] || null;

    const images = imageFiles.map((file) => toProductFile(file, "products"));
    const configuratorUrl = configuratorFile
      ? toProductFile(configuratorFile, "products").url
      : normalizeStoredUploadUrl(p.configuratorImageUrl);
    const baseDeviceUrl = baseDeviceFile
      ? toProductFile(baseDeviceFile, "products").url
      : normalizeStoredUploadUrl(p.baseDeviceImageUrl) || configuratorUrl || "";
    const engravingMaskUrl = engravingMaskFile
      ? toProductFile(engravingMaskFile, "products").url
      : normalizeStoredUploadUrl(p.engravingMaskImageUrl);
    const printAreaBackgroundUrl = printAreaBackgroundFile
      ? toProductFile(printAreaBackgroundFile, "products").url
      : normalizeStoredUploadUrl(p.printAreaBackgroundImageUrl);
    const primaryUrl =
      images[0]?.url ||
      normalizeStoredUploadUrl(p.baseImageUrl) ||
      configuratorUrl ||
      baseDeviceUrl ||
      "";

    const product = await Product.create({
      name: p.name,
      slug: await createUniqueSlug(Product, p.name, { fallback: "product" }),
      productCode: p.productCode ?? "",
      description: p.description ?? "",
      technicalDetails: p.technicalDetails ?? "",
      range: p.range,
      baseImageUrl: primaryUrl,
      configuratorImageUrl: configuratorUrl,
      baseDeviceImageUrl: baseDeviceUrl,
      engravingMaskImageUrl: engravingMaskUrl,
      printAreaBackgroundImageUrl: printAreaBackgroundUrl,
      printingEnabled,
      laserEnabled,
      backgroundCustomizable,
      backgroundEnabled: parseBool(p.backgroundEnabled, true),
      iconsTextEnabled: parseBool(p.iconsTextEnabled, true),
      photoCroppingEnabled: parseBool(p.photoCroppingEnabled, true),
      photoCroppingHeightPx: parseNumber(p.photoCroppingHeightPx),
      photoCroppingWidthPx: parseNumber(p.photoCroppingWidthPx),
      images,
      isConfigurable: parseBool(p.isConfigurable, false),
      productType: parseBool(p.isConfigurable, false) ? "configurable" : "normal",
      status: p.status || "active",
      featured: parseBool(p.featured, false),
      resourceIds: resourceIds || [],
    });

    const populated = await populateProductQuery(
      Product.findById(product._id).lean(),
    );

    const urlsToOptimize = [
      ...images.map((image) => image.url),
      configuratorUrl,
      baseDeviceUrl,
      engravingMaskUrl,
      printAreaBackgroundUrl,
    ].filter(Boolean);
    Promise.all(urlsToOptimize.map((url) => optimizeImageAtUrl(url))).catch(() => {});

    return res.status(201).json({
      success: true,
      product: serializeProduct(populated),
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------
// UPDATE PRODUCT
// ------------------------
export async function update(req, res, next) {
  try {
    const directResourceError = ensureProductResourcesAreCentralized(req);
    if (directResourceError) throw directResourceError;

    const existingProduct = await Product.findById(req.params.id).lean();
    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const p = parseProductFormBody(req.body);
    const updates = {};

    if (p.name !== undefined) {
      updates.name = p.name;
      updates.slug = await createUniqueSlug(Product, p.name, {
        excludeId: req.params.id,
        fallback: "product",
      });
    }
    if (p.productCode !== undefined) updates.productCode = p.productCode;
    if (p.description !== undefined) updates.description = p.description;
    if (p.technicalDetails !== undefined) updates.technicalDetails = p.technicalDetails;
    if (p.status !== undefined) updates.status = p.status;
    if (p.featured !== undefined) updates.featured = parseBool(p.featured, false);

    if (p.isConfigurable !== undefined) {
      const isConfigurable = parseBool(p.isConfigurable, false);
      updates.isConfigurable = isConfigurable;
      updates.productType = isConfigurable ? "configurable" : "normal";
    }

    if (p.range) {
      const range = await Range.findById(p.range).lean();
      if (!range) {
        return res.status(400).json({ success: false, message: "Range not found" });
      }
      updates.range = p.range;
    }

    if (p.printingEnabled !== undefined || p.laserEnabled !== undefined) {
      const { printingEnabled, laserEnabled, backgroundCustomizable } = resolveModes(
        p.printingEnabled !== undefined ? p.printingEnabled : existingProduct.printingEnabled,
        p.laserEnabled !== undefined ? p.laserEnabled : existingProduct.laserEnabled,
      );
      updates.printingEnabled = printingEnabled;
      updates.laserEnabled = laserEnabled;
      updates.backgroundCustomizable = backgroundCustomizable;
    }

    if (p.backgroundEnabled !== undefined) {
      updates.backgroundEnabled = parseBool(p.backgroundEnabled, true);
    }
    if (p.iconsTextEnabled !== undefined) {
      updates.iconsTextEnabled = parseBool(p.iconsTextEnabled, true);
    }
    if (p.photoCroppingEnabled !== undefined) {
      updates.photoCroppingEnabled = parseBool(p.photoCroppingEnabled, true);
    }
    if (p.photoCroppingHeightPx !== undefined) {
      updates.photoCroppingHeightPx = parseNumber(p.photoCroppingHeightPx);
    }
    if (p.photoCroppingWidthPx !== undefined) {
      updates.photoCroppingWidthPx = parseNumber(p.photoCroppingWidthPx);
    }

    const hasResourceIdsField =
      req.body && Object.prototype.hasOwnProperty.call(req.body, "resourceIds");
    if (hasResourceIdsField) {
      updates.resourceIds = await assertValidResourceIds(req.body.resourceIds);
    }

    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : [];
    const configuratorFile = req.files?.configuratorImage?.[0] || null;
    const baseDeviceFile = req.files?.baseDeviceImage?.[0] || null;
    const engravingMaskFile = req.files?.engravingMaskImage?.[0] || null;
    const printAreaBackgroundFile = req.files?.printAreaBackgroundImage?.[0] || null;

    const hasExistingImagesField =
      req.body && Object.prototype.hasOwnProperty.call(req.body, "existingImages");
    if (hasExistingImagesField || imageFiles.length > 0) {
      const keptImages = hasExistingImagesField
        ? parseStringArrayField(req.body.existingImages)
            .map((value) => buildStoredImageFromUrl(value))
            .filter(Boolean)
        : Array.isArray(existingProduct.images)
          ? existingProduct.images
          : [];

      const uploadedImages = imageFiles.map((file) => toProductFile(file, "products"));
      updates.images = [...keptImages, ...uploadedImages];
      updates.baseImageUrl =
        updates.images[0]?.url ||
        existingProduct.baseImageUrl ||
        existingProduct.configuratorImageUrl ||
        existingProduct.baseDeviceImageUrl ||
        "";
    }

    if (configuratorFile) {
      updates.configuratorImageUrl = toProductFile(configuratorFile, "products").url;
    } else if (p.configuratorImageUrl !== undefined) {
      updates.configuratorImageUrl = normalizeStoredUploadUrl(p.configuratorImageUrl);
    }

    if (baseDeviceFile) {
      updates.baseDeviceImageUrl = toProductFile(baseDeviceFile, "products").url;
    } else if (p.baseDeviceImageUrl !== undefined) {
      updates.baseDeviceImageUrl = normalizeStoredUploadUrl(p.baseDeviceImageUrl);
    }

    if (engravingMaskFile) {
      updates.engravingMaskImageUrl = toProductFile(engravingMaskFile, "products").url;
    } else if (p.engravingMaskImageUrl !== undefined) {
      updates.engravingMaskImageUrl = normalizeStoredUploadUrl(p.engravingMaskImageUrl);
    }

    if (printAreaBackgroundFile) {
      updates.printAreaBackgroundImageUrl = toProductFile(
        printAreaBackgroundFile,
        "products",
      ).url;
    } else if (p.printAreaBackgroundImageUrl !== undefined) {
      updates.printAreaBackgroundImageUrl = normalizeStoredUploadUrl(
        p.printAreaBackgroundImageUrl,
      );
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    );

    const populated = await populateProductQuery(
      Product.findById(product._id).lean(),
    );

    return res.status(200).json({
      success: true,
      product: serializeProduct(populated),
    });
  } catch (err) {
    next(err);
  }
}

// ------------------------
// LIST PRODUCTS
// ------------------------
export async function list(req, res, next) {
  return sendProductList(req, res, next);
}

export async function listConfigurable(req, res, next) {
  return sendProductList(req, res, next, {
    productType: "configurable",
    status: "active",
  });
}

export async function listNormal(req, res, next) {
  return sendProductList(req, res, next, {
    productType: "normal",
    status: "active",
  });
}

export async function listFeatured(req, res, next) {
  return sendProductList(req, res, next, {
    featured: true,
    status: "active",
  });
}

// ------------------------
// GET PRODUCT
// ------------------------
export async function getById(req, res, next) {
  try {
    const product = await populateProductQuery(
      Product.findById(req.params.id).lean(),
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product: serializeProduct(product) });
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req, res, next) {
  try {
    const product = await populateProductQuery(
      Product.findOne({ slug: req.params.slug }).lean(),
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product: serializeProduct(product) });
  } catch (err) {
    next(err);
  }
}

// ------------------------
// DELETE PRODUCT
// ------------------------
export async function remove(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

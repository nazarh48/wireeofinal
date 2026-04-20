// src/controllers/productsController.js
import { Product } from "../models/Product.js";
import { Range } from "../models/Range.js";
import { optimizeImageAtUrl } from "../services/imageService.js";
import { parseProductFormBody, firstFormValue } from "../utils/productBodyParser.js";

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
  return isNaN(n) ? fallback : n;
}

function buildProductListFilter(req, enforcedFilter = {}) {
  const filter = {};

  if (req.query.range) filter.range = req.query.range;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.productType) filter.productType = req.query.productType;
  if (req.query.featured !== undefined) filter.featured = parseBool(req.query.featured);

  return { ...filter, ...enforcedFilter };
}

async function sendProductList(req, res, next, enforcedFilter = {}) {
  try {
    const filter = buildProductListFilter(req, enforcedFilter);
    const products = await Product.find(filter)
      .populate("range", "name description status")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, products });
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

// ------------------------
// File helper
// ------------------------
function toProductFile(f, dir, customLabel) {
  const base = dir === "products" ? "/uploads/products" : "/uploads/product-files";
  return {
    url: `${base}/${f.filename}`,
    filename: f.filename,
    originalName: f.originalname || "",
    label: customLabel !== undefined && customLabel !== "" ? String(customLabel) : (f.originalname || ""),
  };
}

// ------------------------
// CREATE PRODUCT
// ------------------------
export async function create(req, res, next) {
  try {
    const p = parseProductFormBody(req.body);

    const rangeObj = await Range.findById(p.range);
    if (!rangeObj) return res.status(400).json({ success: false, message: "Range not found" });

    const { printingEnabled, laserEnabled, backgroundCustomizable } = resolveModes(p.printingEnabled, p.laserEnabled);

    // Parse all booleans & numbers
    const productData = {
      name: p.name,
      productCode: p.productCode ?? "",
      description: p.description ?? "",
      technicalDetails: p.technicalDetails ?? "",
      range: p.range,
      isConfigurable: parseBool(p.isConfigurable, true),
      productType: parseBool(p.isConfigurable, true) ? "configurable" : "normal",
      status: p.status || "active",
      featured: parseBool(p.featured, false),
      printingEnabled,
      laserEnabled,
      backgroundCustomizable,
      backgroundEnabled: parseBool(p.backgroundEnabled, true),
      iconsTextEnabled: parseBool(p.iconsTextEnabled, true),
      photoCroppingEnabled: parseBool(p.photoCroppingEnabled, true),
      photoCroppingHeightPx: parseNumber(p.photoCroppingHeightPx),
      photoCroppingWidthPx: parseNumber(p.photoCroppingWidthPx),
    };

    // Handle uploaded files
    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : [];
    const configuratorFile = req.files?.configuratorImage?.[0] || null;
    const baseDeviceFile = req.files?.baseDeviceImage?.[0] || null;
    const engravingMaskFile = req.files?.engravingMaskImage?.[0] || null;
    const printAreaBackgroundFile = req.files?.printAreaBackgroundImage?.[0] || null;

    const images = imageFiles.map((f) => toProductFile(f, "products"));
    const configuratorUrl = configuratorFile ? toProductFile(configuratorFile, "products").url : (p.configuratorImageUrl || "");
    const baseDeviceUrl = baseDeviceFile ? toProductFile(baseDeviceFile, "products").url : (p.baseDeviceImageUrl || configuratorUrl || "");
    const engravingMaskUrl = engravingMaskFile ? toProductFile(engravingMaskFile, "products").url : (p.engravingMaskImageUrl || "");
    const printAreaBackgroundUrl = printAreaBackgroundFile ? toProductFile(printAreaBackgroundFile, "products").url : (p.printAreaBackgroundImageUrl || "");
    const primaryUrl = images[0]?.url || p.baseImageUrl || configuratorUrl || baseDeviceUrl || "";

    productData.baseImageUrl = primaryUrl;
    productData.configuratorImageUrl = configuratorUrl;
    productData.baseDeviceImageUrl = baseDeviceUrl;
    productData.engravingMaskImageUrl = engravingMaskUrl;
    productData.printAreaBackgroundImageUrl = printAreaBackgroundUrl;
    productData.images = images;

    const product = await Product.create(productData);
    await product.populate("range", "name description status");

    // Optimize images asynchronously
    const urlsToOptimize = [...images.map((img) => img.url), configuratorUrl, baseDeviceUrl, engravingMaskUrl, printAreaBackgroundUrl].filter(Boolean);
    Promise.all(urlsToOptimize.map((u) => optimizeImageAtUrl(u))).catch(() => {});

    return res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

// ------------------------
// UPDATE PRODUCT
// ------------------------
export async function update(req, res, next) {
  try {
    const p = parseProductFormBody(req.body);

    const updates = {
      name: p.name,
      productCode: p.productCode,
      description: p.description,
      technicalDetails: p.technicalDetails,
      status: p.status,
      featured: parseBool(p.featured, false),
      isConfigurable: parseBool(p.isConfigurable, true),
      productType: parseBool(p.isConfigurable, true) ? "configurable" : "normal",
      printingEnabled: parseBool(p.printingEnabled, true),
      laserEnabled: parseBool(p.laserEnabled, false),
      backgroundCustomizable: parseBool(p.printingEnabled, true),
      backgroundEnabled: parseBool(p.backgroundEnabled, true),
      iconsTextEnabled: parseBool(p.iconsTextEnabled, true),
      photoCroppingEnabled: parseBool(p.photoCroppingEnabled, true),
      photoCroppingHeightPx: parseNumber(p.photoCroppingHeightPx),
      photoCroppingWidthPx: parseNumber(p.photoCroppingWidthPx),
    };

    // File handling
    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : [];
    const configuratorFile = req.files?.configuratorImage?.[0] || null;
    const baseDeviceFile = req.files?.baseDeviceImage?.[0] || null;
    const engravingMaskFile = req.files?.engravingMaskImage?.[0] || null;
    const printAreaBackgroundFile = req.files?.printAreaBackgroundImage?.[0] || null;

    if (imageFiles.length) updates.images = imageFiles.map((f) => toProductFile(f, "products"));
    if (configuratorFile) updates.configuratorImageUrl = toProductFile(configuratorFile, "products").url;
    if (baseDeviceFile) updates.baseDeviceImageUrl = toProductFile(baseDeviceFile, "products").url;
    if (engravingMaskFile) updates.engravingMaskImageUrl = toProductFile(engravingMaskFile, "products").url;
    if (printAreaBackgroundFile) updates.printAreaBackgroundImageUrl = toProductFile(printAreaBackgroundFile, "products").url;

    if (p.range) {
      const r = await Range.findById(p.range);
      if (!r) return res.status(400).json({ success: false, message: "Range not found" });
      updates.range = p.range;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true }).populate("range", "name description status").lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({ success: true, product });
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
// GET PRODUCT BY ID
// ------------------------
export async function getById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate("range", "name description status").lean();
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, product });
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
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, message: "Product deleted" });
  } catch (err) {
    next(err);
  }
}

import { Product } from "../models/Product.js";
import { Range } from "../models/Range.js";
import { optimizeImageAtUrl } from "../services/imageService.js";
import { getFromCache, setInCache } from "../utils/simpleCache.js";

function buildProductFilter(query) {
  const filter = {};
  if (query.range) filter.range = query.range;
  if (query.status) filter.status = query.status;
  if (query.productType) filter.productType = query.productType;
  if (query.featured !== undefined) filter.featured = query.featured === true || query.featured === "true" || query.featured === "1";
  return filter;
}

function toProductFile(f, dir, customLabel) {
  const base = dir === "products" ? "/uploads/products" : "/uploads/product-files";
  return {
    url: `${base}/${f.filename}`,
    filename: f.filename,
    originalName: f.originalname || "",
    label: customLabel !== undefined && customLabel !== "" ? String(customLabel) : (f.originalname || ""),
  };
}

export async function create(req, res, next) {
  try {
    const {
      name,
      productCode,
      description,
      technicalDetails,
      range,
      baseImageUrl,
      configuratorImageUrl,
      baseDeviceImageUrl,
      engravingMaskImageUrl,
      isConfigurable,
      status,
      featured,
      printingEnabled,
      laserEnabled,
      backgroundCustomizable,
    } = req.body;
    const r = await Range.findById(range);
    if (!r) return res.status(400).json({ success: false, message: "Range not found" });
    // Treat missing/undefined/false/0/"0"/"false" as non-configurable so product shows on Products page
    const boolConfigurable =
      isConfigurable === true ||
      isConfigurable === "true" ||
      isConfigurable === "1" ||
      isConfigurable === 1;
    const productType = boolConfigurable ? "configurable" : "normal";

    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : Array.isArray(req.files) ? req.files : [];
    const configuratorFile = Array.isArray(req.files?.configuratorImage) && req.files.configuratorImage[0]
      ? req.files.configuratorImage[0]
      : null;
    const baseDeviceFile = Array.isArray(req.files?.baseDeviceImage) && req.files.baseDeviceImage[0]
      ? req.files.baseDeviceImage[0]
      : null;
    const engravingMaskFile = Array.isArray(req.files?.engravingMaskImage) && req.files.engravingMaskImage[0]
      ? req.files.engravingMaskImage[0]
      : null;
    const fileFiles = Array.isArray(req.files?.files) ? req.files.files : [];
    const images = imageFiles.map((f) => toProductFile(f, "products"));
    const configuratorUrl = configuratorFile ? toProductFile(configuratorFile, "products").url : (configuratorImageUrl || "");
    const baseDeviceUrl = baseDeviceFile ? toProductFile(baseDeviceFile, "products").url : (baseDeviceImageUrl || configuratorUrl || "");
    const engravingMaskUrl = engravingMaskFile ? toProductFile(engravingMaskFile, "products").url : (engravingMaskImageUrl || "");
    const primaryUrl = images[0]?.url || baseImageUrl || configuratorUrl || baseDeviceUrl || "";
    let fileLabels = [];
    if (typeof req.body.fileLabels === "string" && req.body.fileLabels.trim()) {
      try {
        const parsed = JSON.parse(req.body.fileLabels);
        if (Array.isArray(parsed)) fileLabels = parsed;
      } catch (_) { }
    }
    const downloadableFiles = fileFiles.map((f, i) =>
      toProductFile(f, "product-files", fileLabels[i]),
    );

    const product = await Product.create({
      name,
      productCode: productCode || "",
      description: description || "",
      technicalDetails: technicalDetails || "",
      range,
      baseImageUrl: primaryUrl,
      configuratorImageUrl: configuratorUrl,
      baseDeviceImageUrl: baseDeviceUrl,
      engravingMaskImageUrl: engravingMaskUrl,
      images,
      isConfigurable: !!boolConfigurable,
      productType,
      status: status || "active",
      featured: featured === true || featured === "true" || featured === "1",
      printingEnabled:
        printingEnabled === undefined
          ? true
          : printingEnabled === true ||
            printingEnabled === "true" ||
            printingEnabled === "1",
      laserEnabled:
        laserEnabled === undefined
          ? true
          : laserEnabled === true ||
            laserEnabled === "true" ||
            laserEnabled === "1",
      backgroundCustomizable:
        backgroundCustomizable === undefined
          ? true
          : backgroundCustomizable === true ||
            backgroundCustomizable === "true" ||
            backgroundCustomizable === "1",
      downloadableFiles: downloadableFiles.length ? downloadableFiles : undefined,
    });
    await product.populate("range", "name description status");

    const urlsToOptimize = [
      ...images.map((img) => img.url),
      configuratorUrl,
      baseDeviceUrl,
      engravingMaskUrl,
    ].filter(Boolean);
    Promise.all(urlsToOptimize.map((u) => optimizeImageAtUrl(u))).catch(() => {});
    return res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const filter = buildProductFilter(req.query);
    const cacheKey = `products:list:${JSON.stringify(filter)}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const products = await Product.find(filter)
      .populate("range", "name description status")
      .sort({ createdAt: -1 })
      .lean();

    const payload = { success: true, products };
    setInCache(cacheKey, payload, 10000);
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function listConfigurable(req, res, next) {
  try {
    const filter = { productType: "configurable", status: "active" };
    if (req.query.range) filter.range = req.query.range;
    if (req.query.featured !== undefined) filter.featured = req.query.featured === true || req.query.featured === "true" || req.query.featured === "1";
    const cacheKey = `products:configurable:${JSON.stringify(filter)}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const products = await Product.find(filter)
      .populate("range", "name description status")
      .sort({ createdAt: -1 })
      .lean();

    const payload = { success: true, products };
    setInCache(cacheKey, payload, 10000);
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function listNormal(req, res, next) {
  try {
    const filter = { productType: "normal", status: "active" };
    if (req.query.range) filter.range = req.query.range;
    if (req.query.featured !== undefined) filter.featured = req.query.featured === true || req.query.featured === "true" || req.query.featured === "1";
    const cacheKey = `products:normal:${JSON.stringify(filter)}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const products = await Product.find(filter)
      .populate("range", "name description status")
      .sort({ createdAt: -1 })
      .lean();

    const payload = { success: true, products };
    setInCache(cacheKey, payload, 10000);
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function listFeatured(req, res, next) {
  try {
    const filter = { featured: true, status: "active" };
    const cacheKey = `products:featured`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const products = await Product.find(filter)
      .populate("range", "name description status")
      .sort({ createdAt: -1 })
      .lean();

    const payload = { success: true, products };
    setInCache(cacheKey, payload, 10000);
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id).populate("range", "name description status").lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

function parseBodyFiles(bodyFiles) {
  if (Array.isArray(bodyFiles)) return bodyFiles;
  if (typeof bodyFiles === "string" && bodyFiles.trim()) {
    try {
      const parsed = JSON.parse(bodyFiles);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normaliseUploadUrl(input) {
  if (!input || typeof input !== "string") return "";
  let pathname = input;
  try {
    const parsedUrl = new URL(input);
    pathname = parsedUrl.pathname || input;
  } catch {
    // keep as-is (already relative)
  }
  // Frontend may send absolute URLs under /api/uploads; store as /uploads to match create()
  if (pathname.startsWith("/api/uploads/")) return pathname.replace(/^\/api\/uploads\//, "/uploads/");
  return pathname;
}

function basenameFromPath(p) {
  if (!p || typeof p !== "string") return "";
  const clean = p.split("?")[0].split("#")[0];
  const parts = clean.split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}

export async function update(req, res, next) {
  try {
    const {
      name,
      productCode,
      description,
      technicalDetails,
      range,
      baseImageUrl,
      configuratorImageUrl,
      isConfigurable,
      status,
      featured,
      downloadableFiles: bodyFilesRaw,
      baseDeviceImageUrl,
      engravingMaskImageUrl,
      printingEnabled,
      laserEnabled,
      backgroundCustomizable,
    } = req.body;
    const bodyFiles = parseBodyFiles(bodyFilesRaw);
    if (range !== undefined) {
      const r = await Range.findById(range);
      if (!r) return res.status(400).json({ success: false, message: "Range not found" });
    }
    const configuratorFile = Array.isArray(req.files?.configuratorImage) && req.files.configuratorImage[0]
      ? req.files.configuratorImage[0]
      : null;
    const baseDeviceFile = Array.isArray(req.files?.baseDeviceImage) && req.files.baseDeviceImage[0]
      ? req.files.baseDeviceImage[0]
      : null;
    const engravingMaskFile = Array.isArray(req.files?.engravingMaskImage) && req.files.engravingMaskImage[0]
      ? req.files.engravingMaskImage[0]
      : null;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (productCode !== undefined) updates.productCode = productCode;
    if (description !== undefined) updates.description = description;
    if (technicalDetails !== undefined) updates.technicalDetails = technicalDetails;
    if (range !== undefined) updates.range = range;
    if (baseImageUrl !== undefined) updates.baseImageUrl = baseImageUrl;
    if (configuratorFile) updates.configuratorImageUrl = toProductFile(configuratorFile, "products").url;
    else if (configuratorImageUrl !== undefined) updates.configuratorImageUrl = configuratorImageUrl;
    if (baseDeviceFile) updates.baseDeviceImageUrl = toProductFile(baseDeviceFile, "products").url;
    else if (baseDeviceImageUrl !== undefined) updates.baseDeviceImageUrl = baseDeviceImageUrl;
    if (engravingMaskFile) updates.engravingMaskImageUrl = toProductFile(engravingMaskFile, "products").url;
    else if (engravingMaskImageUrl !== undefined) updates.engravingMaskImageUrl = engravingMaskImageUrl;
    if (isConfigurable !== undefined) {
      const boolConfigurable =
        isConfigurable === true ||
        isConfigurable === "true" ||
        isConfigurable === "1" ||
        isConfigurable === 1;
      updates.isConfigurable = !!boolConfigurable;
      updates.productType = boolConfigurable ? "configurable" : "normal";
    }
    if (status !== undefined) updates.status = status;
    if (featured !== undefined) updates.featured = featured === true || featured === "true" || featured === "1";
    if (printingEnabled !== undefined) {
      updates.printingEnabled =
        printingEnabled === true ||
        printingEnabled === "true" ||
        printingEnabled === "1";
    }
    if (laserEnabled !== undefined) {
      updates.laserEnabled =
        laserEnabled === true ||
        laserEnabled === "true" ||
        laserEnabled === "1";
    }
    if (backgroundCustomizable !== undefined) {
      updates.backgroundCustomizable =
        backgroundCustomizable === true ||
        backgroundCustomizable === "true" ||
        backgroundCustomizable === "1";
    }

    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : Array.isArray(req.files) ? req.files : [];
    const fileFiles = Array.isArray(req.files?.files) ? req.files.files : [];

    // Parse the kept existing image URLs sent by the client
    let keptExistingImages = [];
    const rawExisting = req.body.existingImages;
    if (typeof rawExisting === "string" && rawExisting.trim()) {
      try {
        const parsed = JSON.parse(rawExisting);
        if (Array.isArray(parsed)) {
          keptExistingImages = parsed
            .filter((u) => typeof u === "string" && u)
            .map((u) => {
              // Normalise absolute URLs to stored relative paths (e.g. /uploads/products/xxx)
              const pathname = normaliseUploadUrl(u);
              const filename = basenameFromPath(pathname);
              // Ensure all required image fields are present so Mongoose validation passes
              return {
                url: pathname,
                filename,
                originalName: filename,
              };
            })
            .filter((img) => img.url && img.filename);
        }
      } catch (_) { }
    }

    if (imageFiles.length || rawExisting !== undefined) {
      const newImages = imageFiles.map((f) => toProductFile(f, "products"));
      // Merge: kept existing first, then newly uploaded
      updates.images = [...keptExistingImages, ...newImages];
      if (!updates.baseImageUrl) updates.baseImageUrl = updates.images[0]?.url || "";
    }
    if (fileFiles.length) {
      const existingRaw = parseBodyFiles(bodyFilesRaw);
      const existing = existingRaw
        .map((f) => {
          if (typeof f === "string") {
            const url = normaliseUploadUrl(f);
            const filename = basenameFromPath(url);
            return filename
              ? { url, filename, originalName: filename, label: filename }
              : null;
          }
          if (f && typeof f === "object") {
            const url = normaliseUploadUrl(f.url || "");
            const filename = String(f.filename || basenameFromPath(url) || f.originalName || "").trim();
            if (!url || !filename) return null;
            const originalName = String(f.originalName || filename).trim();
            const label = String(f.label || originalName || filename).trim();
            return { url, filename, originalName, label };
          }
          return null;
        })
        .filter(Boolean);
      let fileLabels = [];
      const rawLabels = req.body.fileLabels;
      if (typeof rawLabels === "string" && rawLabels.trim()) {
        try {
          fileLabels = JSON.parse(rawLabels);
          if (!Array.isArray(fileLabels)) fileLabels = [];
        } catch {
          fileLabels = [];
        }
      } else if (Array.isArray(rawLabels)) fileLabels = rawLabels;
      const newFiles = fileFiles.map((f, i) => toProductFile(f, "product-files", fileLabels[i]));
      updates.downloadableFiles = [...existing, ...newFiles];
    } else if (bodyFilesRaw !== undefined) {
      const parsedRaw = parseBodyFiles(bodyFilesRaw);
      const parsed = parsedRaw
        .map((f) => {
          if (typeof f === "string") {
            const url = normaliseUploadUrl(f);
            const filename = basenameFromPath(url);
            return filename
              ? { url, filename, originalName: filename, label: filename }
              : null;
          }
          if (f && typeof f === "object") {
            const url = normaliseUploadUrl(f.url || "");
            const filename = String(f.filename || basenameFromPath(url) || f.originalName || "").trim();
            if (!url || !filename) return null;
            const originalName = String(f.originalName || filename).trim();
            const label = String(f.label || originalName || filename).trim();
            return { url, filename, originalName, label };
          }
          return null;
        })
        .filter(Boolean);
      updates.downloadableFiles = parsed;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true })
      .populate("range", "name description status")
      .lean();
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

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

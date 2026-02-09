import { Product } from "../models/Product.js";
import { Range } from "../models/Range.js";

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
    const { name, description, range, baseImageUrl, isConfigurable, status, featured } = req.body;
    const r = await Range.findById(range);
    if (!r) return res.status(400).json({ success: false, message: "Range not found" });
    const boolConfigurable =
      isConfigurable === true ||
      isConfigurable === "true" ||
      isConfigurable === "1" ||
      isConfigurable === 1;
    const productType = boolConfigurable ? "configurable" : "normal";

    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : Array.isArray(req.files) ? req.files : [];
    const fileFiles = Array.isArray(req.files?.files) ? req.files.files : [];
    const images = imageFiles.map((f) => toProductFile(f, "products"));
    const primaryUrl = images[0]?.url || baseImageUrl || "";
    const downloadableFiles = fileFiles.map((f) => toProductFile(f, "product-files"));
    const product = await Product.create({
      name,
      description: description || "",
      range,
      baseImageUrl: primaryUrl,
      images,
      isConfigurable: !!boolConfigurable,
      productType,
      status: status || "active",
      featured: featured === true || featured === "true" || featured === "1",
      downloadableFiles: downloadableFiles.length ? downloadableFiles : undefined,
    });
    await product.populate("range", "name description status");
    return res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const filter = buildProductFilter(req.query);
    const products = await Product.find(filter).populate("range", "name description status").sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
}

export async function listConfigurable(req, res, next) {
  try {
    const filter = { productType: "configurable", status: "active" };
    if (req.query.range) filter.range = req.query.range;
    if (req.query.featured !== undefined) filter.featured = req.query.featured === true || req.query.featured === "true" || req.query.featured === "1";
    const products = await Product.find(filter).populate("range", "name description status").sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
}

export async function listNormal(req, res, next) {
  try {
    const filter = { productType: "normal", status: "active" };
    if (req.query.range) filter.range = req.query.range;
    if (req.query.featured !== undefined) filter.featured = req.query.featured === true || req.query.featured === "true" || req.query.featured === "1";
    const products = await Product.find(filter).populate("range", "name description status").sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
}

export async function listFeatured(req, res, next) {
  try {
    const filter = { featured: true, status: "active" };
    const products = await Product.find(filter).populate("range", "name description status").sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, products });
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

export async function update(req, res, next) {
  try {
    const { name, description, range, baseImageUrl, isConfigurable, status, featured, downloadableFiles: bodyFilesRaw } = req.body;
    const bodyFiles = parseBodyFiles(bodyFilesRaw);
    if (range !== undefined) {
      const r = await Range.findById(range);
      if (!r) return res.status(400).json({ success: false, message: "Range not found" });
    }
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (range !== undefined) updates.range = range;
    if (baseImageUrl !== undefined) updates.baseImageUrl = baseImageUrl;
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

    const imageFiles = Array.isArray(req.files?.images) ? req.files.images : Array.isArray(req.files) ? req.files : [];
    const fileFiles = Array.isArray(req.files?.files) ? req.files.files : [];
    if (imageFiles.length) {
      const images = imageFiles.map((f) => toProductFile(f, "products"));
      updates.images = images;
      if (!updates.baseImageUrl) updates.baseImageUrl = images[0]?.url || "";
    }
    if (fileFiles.length) {
      const existing = parseBodyFiles(bodyFilesRaw);
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
      const parsed = parseBodyFiles(bodyFilesRaw);
      if (parsed.length >= 0) updates.downloadableFiles = parsed;
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

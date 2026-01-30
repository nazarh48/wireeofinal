import { Product } from "../models/Product.js";
import { Range } from "../models/Range.js";

function buildProductFilter(query) {
  const filter = {};
  if (query.range) filter.range = query.range;
  if (query.status) filter.status = query.status;
  if (query.productType) filter.productType = query.productType;
  return filter;
}

export async function create(req, res, next) {
  try {
    const { name, description, range, baseImageUrl, isConfigurable, status } = req.body;
    const r = await Range.findById(range);
    if (!r) return res.status(400).json({ success: false, message: "Range not found" });
    const boolConfigurable =
      isConfigurable === true ||
      isConfigurable === "true" ||
      isConfigurable === "1" ||
      isConfigurable === 1;
    const productType = boolConfigurable ? "configurable" : "normal";

    const files = Array.isArray(req.files) ? req.files : [];
    const images = files.map((f) => ({
      url: `/uploads/products/${f.filename}`,
      filename: f.filename,
      originalName: f.originalname || "",
    }));
    const primaryUrl = images[0]?.url || baseImageUrl || "";
    const product = await Product.create({
      name,
      description: description || "",
      range,
      baseImageUrl: primaryUrl,
      images,
      isConfigurable: !!boolConfigurable,
      productType,
      status: status || "active",
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

export async function update(req, res, next) {
  try {
    const { name, description, range, baseImageUrl, isConfigurable, status } = req.body;
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

    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length) {
      const images = files.map((f) => ({
        url: `/uploads/products/${f.filename}`,
        filename: f.filename,
        originalName: f.originalname || "",
      }));
      updates.images = images;
      if (!updates.baseImageUrl) updates.baseImageUrl = images[0]?.url || "";
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

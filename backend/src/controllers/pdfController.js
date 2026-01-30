import { PDFConfig } from "../models/PDFConfig.js";
import { ensureConfigurable } from "../services/productService.js";

export async function create(req, res, next) {
  try {
    const { projectId, products, pdfSettings } = req.body;
    const productIds = (products || []).map((p) => p.product ?? p.productId ?? p).filter(Boolean);
    if (productIds.length) await ensureConfigurable(productIds);

    const config = await PDFConfig.create({
      projectId: projectId || null,
      products: products || [],
      pdfSettings: pdfSettings || {},
      createdBy: req.user._id,
    });
    await config.populate("products.product", "name description baseImageUrl isConfigurable productType");
    return res.status(201).json({ success: true, config });
  } catch (err) {
    if (err.message?.startsWith("Only configurable")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const configs = await PDFConfig.find({ createdBy: req.user._id })
      .populate("products.product", "name description baseImageUrl")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, configs });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const config = await PDFConfig.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate("products.product", "name description baseImageUrl isConfigurable productType")
      .lean();
    if (!config) {
      return res.status(404).json({ success: false, message: "PDF configuration not found" });
    }
    return res.status(200).json({ success: true, config });
  } catch (err) {
    next(err);
  }
}

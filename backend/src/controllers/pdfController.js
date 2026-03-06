import { PDFConfig } from "../models/PDFConfig.js";
import { ensureConfigurable } from "../services/productService.js";

export async function create(req, res, next) {
  try {
    const { projectId, projectName, productCount, products, pdfSettings } = req.body;
    const count = Number(productCount) || 0;
    // Only validate configurability for ad-hoc exports (no projectId).
    // When projectId is present the products were already validated when added to the project.
    if (!projectId) {
      const productIds = (products || []).map((p) => p.product ?? p.productId ?? p).filter(Boolean);
      if (productIds.length) await ensureConfigurable(productIds);
    }

    let config;
    if (projectId) {
      config = await PDFConfig.findOneAndUpdate(
        { projectId, createdBy: req.user._id },
        {
          $set: {
            projectName: (projectName || "Unnamed Project").trim(),
            productCount: Math.max(0, count),
            lastExportedAt: new Date(),
            products: Array.isArray(products) ? products : [],
            pdfSettings: pdfSettings || {},
          }
        },
        { new: true, upsert: true }
      );
    } else {
      config = await PDFConfig.create({
        projectId: null,
        projectName: (projectName || "Unnamed Project").trim(),
        productCount: Math.max(0, count),
        lastExportedAt: new Date(),
        products: Array.isArray(products) ? products : [],
        pdfSettings: pdfSettings || {},
        createdBy: req.user._id,
      });
    }
    await config.populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl images isConfigurable productType productCode sku");
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
      .populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl images isConfigurable productType productCode sku")
      .lean();
    if (!config) {
      return res.status(404).json({ success: false, message: "PDF configuration not found" });
    }
    return res.status(200).json({ success: true, config });
  } catch (err) {
    next(err);
  }
}

export async function updateLastExported(req, res, next) {
  try {
    const config = await PDFConfig.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: { lastExportedAt: new Date() } },
      { new: true }
    ).lean();
    if (!config) {
      return res.status(404).json({ success: false, message: "PDF configuration not found" });
    }
    return res.status(200).json({ success: true, config });
  } catch (err) {
    next(err);
  }
}

export async function reExport(req, res, next) {
  try {
    const config = await PDFConfig.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      {
        $set: { lastExportedAt: new Date() },
        $inc: { reExportCount: 1 }
      },
      { new: true }
    )
      .populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl images isConfigurable productType productCode sku")
      .lean();

    if (!config) {
      return res.status(404).json({ success: false, message: "PDF configuration not found" });
    }
    return res.status(200).json({ success: true, config });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const deleted = await PDFConfig.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "PDF configuration not found" });
    }
    return res.status(200).json({ success: true, message: "PDF configuration deleted" });
  } catch (err) {
    next(err);
  }
}

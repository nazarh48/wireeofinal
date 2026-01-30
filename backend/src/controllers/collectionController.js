import { Collection } from "../models/Collection.js";
import { Product } from "../models/Product.js";
import { ensureConfigurable } from "../services/productService.js";

export async function addToCollection(req, res, next) {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ success: false, message: "productIds array required" });
    }
    await ensureConfigurable(productIds);

    let collection = await Collection.findOne({ createdBy: req.user._id });
    if (!collection) {
      collection = await Collection.create({ name: "My Collection", createdBy: req.user._id, configurableProducts: [] });
    }

    const existing = new Set(collection.configurableProducts.map((p) => p.product.toString()));
    for (const pid of productIds) {
      if (existing.has(pid)) continue;
      collection.configurableProducts.push({
        product: pid,
        instanceId: `inst_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      });
      existing.add(pid);
    }
    await collection.save();
    await collection.populate("configurableProducts.product", "name description baseImageUrl isConfigurable productType");
    return res.status(200).json({ success: true, collection });
  } catch (err) {
    if (err.message?.startsWith("Only configurable")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function getMyCollection(req, res, next) {
  try {
    let collection = await Collection.findOne({ createdBy: req.user._id }).populate(
      "configurableProducts.product",
      "name description baseImageUrl isConfigurable productType range"
    );
    if (!collection) {
      collection = { configurableProducts: [], name: "My Collection" };
    }
    return res.status(200).json({ success: true, collection });
  } catch (err) {
    next(err);
  }
}

export async function removeFromCollection(req, res, next) {
  try {
    const { instanceId } = req.params;
    const collection = await Collection.findOne({ createdBy: req.user._id });
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }
    collection.configurableProducts = collection.configurableProducts.filter(
      (p) => p.instanceId !== instanceId
    );
    await collection.save();
    return res.status(200).json({ success: true, message: "Removed from collection" });
  } catch (err) {
    next(err);
  }
}

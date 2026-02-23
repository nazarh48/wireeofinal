import { Collection } from "../models/Collection.js";
import { ensureConfigurable } from "../services/productService.js";
import { CanvasEdit } from "../models/CanvasEdit.js";
import crypto from "crypto";

const makeInstanceId = () =>
  `inst_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

const buildInstanceObjectId = (instanceId) =>
  crypto.createHash("sha1").update(String(instanceId || "")).digest("hex").slice(0, 24);

const deepClone = (value) => JSON.parse(JSON.stringify(value ?? null));

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

    // Allow same product multiple times: each add gets its own instanceId (independent edits per instance).
    for (const pid of productIds) {
      collection.configurableProducts.push({
        product: pid,
        instanceId: `inst_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      });
    }
    await collection.save();
    await collection.populate(
      "configurableProducts.product",
      "name description productCode sku baseImageUrl configuratorImageUrl isConfigurable productType",
    );
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
    let collection = await Collection.findOne({
      createdBy: req.user._id,
    }).populate(
      "configurableProducts.product",
      "name description productCode sku baseImageUrl configuratorImageUrl isConfigurable productType range",
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

export async function duplicateCollectionItem(req, res, next) {
  try {
    const { instanceId } = req.params;
    const collection = await Collection.findOne({ createdBy: req.user._id });
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }

    const sourceItem = (collection.configurableProducts || []).find(
      (item) => item.instanceId === instanceId,
    );
    if (!sourceItem) {
      return res.status(404).json({ success: false, message: "Collection item not found" });
    }

    const newInstanceId = makeInstanceId();
    const newItem = {
      product: sourceItem.product,
      instanceId: newInstanceId,
      addedAt: new Date(),
    };
    collection.configurableProducts.push(newItem);
    await collection.save();

    // Deep-copy instance canvas edit to keep duplicate fully independent.
    const sourceEdit = await CanvasEdit.findOne({
      instanceId,
      createdBy: req.user._id,
    }).lean();
    if (sourceEdit) {
      const copied = {
        canvasData: deepClone(sourceEdit.canvasData) || [],
        textOverlays: deepClone(sourceEdit.textOverlays) || [],
        layoutConfig: deepClone(sourceEdit.layoutConfig) || {},
        editedImage: deepClone(sourceEdit.editedImage),
      };
      await CanvasEdit.findOneAndUpdate(
        { instanceId: newInstanceId, createdBy: req.user._id },
        {
          $set: {
            productId: buildInstanceObjectId(newInstanceId),
            instanceId: newInstanceId,
            originalProductId: sourceEdit.originalProductId || sourceItem.product,
            ...copied,
          },
        },
        { upsert: true, new: true, runValidators: true },
      );
    }

    await collection.populate(
      "configurableProducts.product",
      "name description productCode sku baseImageUrl configuratorImageUrl isConfigurable productType range",
    );

    const duplicated = collection.configurableProducts.find(
      (item) => item.instanceId === newInstanceId,
    );
    return res.status(201).json({
      success: true,
      message: "Collection item duplicated",
      item: duplicated,
      sourceInstanceId: instanceId,
      newInstanceId,
    });
  } catch (err) {
    next(err);
  }
}

import { CanvasEdit } from "../models/CanvasEdit.js";
import crypto from "crypto";

const buildInstanceObjectId = (instanceId) =>
  crypto.createHash("sha1").update(String(instanceId || "")).digest("hex").slice(0, 24);

export async function save(req, res, next) {
  try {
    const { productId, canvasData, textOverlays, layoutConfig } = req.body;
    const edit = await CanvasEdit.findOneAndUpdate(
      { productId, createdBy: req.user._id, instanceId: { $exists: false } },
      { $set: { canvasData: canvasData || {}, textOverlays: textOverlays || {}, layoutConfig: layoutConfig || {} } },
      { new: true, upsert: true, runValidators: true }
    );
    return res.status(200).json({ success: true, edit });
  } catch (err) {
    next(err);
  }
}

export async function getByProduct(req, res, next) {
  try {
    const edit = await CanvasEdit.findOne({
      productId: req.params.productId,
      createdBy: req.user._id,
      instanceId: { $exists: false },
    }).lean();
    if (!edit) {
      return res.status(200).json({ success: true, edit: null });
    }
    return res.status(200).json({ success: true, edit });
  } catch (err) {
    next(err);
  }
}

// Instance-level canvas edit endpoints
export async function saveInstance(req, res, next) {
  try {
    const { instanceId, productId, canvasData, textOverlays, layoutConfig, editedImage } = req.body;
    const instanceProductId = buildInstanceObjectId(instanceId);
    const normalizedEditedImage =
      editedImage && typeof editedImage === "object" && typeof editedImage.value === "string"
        ? editedImage.value.length > 1_500_000
          ? null
          : editedImage
        : null;

    const edit = await CanvasEdit.findOneAndUpdate(
      { instanceId, createdBy: req.user._id },
      {
        $set: {
          // Keep instance edits isolated from product-level unique index by using a deterministic
          // per-instance ObjectId surrogate in productId, while preserving the real product id.
          productId: instanceProductId,
          instanceId,
          originalProductId: productId,
          canvasData: canvasData || {},
          textOverlays: textOverlays || {},
          layoutConfig: layoutConfig || {},
          editedImage: normalizedEditedImage,
        }
      },
      { new: true, upsert: true, runValidators: true }
    );
    return res.status(200).json({ success: true, edit });
  } catch (err) {
    next(err);
  }
}

export async function getByInstance(req, res, next) {
  try {
    const edit = await CanvasEdit.findOne({
      instanceId: req.params.instanceId,
      createdBy: req.user._id,
    }).lean();
    if (!edit) {
      return res.status(200).json({ success: true, edit: null });
    }
    return res.status(200).json({ success: true, edit });
  } catch (err) {
    next(err);
  }
}

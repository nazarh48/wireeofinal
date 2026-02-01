import { CanvasEdit } from "../models/CanvasEdit.js";

export async function save(req, res, next) {
  try {
    const { productId, canvasData, textOverlays, layoutConfig } = req.body;
    const edit = await CanvasEdit.findOneAndUpdate(
      { productId, createdBy: req.user._id },
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

    // Store instance-level edits in a separate collection or use instanceId as key
    // For now, we'll use the same CanvasEdit model but with instanceId as identifier
    const edit = await CanvasEdit.findOneAndUpdate(
      { productId: instanceId, createdBy: req.user._id }, // Using instanceId as productId for instance edits
      {
        $set: {
          canvasData: canvasData || {},
          textOverlays: textOverlays || {},
          layoutConfig: layoutConfig || {},
          metadata: { instanceId, originalProductId: productId, editedImage }
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
      productId: req.params.instanceId, // instanceId stored as productId
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

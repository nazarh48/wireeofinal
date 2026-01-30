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

import mongoose from "mongoose";

const canvasEditSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    canvasData: { type: mongoose.Schema.Types.Mixed, default: {} },
    textOverlays: { type: mongoose.Schema.Types.Mixed, default: {} },
    layoutConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

canvasEditSchema.index({ productId: 1, createdBy: 1 }, { unique: true });

export const CanvasEdit = mongoose.model("CanvasEdit", canvasEditSchema);

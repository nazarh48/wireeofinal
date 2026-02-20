import mongoose from "mongoose";

const canvasEditSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    // When present, this record is tied to a collection/project instance.
    // When absent, it is the legacy product-level edit.
    instanceId: { type: String },
    originalProductId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    canvasData: { type: mongoose.Schema.Types.Mixed, default: {} },
    textOverlays: { type: mongoose.Schema.Types.Mixed, default: {} },
    layoutConfig: { type: mongoose.Schema.Types.Mixed, default: {} },
    editedImage: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

// Legacy unique constraint for product-level edits only (no instanceId)
canvasEditSchema.index(
  { productId: 1, createdBy: 1 },
  {
    unique: true,
    partialFilterExpression: { instanceId: { $exists: false } },
  }
);

// Unique per-instance edits for each user
canvasEditSchema.index(
  { instanceId: 1, createdBy: 1 },
  {
    unique: true,
    partialFilterExpression: { instanceId: { $exists: true } },
  }
);

export const CanvasEdit = mongoose.model("CanvasEdit", canvasEditSchema);

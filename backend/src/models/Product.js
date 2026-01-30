import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    range: { type: mongoose.Schema.Types.ObjectId, ref: "Range", required: true },
    baseImageUrl: { type: String, default: "", trim: true },
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        originalName: { type: String, default: "" },
      },
    ],
    isConfigurable: { type: Boolean, default: false },
    productType: { type: String, enum: ["configurable", "normal"], required: true },
    status: { type: String, enum: ["active", "inactive", "draft"], default: "active" },
  },
  { timestamps: true }
);

productSchema.index({ range: 1 });
productSchema.index({ productType: 1, status: 1 });

export const Product = mongoose.model("Product", productSchema);

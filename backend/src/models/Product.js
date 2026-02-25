import mongoose from "mongoose";

const downloadableFileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    productCode: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    technicalDetails: { type: String, default: "", trim: true },
    range: { type: mongoose.Schema.Types.ObjectId, ref: "Range", required: true },
    baseImageUrl: { type: String, default: "", trim: true },
    // Optional image used specifically inside the Graphic Configurator
    // (personalised canvas) instead of the marketing/base image.
    configuratorImageUrl: { type: String, default: "", trim: true },
    // Configurator device layering (admin-driven)
    baseDeviceImageUrl: { type: String, default: "", trim: true }, // Layer 1
    engravingMaskImageUrl: { type: String, default: "", trim: true }, // Layer 3 (zone mask/overlay)
    printingEnabled: { type: Boolean, default: true },
    laserEnabled: { type: Boolean, default: true },
    backgroundCustomizable: { type: Boolean, default: true },
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
    featured: { type: Boolean, default: false },
    downloadableFiles: [downloadableFileSchema],
  },
  { timestamps: true }
);

productSchema.index({ range: 1 });
productSchema.index({ productType: 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });

export const Product = mongoose.model("Product", productSchema);

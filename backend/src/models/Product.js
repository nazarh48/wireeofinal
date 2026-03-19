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
    // Printing layer (Layer 2): default "print area background" uploaded in admin.
    // Used as the initial background in the configurator when background is enabled.
    printAreaBackgroundImageUrl: { type: String, default: "", trim: true },
    printingEnabled: { type: Boolean, default: true },
    laserEnabled: { type: Boolean, default: true },
    backgroundCustomizable: { type: Boolean, default: true },
    // Printing-only customization options (admin-configurable).
    // When these are undefined (older products), frontend falls back to legacy behaviour
    // to preserve backward compatibility.
    backgroundEnabled: { type: Boolean },
    iconsTextEnabled: { type: Boolean },
    photoCroppingEnabled: { type: Boolean },
    // Cropping dimensions in pixels (required when photoCroppingEnabled is true)
    photoCroppingHeightPx: {
      type: Number,
      validate: {
        validator: function (v) {
          if (!this.photoCroppingEnabled) return true;
          return Number.isInteger(v) && v > 0;
        },
        message: "photoCroppingHeightPx must be a positive integer when photoCroppingEnabled is true",
      },
    },
    photoCroppingWidthPx: {
      type: Number,
      validate: {
        validator: function (v) {
          if (!this.photoCroppingEnabled) return true;
          return Number.isInteger(v) && v > 0;
        },
        message: "photoCroppingWidthPx must be a positive integer when photoCroppingEnabled is true",
      },
    },
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

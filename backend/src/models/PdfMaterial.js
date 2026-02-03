import mongoose from "mongoose";

const pdfMaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: "", trim: true },
    photo: { type: String, default: "", trim: true },
    fileUrl: { type: String, default: "", trim: true },
    fileFilename: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

pdfMaterialSchema.index({ status: 1, order: 1 });

export const PdfMaterial = mongoose.model("PdfMaterial", pdfMaterialSchema);

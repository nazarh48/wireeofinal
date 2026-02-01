import mongoose from "mongoose";

/**
 * PdfExport (PDFConfig) – registry of exported projects for PDF-Configurations tab.
 * One row per exported project. Re-export updates lastExportedAt; project reference used to fetch latest config at re-export time.
 */
const pdfProductSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    instanceId: { type: String },
    edits: {
      elements: { type: mongoose.Schema.Types.Mixed },
      configuration: { type: mongoose.Schema.Types.Mixed },
    },
  },
  { _id: false }
);

const pdfConfigSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    projectName: { type: String, required: true, trim: true },
    productCount: { type: Number, required: true, min: 0 },
    lastExportedAt: { type: Date, default: Date.now },
    reExportCount: { type: Number, default: 0 },
    products: [pdfProductSchema],
    pdfSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const PDFConfig = mongoose.model("PDFConfig", pdfConfigSchema);

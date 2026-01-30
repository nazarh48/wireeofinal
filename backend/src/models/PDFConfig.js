import mongoose from "mongoose";

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
    products: [pdfProductSchema],
    pdfSettings: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const PDFConfig = mongoose.model("PDFConfig", pdfConfigSchema);

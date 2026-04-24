import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: "", trim: true },
    type: { type: String, default: "Guide", trim: true },
    photo: { type: String, default: "", trim: true },
    fileUrl: { type: String, default: "", trim: true },
    fileFilename: { type: String, default: "", trim: true },
    size: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
    collection: "pdfmaterials",
  },
);

resourceSchema.index({ status: 1, order: 1 });

export const Resource =
  mongoose.models.Resource || mongoose.model("Resource", resourceSchema);

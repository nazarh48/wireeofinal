import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    filename: { type: String, required: true },
    originalName: { type: String, default: "" },
    label: { type: String, default: "" },
  },
  { _id: false }
);

const solutionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: "", trim: true },
    image: { type: String, default: "", trim: true },
    features: [{ type: String, trim: true }],
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String, required: true },
        originalName: { type: String, default: "" },
      },
    ],
    downloadableFiles: [fileSchema],
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

solutionSchema.index({ status: 1, order: 1 });

export const Solution = mongoose.model("Solution", solutionSchema);

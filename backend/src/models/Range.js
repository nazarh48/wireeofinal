import mongoose from "mongoose";

const rangeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    image: { type: String, default: "", trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

rangeSchema.index({ status: 1, createdAt: -1 });

export const Range = mongoose.model("Range", rangeSchema);

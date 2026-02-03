import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, trim: true, lowercase: true },
    description: { type: String, default: "", trim: true },
    subtitle: { type: String, default: "", trim: true },
    icon: { type: String, default: "", trim: true },
    image: { type: String, default: "", trim: true },
    color: { type: String, default: "from-blue-500 to-blue-600", trim: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

categorySchema.index({ status: 1, order: 1 });

export const Category = mongoose.model("Category", categorySchema);

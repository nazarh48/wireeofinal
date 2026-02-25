import mongoose from "mongoose";

const iconCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

iconCategorySchema.index({ is_active: 1, order: 1, createdAt: -1 });

export const IconCategory = mongoose.model("IconCategory", iconCategorySchema);


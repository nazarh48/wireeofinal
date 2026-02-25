import mongoose from "mongoose";

const iconSchema = new mongoose.Schema(
  {
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "IconCategory",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    file_path: { type: String, required: true, trim: true }, // /uploads/icons/...
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

iconSchema.index({ is_active: 1, category_id: 1, createdAt: -1 });

export const Icon = mongoose.model("Icon", iconSchema);


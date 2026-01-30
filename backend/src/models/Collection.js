import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    configurableProducts: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        instanceId: { type: String },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Collection = mongoose.model("Collection", collectionSchema);

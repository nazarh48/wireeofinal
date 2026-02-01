import mongoose from "mongoose";

const projectProductSchema = new mongoose.Schema(
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

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    products: [projectProductSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

projectSchema.index({ "products.instanceId": 1 });

export const Project = mongoose.model("Project", projectSchema);

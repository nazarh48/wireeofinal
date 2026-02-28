import mongoose from "mongoose";

const solutionDetailSchema = new mongoose.Schema(
  {
    solution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solution",
      required: true,
    },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: "", trim: true },
    body: { type: String, default: "", trim: true },
    points: [
      {
        title: { type: String, trim: true, default: "" },
        desc: { type: String, trim: true, default: "" },
      },
    ],
    image: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

solutionDetailSchema.index({ solution: 1, status: 1, order: 1 });

export const SolutionDetail = mongoose.model("SolutionDetail", solutionDetailSchema);


import mongoose from "mongoose";

const solutionWhyChooseItemSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: "" },
    desc: { type: String, trim: true, default: "" },
    icon: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const solutionWhyChooseSchema = new mongoose.Schema(
  {
    solution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Solution",
      required: true,
      unique: true,
    },
    introTitle: {
      type: String,
      trim: true,
      default: "Why Choose Our Solution",
    },
    introSubtitle: {
      type: String,
      trim: true,
      default:
        "Designed to optimize access management through security, efficiency, and full operational visibility.",
    },
    items: {
      type: [solutionWhyChooseItemSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export const SolutionWhyChoose = mongoose.model(
  "SolutionWhyChoose",
  solutionWhyChooseSchema
);


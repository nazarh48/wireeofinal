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
    configurationNumber: { type: String, unique: true, sparse: true, index: true },
    products: [projectProductSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

projectSchema.pre("save", async function (next) {
  if (!this.configurationNumber) {
    let isUnique = false;
    while (!isUnique) {
      const generatedNumber = "CONF-" + Math.floor(100000 + Math.random() * 900000).toString();
      const existing = await mongoose.models.Project.findOne({ configurationNumber: generatedNumber });
      if (!existing) {
        this.configurationNumber = generatedNumber;
        isUnique = true;
      }
    }
  }
  next();
});

projectSchema.index({ "products.instanceId": 1 });

export const Project = mongoose.model("Project", projectSchema);

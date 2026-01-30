import mongoose from "mongoose";
import { Product } from "../models/Product.js";

function toId(v) {
  if (!v) return null;
  if (mongoose.Types.ObjectId.isValid(v)) return v;
  if (v._id) return v._id;
  return null;
}

export async function ensureConfigurable(productIds) {
  const ids = productIds.map(toId).filter(Boolean);
  const products = await Product.find({ _id: { $in: ids }, productType: "configurable" }).lean();
  if (products.length !== ids.length) {
    const found = new Set(products.map((p) => p._id.toString()));
    const invalid = ids.filter((id) => !found.has(id.toString()));
    throw new Error(`Only configurable products allowed. Invalid: ${invalid.join(", ")}`);
  }
  return products;
}

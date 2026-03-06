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
  // Deduplicate IDs so having the same product multiple times doesn't fail length validation
  const uniqueIds = [...new Set(ids.map(id => id.toString()))];
  
  const products = await Product.find({ _id: { $in: uniqueIds }, productType: "configurable" }).lean();
  if (products.length !== uniqueIds.length) {
    const found = new Set(products.map((p) => p._id.toString()));
    const invalid = uniqueIds.filter((id) => !found.has(id));
    throw new Error(`Only configurable products allowed. Invalid: ${invalid.join(", ")}`);
  }
  return products;
}

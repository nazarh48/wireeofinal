import mongoose from "mongoose";
import path from "path";
import { connectDB } from "../config/db.js";
import { Product } from "../models/Product.js";
import { Range } from "../models/Range.js";
import { Resource } from "../models/Resource.js";
import { createUniqueSlug } from "../utils/slug.js";

function normalizeStoredUploadUrl(rawValue) {
  if (rawValue === undefined || rawValue === null || rawValue === "") return "";

  let value = rawValue;
  if (typeof value === "object") {
    value = value.url || value.fileUrl || "";
  }

  if (typeof value !== "string") return "";

  let normalized = value.trim();
  if (!normalized) return "";

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    try {
      normalized = new URL(normalized).pathname || normalized;
    } catch {
      return normalized;
    }
  }

  if (normalized.startsWith("/api/uploads/")) {
    normalized = normalized.replace(/^\/api/, "");
  }

  return normalized;
}

function normalizeLegacyDownloadable(item) {
  const url = normalizeStoredUploadUrl(
    typeof item === "string" ? item : item?.url || item?.fileUrl || "",
  );
  if (!url) return null;

  const filename =
    (typeof item === "object" && item?.filename) || path.basename(url) || "";
  const originalName =
    (typeof item === "object" && item?.originalName) || filename;
  const label =
    (typeof item === "object" && item?.label) || originalName || filename || "Download";

  return {
    url,
    filename,
    originalName,
    label,
  };
}

async function backfillRangeSlugs() {
  const ranges = await Range.find({}).select("_id name slug").lean();
  let updated = 0;

  for (const range of ranges) {
    if (range.slug) continue;

    const slug = await createUniqueSlug(Range, range.name, {
      excludeId: range._id,
      fallback: "range",
    });
    await Range.updateOne({ _id: range._id }, { $set: { slug } });
    updated += 1;
  }

  return updated;
}

async function backfillProductSlugs() {
  const products = await Product.find({}).select("_id name slug").lean();
  let updated = 0;

  for (const product of products) {
    if (product.slug) continue;

    const slug = await createUniqueSlug(Product, product.name, {
      excludeId: product._id,
      fallback: "product",
    });
    await Product.updateOne({ _id: product._id }, { $set: { slug } });
    updated += 1;
  }

  return updated;
}

async function migrateLegacyProductResources() {
  const products = await Product.find({
    $or: [
      { downloadableFiles: { $exists: true, $ne: [] } },
      { resourceIds: { $exists: true, $ne: [] } },
    ],
  });

  let productsUpdated = 0;
  let resourcesCreated = 0;
  let resourcesReused = 0;
  let legacyReferencesCleared = 0;

  for (const product of products) {
    const existingResourceIds = Array.isArray(product.resourceIds)
      ? product.resourceIds.map((id) => String(id))
      : [];
    const legacyFiles = Array.isArray(product.downloadableFiles)
      ? product.downloadableFiles.map(normalizeLegacyDownloadable).filter(Boolean)
      : [];

    if (legacyFiles.length === 0) {
      const deduped = [...new Set(existingResourceIds)];
      if (deduped.length !== existingResourceIds.length) {
        product.resourceIds = deduped;
        await product.save();
        productsUpdated += 1;
      }
      continue;
    }

    const nextResourceIds = [...existingResourceIds];

    for (const legacyFile of legacyFiles) {
      let resource = await Resource.findOne({ fileUrl: legacyFile.url });
      if (!resource) {
        resource = await Resource.create({
          name: legacyFile.label || legacyFile.originalName || legacyFile.filename || "Documentation",
          shortDescription: "",
          type: "Technical Manuals",
          photo: "",
          fileUrl: legacyFile.url,
          fileFilename: legacyFile.filename || path.basename(legacyFile.url) || "",
          size: "",
          order: 0,
          status: "active",
        });
        resourcesCreated += 1;
      } else {
        resourcesReused += 1;
      }

      const resourceId = String(resource._id);
      if (!nextResourceIds.includes(resourceId)) {
        nextResourceIds.push(resourceId);
      }
    }

    product.resourceIds = nextResourceIds;
    if (product.downloadableFiles.length > 0) {
      product.downloadableFiles = [];
      legacyReferencesCleared += 1;
    }
    await product.save();
    productsUpdated += 1;
  }

  return {
    productsUpdated,
    resourcesCreated,
    resourcesReused,
    legacyReferencesCleared,
  };
}

async function main() {
  await connectDB();

  const rangeSlugsAdded = await backfillRangeSlugs();
  const productSlugsAdded = await backfillProductSlugs();
  const resourceMigration = await migrateLegacyProductResources();

  await Range.syncIndexes();
  await Product.syncIndexes();

  console.log("[Migration] Product catalog/resource backfill complete");
  console.log(
    JSON.stringify(
      {
        rangeSlugsAdded,
        productSlugsAdded,
        ...resourceMigration,
      },
      null,
      2,
    ),
  );

  await mongoose.connection.close();
}

main().catch(async (error) => {
  console.error("[Migration] Failed:", error);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});

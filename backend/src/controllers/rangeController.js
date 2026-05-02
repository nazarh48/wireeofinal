import { Range } from "../models/Range.js";
import { Product } from "../models/Product.js";
import { optimizeImageAtUrl } from "../services/imageService.js";
import { getFromCache, invalidatePrefix, setInCache } from "../utils/simpleCache.js";
import { createUniqueSlug, slugify } from "../utils/slug.js";

function toImageUrl(filename) {
  if (!filename) return "";
  return `/uploads/ranges/${filename}`;
}

function normalizeRangeImage(range) {
  if (!range) return range;
  const out = { ...range };
  if (typeof out.image === "string" && out.image && !out.image.startsWith("http")) {
    out.image = out.image.startsWith("/") ? out.image : `/${out.image}`;
  }
  return out;
}

function normalizeOrderValue(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function normalizeRangePayload(payload = {}) {
  const normalized = { ...payload };
  if (Object.prototype.hasOwnProperty.call(payload, "order")) {
    normalized.order = normalizeOrderValue(payload.order);
  }
  return normalized;
}

function compareRangesByDisplayOrder(a, b) {
  const orderA = normalizeOrderValue(a?.order);
  const orderB = normalizeOrderValue(b?.order);

  if (orderA !== null && orderB !== null && orderA !== orderB) {
    return orderA - orderB;
  }
  if (orderA !== null && orderB === null) return -1;
  if (orderA === null && orderB !== null) return 1;

  const createdAtA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
  const createdAtB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
  if (createdAtA !== createdAtB) {
    return createdAtB - createdAtA;
  }

  return String(a?.name || "").localeCompare(String(b?.name || ""));
}

function invalidateRangeCaches() {
  invalidatePrefix("ranges:list:");
  invalidatePrefix("admin:dashboard:");
}

export async function create(req, res, next) {
  try {
    const body = normalizeRangePayload(req.body);
    body.slug = await createUniqueSlug(Range, body.name, {
      fallback: "range",
    });
    if (req.file && req.file.filename) body.image = toImageUrl(req.file.filename);
    const range = await Range.create(body);
    const normalized = normalizeRangeImage(range.toObject ? range.toObject() : range);
    if (normalized.image) {
      Promise.resolve(optimizeImageAtUrl(normalized.image)).catch(() => {});
    }
    invalidateRangeCaches();
    return res.status(201).json({ success: true, range: normalized });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const cacheKey = `ranges:list:${status || "all"}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const ranges = await Range.find(filter).lean();
    const normalized = ranges
      .map(normalizeRangeImage)
      .sort(compareRangesByDisplayOrder);
    const payload = { success: true, ranges: normalized };
    setInCache(cacheKey, payload, 10000);
    return res.status(200).json(payload);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const range = await Range.findById(req.params.id).lean();
    if (!range) {
      return res.status(404).json({ success: false, message: "Range not found" });
    }
    const normalized = normalizeRangeImage(range);
    return res.status(200).json({ success: true, range: normalized });
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req, res, next) {
  try {
    let range = await Range.findOne({ slug: req.params.slug }).lean();

    if (!range) {
      const requestedSlug = slugify(req.params.slug, "");
      const ranges = await Range.find({}).lean();
      range = ranges.find(
        (item) => slugify(item?.name, item?._id?.toString?.() || "") === requestedSlug,
      );
    }

    if (!range) {
      return res.status(404).json({ success: false, message: "Range not found" });
    }
    const normalized = normalizeRangeImage(range);
    return res.status(200).json({ success: true, range: normalized });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const updates = normalizeRangePayload(req.body);
    if (updates.name !== undefined) {
      updates.slug = await createUniqueSlug(Range, updates.name, {
        excludeId: req.params.id,
        fallback: "range",
      });
    }
    if (req.file && req.file.filename) updates.image = toImageUrl(req.file.filename);
    const range = await Range.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    if (!range) {
      return res.status(404).json({ success: false, message: "Range not found" });
    }
    const normalized = normalizeRangeImage(range);
    if (normalized.image) {
      Promise.resolve(optimizeImageAtUrl(normalized.image)).catch(() => {});
    }
    invalidateRangeCaches();
    return res.status(200).json({ success: true, range: normalized });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const range = await Range.findByIdAndDelete(req.params.id);
    if (!range) {
      return res.status(404).json({ success: false, message: "Range not found" });
    }
    await Product.deleteMany({ range: range._id });
    invalidateRangeCaches();
    return res.status(200).json({ success: true, message: "Range deleted" });
  } catch (err) {
    next(err);
  }
}

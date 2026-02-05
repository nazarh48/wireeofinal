import { Range } from "../models/Range.js";
import { Product } from "../models/Product.js";

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

export async function create(req, res, next) {
  try {
    const body = { ...req.body };
    if (req.file && req.file.filename) body.image = toImageUrl(req.file.filename);
    const range = await Range.create(body);
    const normalized = normalizeRangeImage(range.toObject ? range.toObject() : range);
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
    const ranges = await Range.find(filter).sort({ createdAt: -1 }).lean();
    const normalized = ranges.map(normalizeRangeImage);
    return res.status(200).json({ success: true, ranges: normalized });
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

export async function update(req, res, next) {
  try {
    const updates = { ...req.body };
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
    return res.status(200).json({ success: true, message: "Range deleted" });
  } catch (err) {
    next(err);
  }
}

import { Category } from "../models/Category.js";

function getImageUrl(file) {
  if (!file || !file.filename) return "";
  return `/uploads/categories/${file.filename}`;
}

export async function create(req, res, next) {
  try {
    const raw = req.body || {};
    const name = (raw.name != null ? String(raw.name) : "").trim();
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "name", msg: "Name required" }],
      });
    }
    const body = {
      name,
      slug: (raw.slug != null ? String(raw.slug) : "").trim() || undefined,
      description: (raw.description != null ? String(raw.description) : "").trim() || "",
      subtitle: (raw.subtitle != null ? String(raw.subtitle) : "").trim() || "",
      icon: (raw.icon != null ? String(raw.icon) : "").trim() || "",
      image: (raw.image != null ? String(raw.image) : "").trim() || "",
      color: (raw.color != null ? String(raw.color) : "").trim() || "from-blue-500 to-blue-600",
      order: raw.order != null ? Number(raw.order) : 0,
      status: raw.status === "inactive" ? "inactive" : "active",
    };
    if (req.file) body.image = getImageUrl(req.file);
    const category = await Category.create(body);
    return res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const categories = await Category.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const updates = { ...req.body };
    if (req.file) updates.image = getImageUrl(req.file);
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err) {
    next(err);
  }
}

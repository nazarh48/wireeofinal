import { Category } from "../models/Category.js";

function getImagePath(file) {
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
      description: (raw.description != null ? String(raw.description) : "").trim() || "",
      subtitle: (raw.subtitle != null ? String(raw.subtitle) : "").trim() || "",
      link: (raw.link != null ? String(raw.link) : "").trim() || "",
      image: (raw.image != null ? String(raw.image) : "").trim() || "",
      order: raw.order != null ? Number(raw.order) : 0,
      status: raw.status === "inactive" ? "inactive" : "active",
    };
    if (req.file) body.image = getImagePath(req.file);
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
    const raw = req.body || {};

    // Build a clean updates object — explicitly pull out known fields
    const updates = {};

    if (raw.name != null) updates.name = String(raw.name).trim();
    if (raw.description != null) updates.description = String(raw.description).trim();
    if (raw.subtitle != null) updates.subtitle = String(raw.subtitle).trim();
    if (raw.link != null) updates.link = String(raw.link).trim();
    if (raw.order != null) updates.order = Number(raw.order);
    if (raw.status != null) updates.status = raw.status === "inactive" ? "inactive" : "active";

    // Image: uploaded file takes priority, else if removeImage flag clear it
    if (req.file) {
      updates.image = getImagePath(req.file);
    } else if (String(raw.removeImage) === "true" || raw.image === "") {
      updates.image = "";
    } else if (raw.image != null) {
      updates.image = String(raw.image).trim();
    }

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

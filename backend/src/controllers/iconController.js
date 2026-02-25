import { Icon } from "../models/Icon.js";
import { IconCategory } from "../models/IconCategory.js";

const toBool = (v) => v === true || v === "true" || v === "1" || v === 1;

function getIconPath(file) {
  if (!file || !file.filename) return "";
  return `/uploads/icons/${file.filename}`;
}

export async function create(req, res, next) {
  try {
    const raw = req.body || {};
    const name = (raw.name != null ? String(raw.name) : "").trim();
    const categoryId = raw.category_id != null ? String(raw.category_id).trim() : "";
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "name", msg: "Name required" }],
      });
    }
    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "category_id", msg: "category_id required" }],
      });
    }
    const cat = await IconCategory.findById(categoryId).lean();
    if (!cat) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "category_id", msg: "Invalid category_id" }],
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: [{ field: "file", msg: "Icon file upload required" }],
      });
    }

    const icon = await Icon.create({
      name,
      category_id: categoryId,
      file_path: getIconPath(req.file),
      is_active: raw.is_active != null ? toBool(raw.is_active) : true,
    });
    return res.status(201).json({ success: true, icon });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { category_id, is_active } = req.query;
    const filter = {};
    if (category_id) filter.category_id = String(category_id).trim();
    if (is_active !== undefined) filter.is_active = toBool(is_active);
    const icons = await Icon.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, icons });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const icon = await Icon.findById(req.params.id).lean();
    if (!icon) {
      return res.status(404).json({ success: false, message: "Icon not found" });
    }
    return res.status(200).json({ success: true, icon });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const raw = req.body || {};
    const updates = {};
    if (raw.name != null) updates.name = String(raw.name).trim();
    if (raw.category_id != null) {
      const categoryId = String(raw.category_id).trim();
      const cat = await IconCategory.findById(categoryId).lean();
      if (!cat) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: [{ field: "category_id", msg: "Invalid category_id" }],
        });
      }
      updates.category_id = categoryId;
    }
    if (raw.is_active != null) updates.is_active = toBool(raw.is_active);
    if (req.file) updates.file_path = getIconPath(req.file);

    const icon = await Icon.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!icon) {
      return res.status(404).json({ success: false, message: "Icon not found" });
    }
    return res.status(200).json({ success: true, icon });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const icon = await Icon.findByIdAndDelete(req.params.id);
    if (!icon) {
      return res.status(404).json({ success: false, message: "Icon not found" });
    }
    return res.status(200).json({ success: true, message: "Icon deleted" });
  } catch (err) {
    next(err);
  }
}


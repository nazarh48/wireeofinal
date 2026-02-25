import { IconCategory } from "../models/IconCategory.js";

const toBool = (v) => v === true || v === "true" || v === "1" || v === 1;

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
    const category = await IconCategory.create({
      name,
      order: raw.order != null ? Number(raw.order) : 0,
      is_active: raw.is_active != null ? toBool(raw.is_active) : true,
    });
    return res.status(201).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { is_active } = req.query;
    const filter = {};
    if (is_active !== undefined) filter.is_active = toBool(is_active);
    const categories = await IconCategory.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const category = await IconCategory.findById(req.params.id).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: "Icon category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const raw = req.body || {};
    const updates = {};
    if (raw.name != null) updates.name = String(raw.name).trim();
    if (raw.order != null) updates.order = Number(raw.order);
    if (raw.is_active != null) updates.is_active = toBool(raw.is_active);

    const category = await IconCategory.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    if (!category) {
      return res.status(404).json({ success: false, message: "Icon category not found" });
    }
    return res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const category = await IconCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Icon category not found" });
    }
    return res.status(200).json({ success: true, message: "Icon category deleted" });
  } catch (err) {
    next(err);
  }
}


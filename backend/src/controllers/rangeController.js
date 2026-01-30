import { Range } from "../models/Range.js";
import { Product } from "../models/Product.js";

export async function create(req, res, next) {
  try {
    const range = await Range.create(req.body);
    return res.status(201).json({ success: true, range });
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
    return res.status(200).json({ success: true, ranges });
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
    return res.status(200).json({ success: true, range });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const range = await Range.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();
    if (!range) {
      return res.status(404).json({ success: false, message: "Range not found" });
    }
    return res.status(200).json({ success: true, range });
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

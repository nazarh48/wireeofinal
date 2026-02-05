import { Solution } from "../models/Solution.js";

function toUrl(dirName, filename) {
  if (!filename) return "";
  return `/uploads/${dirName}/${filename}`;
}

/** Ensure image and file URLs are in /uploads/... form for frontend. */
function normalizeSolutionUrls(solution) {
  if (!solution) return solution;
  const out = { ...solution };

  if (typeof out.image === "string" && out.image && !out.image.startsWith("http")) {
    out.image = out.image.startsWith("/") ? out.image : `/${out.image}`;
  }

  if (Array.isArray(out.images)) {
    out.images = out.images.map((item) => {
      if (typeof item === "string") return { url: item.startsWith("/") ? item : `/${item}`, filename: "", originalName: "" };
      const url = item?.url || "";
      return {
        ...item,
        url: typeof url === "string" && url ? (url.startsWith("/") ? url : `/${url}`) : url,
      };
    });
  } else {
    out.images = [];
  }

  if (!out.image && out.images && out.images[0] && out.images[0].url) {
    out.image = out.images[0].url;
  }

  if (Array.isArray(out.downloadableFiles)) {
    out.downloadableFiles = out.downloadableFiles.map((item) => {
      if (typeof item === "string") return { url: item.startsWith("/") ? item : `/${item}`, filename: "", originalName: "", label: "" };
      const url = item?.url || "";
      return {
        ...item,
        url: typeof url === "string" && url ? (url.startsWith("/") ? url : `/${url}`) : url,
      };
    });
  } else {
    out.downloadableFiles = [];
  }

  return out;
}

function parseFeatures(features) {
  if (Array.isArray(features)) return features.filter((f) => f != null && String(f).trim() !== "");
  if (typeof features === "string") return features.trim() ? [features.trim()] : [];
  return [];
}

export async function create(req, res, next) {
  try {
    const { title, description, icon, image, features, order, status } = req.body;
    const images = [];
    const files = Array.isArray(req.files?.images) ? req.files.images : [];
    files.forEach((f) => {
      images.push({
        url: toUrl("solutions", f.filename),
        filename: f.filename,
        originalName: f.originalname || "",
      });
    });
    const downloadableFiles = [];
    const fileList = Array.isArray(req.files?.files) ? req.files.files : [];
    fileList.forEach((f) => {
      downloadableFiles.push({
        url: toUrl("solutions", f.filename),
        filename: f.filename,
        originalName: f.originalname || "",
        label: f.originalname || "",
      });
    });
    const slug =
      (title || "")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || undefined;
    const solution = await Solution.create({
      title: title || "",
      slug,
      description: description || "",
      icon: icon || "",
      image: image || (images[0]?.url || ""),
      features: Array.isArray(features) ? features : typeof features === "string" ? (features ? [features] : []) : [],
      images,
      downloadableFiles,
      order: order != null ? Number(order) : 0,
      status: status || "active",
    });
    const doc = solution.toObject ? solution.toObject() : solution;
    const normalized = normalizeSolutionUrls(doc);
    return res.status(201).json({ success: true, solution: normalized });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const solutions = await Solution.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    const normalized = solutions.map(normalizeSolutionUrls);
    return res.status(200).json({ success: true, solutions: normalized });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const solution = await Solution.findById(req.params.id).lean();
    if (!solution) {
      return res.status(404).json({ success: false, message: "Solution not found" });
    }
    const normalized = normalizeSolutionUrls(solution);
    return res.status(200).json({ success: true, solution: normalized });
  } catch (err) {
    next(err);
  }
}

export async function getBySlug(req, res, next) {
  try {
    const solution = await Solution.findOne({ slug: req.params.slug, status: "active" }).lean();
    if (!solution) {
      return res.status(404).json({ success: false, message: "Solution not found" });
    }
    const normalized = normalizeSolutionUrls(solution);
    return res.status(200).json({ success: true, solution: normalized });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { title, description, icon, image, features, order, status } = req.body;
    const setUpdates = {};
    if (title !== undefined) setUpdates.title = title;
    if (description !== undefined) setUpdates.description = description;
    if (icon !== undefined) setUpdates.icon = icon;
    if (image !== undefined) setUpdates.image = image;
    if (features !== undefined) setUpdates.features = parseFeatures(features);
    if (order !== undefined) setUpdates.order = Number(order);
    if (status !== undefined) setUpdates.status = status;

    const updateOp = Object.keys(setUpdates).length ? { $set: setUpdates } : {};
    const files = Array.isArray(req.files?.images) ? req.files.images : [];
    if (files.length) {
      const images = files.map((f) => ({
        url: toUrl("solutions", f.filename),
        filename: f.filename,
        originalName: f.originalname || "",
      }));
      updateOp.$push = updateOp.$push || {};
      updateOp.$push.images = { $each: images };
    }
    const fileList = Array.isArray(req.files?.files) ? req.files.files : [];
    if (fileList.length) {
      const downloadableFiles = fileList.map((f) => ({
        url: toUrl("solutions", f.filename),
        filename: f.filename,
        originalName: f.originalname || "",
        label: f.originalname || "",
      }));
      updateOp.$push = updateOp.$push || {};
      updateOp.$push.downloadableFiles = { $each: downloadableFiles };
    }

    const solution = await Solution.findByIdAndUpdate(
      req.params.id,
      Object.keys(updateOp).length ? updateOp : { $set: { updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();
    if (!solution) {
      return res.status(404).json({ success: false, message: "Solution not found" });
    }
    const normalized = normalizeSolutionUrls(solution);
    return res.status(200).json({ success: true, solution: normalized });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const solution = await Solution.findByIdAndDelete(req.params.id);
    if (!solution) {
      return res.status(404).json({ success: false, message: "Solution not found" });
    }
    return res.status(200).json({ success: true, message: "Solution deleted" });
  } catch (err) {
    next(err);
  }
}

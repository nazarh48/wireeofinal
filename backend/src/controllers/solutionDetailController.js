import { SolutionDetail } from "../models/SolutionDetail.js";
import { Solution } from "../models/Solution.js";

function normalizeImagePath(image) {
  if (!image || typeof image !== "string") return "";
  if (image.startsWith("http://") || image.startsWith("https://") || image.startsWith("data:")) {
    return image;
  }
  const path = image.startsWith("/") ? image : `/${image}`;
  if (path.startsWith("/uploads/")) return path;
  if (path.startsWith("/solutions/")) return `/uploads${path}`;
  return `/uploads/solutions/${path.replace(/^\/+/, "")}`;
}

function normalize(detail) {
  if (!detail) return detail;
  const out = detail.toObject ? detail.toObject() : { ...detail };
  out.image = normalizeImagePath(out.image);
  return out;
}

function parsePoints(raw) {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => {
        if (item == null) return null;
        if (typeof item === "string") {
          const title = item.trim();
          if (!title) return null;
          return { title, desc: "" };
        }
        const title = item.title != null ? String(item.title).trim() : "";
        const desc = item.desc != null ? String(item.desc).trim() : "";
        if (!title && !desc) return null;
        return { title, desc };
      })
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsePoints(parsed);
      }
    } catch {
      // not JSON, fall through
    }
    return trimmed
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line !== "")
      .map((line) => {
        const [first, ...rest] = line.split(" - ");
        const title = (first || "").trim();
        const desc = rest.join(" - ").trim();
        return { title, desc };
      })
      .filter((p) => p.title || p.desc);
  }

  return [];
}

export async function create(req, res, next) {
  try {
    const { solution, title, subtitle, body, order, status, image, points } = req.body;

    const solutionExists = await Solution.exists({ _id: solution });
    if (!solutionExists) {
      return res.status(400).json({ success: false, message: "Invalid solution id" });
    }

    const imageFile = Array.isArray(req.files?.image) ? req.files.image[0] : undefined;
    const imagePath = imageFile ? `/uploads/solutions/${imageFile.filename}` : image;

    const doc = await SolutionDetail.create({
      solution,
      title: title || "",
      subtitle: subtitle || "",
      body: body || "",
      points: parsePoints(points),
      image: imagePath || "",
      order: order != null ? Number(order) : 0,
      status: status || "active",
    });

    return res.status(201).json({ success: true, detail: normalize(doc) });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { solutionId, status } = req.query;
    const filter = {};
    if (solutionId) filter.solution = solutionId;
    if (status) filter.status = status;

    const docs = await SolutionDetail.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    const normalized = docs.map(normalize);
    return res.status(200).json({ success: true, details: normalized });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const doc = await SolutionDetail.findById(req.params.id).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: "Solution detail not found" });
    }
    return res.status(200).json({ success: true, detail: normalize(doc) });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { title, subtitle, body, order, status, image, solution, points } = req.body;
    const setUpdates = {};

    if (solution !== undefined) {
      const exists = await Solution.exists({ _id: solution });
      if (!exists) {
        return res.status(400).json({ success: false, message: "Invalid solution id" });
      }
      setUpdates.solution = solution;
    }

    if (title !== undefined) setUpdates.title = title;
    if (subtitle !== undefined) setUpdates.subtitle = subtitle;
    if (body !== undefined) setUpdates.body = body;
    if (order !== undefined) setUpdates.order = Number(order);
    if (status !== undefined) setUpdates.status = status;
    if (image !== undefined) setUpdates.image = image;
    if (points !== undefined) setUpdates.points = parsePoints(points);

    const imageFile = Array.isArray(req.files?.image) ? req.files.image[0] : undefined;
    if (imageFile) {
      setUpdates.image = `/uploads/solutions/${imageFile.filename}`;
    }

    const doc = await SolutionDetail.findByIdAndUpdate(
      req.params.id,
      Object.keys(setUpdates).length ? { $set: setUpdates } : { $set: { updatedAt: new Date() } },
      { new: true, runValidators: true }
    ).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: "Solution detail not found" });
    }

    return res.status(200).json({ success: true, detail: normalize(doc) });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const doc = await SolutionDetail.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Solution detail not found" });
    }
    return res.status(200).json({ success: true, message: "Solution detail deleted" });
  } catch (err) {
    next(err);
  }
}


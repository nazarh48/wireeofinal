import { SolutionWhyChoose } from "../models/SolutionWhyChoose.js";
import mongoose from "mongoose";

const DEFAULT_INTRO_TITLE = "Why Choose Our Solution";
const DEFAULT_INTRO_SUBTITLE =
  "Designed to optimize access management through security, efficiency, and full operational visibility.";

function normalizeItems(raw) {
  if (!raw) return [];

  let items = raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      items = parsed;
    } catch {
      return [];
    }
  }

  if (!Array.isArray(items)) return [];

  return items
    .map((it, index) => {
      if (!it) return null;
      const title = (it.title ?? "").toString().trim();
      const desc = (it.desc ?? "").toString().trim();
      const icon = (it.icon ?? "").toString().trim();
      const order =
        typeof it.order === "number"
          ? it.order
          : Number.isFinite(Number(it.order))
          ? Number(it.order)
          : index;
      if (!title && !desc && !icon) return null;
      return { title, desc, icon, order };
    })
    .filter(Boolean)
    .sort((a, b) => a.order - b.order);
}

function toSolutionUrl(filename) {
  if (!filename) return "";
  return `/uploads/solutions/${filename}`;
}

export async function getBySolution(req, res, next) {
  try {
    const { solutionId } = req.params;
    const doc = await SolutionWhyChoose.findOne({ solution: solutionId }).lean();
    if (!doc) {
      return res.status(200).json({
        success: true,
        config: {
          solution: solutionId,
          introTitle: DEFAULT_INTRO_TITLE,
          introSubtitle: DEFAULT_INTRO_SUBTITLE,
          items: [],
        },
      });
    }
    return res.status(200).json({ success: true, config: doc });
  } catch (err) {
    next(err);
  }
}

export async function upsertForSolution(req, res, next) {
  try {
    const { solutionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(solutionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid solution id" });
    }

    const introTitle =
      (req.body.introTitle ?? "").toString().trim() || DEFAULT_INTRO_TITLE;
    const introSubtitle =
      (req.body.introSubtitle ?? "").toString().trim() ||
      DEFAULT_INTRO_SUBTITLE;
    const items = normalizeItems(req.body.items);

    const update = {
      solution: solutionId,
      introTitle,
      introSubtitle,
      items,
    };

    const doc = await SolutionWhyChoose.findOneAndUpdate(
      { solution: solutionId },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({ success: true, config: doc });
  } catch (err) {
    next(err);
  }
}

export async function uploadIcon(req, res, next) {
  try {
    const { solutionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(solutionId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid solution id" });
    }
    if (!req.file || !req.file.filename) {
      return res
        .status(400)
        .json({ success: false, message: "Icon file upload required" });
    }
    const iconPath = toSolutionUrl(req.file.filename);
    return res.status(201).json({ success: true, iconPath });
  } catch (err) {
    next(err);
  }
}



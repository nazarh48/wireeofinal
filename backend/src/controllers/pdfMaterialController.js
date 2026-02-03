import { PdfMaterial } from "../models/PdfMaterial.js";

function toUrl(dirName, filename) {
  if (!filename) return "";
  return `/uploads/${dirName}/${filename}`;
}

export async function create(req, res, next) {
  try {
    const { name, shortDescription, order, status } = req.body;
    const photoFile = req.files?.photo?.[0];
    const fileFile = req.files?.file?.[0];
    const photo = photoFile ? toUrl("pdf-materials", photoFile.filename) : "";
    const fileUrl = fileFile ? toUrl("pdf-materials", fileFile.filename) : "";
    const fileFilename = fileFile ? fileFile.filename : "";
    const material = await PdfMaterial.create({
      name: name || "",
      shortDescription: shortDescription || "",
      photo,
      fileUrl,
      fileFilename,
      order: order != null ? Number(order) : 0,
      status: status || "active",
    });
    return res.status(201).json({ success: true, material });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const materials = await PdfMaterial.find(filter).sort({ order: 1, createdAt: -1 }).lean();
    return res.status(200).json({ success: true, materials });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const material = await PdfMaterial.findById(req.params.id).lean();
    if (!material) {
      return res.status(404).json({ success: false, message: "PDF material not found" });
    }
    return res.status(200).json({ success: true, material });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { name, shortDescription, order, status } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (shortDescription !== undefined) updates.shortDescription = shortDescription;
    if (order !== undefined) updates.order = Number(order);
    if (status !== undefined) updates.status = status;

    const photoFile = req.files?.photo?.[0];
    const fileFile = req.files?.file?.[0];
    if (photoFile) updates.photo = toUrl("pdf-materials", photoFile.filename);
    if (fileFile) {
      updates.fileUrl = toUrl("pdf-materials", fileFile.filename);
      updates.fileFilename = fileFile.filename;
    }

    const material = await PdfMaterial.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    if (!material) {
      return res.status(404).json({ success: false, message: "PDF material not found" });
    }
    return res.status(200).json({ success: true, material });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const material = await PdfMaterial.findByIdAndDelete(req.params.id);
    if (!material) {
      return res.status(404).json({ success: false, message: "PDF material not found" });
    }
    return res.status(200).json({ success: true, message: "PDF material deleted" });
  } catch (err) {
    next(err);
  }
}

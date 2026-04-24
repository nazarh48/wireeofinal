import { Resource } from "../models/Resource.js";
import { Product } from "../models/Product.js";

function toUrl(dirName, filename) {
  if (!filename) return "";
  return `/uploads/${dirName}/${filename}`;
}

function formatFileSize(file) {
  if (!file?.size) return "";
  const mb = file.size / (1024 * 1024);
  if (mb < 1) {
    return `${(file.size / 1024).toFixed(1)} KB`;
  }
  return `${mb.toFixed(1)} MB`;
}

async function buildLinkedCountMap(resourceIds) {
  if (!Array.isArray(resourceIds) || resourceIds.length === 0) return new Map();

  const counts = await Product.aggregate([
    { $match: { resourceIds: { $in: resourceIds } } },
    { $unwind: "$resourceIds" },
    { $match: { resourceIds: { $in: resourceIds } } },
    { $group: { _id: "$resourceIds", count: { $sum: 1 } } },
  ]);

  return new Map(
    counts.map((entry) => [String(entry._id), Number(entry.count || 0)]),
  );
}

function serializeResource(resource, linkedCount = 0) {
  if (!resource) return resource;
  return {
    ...resource,
    linkedProductsCount: linkedCount,
    canDelete: linkedCount === 0,
  };
}

export async function create(req, res, next) {
  try {
    const { name, shortDescription, type, order, status } = req.body;
    const photoFile = req.files?.photo?.[0];
    const fileFile = req.files?.file?.[0];

    if (!fileFile) {
      return res.status(400).json({
        success: false,
        message: "Attachment file is required.",
      });
    }

    const resource = await Resource.create({
      name: name || "",
      shortDescription: shortDescription || "",
      type: type || "Guide",
      photo: photoFile ? toUrl("pdf-materials", photoFile.filename) : "",
      fileUrl: toUrl("pdf-materials", fileFile.filename),
      fileFilename: fileFile.filename,
      size: formatFileSize(fileFile),
      order: order != null ? Number(order) : 0,
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      material: serializeResource(resource.toObject()),
      resource: serializeResource(resource.toObject()),
    });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const resources = await Resource.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .lean();
    const resourceIds = resources.map((resource) => resource._id);
    const linkedCountMap = await buildLinkedCountMap(resourceIds);
    const decorated = resources.map((resource) =>
      serializeResource(resource, linkedCountMap.get(String(resource._id)) || 0),
    );

    return res.status(200).json({
      success: true,
      materials: decorated,
      resources: decorated,
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const resource = await Resource.findById(req.params.id).lean();
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const linkedCount = await Product.countDocuments({ resourceIds: req.params.id });
    const payload = serializeResource(resource, linkedCount);

    return res.status(200).json({
      success: true,
      material: payload,
      resource: payload,
    });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const { name, shortDescription, type, order, status } = req.body;
    const updates = {};

    if (name !== undefined) updates.name = name;
    if (shortDescription !== undefined) updates.shortDescription = shortDescription;
    if (type !== undefined) updates.type = type;
    if (order !== undefined) updates.order = Number(order);
    if (status !== undefined) updates.status = status;

    const photoFile = req.files?.photo?.[0];
    const fileFile = req.files?.file?.[0];

    if (photoFile) {
      updates.photo = toUrl("pdf-materials", photoFile.filename);
    }
    if (fileFile) {
      updates.fileUrl = toUrl("pdf-materials", fileFile.filename);
      updates.fileFilename = fileFile.filename;
      updates.size = formatFileSize(fileFile);
    }

    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).lean();

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const linkedCount = await Product.countDocuments({ resourceIds: req.params.id });
    const payload = serializeResource(resource, linkedCount);

    return res.status(200).json({
      success: true,
      material: payload,
      resource: payload,
    });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const linkedProductsCount = await Product.countDocuments({ resourceIds: req.params.id });
    if (linkedProductsCount > 0) {
      return res.status(409).json({
        success: false,
        message: `This resource is linked to ${linkedProductsCount} product(s). Unlink it from those products before deleting it.`,
        linkedProductsCount,
      });
    }

    const resource = await Resource.findByIdAndDelete(req.params.id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Resource deleted",
    });
  } catch (err) {
    next(err);
  }
}

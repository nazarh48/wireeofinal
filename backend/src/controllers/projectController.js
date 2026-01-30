import { Project } from "../models/Project.js";
import { Collection } from "../models/Collection.js";
import { ensureConfigurable } from "../services/productService.js";

function mapProducts(items) {
  return items.map((p) => ({
    product: p.product?._id ?? p.product,
    instanceId: p.instanceId || `inst_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    edits: p.edits || {},
  }));
}

export async function create(req, res, next) {
  try {
    const { name, products: productsInput } = req.body;
    const productIds = (productsInput || []).map((p) => p.product ?? p.productId ?? p).filter(Boolean);
    if (productIds.length) await ensureConfigurable(productIds);

    const project = await Project.create({
      name: name || "New Project",
      products: mapProducts(productsInput || []),
      createdBy: req.user._id,
    });
    await project.populate("products.product", "name description baseImageUrl isConfigurable productType");
    return res.status(201).json({ success: true, project });
  } catch (err) {
    if (err.message?.startsWith("Only configurable")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const projects = await Project.find({ createdBy: req.user._id })
      .populate("products.product", "name description baseImageUrl isConfigurable productType")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, projects });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.id, createdBy: req.user._id })
      .populate("products.product", "name description baseImageUrl isConfigurable productType range")
      .lean();
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    return res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
}

export async function addProducts(req, res, next) {
  try {
    const { projectId, products: productsInput } = req.body;
    const productIds = (productsInput || []).map((p) => p.product ?? p.productId ?? p).filter(Boolean);
    if (productIds.length) await ensureConfigurable(productIds);

    const project = await Project.findOne({ _id: projectId, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    const toAdd = mapProducts(productsInput || []);
    project.products.push(...toAdd);
    await project.save();
    await project.populate("products.product", "name description baseImageUrl isConfigurable productType");
    return res.status(200).json({ success: true, project });
  } catch (err) {
    if (err.message?.startsWith("Only configurable")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function addFromCollection(req, res, next) {
  try {
    const { projectId, instanceIds } = req.body;
    const collection = await Collection.findOne({ createdBy: req.user._id });
    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" });
    }
    const toAdd = collection.configurableProducts.filter((p) =>
      instanceIds && instanceIds.length ? instanceIds.includes(p.instanceId) : true
    );
    if (toAdd.length === 0) {
      return res.status(400).json({ success: false, message: "No products to add" });
    }

    let project;
    if (projectId) {
      project = await Project.findOne({ _id: projectId, createdBy: req.user._id });
      if (!project) {
        return res.status(404).json({ success: false, message: "Project not found" });
      }
    } else {
      project = await Project.create({
        name: req.body.projectName || "New Project",
        products: [],
        createdBy: req.user._id,
      });
    }

    const productIds = toAdd.map((p) => (p.product && p.product._id ? p.product._id : p.product));
    await ensureConfigurable(productIds);

    const mapped = toAdd.map((p) => ({
      product: p.product && p.product._id ? p.product._id : p.product,
      instanceId: p.instanceId,
      edits: {},
    }));
    project.products.push(...mapped);
    await project.save();
    await project.populate("products.product", "name description baseImageUrl isConfigurable productType");
    return res.status(200).json({ success: true, project });
  } catch (err) {
    if (err.message?.startsWith("Only configurable")) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

export async function updateName(req, res, next) {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: { name: req.body.name } },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    return res.status(200).json({ success: true, project });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    return res.status(200).json({ success: true, message: "Project deleted" });
  } catch (err) {
    next(err);
  }
}

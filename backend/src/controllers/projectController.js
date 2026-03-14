import { Project } from "../models/Project.js";
import { Collection } from "../models/Collection.js";
import { ensureConfigurable } from "../services/productService.js";
import mongoose from "mongoose";

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
    await project.populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl isConfigurable productType productCode sku printingEnabled laserEnabled");
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
    const isAdmin = req.user?.role === "admin";
    const mineOnly = req.query.mine === "1" || req.query.mine === "true";
    const filter = mineOnly || !isAdmin ? { createdBy: req.user._id } : {};
    const projects = await Project.find(filter)
      .populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl isConfigurable productType productCode sku printingEnabled laserEnabled")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, projects });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user._id };
    const project = await Project.findOne(filter)
      .populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl isConfigurable productType range productCode sku printingEnabled laserEnabled")
      .populate("createdBy", "name email role")
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
    await project.populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl isConfigurable productType productCode sku printingEnabled laserEnabled");
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
    const { projectId, instanceIds, editsSnapshot } = req.body;
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

    const snapshot = editsSnapshot && typeof editsSnapshot === "object" ? editsSnapshot : {};
    const mapped = toAdd.map((p) => {
      const saved = snapshot[p.instanceId];
      const edits = saved && typeof saved === "object"
        ? {
            elements: Array.isArray(saved.elements) ? saved.elements : [],
            configuration: saved.configuration && typeof saved.configuration === "object" ? saved.configuration : {},
          }
        : {};
      return {
        product: p.product && p.product._id ? p.product._id : p.product,
        instanceId: p.instanceId,
        edits,
      };
    });
    project.products.push(...mapped);
    await project.save();
    await project.populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl isConfigurable productType productCode sku printingEnabled laserEnabled");
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
    const isAdmin = req.user?.role === "admin";
    const filter = isAdmin
      ? { _id: req.params.id }
      : { _id: req.params.id, createdBy: req.user._id };
    const project = await Project.findOneAndDelete(filter);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }
    return res.status(200).json({ success: true, message: "Project deleted" });
  } catch (err) {
    next(err);
  }
}

export async function removeProduct(req, res, next) {
  try {
    const { id, instanceId } = req.params;
    const project = await Project.findOne({ _id: id, createdBy: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const before = Array.isArray(project.products) ? project.products.length : 0;
    let nextProducts;

    // Prefer removal by project-entry _id so the same product (same instanceId) can appear multiple times and be removed one by one.
    const isValidObjectId =
      typeof instanceId === "string" &&
      instanceId.length === 24 &&
      /^[a-f\d]{24}$/i.test(instanceId) &&
      mongoose.Types.ObjectId.isValid(instanceId);
    if (isValidObjectId) {
      const entry = project.products?.id?.(instanceId);
      if (entry) {
        nextProducts = project.products.filter((p) => String(p._id) !== String(instanceId));
      } else {
        nextProducts = (project.products || []).slice();
      }
    } else {
      // Remove by instanceId: remove only the FIRST match so one "row" is removed.
      let removed = false;
      nextProducts = (project.products || []).filter((p) => {
        if (removed) return true;
        if (String(p.instanceId || "") === String(instanceId)) {
          removed = true;
          return false;
        }
        return true;
      });
    }

    // Idempotent response: already removed/not found should not break frontend flow.
    if (nextProducts.length === before) {
      await project.populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl isConfigurable productType productCode sku printingEnabled laserEnabled");
      return res.status(200).json({
        success: true,
        project,
        removed: false,
        message: "Project product was already removed",
      });
    }

    project.products = nextProducts;
    await project.save();
    await project.populate("products.product", "name description baseImageUrl configuratorImageUrl baseDeviceImageUrl isConfigurable productType productCode sku printingEnabled laserEnabled");
    return res.status(200).json({ success: true, project, removed: true });
  } catch (err) {
    next(err);
  }
}

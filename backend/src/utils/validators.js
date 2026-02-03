import { body, param, query } from "express-validator";
import mongoose from "mongoose";

const objectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) throw new Error("Invalid ID");
  return value;
};

export const authValidators = {
  register: [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
  ],
  login: [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
};

export const rangeValidators = {
  create: [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("description").optional().trim(),
    body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
  ],
  update: [
    param("id").custom(objectId),
    body("name").optional().trim().notEmpty().withMessage("Name required"),
    body("description").optional().trim(),
    body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
  ],
  id: [param("id").custom(objectId)],
};

export const productValidators = {
  create: [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("description").optional().trim(),
    body("range").custom(objectId).withMessage("Valid range ID required"),
    body("baseImageUrl").optional().trim(),
    body("isConfigurable")
      .optional()
      .custom((v) => v === true || v === false || v === "true" || v === "false" || v === "1" || v === "0")
      .withMessage("isConfigurable must be boolean"),
    body("status").optional().isIn(["active", "inactive", "draft"]).withMessage("Invalid status"),
    body("featured")
      .optional()
      .custom((v) => v === true || v === false || v === "true" || v === "false" || v === "1" || v === "0")
      .withMessage("featured must be boolean"),
  ],
  update: [
    param("id").custom(objectId),
    body("name").optional().trim().notEmpty(),
    body("description").optional().trim(),
    body("range").optional().custom(objectId),
    body("baseImageUrl").optional().trim(),
    body("isConfigurable")
      .optional()
      .custom((v) => v === true || v === false || v === "true" || v === "false" || v === "1" || v === "0")
      .withMessage("isConfigurable must be boolean"),
    body("status").optional().isIn(["active", "inactive", "draft"]),
    body("featured")
      .optional()
      .custom((v) => v === true || v === false || v === "true" || v === "false" || v === "1" || v === "0")
      .withMessage("featured must be boolean"),
  ],
  id: [param("id").custom(objectId)],
  productId: [param("productId").custom(objectId)],
};

export const collectionValidators = {
  add: [
    body("productIds")
      .isArray({ min: 1 })
      .withMessage("productIds must be non-empty array"),
  ],
};

export const projectValidators = {
  create: [
    body("name").optional().trim(),
    body("products").optional().isArray(),
  ],
  addProducts: [
    body("projectId").custom(objectId).withMessage("Valid projectId required"),
    body("products").isArray().withMessage("products must be array"),
  ],
  addFromCollection: [
    body("projectId").optional().custom(objectId),
    body("projectName").optional().trim(),
    body("instanceIds").optional().isArray(),
  ],
  updateName: [param("id").custom(objectId), body("name").trim().notEmpty().withMessage("Name required")],
  id: [param("id").custom(objectId)],
};

export const canvasValidators = {
  save: [body("productId").custom(objectId).withMessage("Valid productId required")],
  productId: [param("productId").custom(objectId)],
  saveInstance: [
    body("instanceId").trim().notEmpty().withMessage("instanceId required"),
    body("productId").custom(objectId).withMessage("Valid productId required"),
  ],
  instanceId: [param("instanceId").trim().notEmpty().withMessage("instanceId required")],
};

export const pdfValidators = {
  create: [
    body("projectId").optional().custom(objectId),
    body("projectName").trim().notEmpty().withMessage("projectName required"),
    body("productCount").isInt({ min: 0 }).withMessage("productCount must be non-negative integer"),
    body("products").optional().isArray(),
    body("pdfSettings").optional().isObject(),
  ],
  id: [param("id").custom(objectId)],
};

export const categoryValidators = {
  create: [
    body("name")
      .custom((val, { req }) => {
        const name = (val != null ? val : req.body?.name ?? "").toString().trim();
        if (!name) throw new Error("Name required");
        return true;
      })
      .withMessage("Name required"),
    body("slug").optional().trim(),
    body("description").optional().trim(),
    body("subtitle").optional().trim(),
    body("icon").optional().trim(),
    body("image").optional().trim(),
    body("color").optional().trim(),
    body("order").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  update: [
    param("id").custom(objectId),
    body("name").optional().trim().notEmpty(),
    body("slug").optional().trim(),
    body("description").optional().trim(),
    body("subtitle").optional().trim(),
    body("icon").optional().trim(),
    body("image").optional().trim(),
    body("color").optional().trim(),
    body("order").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  id: [param("id").custom(objectId)],
};

export const solutionValidators = {
  create: [
    body("title").trim().notEmpty().withMessage("Title required"),
    body("description").optional().trim(),
    body("icon").optional().trim(),
    body("image").optional().trim(),
    body("features").optional(),
    body("order").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  update: [
    param("id").custom(objectId),
    body("title").optional().trim().notEmpty(),
    body("description").optional().trim(),
    body("icon").optional().trim(),
    body("image").optional().trim(),
    body("features").optional(),
    body("order").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  id: [param("id").custom(objectId)],
  slug: [param("slug").trim().notEmpty()],
};

export const pdfMaterialValidators = {
  create: [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("shortDescription").optional().trim(),
    body("order").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  update: [
    param("id").custom(objectId),
    body("name").optional().trim().notEmpty(),
    body("shortDescription").optional().trim(),
    body("order").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  id: [param("id").custom(objectId)],
};

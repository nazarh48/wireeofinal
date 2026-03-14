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
  forgotPassword: [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  ],
  resetPassword: [
    body("token").trim().notEmpty().withMessage("Reset token required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
  ],
  verifyEmail: [body("token").trim().notEmpty().withMessage("Verification token required")],
  verifySignUpOtp: [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("code").trim().notEmpty().withMessage("Verification code required"),
  ],
  verify2FA: [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("code").trim().notEmpty().withMessage("Verification code required"),
  ],
  resendVerification: [body("email").isEmail().normalizeEmail().withMessage("Valid email required")],
  resend2FA: [body("email").isEmail().normalizeEmail().withMessage("Valid email required")],
};

export const rangeValidators = {
  create: [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("description").optional().trim(),
    body("image").optional().trim(),
    body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
  ],
  update: [
    param("id").custom(objectId),
    body("name").optional().trim().notEmpty().withMessage("Name required"),
    body("description").optional().trim(),
    body("image").optional().trim(),
    body("status").optional().isIn(["active", "inactive"]).withMessage("Invalid status"),
  ],
  id: [param("id").custom(objectId)],
};

export const productValidators = {
  create: [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("productCode").optional().trim(),
    body("description").optional().trim(),
    body("technicalDetails").optional().trim(),
    body("range").custom(objectId).withMessage("Valid range ID required"),
    body("baseImageUrl").optional().trim(),
    body("configuratorImageUrl").optional().trim(),
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
    body("productCode").optional().trim(),
    body("description").optional().trim(),
    body("technicalDetails").optional().trim(),
    body("range").optional().custom(objectId),
    body("baseImageUrl").optional().trim(),
    body("configuratorImageUrl").optional().trim(),
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
    // Accept either the new format ({ products: [{productId, instanceId}] })
    // or the legacy format ({ productIds: ["id1"] }). At least one must be a non-empty array.
    body()
      .custom((_, { req }) => {
        const hasNewFormat =
          Array.isArray(req.body?.products) && req.body.products.length > 0;
        const hasLegacyFormat =
          Array.isArray(req.body?.productIds) && req.body.productIds.length > 0;
        if (!hasNewFormat && !hasLegacyFormat) {
          throw new Error("products (or productIds) must be a non-empty array");
        }
        return true;
      }),
  ],
  instanceId: [param("instanceId").trim().notEmpty().withMessage("instanceId required")],
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
  removeProduct: [
    param("id").custom(objectId),
    param("instanceId").trim().notEmpty().withMessage("instanceId required"),
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
    body("description").optional().trim(),
    body("subtitle").optional().trim(),
    body("image").optional(),
    body("link").optional().trim(),
    body("order").optional(),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  update: [
    param("id").custom(objectId),
    body("name").optional().trim().notEmpty(),
    body("description").optional().trim(),
    body("subtitle").optional().trim(),
    body("image").optional(),
    body("link").optional().trim(),
    body("removeImage").optional(),
    body("order").optional(),
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

export const solutionDetailValidators = {
  create: [
    body("solution").custom(objectId).withMessage("Valid solution id required"),
    body("title").trim().notEmpty().withMessage("Title required"),
    body("subtitle").optional().trim(),
    body("body").optional().trim(),
     body("points").optional(),
    body("image").optional().trim(),
    body("order").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  update: [
    param("id").custom(objectId),
    body("solution").optional().custom(objectId),
    body("title").optional().trim().notEmpty(),
    body("subtitle").optional().trim(),
    body("body").optional().trim(),
    body("points").optional(),
    body("image").optional().trim(),
    body("order").optional().isInt({ min: 0 }),
    body("status").optional().isIn(["active", "inactive"]),
  ],
  id: [param("id").custom(objectId)],
};

export const solutionWhyChooseValidators = {
  solutionId: [param("solutionId").custom(objectId)],
  upsert: [
    param("solutionId").custom(objectId),
    body("introTitle").optional().trim(),
    body("introSubtitle").optional().trim(),
    body("items").optional(),
  ],
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

export const newsletterValidators = {
  subscribe: [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("source").optional().trim(),
  ],
};

export const iconCategoryValidators = {
  create: [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("order").optional(),
    body("is_active").optional(),
  ],
  update: [
    param("id").custom(objectId),
    body("name").optional().trim().notEmpty().withMessage("Name required"),
    body("order").optional(),
    body("is_active").optional(),
  ],
  id: [param("id").custom(objectId)],
};

export const iconValidators = {
  create: [
    body("category_id").custom(objectId).withMessage("Valid category_id required"),
    body("name").trim().notEmpty().withMessage("Name required"),
    body("is_active").optional(),
  ],
  update: [
    param("id").custom(objectId),
    body("category_id").optional().custom(objectId),
    body("name").optional().trim().notEmpty().withMessage("Name required"),
    body("is_active").optional(),
  ],
  id: [param("id").custom(objectId)],
};

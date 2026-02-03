import { Router } from "express";
import * as ctrl from "../controllers/productController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadProductImages, uploadProductImagesAndFiles } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { productValidators } from "../utils/validators.js";

const router = Router();

router.get("/configurable", ctrl.listConfigurable);
router.get("/normal", ctrl.listNormal);
router.get("/featured", ctrl.listFeatured);
router.get("/", ctrl.list);
router.get("/:id", validate(productValidators.id), ctrl.getById);

router.use(authenticateAdmin);

router.post("/", uploadProductImagesAndFiles, validate(productValidators.create), ctrl.create);
router.patch("/:id", uploadProductImagesAndFiles, validate(productValidators.update), ctrl.update);
router.delete("/:id", validate(productValidators.id), ctrl.remove);

export default router;

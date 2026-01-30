import { Router } from "express";
import * as ctrl from "../controllers/productController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadProductImages } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { productValidators } from "../utils/validators.js";

const router = Router();

router.get("/configurable", ctrl.listConfigurable);
router.get("/normal", ctrl.listNormal);
router.get("/", ctrl.list);
router.get("/:id", validate(productValidators.id), ctrl.getById);

router.use(authenticateAdmin);

router.post("/", uploadProductImages, validate(productValidators.create), ctrl.create);
router.patch("/:id", uploadProductImages, validate(productValidators.update), ctrl.update);
router.delete("/:id", validate(productValidators.id), ctrl.remove);

export default router;

import { Router } from "express";
import * as ctrl from "../controllers/pdfMaterialController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadPdfMaterial } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { pdfMaterialValidators } from "../utils/validators.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/:id", validate(pdfMaterialValidators.id), ctrl.getById);

router.use(authenticateAdmin);
router.post("/", uploadPdfMaterial, validate(pdfMaterialValidators.create), ctrl.create);
router.patch("/:id", uploadPdfMaterial, validate(pdfMaterialValidators.update), ctrl.update);
router.delete("/:id", validate(pdfMaterialValidators.id), ctrl.remove);

export default router;

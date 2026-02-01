import { Router } from "express";
import * as ctrl from "../controllers/pdfController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { pdfValidators } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.post("/", validate(pdfValidators.create), ctrl.create);
router.get("/", ctrl.list);
router.get("/:id", validate(pdfValidators.id), ctrl.getById);
router.patch("/:id/last-exported", validate(pdfValidators.id), ctrl.updateLastExported);
router.put("/:id/re-export", validate(pdfValidators.id), ctrl.reExport);

export default router;

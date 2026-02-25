import { Router } from "express";
import * as ctrl from "../controllers/iconController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadIconFile } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { iconValidators } from "../utils/validators.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/:id", validate(iconValidators.id), ctrl.getById);

router.use(authenticateAdmin);
router.post("/", uploadIconFile, validate(iconValidators.create), ctrl.create);
router.patch("/:id", uploadIconFile, validate(iconValidators.update), ctrl.update);
router.delete("/:id", validate(iconValidators.id), ctrl.remove);

export default router;


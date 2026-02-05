import { Router } from "express";
import * as ctrl from "../controllers/rangeController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadRangeImage } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { rangeValidators } from "../utils/validators.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/:id", validate(rangeValidators.id), ctrl.getById);

router.use(authenticateAdmin);
router.post("/", uploadRangeImage, validate(rangeValidators.create), ctrl.create);
router.patch("/:id", uploadRangeImage, validate(rangeValidators.update), ctrl.update);
router.delete("/:id", validate(rangeValidators.id), ctrl.remove);

export default router;

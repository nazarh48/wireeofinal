import { Router } from "express";
import * as ctrl from "../controllers/solutionController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadSolutionAssets } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { solutionValidators } from "../utils/validators.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/slug/:slug", validate(solutionValidators.slug), ctrl.getBySlug);
router.get("/:id", validate(solutionValidators.id), ctrl.getById);

router.use(authenticateAdmin);
router.post("/", uploadSolutionAssets, validate(solutionValidators.create), ctrl.create);
router.patch("/:id", uploadSolutionAssets, validate(solutionValidators.update), ctrl.update);
router.delete("/:id", validate(solutionValidators.id), ctrl.remove);

export default router;

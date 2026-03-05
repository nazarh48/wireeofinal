import { Router } from "express";
import { authenticateAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { solutionWhyChooseValidators } from "../utils/validators.js";
import * as ctrl from "../controllers/solutionWhyChooseController.js";
import { uploadSolutionIcon } from "../middleware/upload.js";

const router = Router();

router.get(
  "/:solutionId",
  validate(solutionWhyChooseValidators.solutionId),
  ctrl.getBySolution
);

router.put(
  "/:solutionId",
  authenticateAdmin,
  validate(solutionWhyChooseValidators.upsert),
  ctrl.upsertForSolution
);

router.post(
  "/:solutionId/icon",
  authenticateAdmin,
  validate(solutionWhyChooseValidators.solutionId),
  uploadSolutionIcon,
  ctrl.uploadIcon
);

export default router;


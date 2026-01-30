import { Router } from "express";
import * as ctrl from "../controllers/projectController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { projectValidators } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.list);
router.get("/:id", validate(projectValidators.id), ctrl.getById);
router.post("/", ctrl.create);
router.post("/add-products", validate(projectValidators.addProducts), ctrl.addProducts);
router.post("/add-from-collection", validate(projectValidators.addFromCollection), ctrl.addFromCollection);
router.patch("/:id/name", validate(projectValidators.updateName), ctrl.updateName);
router.delete("/:id", validate(projectValidators.id), ctrl.remove);

export default router;

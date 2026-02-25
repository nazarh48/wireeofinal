import { Router } from "express";
import * as ctrl from "../controllers/iconCategoryController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { iconCategoryValidators } from "../utils/validators.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/:id", validate(iconCategoryValidators.id), ctrl.getById);

router.use(authenticateAdmin);
router.post("/", validate(iconCategoryValidators.create), ctrl.create);
router.patch("/:id", validate(iconCategoryValidators.update), ctrl.update);
router.delete("/:id", validate(iconCategoryValidators.id), ctrl.remove);

export default router;


import { Router } from "express";
import * as ctrl from "../controllers/categoryController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { uploadCategoryImage } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { categoryValidators } from "../utils/validators.js";

const router = Router();

router.get("/", ctrl.list);
router.get("/:id", validate(categoryValidators.id), ctrl.getById);

router.use(authenticateAdmin);
router.post("/", uploadCategoryImage, ctrl.create);
router.patch("/:id", uploadCategoryImage, validate(categoryValidators.update), ctrl.update);
router.delete("/:id", validate(categoryValidators.id), ctrl.remove);

export default router;

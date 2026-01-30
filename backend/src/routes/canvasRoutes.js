import { Router } from "express";
import * as ctrl from "../controllers/canvasController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { canvasValidators } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.post("/save", validate(canvasValidators.save), ctrl.save);
router.get("/product/:productId", validate(canvasValidators.productId), ctrl.getByProduct);

export default router;

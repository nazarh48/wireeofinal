import { Router } from "express";
import * as ctrl from "../controllers/newsletterController.js";
import { authenticateAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { newsletterValidators } from "../utils/validators.js";

const router = Router();

router.post("/subscribe", validate(newsletterValidators.subscribe), ctrl.subscribe);

router.use(authenticateAdmin);
router.get("/subscribers", ctrl.list);

export default router;

import { Router } from "express";
import * as ctrl from "../controllers/collectionController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { collectionValidators } from "../utils/validators.js";

const router = Router();

router.use(authenticate);

router.get("/", ctrl.getMyCollection);
router.post("/add", validate(collectionValidators.add), ctrl.addToCollection);
router.delete("/:instanceId", ctrl.removeFromCollection);

export default router;

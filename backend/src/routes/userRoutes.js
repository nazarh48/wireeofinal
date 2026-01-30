import { Router } from "express";
import { getCount, list } from "../controllers/userController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/count", authenticateAdmin, getCount);
router.get("/", authenticateAdmin, list);

export default router;

import { Router } from "express";
import { getStats } from "../controllers/adminDashboardController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

router.use(authenticateAdmin);
router.get("/stats", getStats);

export default router;

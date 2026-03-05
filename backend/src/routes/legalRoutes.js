import { Router } from "express";
import { getLegalPage, updateLegalPage } from "../controllers/legalController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public route – anyone can view a legal page (privacy, terms)
router.get("/:page", getLegalPage);

// Admin-only route – only admins can update legal pages
router.put("/:page", authenticateAdmin, updateLegalPage);

export default router;


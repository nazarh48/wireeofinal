import { Router } from "express";
import {
    getCookiePolicy,
    updateCookiePolicy,
} from "../controllers/cookiePolicyController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

// Public route - anyone can view the cookie policy
router.get("/", getCookiePolicy);

// Admin-only route - only admins can update the cookie policy
router.put("/", authenticateAdmin, updateCookiePolicy);

export default router;

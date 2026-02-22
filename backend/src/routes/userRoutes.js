import { Router } from "express";
import { getCount, list, createUser, updateUser, deleteUser } from "../controllers/userController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/count", authenticateAdmin, getCount);
router.get("/", authenticateAdmin, list);
router.post("/", authenticateAdmin, createUser);
router.patch("/:id", authenticateAdmin, updateUser);
router.delete("/:id", authenticateAdmin, deleteUser);

export default router;

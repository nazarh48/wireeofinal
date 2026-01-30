import { Router } from "express";
import { register, login, adminLogin } from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { authValidators } from "../utils/validators.js";

const router = Router();

router.post("/register", validate(authValidators.register), register);
router.post("/login", validate(authValidators.login), login);
router.post("/admin/login", validate(authValidators.login), adminLogin);

export default router;

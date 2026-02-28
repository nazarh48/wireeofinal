import { Router } from "express";
import {
  register,
  login,
  adminLogin,
  refreshSession,
  refreshAdminSession,
  verifyEmail,
  resendVerificationEmail,
  verify2FA,
  resend2FACode,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { validate } from "../middleware/validate.js";
import { authValidators } from "../utils/validators.js";

const router = Router();

router.post("/register", validate(authValidators.register), register);
router.post("/login", validate(authValidators.login), login);
router.post("/admin/login", validate(authValidators.login), adminLogin);
router.post("/refresh", refreshSession);
router.post("/admin/refresh", refreshAdminSession);

router.post("/verify-email", validate(authValidators.verifyEmail), verifyEmail);
router.post(
  "/resend-verification",
  validate(authValidators.resendVerification),
  resendVerificationEmail
);
router.post("/resend", validate(authValidators.resendVerification), resendVerificationEmail);
router.post("/verify-2fa", validate(authValidators.verify2FA), verify2FA);
router.post("/resend-2fa", validate(authValidators.resend2FA), resend2FACode);

router.post("/forgot-password", validate(authValidators.forgotPassword), forgotPassword);
router.post("/reset-password", validate(authValidators.resetPassword), resetPassword);

export default router;

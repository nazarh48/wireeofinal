import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config/index.js";
import {
  sendVerificationEmail,
  send2FACode,
  sendPasswordResetEmail,
} from "../services/emailService.js";

const USER_SELECT = "+password +emailVerificationToken +emailVerificationExpires +twoFactorCode +twoFactorCodeExpires +passwordResetToken +passwordResetExpires";

function signToken(user) {
  const expiresIn = config.session?.inactivityMinutes
    ? `${config.session.inactivityMinutes}m`
    : config.jwt.expiresIn;
  return jwt.sign(
    { userId: user._id, role: user.role },
    config.jwt.secret,
    { expiresIn }
  );
}

function toUserResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
  };
}

function generateSecureToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generate6DigitCode() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const emailVerificationToken = generateSecureToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      name,
      email,
      password,
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
      twoFactorEnabled: false,
    });

    try {
      await sendVerificationEmail(email, name, emailVerificationToken);
    } catch (emailErr) {
      console.error("[Auth] Failed to send verification email:", emailErr?.message);
      const baseUrl =
        config.app?.frontendUrl ??
        (process.env.NODE_ENV === "production" ? "https://wireeo.com" : "http://localhost:5173");
      const url = `${baseUrl}/verify-email?token=${emailVerificationToken}`;
      console.log("[Auth] Verification link (copy for testing):", url);
      // Continue - user is created, they can use resend
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user: toUserResponse(user),
      requiresVerification: true,
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.body;
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).select(USER_SELECT);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired verification link" });
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resendVerificationEmail(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select(
      "+emailVerificationToken +emailVerificationExpires"
    );

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a verification link has been sent.",
      });
    }

    if (user.emailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified. You can sign in." });
    }

    const emailVerificationToken = generateSecureToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(user.email, user.name, emailVerificationToken);
    } catch (emailErr) {
      console.error("[Auth] Resend verification email failed:", emailErr?.message);
      const baseUrl =
        config.app?.frontendUrl ??
        (process.env.NODE_ENV === "production" ? "https://wireeo.com" : "http://localhost:5173");
      const url = `${baseUrl}/verify-email?token=${emailVerificationToken}`;
      console.log("[Auth] Verification link (copy for testing):", url);
    }

    return res.status(200).json({
      success: true,
      message: "Verification email sent. Please check your inbox.",
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select(USER_SELECT);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Strict: require email verification for all users
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before signing in.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Please use the admin login page.",
      });
    }

    // 2FA: only if explicitly enabled (disabled for login/signup flow)
    if (user.twoFactorEnabled === true) {
      const code = generate6DigitCode();
      user.twoFactorCode = code;
      user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
      await user.save({ validateBeforeSave: false });

      await send2FACode(user.email, user.name, code);

      return res.status(200).json({
        success: true,
        requires2FA: true,
        message: "Verification code sent to your email.",
        email: user.email,
      });
    }

    const token = signToken(user);
    return res.status(200).json({
      success: true,
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function verify2FA(req, res, next) {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email }).select(
      "+twoFactorCode +twoFactorCodeExpires"
    );

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid request" });
    }

    if (!user.twoFactorCode || !user.twoFactorCodeExpires) {
      return res
        .status(400)
        .json({ success: false, message: "No pending verification. Please log in again." });
    }

    if (user.twoFactorCodeExpires < new Date()) {
      user.twoFactorCode = undefined;
      user.twoFactorCodeExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired. Please log in again." });
    }

    if (user.twoFactorCode !== code.trim()) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid verification code" });
    }

    user.twoFactorCode = undefined;
    user.twoFactorCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = signToken(user);
    return res.status(200).json({
      success: true,
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function resend2FACode(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select(
      "+twoFactorCode +twoFactorCodeExpires"
    );

    if (!user || !user.twoFactorCode) {
      return res
        .status(400)
        .json({ success: false, message: "No pending verification. Please log in again." });
    }

    const code = generate6DigitCode();
    user.twoFactorCode = code;
    user.twoFactorCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await send2FACode(user.email, user.name, code);

    return res.status(200).json({
      success: true,
      message: "New verification code sent to your email.",
    });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    const passwordResetToken = generateSecureToken();
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    user.passwordResetToken = passwordResetToken;
    user.passwordResetExpires = passwordResetExpires;
    await user.save({ validateBeforeSave: false });

    await sendPasswordResetEmail(user.email, user.name, passwordResetToken);

    return res.status(200).json({
      success: true,
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset link" });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now sign in.",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Refresh session: valid (non-expired) token in header returns a new token.
 * Used for sliding expiration on activity.
 */
export async function refreshSession(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required", code: "AUTH_REQUIRED" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired due to inactivity",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found", code: "USER_NOT_FOUND" });
    }
    if (user.status !== "active") {
      return res
        .status(401)
        .json({ success: false, message: "Account inactive", code: "ACCOUNT_INACTIVE" });
    }
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Use admin refresh endpoint for admin sessions.",
        code: "USE_ADMIN_REFRESH",
      });
    }
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    const newToken = signToken(user);
    return res.status(200).json({
      success: true,
      token: newToken,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Refresh admin session (sliding expiration).
 */
export async function refreshAdminSession(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required", code: "AUTH_REQUIRED" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Session expired due to inactivity",
          code: "TOKEN_EXPIRED",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found", code: "USER_NOT_FOUND" });
    }
    if (user.status !== "active") {
      return res
        .status(401)
        .json({ success: false, message: "Account inactive", code: "ACCOUNT_INACTIVE" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
        code: "ADMIN_REQUIRED",
      });
    }

    const newToken = signToken(user);
    return res.status(200).json({
      success: true,
      token: newToken,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    if (user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Admin access required" });
    }

    const token = signToken(user);
    return res.status(200).json({
      success: true,
      token,
      user: toUserResponse(user),
    });
  } catch (err) {
    next(err);
  }
}

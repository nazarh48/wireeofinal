import crypto from "crypto";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { config } from "../config/index.js";
import {
  sendVerificationEmail,
  sendSignUpOtpEmail,
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

    const otp = generate6DigitCode();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min for OTP

    const user = await User.create({
      name,
      email,
      password,
      emailVerified: false,
      emailVerificationToken: otp,
      emailVerificationExpires,
      twoFactorEnabled: false,
    });

    try {
      await sendSignUpOtpEmail(email, name, otp);
    } catch (emailErr) {
      console.error("[Auth] Failed to send OTP email:", emailErr?.message);
      console.log("[Auth] OTP (copy for testing):", otp);
      // Continue - user is created, they can use resend
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful. Check your email for the verification code.",
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

/** Verify signup OTP (email + 6-digit code). */
export async function verifySignUpOtp(req, res, next) {
  try {
    const { email, code } = req.body;
    const otp = String(code).trim();
    const user = await User.findOne({ email }).select(
      "+emailVerificationToken +emailVerificationExpires"
    );

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired verification code" });
    }

    if (user.emailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified. You can sign in." });
    }

    if (!user.emailVerificationToken || !user.emailVerificationExpires) {
      return res
        .status(400)
        .json({ success: false, message: "No pending verification. Please request a new code." });
    }

    if (user.emailVerificationExpires < new Date()) {
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(400)
        .json({ success: false, message: "Verification code expired. Please request a new code." });
    }

    if (user.emailVerificationToken !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid verification code" });
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

    const otp = generate6DigitCode();
    const emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.emailVerificationToken = otp;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save({ validateBeforeSave: false });

    try {
      await sendSignUpOtpEmail(user.email, user.name, otp);
    } catch (emailErr) {
      console.error("[Auth] Resend OTP failed:", emailErr?.message);
      console.log("[Auth] OTP (copy for testing):", otp);
    }

    return res.status(200).json({
      success: true,
      message: "New verification code sent. Please check your inbox.",
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

/**
 * Redirect user to Google OAuth consent screen.
 */
export async function googleAuth(req, res, next) {
  try {
    const { clientId } = config.google || {};
    const baseUrl = config.app?.backendPublicUrl || "http://localhost:5000";
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    if (!clientId) {
      const frontendUrl = config.app?.frontendUrl || "http://localhost:5173";
      return res.redirect(302, `${frontendUrl}/login?error=${encodeURIComponent("Google sign-in is not configured.")}`);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return res.redirect(302, url);
  } catch (err) {
    next(err);
  }
}

/**
 * Google OAuth callback: exchange code for tokens, get profile, find or create user, redirect to frontend with JWT.
 */
export async function googleCallback(req, res, next) {
  try {
    const { code, error } = req.query;
    const frontendUrl = config.app?.frontendUrl || "http://localhost:5173";
    const loginPath = "/login";

    if (error) {
      const errMsg = error === "access_denied" ? "Sign-in was cancelled." : "Google sign-in failed.";
      return res.redirect(302, `${frontendUrl}${loginPath}?error=${encodeURIComponent(errMsg)}`);
    }

    if (!code) {
      return res.redirect(302, `${frontendUrl}${loginPath}?error=${encodeURIComponent("Missing authorization code.")}`);
    }

    const { clientId, clientSecret } = config.google || {};
    if (!clientId || !clientSecret) {
      return res.redirect(302, `${frontendUrl}${loginPath}?error=${encodeURIComponent("Google sign-in is not configured.")}`);
    }

    const baseUrl = config.app?.backendPublicUrl || "http://localhost:5000";
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error("[Auth] Google token exchange failed:", tokenRes.status, errData);
      return res.redirect(302, `${frontendUrl}${loginPath}?error=${encodeURIComponent("Google sign-in failed. Try again.")}`);
    }

    const tokens = await tokenRes.json();
    const accessToken = tokens.access_token;
    if (!accessToken) {
      return res.redirect(302, `${frontendUrl}${loginPath}?error=${encodeURIComponent("Google sign-in failed.")}`);
    }

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userInfoRes.ok) {
      return res.redirect(302, `${frontendUrl}${loginPath}?error=${encodeURIComponent("Could not load Google profile.")}`);
    }
    const profile = await userInfoRes.json();
    const email = profile.email?.trim().toLowerCase();
    const name = (profile.name || profile.email || "User").trim();

    if (!email) {
      return res.redirect(302, `${frontendUrl}${loginPath}?error=${encodeURIComponent("Google account has no email.")}`);
    }

    let user = await User.findOne({ email }).select(USER_SELECT);
    if (!user) {
      const randomPassword = crypto.randomBytes(32).toString("hex");
      user = await User.create({
        name,
        email,
        password: randomPassword,
        emailVerified: true,
        twoFactorEnabled: false,
      });
    } else if (!user.emailVerified) {
      user.emailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    if (user.status !== "active") {
      return res.redirect(302, `${frontendUrl}${loginPath}?error=${encodeURIComponent("Account is inactive.")}`);
    }

    const token = signToken(user);
    const redirectTo = `${frontendUrl}${loginPath}?token=${encodeURIComponent(token)}`;
    return res.redirect(302, redirectTo);
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

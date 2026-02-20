import nodemailer from "nodemailer";
import { config } from "../config/index.js";

let transporter = null;
let etherealTestAccount = null;
let emailStatusLogged = false;

const PLACEHOLDER_EMAILS = [
  "your-email@gmail.com",
  "example@example.com",
  "user@example.com",
];

function isRealSmtpConfigured() {
  const { host, user, pass } = config.email || {};
  if (!host || !user || !pass) return false;
  const u = String(user).trim().toLowerCase();
  if (PLACEHOLDER_EMAILS.some((p) => u.includes(p) || u === p)) return false;
  if (u.includes("your-") || u.includes("your_")) return false;
  if (String(pass).includes("your-") || String(pass).includes("app-password")) return false;
  return true;
}

export function getEmailConfigStatus() {
  return isRealSmtpConfigured()
    ? "configured"
    : "ethereal";
}

function logEmailStatus(useEthereal) {
  if (emailStatusLogged) return;
  emailStatusLogged = true;
  if (useEthereal) {
    console.warn(
      "[Email] SMTP not configured. Using Ethereal - emails will NOT reach real inboxes.",
    );
    console.warn("[Email] Add MAIL_HOST, MAIL_USER, MAIL_PASS to .env to send real emails.");
  } else {
    console.log("[Email] SMTP configured. Emails will be delivered to recipients.");
  }
}

async function getTransporter() {
  if (transporter) return transporter;

  const { host, port, user, pass, secure } = config.email || {};

  if (isRealSmtpConfigured()) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port || "587", 10),
      secure: secure === "true" || secure === true,
      auth: { user, pass },
    });
    // Verify connection on first use
    try {
      await transporter.verify();
      logEmailStatus(false);
    } catch (err) {
      console.error("[Email] SMTP verification failed:", err?.message);
      transporter = null;
      throw new Error("SMTP configuration invalid. Check MAIL_* in .env");
    }
    return transporter;
  }

  // Fallback: Ethereal (emails do NOT reach real recipients)
  logEmailStatus(true);
  try {
    etherealTestAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: etherealTestAccount.user,
        pass: etherealTestAccount.pass,
      },
    });
    console.log("[Email] Ethereal ready. Use Preview URL from logs to view test emails.");
  } catch (e) {
    console.error("[Email] Ethereal failed:", e?.message);
    transporter = null;
  }
  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const trans = await getTransporter();
  if (!trans) {
    console.warn("[Email] No transporter. Configure MAIL_* in .env or check Ethereal.");
    throw new Error("Email service not configured");
  }
  const from = config.email?.from || config.email?.user || "noreply@wireeo.com";

  try {
    const info = await trans.sendMail({
      from,
      to,
      subject,
      html: html || text,
      text: text || html?.replace(/<[^>]*>/g, "") || "",
    });

    // Log Ethereal preview URL in dev (useful when SMTP not configured)
    if (etherealTestAccount) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("[Email] Preview:", previewUrl);
      }
    }

    return { ok: true, messageId: info.messageId };
  } catch (err) {
    console.error("[Email] Send failed:", err?.message);
    throw err;
  }
}

export async function sendVerificationEmail(email, name, token) {
  const baseUrl = config.app?.frontendUrl || "http://localhost:5173";
  const url = `${baseUrl}/verify-email?token=${token}`;
  const subject = "Verify your Wireeo account";
  const html = `
    <h2>Welcome to Wireeo, ${name}!</h2>
    <p>Please verify your email address by clicking the link below:</p>
    <p><a href="${url}" style="background:#10b981;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;">Verify Email</a></p>
    <p>Or copy this link: <a href="${url}">${url}</a></p>
    <p>This link expires in 24 hours.</p>
    <p>If you didn't create an account, you can ignore this email.</p>
    <p>— The Wireeo Team</p>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function send2FACode(email, name, code) {
  const subject = "Your Wireeo login code";
  const html = `
    <h2>Hello ${name},</h2>
    <p>Your verification code is: <strong style="font-size:24px;letter-spacing:4px;">${code}</strong></p>
    <p>This code expires in 10 minutes.</p>
    <p>If you didn't request this, please secure your account immediately.</p>
    <p>— The Wireeo Team</p>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendPasswordResetEmail(email, name, token) {
  const baseUrl = config.app?.frontendUrl || "http://localhost:5173";
  const url = `${baseUrl}/reset-password?token=${token}`;
  const subject = "Reset your Wireeo password";
  const html = `
    <h2>Hello ${name},</h2>
    <p>You requested a password reset. Click the link below to set a new password:</p>
    <p><a href="${url}" style="background:#10b981;color:white;padding:10px 20px;text-decoration:none;border-radius:8px;">Reset Password</a></p>
    <p>Or copy this link: <a href="${url}">${url}</a></p>
    <p>This link expires in 1 hour.</p>
    <p>If you didn't request this, you can ignore this email.</p>
    <p>— The Wireeo Team</p>
  `;
  return sendEmail({ to: email, subject, html });
}

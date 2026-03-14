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

export async function sendEmail({ to, replyTo, subject, html, text }) {
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
      ...(replyTo && { replyTo }),
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

function getFrontendBaseUrl() {
  return (
    config.app?.frontendUrl ??
    (process.env.NODE_ENV === "production" ? "https://wireeo.com" : "http://localhost:5173")
  );
}

export async function sendVerificationEmail(email, name, token) {
  const baseUrl = getFrontendBaseUrl();
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

/** Beautiful OTP email for signup verification (6-digit code). */
export async function sendSignUpOtpEmail(email, name, otp) {
  const subject = "Your Wireeo verification code";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Wireeo account</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f0fdf4;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:linear-gradient(135deg,#f0fdf4 0%,#ecfdf5 50%,#d1fae5 100%);min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;background:#ffffff;border-radius:24px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.08);border:1px solid rgba(255,255,255,0.8);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#059669 0%,#10b981 50%,#34d399 100%);padding:32px 40px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:16px;line-height:64px;margin-bottom:16px;">
                <span style="font-size:28px;">✉️</span>
              </div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Verify your email</h1>
              <p style="margin:8px 0 0;font-size:14px;color:rgba(255,255,255,0.9);">Welcome to Wireeo, ${name}!</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 24px;font-size:16px;color:#374151;line-height:1.6;">Use the code below to verify your account. Enter it on the sign-up page to complete registration.</p>
              <div style="background:linear-gradient(135deg,#ecfdf5 0%,#d1fae5 100%);border:2px dashed #10b981;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
                <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:2px;color:#059669;font-weight:600;">Your verification code</p>
                <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:8px;color:#047857;font-family:ui-monospace,monospace;">${otp}</p>
              </div>
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">This code expires in <strong>15 minutes</strong>.</p>
              <p style="margin:0;font-size:13px;color:#6b7280;">If you didn't create a Wireeo account, you can safely ignore this email.</p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">— The Wireeo Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
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
  const baseUrl = getFrontendBaseUrl();
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

import crypto from "crypto";
import qrcode from "qrcode";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { verifyPassword } from "@/lib/auth/password";
import { sendMail } from "@/lib/email/mailer";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { env } from "@/lib/env";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/**
 * Encodes a buffer into standard RFC 4648 Base32 string (without padding)
 */
export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

/**
 * Decodes an RFC 4648 Base32 string back to Buffer
 */
export function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, "").replace(/\s+/g, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

/**
 * Computes a 6-digit TOTP code according to RFC 6238 (HMAC-SHA1, 30s step)
 */
export function generateTOTPCode(secretBase32: string, timeStepOffset = 0): string {
  const secret = base32Decode(secretBase32);
  const timeStep = Math.floor(Date.now() / 1000 / 30) + timeStepOffset;
  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigUInt64BE(BigInt(timeStep), 0);

  const hmac = crypto.createHmac("sha1", secret).update(timeBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (binary % 1000000).toString().padStart(6, "0");
}

/**
 * Verifies a 6-digit TOTP code against a secret with +/- 1 time step drift (30s tolerance)
 */
export function verifyTOTPCode(token: string, secretBase32: string): boolean {
  if (!token || !secretBase32) return false;
  const clean = token.replace(/\s+/g, "").trim();
  if (clean.length !== 6 || !/^\d{6}$/.test(clean)) return false;

  for (let offset = -1; offset <= 1; offset++) {
    if (generateTOTPCode(secretBase32, offset) === clean) {
      return true;
    }
  }

  return false;
}

/**
 * Generates an array of secure random one-time backup recovery codes
 */
export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}`);
  }
  return codes;
}

/**
 * Dispatches an email notification when 2FA is activated
 */
async function sendTwoFactorEnabledEmail(to: string, userName: string) {
  const appName = env.appName || "PPMS Clinical OS";
  const now = new Date().toUTCString();

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Two-Factor Authentication Enabled</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; background: #f0fdfa; border: 1px solid #99f6e4; color: #0f766e; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .info-box { background: #f1f5f9; border-left: 4px solid #0f766e; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #334155; }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">🛡️ Security Confirmation</div>
    <h1 class="title">Two-Factor Authentication Enabled</h1>
    <p class="text">Hello <strong>${userName}</strong>,</p>
    <p class="text">Two-Factor Authentication (2FA) has been successfully activated on your <strong>${appName}</strong> account.</p>
    
    <div class="info-box">
      <strong>Activation Timestamp:</strong> ${now}<br />
      <strong>Account Email:</strong> ${to}<br />
      <strong>Security Method:</strong> Authenticator App (RFC 6238 TOTP)
    </div>

    <p class="text">
      From now on, whenever you sign in to PPMS, you will be prompted to enter a 6-digit code from your authenticator app or use one of your one-time backup recovery codes.
    </p>

    <p class="text" style="color: #64748b; font-size: 13px;">
      <strong>Notice:</strong> If you did not authorize this change, please contact your clinic administrator or reset your password immediately.
    </p>

    <div class="footer">
      This is an automated security notice from ${appName}. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>`;

  await sendMail({
    to,
    subject: `[Security Notice] Two-Factor Authentication Enabled - ${appName}`,
    html,
    text: `Hello ${userName}, Two-Factor Authentication (2FA) has been enabled on your ${appName} account at ${now}. If you did not perform this change, please reset your password immediately.`,
  });
}

/**
 * Dispatches an urgent email alert when 2FA is deactivated
 */
async function sendTwoFactorDisabledEmail(to: string, userName: string) {
  const appName = env.appName || "PPMS Clinical OS";
  const now = new Date().toUTCString();

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Security Alert: Two-Factor Authentication Disabled</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 24px; border: 1px solid #fecaca; padding: 36px; box-shadow: 0 4px 24px rgba(239,68,68,0.08); }
    .badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 9999px; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 20px; }
    .title { font-size: 22px; font-weight: 800; color: #991b1b; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .alert-box { background: #fff1f2; border-left: 4px solid #ef4444; border-radius: 12px; padding: 16px; margin: 24px 0; font-size: 13px; color: #991b1b; }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">⚠️ Urgent Security Notice</div>
    <h1 class="title">Two-Factor Authentication Was Disabled</h1>
    <p class="text">Hello <strong>${userName}</strong>,</p>
    <p class="text">This is an urgent notification to inform you that Two-Factor Authentication (2FA) has been <strong>disabled</strong> on your <strong>${appName}</strong> account.</p>
    
    <div class="alert-box">
      <strong>Action Timestamp:</strong> ${now}<br />
      <strong>Account Email:</strong> ${to}<br />
      <strong>Current Status:</strong> Your account is now protected only by your password.
    </div>

    <p class="text" style="color: #b91c1c; font-weight: 600;">
      If you did NOT perform this action, your account may be compromised. Please sign in and reset your password immediately, and re-enable Two-Factor Authentication.
    </p>

    <div class="footer">
      This is an automated security notice from ${appName}. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>`;

  await sendMail({
    to,
    subject: `[Urgent Security Alert] Two-Factor Authentication Disabled - ${appName}`,
    html,
    text: `Urgent Security Alert: Two-Factor Authentication has been disabled on your ${appName} account at ${now}. If you did not perform this change, please sign in and change your password immediately.`,
  });
}

/**
 * Initiates 2FA setup for an authenticated user:
 * Generates temporary secret, standard otpauth URI, QR Code data URL, and 8 recovery backup codes.
 */
export async function setupTwoFactor(user: { id: string; email: string; name: string }) {
  const appName = env.appName || "PPMS";
  // Generate 20 random cryptographically secure bytes (160 bits standard)
  const randomBuffer = crypto.randomBytes(20);
  const secret = base32Encode(randomBuffer);

  // Standard OTPAuth URI
  const issuer = appName.replace(/[:/?#]/g, "");
  const account = user.email;
  const otpauthUri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  // Generate QR code Data URL (PNG)
  const qrCodeDataUrl = await qrcode.toDataURL(otpauthUri, {
    errorCorrectionLevel: "M",
    width: 280,
    margin: 2,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  // Generate 8 initial recovery backup codes
  const backupCodes = generateBackupCodes(8);

  return {
    secret,
    qrCodeDataUrl,
    otpauthUri,
    backupCodes,
  };
}

/**
 * Verifies the user's initial code against the temporary secret and activates 2FA.
 * Dispatches a confirmation email and records activity log.
 */
export async function enableTwoFactor(
  userId: string,
  code: string,
  tempSecret: string,
  backupCodes: string[]
) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Validate the 6-digit TOTP code
  const isValid = verifyTOTPCode(code, tempSecret);
  if (!isValid) {
    throw new AppError("Invalid verification code. Please check your authenticator app and try again.", 400);
  }

  // Persist 2FA settings to database
  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: tempSecret,
      twoFactorBackupCodes: backupCodes,
    },
  });

  // Log activity
  await logActivity({
    organizationId: user.organizationId,
    userId: user.id,
    userName: user.name,
    userRole: user.role.name,
    action: "USER_2FA_ENABLED",
    entityType: "User",
    entityId: user.id,
    detailsJson: { email: user.email },
  });

  // Send confirmation email asynchronously (does not block user response)
  void sendTwoFactorEnabledEmail(user.email, user.name).catch((err) => {
    console.warn("[2FA EMAIL WARNING] Failed to deliver 2FA activation email:", err);
  });

  return {
    success: true,
    message: "Two-factor authentication has been successfully activated on your account.",
  };
}

/**
 * Disables 2FA on a user's account.
 * Requires user's current password for strict authentication.
 * Dispatches an urgent alert email and records activity log.
 */
export async function disableTwoFactor(userId: string, currentPassword: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.twoFactorEnabled) {
    throw new AppError("Two-factor authentication is not currently enabled on your account.", 400);
  }

  // Verify password before allowing 2FA deactivation
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError("Incorrect password. Current password is required to disable 2FA.", 401);
  }

  // Disable 2FA in database
  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  // Log activity
  await logActivity({
    organizationId: user.organizationId,
    userId: user.id,
    userName: user.name,
    userRole: user.role.name,
    action: "USER_2FA_DISABLED",
    entityType: "User",
    entityId: user.id,
    detailsJson: { email: user.email },
  });

  // Send security alert email asynchronously
  void sendTwoFactorDisabledEmail(user.email, user.name).catch((err) => {
    console.warn("[2FA EMAIL WARNING] Failed to deliver 2FA deactivation alert email:", err);
  });

  return {
    success: true,
    message: "Two-factor authentication has been disabled.",
  };
}

/**
 * Verifies a 2FA code during the login flow.
 * Accepts either:
 * 1. A 6-digit TOTP code
 * 2. An 8-character backup recovery code (format: XXXX-XXXX)
 * If a backup code is used, it is consumed (removed from the array) and updated in DB.
 */
export async function verifyLoginTwoFactor(
  userId: string,
  code: string
): Promise<{ success: boolean; usedBackupCode?: boolean }> {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    return { success: false };
  }

  const clean = code.trim().toUpperCase();

  // 1. Check if it's a valid 6-digit TOTP code
  if (/^\d{6}$/.test(clean.replace(/\s+/g, ""))) {
    const isValid = verifyTOTPCode(clean, user.twoFactorSecret);
    if (isValid) {
      return { success: true, usedBackupCode: false };
    }
  }

  // 2. Check if it matches an existing backup recovery code
  const backupCodes = Array.isArray(user.twoFactorBackupCodes)
    ? (user.twoFactorBackupCodes as string[])
    : [];

  const matchedIndex = backupCodes.findIndex(
    (bc) => bc.toUpperCase() === clean || bc.replace("-", "").toUpperCase() === clean.replace("-", "")
  );

  if (matchedIndex !== -1) {
    // Consume this single-use backup code
    const updatedBackupCodes = [...backupCodes];
    updatedBackupCodes.splice(matchedIndex, 1);

    await db.user.update({
      where: { id: userId },
      data: { twoFactorBackupCodes: updatedBackupCodes },
    });

    return { success: true, usedBackupCode: true };
  }

  return { success: false };
}

/**
 * Regenerates 8 fresh recovery backup codes for a user with active 2FA.
 * Requires current password verification.
 */
export async function regenerateBackupCodes(userId: string, currentPassword: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (!user.twoFactorEnabled) {
    throw new AppError("Two-factor authentication is not active.", 400);
  }

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) {
    throw new AppError("Incorrect password.", 401);
  }

  const newCodes = generateBackupCodes(8);

  await db.user.update({
    where: { id: userId },
    data: { twoFactorBackupCodes: newCodes },
  });

  return {
    success: true,
    backupCodes: newCodes,
  };
}

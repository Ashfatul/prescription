import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { sendMail } from "@/lib/email/mailer";
import { logActivity } from "@/features/activity-log/activity-log.service";

export interface TemplateVariableDefinition {
  name: string;
  description: string;
}

export const SYSTEM_EMAIL_TEMPLATES = [
  {
    key: "EMAIL_VERIFICATION",
    name: "Account Email Verification",
    description: "Sent immediately after user or clinic registration to confirm valid email ownership.",
    subject: "Verify your email address - {{appName}}",
    availableVars: ["userName", "userEmail", "verifyUrl", "token", "appName", "supportEmail"],
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Email</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .brand { font-size: 20px; font-weight: 800; color: #0f766e; margin-bottom: 24px; display: inline-block; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .btn { display: inline-block; background-color: #0f766e; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 2px 8px rgba(15,118,110,0.25); }
    .token-box { margin-top: 24px; padding: 14px 18px; background: #f1f5f9; border-radius: 12px; font-family: monospace; font-size: 13px; color: #334155; word-break: break-all; }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">{{appName}}</div>
    <h1 class="title">Verify Your Email Address</h1>
    <p class="text">Hello <strong>{{userName}}</strong>,</p>
    <p class="text">Thank you for registering with <strong>{{appName}}</strong>. Before you can log in or access your clinical dashboard, please confirm your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{verifyUrl}}" class="btn" target="_blank">Confirm Email Address</a>
    </div>

    <p class="text" style="font-size: 13px;">If the button above does not work, copy and paste this verification link into your web browser:</p>
    <div class="token-box">{{verifyUrl}}</div>

    <p class="text" style="font-size: 12px; color: #64748b; margin-top: 20px;">
      This verification link is valid for 24 hours. If you did not create an account on {{appName}}, please disregard this email.
    </p>

    <div class="footer">
      &copy; {{appName}} Clinical OS • Secure Medical Management System<br>
      Need assistance? Contact support at {{supportEmail}}
    </div>
  </div>
</body>
</html>`,
    bodyText: `Hello {{userName}},\n\nThank you for registering with {{appName}}.\n\nPlease verify your email address by visiting this link:\n{{verifyUrl}}\n\nThis link expires in 24 hours.\n\n- The {{appName}} Team`,
  },
  {
    key: "PASSWORD_RESET",
    name: "Password Reset Request",
    description: "Sent when a user requests to reset their account password.",
    subject: "Reset your {{appName}} password",
    availableVars: ["userName", "userEmail", "resetUrl", "token", "appName", "supportEmail"],
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .brand { font-size: 20px; font-weight: 800; color: #0f766e; margin-bottom: 24px; display: inline-block; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .btn { display: inline-block; background-color: #0f766e; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 2px 8px rgba(15,118,110,0.25); }
    .token-box { margin-top: 24px; padding: 14px 18px; background: #f1f5f9; border-radius: 12px; font-family: monospace; font-size: 13px; color: #334155; word-break: break-all; }
    .warning { padding: 12px 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; font-size: 12px; color: #92400e; margin-top: 20px; }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">{{appName}}</div>
    <h1 class="title">Reset Account Password</h1>
    <p class="text">Hello <strong>{{userName}}</strong>,</p>
    <p class="text">We received a request to reset your password for your <strong>{{appName}}</strong> account ({{userEmail}}). Click the button below to choose a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{resetUrl}}" class="btn" target="_blank">Reset Password</a>
    </div>

    <p class="text" style="font-size: 13px;">Or copy and paste this password reset URL into your web browser:</p>
    <div class="token-box">{{resetUrl}}</div>

    <div class="warning">
      <strong>Security Notice:</strong> This reset link will expire in 60 minutes. If you did not request a password reset, you can safely ignore this email; your account remains secure.
    </div>

    <div class="footer">
      &copy; {{appName}} Security Operations<br>
      Questions? Contact {{supportEmail}}
    </div>
  </div>
</body>
</html>`,
    bodyText: `Hello {{userName}},\n\nA password reset request was received for your {{appName}} account.\n\nReset your password here:\n{{resetUrl}}\n\nThis link is valid for 60 minutes.\nIf you did not request this, please ignore this email.\n\n- The {{appName}} Security Team`,
  },
  {
    key: "WELCOME_CLINIC",
    name: "New Clinic Registration Welcome",
    description: "Sent to the clinic administrator upon registering a new clinic or hospital branch.",
    subject: "Welcome to {{appName}} - {{clinicName}} is ready!",
    availableVars: ["userName", "clinicName", "dashboardUrl", "planName", "appName"],
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to {{appName}}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .brand { font-size: 20px; font-weight: 800; color: #0f766e; margin-bottom: 24px; display: inline-block; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #0f766e; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 2px 8px rgba(15,118,110,0.25); }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">{{appName}}</div>
    <h1 class="title">Welcome, {{userName}}!</h1>
    <p class="text">Congratulations! Your clinic <strong>{{clinicName}}</strong> has been created on <strong>{{appName}}</strong> under the <strong>{{planName}}</strong> plan.</p>
    <p class="text">Your clinic includes its own dedicated pharmaceutical formulary, diagnostic lab catalog, physician rosters, reception queue, and patient management portal.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{dashboardUrl}}" class="btn" target="_blank">Open Clinic Dashboard</a>
    </div>

    <div class="footer">
      &copy; {{appName}} Clinical SaaS Platform
    </div>
  </div>
</body>
</html>`,
    bodyText: `Welcome {{userName}}!\n\nYour clinic {{clinicName}} is active on {{appName}} under {{planName}}.\n\nAccess your dashboard here:\n{{dashboardUrl}}\n\n- The {{appName}} Team`,
  },
  {
    key: "ORGANIZATION_APPROVED",
    name: "Clinic Organization Approved by Super Admin",
    description: "Sent to the clinic administrator when their organization registration has been approved by the Super Admin.",
    subject: "Your clinic registration for {{clinicName}} has been approved! - {{appName}}",
    availableVars: ["userName", "clinicName", "loginUrl", "appName", "supportEmail"],
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Clinic Registration Approved</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .brand { font-size: 20px; font-weight: 800; color: #0f766e; margin-bottom: 24px; display: inline-block; }
    .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #0f766e; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 2px 8px rgba(15,118,110,0.25); }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">{{appName}}</div>
    <div class="badge">Registration Approved</div>
    <h1 class="title">Clinic Registration Approved!</h1>
    <p class="text">Hello <strong>{{userName}}</strong>,</p>
    <p class="text">Great news! Your clinic registration for <strong>{{clinicName}}</strong> has been reviewed and officially approved by the platform Super Administrator.</p>
    <p class="text">Your tenant workspace is now active. You may now log in to configure your physicians, reception triage, and pharmacy formulary.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{loginUrl}}" class="btn" target="_blank">Log In to Your Clinic</a>
    </div>

    <div class="footer">
      &copy; {{appName}} Clinical OS • Platform Administration
    </div>
  </div>
</body>
</html>`,
    bodyText: `Hello {{userName}},\n\nYour clinic registration for {{clinicName}} has been reviewed and approved by the Super Admin.\n\nYou can now log in to your account:\n{{loginUrl}}\n\n- The {{appName}} Team`,
  },
  {
    key: "PATIENT_ACCOUNT_VERIFIED",
    name: "Patient Account Verified & Activated",
    description: "Sent to the patient when their account registration is verified and approved by the clinic administration or front desk staff.",
    subject: "Your patient account has been verified - {{appName}}",
    availableVars: ["patientName", "clinicName", "loginUrl", "appName", "supportEmail"],
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Patient Account Verified</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .brand { font-size: 20px; font-weight: 800; color: #0f766e; margin-bottom: 24px; display: inline-block; }
    .badge { display: inline-block; padding: 4px 12px; background: #dcfce7; color: #166534; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #0f766e; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 2px 8px rgba(15,118,110,0.25); }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">{{appName}}</div>
    <div class="badge">Account Verified</div>
    <h1 class="title">Your Patient Account is Ready!</h1>
    <p class="text">Hello <strong>{{patientName}}</strong>,</p>
    <p class="text">Your patient registration has been verified and activated by the clinical front desk at <strong>{{clinicName}}</strong>.</p>
    <p class="text">You can now securely log in to your patient portal to book appointments, review your digital prescriptions, view diagnostic lab reports, and manage your medicine schedule.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{loginUrl}}" class="btn" target="_blank">Sign In to Patient Portal</a>
    </div>

    <div class="footer">
      &copy; {{appName}} Patient Health Services • {{clinicName}}
    </div>
  </div>
</body>
</html>`,
    bodyText: `Hello {{patientName}},\n\nYour patient account has been verified and activated by the staff at {{clinicName}}.\n\nYou can now log in here:\n{{loginUrl}}\n\n- The {{appName}} Team`,
  },
  {
    key: "PRESCRIPTION_ALERT",
    name: "Prescription Issued Alert",
    description: "Sent to patients when an attending physician publishes a clinical prescription.",
    subject: "Your Prescription from {{doctorName}} - {{appName}}",
    availableVars: ["patientName", "doctorName", "prescriptionUrl", "clinicName", "appName"],
    bodyHtml: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Prescription Issued</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #0f172a; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .brand { font-size: 20px; font-weight: 800; color: #0f766e; margin-bottom: 24px; display: inline-block; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px; }
    .text { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .btn { display: inline-block; background-color: #0f766e; color: #ffffff !important; font-weight: 700; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 14px; box-shadow: 0 2px 8px rgba(15,118,110,0.25); }
    .footer { font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="brand">{{clinicName}}</div>
    <h1 class="title">Digital Prescription Ready</h1>
    <p class="text">Hello <strong>{{patientName}}</strong>,</p>
    <p class="text"><strong>{{doctorName}}</strong> has authored a digital prescription for your consultation at <strong>{{clinicName}}</strong>.</p>
    <p class="text">You can view your prescription, dosages, intake instructions, and downloadable PDF below:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{prescriptionUrl}}" class="btn" target="_blank">View Prescription</a>
    </div>

    <div class="footer">
      &copy; {{clinicName}} • Powered by {{appName}}
    </div>
  </div>
</body>
</html>`,
    bodyText: `Hello {{patientName}},\n\n{{doctorName}} has issued your prescription at {{clinicName}}.\n\nView and download it here:\n{{prescriptionUrl}}\n\n- {{clinicName}}`,
  },
];

/**
 * Initializes default system email templates in the database if not present.
 */
export async function ensureDefaultTemplates(): Promise<void> {
  for (const t of SYSTEM_EMAIL_TEMPLATES) {
    const existing = await db.emailTemplate.findUnique({ where: { key: t.key } });
    if (!existing) {
      await db.emailTemplate.create({
        data: {
          key: t.key,
          name: t.name,
          description: t.description,
          subject: t.subject,
          bodyHtml: t.bodyHtml,
          bodyText: t.bodyText,
          availableVars: t.availableVars,
          isSystem: true,
          isActive: true,
        },
      });
    }
  }
}

/**
 * Lists email templates. Super Admin sees all templates.
 */
export async function listEmailTemplates(organizationId?: string) {
  await ensureDefaultTemplates();

  return db.emailTemplate.findMany({
    where: organizationId
      ? { OR: [{ organizationId }, { organizationId: null }] }
      : undefined,
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });
}

/**
 * Retrieves a single template by ID or key.
 */
export async function getEmailTemplate(keyOrId: string, organizationId?: string) {
  await ensureDefaultTemplates();

  // Try finding by key first
  let template = await db.emailTemplate.findFirst({
    where: {
      key: keyOrId,
      ...(organizationId ? { OR: [{ organizationId }, { organizationId: null }] } : {}),
    },
    orderBy: { organizationId: "desc" }, // prioritize organization-specific override
  });

  if (!template) {
    // Try finding by id
    template = await db.emailTemplate.findUnique({
      where: { id: keyOrId },
    });
  }

  return template;
}

export type CreateEmailTemplateInput = {
  key: string;
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
  description?: string;
  availableVars?: string[];
  organizationId?: string;
};

export async function createEmailTemplate(
  input: CreateEmailTemplateInput,
  creatorUserId?: string
) {
  const cleanKey = input.key.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

  const existing = await db.emailTemplate.findUnique({ where: { key: cleanKey } });
  if (existing) {
    throw new AppError(`An email template with key '${cleanKey}' already exists.`, 409);
  }

  const template = await db.emailTemplate.create({
    data: {
      key: cleanKey,
      name: input.name.trim(),
      subject: input.subject.trim(),
      bodyHtml: input.bodyHtml,
      bodyText: input.bodyText || undefined,
      description: input.description?.trim() || undefined,
      availableVars: input.availableVars || [],
      isSystem: false,
      isActive: true,
      organizationId: input.organizationId || undefined,
    },
  });

  await logActivity({
    organizationId: input.organizationId,
    userId: creatorUserId,
    userName: "Administrator",
    userRole: "SUPER_ADMIN",
    action: "EMAIL_TEMPLATE_CREATED",
    entityType: "EmailTemplate",
    entityId: template.id,
    detailsJson: { key: template.key, name: template.name },
  });

  return template;
}

export type UpdateEmailTemplateInput = {
  name?: string;
  subject?: string;
  bodyHtml?: string;
  bodyText?: string;
  description?: string;
  availableVars?: string[];
  isActive?: boolean;
};

export async function updateEmailTemplate(
  id: string,
  input: UpdateEmailTemplateInput,
  editorUserId?: string
) {
  const existing = await db.emailTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Email template not found", 404);
  }

  const updated = await db.emailTemplate.update({
    where: { id },
    data: {
      name: input.name !== undefined ? input.name.trim() : undefined,
      subject: input.subject !== undefined ? input.subject.trim() : undefined,
      bodyHtml: input.bodyHtml !== undefined ? input.bodyHtml : undefined,
      bodyText: input.bodyText !== undefined ? input.bodyText : undefined,
      description: input.description !== undefined ? input.description.trim() : undefined,
      availableVars: input.availableVars !== undefined ? input.availableVars : undefined,
      isActive: input.isActive !== undefined ? input.isActive : undefined,
    },
  });

  await logActivity({
    organizationId: existing.organizationId,
    userId: editorUserId,
    userName: "Administrator",
    userRole: "SUPER_ADMIN",
    action: "EMAIL_TEMPLATE_UPDATED",
    entityType: "EmailTemplate",
    entityId: updated.id,
    detailsJson: { key: updated.key, name: updated.name },
  });

  return updated;
}

export async function deleteEmailTemplate(id: string, deleterUserId?: string) {
  const existing = await db.emailTemplate.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Email template not found", 404);
  }
  if (existing.isSystem) {
    throw new AppError("System email templates cannot be deleted; you may edit or deactivate them.", 400);
  }

  await db.emailTemplate.delete({ where: { id } });

  await logActivity({
    organizationId: existing.organizationId,
    userId: deleterUserId,
    userName: "Administrator",
    userRole: "SUPER_ADMIN",
    action: "EMAIL_TEMPLATE_DELETED",
    entityType: "EmailTemplate",
    entityId: id,
    detailsJson: { key: existing.key, name: existing.name },
  });

  return { deleted: true };
}

/**
 * Replace {{variableName}} in string with given dictionary.
 */
export function interpolateVariables(
  content: string,
  variables: Record<string, string | number | undefined | null>
): string {
  return content.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const val = variables[key];
    return val !== undefined && val !== null ? String(val) : "";
  });
}

/**
 * Sends a templated email using the configured template and recipient info.
 */
export async function sendTemplatedEmail(params: {
  key: string;
  to: string;
  variables: Record<string, string | number | undefined | null>;
  organizationId?: string | null;
}) {
  const template = await getEmailTemplate(params.key, params.organizationId || undefined);
  if (!template) {
    throw new AppError(`Email template with key '${params.key}' not found.`, 404);
  }

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "PPMS";
  const supportEmail = process.env.MAIL_FROM_ADDRESS || "support@ppms.local";

  const allVars: Record<string, string | number | undefined | null> = {
    appName,
    supportEmail,
    ...params.variables,
  };

  const subject = interpolateVariables(template.subject, allVars);
  const html = interpolateVariables(template.bodyHtml, allVars);
  const text = template.bodyText ? interpolateVariables(template.bodyText, allVars) : undefined;

  return sendMail({
    to: params.to,
    subject,
    html,
    text,
  });
}

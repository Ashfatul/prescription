import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { ensureDefaultTemplates, sendTemplatedEmail } from "@/features/email-templates/email-template.service";

export interface SetupBootstrapInput {
  systemName: string;
  systemTagline?: string;
  supportEmail: string;
  contactPhone?: string;
  emergencyHotline?: string;
  defaultCurrency?: string;
  defaultTimezone?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
  host?: string;
  protocol?: string;
  wipeExistingDatabase?: boolean;

  // Outgoing Mail (SMTP) Settings
  smtpEnabled?: boolean;
  smtpHost?: string;
  smtpPort?: number | string;
  smtpUser?: string;
  smtpPass?: string;
  smtpEncryption?: string;
  smtpFromAddress?: string;
  smtpFromName?: string;
}

export interface SetupStatus {
  isInstalled: boolean;
  dbConnected: boolean;
  tablesReady: boolean;
  latencyMs?: number;
  error?: string;
  superAdminCount?: number;
  existingUserCount?: number;
  hasExistingData?: boolean;
}

// Adaptive memory cache for installation status (1 hour TTL once installed, 5s during setup)
let cachedInstalledStatus: boolean | null = null;
let lastCacheCheckTime = 0;
const UNINSTALLED_CACHE_TTL_MS = 5000;
const INSTALLED_CACHE_TTL_MS = 3600_000; // 1 hour once system is confirmed operational

export function invalidateInstallCache() {
  cachedInstalledStatus = null;
  lastCacheCheckTime = 0;
}

/**
 * Checks PostgreSQL database connection and basic schema readiness.
 */
export async function checkDatabaseConnection(): Promise<{
  connected: boolean;
  tablesReady: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  try {
    // 1. Raw connectivity ping
    await db.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;

    // 2. Check if tables exist by querying Role or User count
    let tablesReady = false;
    try {
      await db.role.count();
      await db.systemSetting.count();
      tablesReady = true;
    } catch {
      tablesReady = false;
    }

    return {
      connected: true,
      tablesReady,
      latencyMs,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to connect to PostgreSQL database.";
    return {
      connected: false,
      tablesReady: false,
      error: errorMsg,
    };
  }
}

/**
 * Fast check to determine if the platform has completed initial installation.
 */
export async function isSystemInstalled(): Promise<boolean> {
  const now = Date.now();
  const activeTtl = cachedInstalledStatus ? INSTALLED_CACHE_TTL_MS : UNINSTALLED_CACHE_TTL_MS;
  if (cachedInstalledStatus !== null && now - lastCacheCheckTime < activeTtl) {
    return cachedInstalledStatus;
  }

  try {
    // 1. Check for installed setting
    const setting = await db.systemSetting.findUnique({
      where: { key: "system_installed" },
    });

    if (!setting || setting.value !== "true") {
      cachedInstalledStatus = false;
      lastCacheCheckTime = now;
      return false;
    }

    // 2. Ensure at least one SUPER_ADMIN user exists
    const superAdmin = await db.user.findFirst({
      where: {
        role: { name: RoleName.SUPER_ADMIN },
      },
      select: { id: true },
    });

    const installed = !!superAdmin;
    cachedInstalledStatus = installed;
    lastCacheCheckTime = now;
    return installed;
  } catch {
    // If DB is offline or tables unmigrated, system cannot be considered installed
    cachedInstalledStatus = false;
    lastCacheCheckTime = now;
    return false;
  }
}

/**
 * Cleanly resets/wipes operational tables in PostgreSQL for a conflict-free fresh onboarding.
 */
export async function wipeDatabaseForSetup(): Promise<void> {
  try {
    await db.$executeRawUnsafe(`
      TRUNCATE TABLE 
        "ChatMessage", 
        "ChatConnection", 
        "PrescriptionAttachment", 
        "PrescriptionVersion", 
        "TestReport", 
        "MedicineReminder", 
        "Appointment", 
        "Prescription", 
        "Doctor", 
        "Patient", 
        "File", 
        "Template", 
        "Notification", 
        "Announcement", 
        "ActivityLog", 
        "User", 
        "Organization", 
        "SystemSetting" 
      CASCADE;
    `);
  } catch (err) {
    console.warn("TRUNCATE CASCADE failed, falling back to sequential deleteMany:", err);
    await db.chatMessage.deleteMany({});
    await db.chatConnection.deleteMany({});
    await db.prescriptionAttachment.deleteMany({});
    await db.prescriptionVersion.deleteMany({});
    await db.testReport.deleteMany({});
    await db.medicineReminder.deleteMany({});
    await db.appointment.deleteMany({});
    await db.prescription.deleteMany({});
    await db.doctor.deleteMany({});
    await db.patient.deleteMany({});
    await db.file.deleteMany({});
    await db.template.deleteMany({});
    await db.notification.deleteMany({});
    await db.announcement.deleteMany({});
    await db.activityLog.deleteMany({});
    await db.user.deleteMany({});
    await db.organization.deleteMany({});
    await db.systemSetting.deleteMany({});
  }

  invalidateInstallCache();
}

/**
 * Returns full diagnostic status for the setup wizard.
 */
export async function getSystemSetupStatus(): Promise<SetupStatus> {
  const dbHealth = await checkDatabaseConnection();
  if (!dbHealth.connected || !dbHealth.tablesReady) {
    return {
      isInstalled: false,
      dbConnected: dbHealth.connected,
      tablesReady: dbHealth.tablesReady,
      latencyMs: dbHealth.latencyMs,
      error: dbHealth.error,
      superAdminCount: 0,
      existingUserCount: 0,
      hasExistingData: false,
    };
  }

  try {
    const [installedSetting, superAdminCount, existingUserCount] = await Promise.all([
      db.systemSetting.findUnique({ where: { key: "system_installed" } }),
      db.user.count({ where: { role: { name: RoleName.SUPER_ADMIN } } }),
      db.user.count(),
    ]);

    const isInstalled = installedSetting?.value === "true" && superAdminCount > 0;
    const hasExistingData = existingUserCount > 0;

    return {
      isInstalled,
      dbConnected: true,
      tablesReady: true,
      latencyMs: dbHealth.latencyMs,
      superAdminCount,
      existingUserCount,
      hasExistingData,
    };
  } catch (err: unknown) {
    return {
      isInstalled: false,
      dbConnected: true,
      tablesReady: false,
      error: err instanceof Error ? err.message : "Error reading system configuration",
      superAdminCount: 0,
      existingUserCount: 0,
      hasExistingData: false,
    };
  }
}

/**
 * Executes the complete first-run system onboarding bootstrap.
 */
export async function executeSystemBootstrap(input: SetupBootstrapInput) {
  // 1. Check if already installed
  const installed = await isSystemInstalled();
  if (installed) {
    throw new AppError("The system is already configured and locked.", 403);
  }

  // 1b. If wipe requested before bootstrap
  if (input.wipeExistingDatabase) {
    await wipeDatabaseForSetup();
  }

  // 2. Validate inputs
  const cleanName = input.systemName?.trim();
  if (!cleanName || cleanName.length < 2) {
    throw new AppError("System or Hospital name must be at least 2 characters.", 400);
  }

  const cleanAdminName = input.adminName?.trim();
  if (!cleanAdminName || cleanAdminName.length < 2) {
    throw new AppError("Administrator name must be at least 2 characters.", 400);
  }

  const cleanAdminEmail = input.adminEmail?.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!cleanAdminEmail || !emailRegex.test(cleanAdminEmail)) {
    throw new AppError("Please provide a valid administrator email address.", 400);
  }

  if (!input.adminPassword || input.adminPassword.length < 8) {
    throw new AppError("Administrator password must be at least 8 characters.", 400);
  }

  // Check if user with this email already exists
  const existingUser = await db.user.findUnique({
    where: { email: cleanAdminEmail },
  });
  if (existingUser) {
    throw new AppError(
      "A user with this email already exists in the database. Please enable 'Wipe existing database' to perform a clean setup without conflict.",
      409
    );
  }

  // 3. Ensure all standard roles exist
  const roles = await Promise.all(
    Object.values(RoleName).map((roleName) =>
      db.role.upsert({
        where: { name: roleName },
        update: {},
        create: { name: roleName },
      })
    )
  );

  const superAdminRole = roles.find((r) => r.name === RoleName.SUPER_ADMIN);
  if (!superAdminRole) {
    throw new AppError("Failed to initialize system roles.", 500);
  }

  // 4. Save core system settings
  const settingsToUpsert = [
    { key: "system_installed", value: "true", category: "system" },
    { key: "hospital_name", value: cleanName, category: "general" },
    { key: "hospitalName", value: cleanName, category: "hospital" },
    { key: "hospital_tagline", value: input.systemTagline?.trim() || "Clinical Prescribing & Hospital Management System", category: "general" },
    { key: "hospitalTagline", value: input.systemTagline?.trim() || "Clinical Prescribing & Hospital Management System", category: "hospital" },
    { key: "support_email", value: input.supportEmail?.trim().toLowerCase() || cleanAdminEmail, category: "general" },
    { key: "supportEmail", value: input.supportEmail?.trim().toLowerCase() || cleanAdminEmail, category: "hospital" },
    { key: "contact_phone", value: input.contactPhone?.trim() || "", category: "general" },
    { key: "contactPhone", value: input.contactPhone?.trim() || "", category: "hospital" },
    { key: "emergency_hotline", value: input.emergencyHotline?.trim() || "", category: "general" },
    { key: "emergencyHotline", value: input.emergencyHotline?.trim() || "", category: "hospital" },
    { key: "default_currency", value: input.defaultCurrency?.trim() || "BDT", category: "general" },
    { key: "default_timezone", value: input.defaultTimezone?.trim() || "Asia/Dhaka", category: "general" },
    { key: "auth_require_email_verification", value: "true", category: "auth" },
    { key: "auth_require_org_approval", value: "true", category: "auth" },
    { key: "auth_require_patient_verification", value: "true", category: "auth" },
    { key: "smtp_enabled", value: input.smtpEnabled ? "true" : "false", category: "mail" },
    { key: "smtp_host", value: input.smtpHost?.trim() || "", category: "mail" },
    { key: "smtp_port", value: String(input.smtpPort || 587), category: "mail" },
    { key: "smtp_encryption", value: input.smtpEncryption || "tls", category: "mail" },
    { key: "smtp_user", value: input.smtpUser?.trim() || "", category: "mail" },
    { key: "smtp_pass", value: input.smtpPass?.trim() || "", category: "mail" },
    { key: "smtp_from_address", value: input.smtpFromAddress?.trim() || input.supportEmail?.trim() || cleanAdminEmail, category: "mail" },
    { key: "smtp_from_name", value: input.smtpFromName?.trim() || cleanName, category: "mail" },
  ];

  await Promise.all(
    settingsToUpsert.map((s) =>
      db.systemSetting.upsert({
        where: { key: s.key },
        create: s,
        update: { value: s.value, category: s.category },
      })
    )
  );

  // 5. Seed standard SaaS Pricing Plans if none exist
  const existingPlanCount = await db.pricingPlan.count();
  if (existingPlanCount === 0) {
    await Promise.all([
      db.pricingPlan.create({
        data: {
          name: "Starter Clinic",
          price: 49,
          billingCycle: "monthly",
          description: "Essential prescribing & patient management for solo practitioners.",
          maxDoctors: 2,
          maxStaff: 5,
          maxPatients: 500,
          maxPrescriptionsPerMonth: 500,
          features: [
            "Up to 2 Doctor Accounts",
            "500 Prescriptions / month",
            "Drug & Test Formulary Access",
            "A4 Standard Printouts",
            "Patient Records & History",
            "Email Support",
          ],
          isPopular: false,
          isActive: true,
        },
      }),
      db.pricingPlan.create({
        data: {
          name: "Professional Polyclinic",
          price: 149,
          billingCycle: "monthly",
          description: "Complete clinical OS for multi-doctor chambers and medical centers.",
          maxDoctors: 15,
          maxStaff: 30,
          maxPatients: 5000,
          maxPrescriptionsPerMonth: 5000,
          features: [
            "Up to 15 Doctor Accounts",
            "Unlimited Prescriptions",
            "Live Chamber Queue Dispenser",
            "QR Code & Public Link Prescription Sharing",
            "Test Report Uploads (Doctor & Patient)",
            "Google Calendar & Medicine Reminders",
            "Staff & Receptionist Triage Portal",
            "Patient-Doctor Approved Chat System",
            "24/7 Priority Clinical Support",
          ],
          isPopular: true,
          isActive: true,
        },
      }),
      db.pricingPlan.create({
        data: {
          name: "Hospital Enterprise",
          price: 399,
          billingCycle: "monthly",
          description: "Comprehensive multi-specialty hospital infrastructure with custom integrations.",
          features: [
            "Unlimited Doctor & Staff Seats",
            "Multi-Branch SaaS Clinic Partitioning",
            "Custom Letterhead & Insignia Watermarking",
            "Full Audit & System Activity Logging",
            "Role-Based Admin Broadcast Announcements",
            "Dedicated Database & SLA Guarantee",
            "Automated Email & System Alerts",
            "Dedicated Account Executive",
          ],
          isPopular: false,
          isActive: true,
        },
      }),
    ]);
  }

  // 6. Ensure default email templates exist
  await ensureDefaultTemplates();

  // 7. Provision the Root Super Admin with email verification token
  const passwordHash = await bcrypt.hash(input.adminPassword, 12);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours validity

  const user = await db.user.create({
    data: {
      name: cleanAdminName,
      email: cleanAdminEmail,
      passwordHash,
      roleId: superAdminRole.id,
      emailVerified: null, // EMAIL MUST REQUIRE VERIFICATION!
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiresAt: tokenExpiresAt,
      isApproved: true,
      isDemo: false,
    },
  });

  // Invalidate cache immediately
  invalidateInstallCache();

  // 8. Dispatch Email Verification
  const host = input.host || "localhost:3000";
  const protocol = input.protocol || "http";
  const verifyUrl = `${protocol}://${host}/auth/verify-email?token=${verificationToken}`;

  let emailSent = false;
  let smtpError: string | undefined;

  try {
    await sendTemplatedEmail({
      key: "EMAIL_VERIFICATION",
      to: user.email,
      variables: {
        userName: user.name,
        userEmail: user.email,
        verifyUrl,
        token: verificationToken,
        appName: cleanName,
      },
    });
    emailSent = true;
  } catch (err: unknown) {
    console.warn("SMTP delivery warning during setup:", err);
    emailSent = false;
    smtpError = err instanceof Error ? err.message : "SMTP service unconfigured or offline";
  }

  // 9. Log setup activity
  await logActivity({
    userId: user.id,
    userName: user.name,
    userRole: RoleName.SUPER_ADMIN,
    action: "SYSTEM_INITIALIZED",
    entityType: "System",
    entityId: "SYSTEM_SETUP",
    detailsJson: {
      systemName: cleanName,
      adminEmail: user.email,
      emailSent,
      timestamp: new Date().toISOString(),
    },
  });

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    systemName: cleanName,
    verificationToken,
    verifyUrl,
    emailSent,
    smtpError,
    smtpConfigured: Boolean(input.smtpEnabled && input.smtpHost),
  };
}

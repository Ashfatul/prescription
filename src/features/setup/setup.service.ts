import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { logActivity } from "@/features/activity-log/activity-log.service";
import { ensureDefaultTemplates, sendTemplatedEmail } from "@/features/email-templates/email-template.service";
import { createOrganization, validateSlugAvailability } from "@/features/organizations/organization.service";
import { invalidateSettingsCache } from "@/features/settings/settings.service";
import { cleanSlug, isValidSlugFormat } from "@/lib/organizations/slug";

/**
 * Everything required to fully provision the clinic (tenant) during onboarding.
 * Core columns live on Organization; the remaining profile data is stored in
 * Organization.settingsJson so it is immediately editable later.
 */
export interface ClinicOnboardingInput {
  name: string;
  slug?: string;
  type?: string;
  registrationNumber?: string;
  establishedYear?: string;
  website?: string;
  email?: string;
  phone?: string;
  hotline?: string;
  addressLine?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  country?: string;
  mapLink?: string;
  about?: string;
  openingTime?: string;
  closingTime?: string;
  workingDays?: string;
  specialties?: string[] | string;
  bedCount?: number | string;
  consultationFee?: number | string;
  followupValidityDays?: number | string;
  reportFreeDays?: number | string;
  logoUrl?: string;
}

export interface SetupBootstrapInput {
  systemName: string;
  systemTagline?: string;
  supportEmail: string;
  contactPhone?: string;
  emergencyHotline?: string;
  defaultCurrency?: string;
  defaultTimezone?: string;

  // First clinic / tenant profile captured in the onboarding wizard
  clinic?: ClinicOnboardingInput;

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

  // 2c. Validate and normalise the clinic profile supplied in the onboarding wizard
  const clinicInput = input.clinic;
  const cleanClinicName = clinicInput?.name?.trim() || cleanName;
  if (cleanClinicName.length < 2) {
    throw new AppError("Clinic name must be at least 2 characters.", 400);
  }

  const cleanClinicSlug = cleanSlug(clinicInput?.slug?.trim() || cleanClinicName);
  const slugFormat = isValidSlugFormat(cleanClinicSlug);
  if (!slugFormat.valid) {
    throw new AppError(slugFormat.reason || "Invalid clinic subdomain.", 400);
  }
  const slugAvailability = await validateSlugAvailability(cleanClinicSlug);
  if (!slugAvailability.available) {
    throw new AppError(slugAvailability.reason || "This clinic subdomain is already taken.", 409);
  }

  const clinicType = clinicInput?.type?.trim() || "clinic";
  const clinicEmail =
    clinicInput?.email?.trim().toLowerCase() ||
    input.supportEmail?.trim().toLowerCase() ||
    cleanAdminEmail;
  const clinicPhone = clinicInput?.phone?.trim() || input.contactPhone?.trim() || "";
  const clinicHotline = clinicInput?.hotline?.trim() || input.emergencyHotline?.trim() || "";
  const clinicAddress = [
    clinicInput?.addressLine,
    clinicInput?.city,
    clinicInput?.district,
    clinicInput?.postalCode,
    clinicInput?.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  const visitingHours = [
    clinicInput?.workingDays?.trim(),
    [clinicInput?.openingTime?.trim(), clinicInput?.closingTime?.trim()].filter(Boolean).join(" - "),
  ]
    .filter(Boolean)
    .join(" | ");
  const clinicSpecialties = (Array.isArray(clinicInput?.specialties)
    ? clinicInput.specialties
    : String(clinicInput?.specialties || "")
        .split(",")
        .map((item) => item.trim())
  ).map((item) => String(item).trim()).filter(Boolean);
  const toNonNegativeNumber = (value: unknown): number | undefined => {
    if (value === undefined || value === null || value === "") return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  };

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
    { key: "system_name", value: cleanName, category: "system" },
    { key: "systemName", value: cleanName, category: "system" },
    { key: "hospital_name", value: cleanClinicName, category: "general" },
    { key: "hospitalName", value: cleanClinicName, category: "hospital" },
    { key: "hospital_tagline", value: input.systemTagline?.trim() || "Clinical Prescribing & Hospital Management System", category: "general" },
    { key: "hospitalTagline", value: input.systemTagline?.trim() || "Clinical Prescribing & Hospital Management System", category: "hospital" },
    { key: "support_email", value: clinicEmail, category: "general" },
    { key: "supportEmail", value: clinicEmail, category: "hospital" },
    { key: "contact_phone", value: clinicPhone, category: "general" },
    { key: "contactPhone", value: clinicPhone, category: "hospital" },
    { key: "emergency_hotline", value: clinicHotline, category: "general" },
    { key: "emergencyHotline", value: clinicHotline, category: "hospital" },
    { key: "hospital_address", value: clinicAddress, category: "general" },
    { key: "hospitalAddress", value: clinicAddress, category: "hospital" },
    { key: "hospital_website", value: clinicInput?.website?.trim() || "", category: "hospital" },
    { key: "hospitalWebsite", value: clinicInput?.website?.trim() || "", category: "hospital" },
    { key: "hospital_logo_url", value: clinicInput?.logoUrl?.trim() || "", category: "hospital" },
    { key: "hospitalLogoUrl", value: clinicInput?.logoUrl?.trim() || "", category: "hospital" },
    { key: "opd_visiting_hours", value: visitingHours, category: "hospital" },
    { key: "opdVisitingHours", value: visitingHours, category: "hospital" },
    { key: "chamber_days", value: clinicInput?.workingDays?.trim() || "", category: "hospital" },
    { key: "chamberDays", value: clinicInput?.workingDays?.trim() || "", category: "hospital" },
    { key: "clinic_name", value: cleanClinicName, category: "hospital" },
    { key: "clinic_slug", value: cleanClinicSlug, category: "hospital" },
    { key: "clinic_type", value: clinicType, category: "hospital" },
    { key: "clinic_registration_number", value: clinicInput?.registrationNumber?.trim() || "", category: "hospital" },
    { key: "clinic_city", value: clinicInput?.city?.trim() || "", category: "hospital" },
    { key: "clinic_country", value: clinicInput?.country?.trim() || "", category: "hospital" },
    { key: "clinic_map_link", value: clinicInput?.mapLink?.trim() || "", category: "hospital" },
    { key: "clinic_specialties", value: clinicSpecialties.join(", "), category: "hospital" },
    { key: "clinic_about", value: clinicInput?.about?.trim() || "", category: "hospital" },
    {
      key: "default_consultation_fee",
      value: String(toNonNegativeNumber(clinicInput?.consultationFee) ?? 0),
      category: "hospital",
    },
    {
      key: "default_followup_validity_days",
      value: String(toNonNegativeNumber(clinicInput?.followupValidityDays) ?? 90),
      category: "hospital",
    },
    {
      key: "default_report_free_days",
      value: String(toNonNegativeNumber(clinicInput?.reportFreeDays) ?? 2),
      category: "hospital",
    },
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

  // 7b. Provision the fully configured first clinic and attach the admin to it
  const organization = await createOrganization(
    {
      name: cleanClinicName,
      slug: cleanClinicSlug,
      contactEmail: clinicEmail,
      contactPhone: clinicPhone,
      address: clinicAddress,
      logoUrl: clinicInput?.logoUrl?.trim() || undefined,
      settingsJson: {
        clinicType,
        registrationNumber: clinicInput?.registrationNumber?.trim() || "",
        establishedYear: clinicInput?.establishedYear?.trim() || "",
        website: clinicInput?.website?.trim() || "",
        hotline: clinicHotline,
        city: clinicInput?.city?.trim() || "",
        district: clinicInput?.district?.trim() || "",
        postalCode: clinicInput?.postalCode?.trim() || "",
        country: clinicInput?.country?.trim() || "",
        mapLink: clinicInput?.mapLink?.trim() || "",
        about: clinicInput?.about?.trim() || "",
        visitingHours,
        workingDays: clinicInput?.workingDays?.trim() || "",
        openingTime: clinicInput?.openingTime?.trim() || "",
        closingTime: clinicInput?.closingTime?.trim() || "",
        specialties: clinicSpecialties,
        bedCount: toNonNegativeNumber(clinicInput?.bedCount) ?? 0,
        consultationFee: toNonNegativeNumber(clinicInput?.consultationFee) ?? 0,
        followupValidityDays: toNonNegativeNumber(clinicInput?.followupValidityDays) ?? 90,
        reportFreeDays: toNonNegativeNumber(clinicInput?.reportFreeDays) ?? 2,
      },
    },
    user.id
  );

  await db.user.update({
    where: { id: user.id },
    data: { organizationId: organization.id, phone: clinicPhone || undefined },
  });

  invalidateSettingsCache();

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

  // 10. Mark the platform installed only after the admin AND clinic are fully provisioned
  await db.systemSetting.upsert({
    where: { key: "system_installed" },
    create: { key: "system_installed", value: "true", category: "system" },
    update: { value: "true", category: "system" },
  });
  invalidateInstallCache();

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    systemName: cleanName,
    clinic: {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      type: clinicType,
      registrationNumber: clinicInput?.registrationNumber?.trim() || "",
      address: clinicAddress,
      contactEmail: clinicEmail,
      contactPhone: clinicPhone,
      hotline: clinicHotline,
      website: clinicInput?.website?.trim() || "",
      logoUrl: clinicInput?.logoUrl?.trim() || "",
    },
    verificationToken,
    verifyUrl,
    emailSent,
    smtpError,
    smtpConfigured: Boolean(input.smtpEnabled && input.smtpHost),
  };
}

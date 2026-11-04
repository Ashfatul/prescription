import bcrypt from "bcryptjs";
import { AppointmentStatus, Prisma, PrismaClient, RoleName } from "@prisma/client";
import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { DEMO_SUPER_ADMIN_EMAIL } from "@/features/demo/demo-reset.constants";

export const DEMO_CLINIC_SLUG = "ppms-clinic";
export const DEMO_CLINIC_NAME = "PPMS Clinic";
export const DEMO_RESET_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
export const SUPER_ADMIN_EMAIL = DEMO_SUPER_ADMIN_EMAIL;
export const LEGACY_SUPER_ADMIN_EMAIL = "admin@ppms.local";
export const DEMO_SUPER_ADMIN_PASSWORD = "aniyasfather";
export const DEMO_USER_PASSWORD = "Pass1234!";

export const DEMO_ACCOUNT_EMAILS = [
  SUPER_ADMIN_EMAIL,
  "clinic.admin@ppms.local",
  "doctor@ppms.local",
  "staff@ppms.local",
  "patient@ppms.local",
  "kamal.demo@ppms.local",
  "sadia.demo@ppms.local",
];

export function isDemoModeActive(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true" || process.env.DEMO_MODE === "true";
}

type DemoDbClient = PrismaClient | Prisma.TransactionClient;
type DemoSeedOptions = { seedSampleData?: boolean };

/**
 * Repairs the canonical demo Super Admin account without clearing demo data.
 * Existing databases may still contain the legacy account from before the
 * canonical credentials were introduced.
 */
export async function repairDemoSuperAdmin(client: DemoDbClient = db) {
  const canonicalAdmin = await client.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });
  const legacyAdmin = canonicalAdmin
    ? null
    : await client.user.findUnique({
        where: { email: LEGACY_SUPER_ADMIN_EMAIL },
      });
  const admin = canonicalAdmin || legacyAdmin;

  // A canonical account is already migrated. Never overwrite its password on
  // every login; Super Admins may have changed it after the initial migration.
  if (!admin || canonicalAdmin) return false;

  const superAdminRole = await client.role.upsert({
    where: { name: RoleName.SUPER_ADMIN },
    update: {},
    create: { name: RoleName.SUPER_ADMIN },
  });

  await client.user.update({
    where: { id: admin.id },
    data: {
      name: "Super Admin",
      email: SUPER_ADMIN_EMAIL,
      passwordHash: await bcrypt.hash(DEMO_SUPER_ADMIN_PASSWORD, 12),
      roleId: superAdminRole.id,
      isDemo: true,
      emailVerified: new Date(),
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  return true;
}

/**
 * Seeds or resets the dedicated PPMS Clinic organization and its clean baseline demo accounts.
 */
export async function seedOrResetDemoClinic(
  client: DemoDbClient = db,
  options: DemoSeedOptions = {},
) {
  const seedSampleData = options.seedSampleData ?? true;
  const passwordHash = await bcrypt.hash(DEMO_USER_PASSWORD, 12);
  const superAdminPasswordHash = await bcrypt.hash(DEMO_SUPER_ADMIN_PASSWORD, 12);

  // 1. Ensure Roles exist
  const roleRecords = await Promise.all(
    Object.values(RoleName).map((name) =>
      client.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  const roleByName = Object.fromEntries(roleRecords.map((r) => [r.name, r.id]));

  // 2. Ensure Starter & Professional pricing plans exist
  let proPlan = await client.pricingPlan.findFirst({
    where: { name: "Professional Polyclinic" },
  });
  if (!proPlan) {
    proPlan = await client.pricingPlan.create({
      data: {
        name: "Professional Polyclinic",
        price: 149,
        billingCycle: "monthly",
        description: "Complete clinical OS for multi-doctor chambers and medical centers.",
        features: [
          "Up to 15 Doctor Accounts",
          "Unlimited Prescriptions",
          "Live Chamber Queue Dispenser",
          "QR Code & Public Link Prescription Sharing",
          "Test Report Uploads",
        ],
        isPopular: true,
        isActive: true,
      },
    });
  }

  // Migrate the original demo Super Admin address before the canonical account is upserted.
  const existingCanonicalAdmin = await client.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
  });
  const legacyAdmin = await client.user.findUnique({
    where: { email: LEGACY_SUPER_ADMIN_EMAIL },
  });
  if (!existingCanonicalAdmin && legacyAdmin) {
    await client.user.update({
      where: { id: legacyAdmin.id },
      data: { email: SUPER_ADMIN_EMAIL },
    });
  }

  // 3. Upsert PPMS Clinic (Demo Sandbox Facility)
  const now = new Date();
  const demoOrg = await client.organization.upsert({
    where: { slug: DEMO_CLINIC_SLUG },
    update: {
      name: DEMO_CLINIC_NAME,
      isDemo: true,
      planId: proPlan.id,
      contactEmail: "demo@ppms-clinic.local",
      contactPhone: "+880 1700-000000",
      address: "Chamber Suite 101, PPMS Clinical Sandbox Facility, Dhaka",
      lastDemoResetAt: now,
      status: "ACTIVE",
    },
    create: {
      name: DEMO_CLINIC_NAME,
      slug: DEMO_CLINIC_SLUG,
      isDemo: true,
      planId: proPlan.id,
      contactEmail: "demo@ppms-clinic.local",
      contactPhone: "+880 1700-000000",
      address: "Chamber Suite 101, PPMS Clinical Sandbox Facility, Dhaka",
      lastDemoResetAt: now,
      status: "ACTIVE",
    },
  });

  // 4. Clean up any previous appointments, prescriptions, reminders for PPMS Clinic
  await client.medicineReminder.deleteMany({
    where: { organizationId: demoOrg.id },
  });
  await client.testReport.deleteMany({
    where: { organizationId: demoOrg.id },
  });
  await client.prescriptionAttachment.deleteMany({
    where: { prescription: { organizationId: demoOrg.id } },
  });
  await client.prescription.deleteMany({
    where: { organizationId: demoOrg.id },
  });
  await client.appointment.deleteMany({
    where: { organizationId: demoOrg.id },
  });
  await client.activityLog.deleteMany({
    where: { organizationId: demoOrg.id },
  });
  await client.announcement.deleteMany({
    where: { organizationId: demoOrg.id },
  });

  // 5. Seed Core Demo Users (All assigned strictly to PPMS Clinic)
  // 5a. Super Admin
  const adminUser = await client.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      name: "Super Admin",
      passwordHash: superAdminPasswordHash,
      roleId: roleByName.SUPER_ADMIN,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
    create: {
      name: "Super Admin",
      email: SUPER_ADMIN_EMAIL,
      passwordHash: superAdminPasswordHash,
      roleId: roleByName.SUPER_ADMIN,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  // 5b. Clinic Admin
  await client.user.upsert({
    where: { email: "clinic.admin@ppms.local" },
    update: {
      name: "PPMS Clinic Admin",
      passwordHash,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
    create: {
      name: "PPMS Clinic Admin",
      email: "clinic.admin@ppms.local",
      passwordHash,
      roleId: roleByName.ADMIN,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  // 5c. Front Desk Staff
  await client.user.upsert({
    where: { email: "staff@ppms.local" },
    update: {
      name: "PPMS Front Desk Staff",
      passwordHash,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
    create: {
      name: "PPMS Front Desk Staff",
      email: "staff@ppms.local",
      passwordHash,
      roleId: roleByName.STAFF,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  // 5d. Doctor: Dr. Fahim Rahman
  const doctorUser = await client.user.upsert({
    where: { email: "doctor@ppms.local" },
    update: {
      name: "Dr. Fahim Rahman",
      passwordHash,
      imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
    create: {
      name: "Dr. Fahim Rahman",
      email: "doctor@ppms.local",
      passwordHash,
      roleId: roleByName.DOCTOR,
      imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
    },
  });

  const demoDoctor = await client.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {
      organizationId: demoOrg.id,
      specialization: "General Medicine",
      degrees: "MBBS, FCPS (Medicine), MACP (USA)",
      designation: "Senior Consultant, Department of Medicine",
      hospital: DEMO_CLINIC_NAME,
      bmdcRegNo: "BMDC-A-41285",
      chamberAddress: "Chamber 101, PPMS Clinic Sandbox Block",
      contactNumber: "+880 1711-234567",
      newPatientFee: 50,
      followupFee: 30,
      available: true,
      scheduleJson: {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"],
        startTime: "09:00 AM",
        endTime: "02:00 PM",
        chamber: "Chamber 101",
      },
    },
    create: {
      userId: doctorUser.id,
      organizationId: demoOrg.id,
      specialization: "General Medicine",
      degrees: "MBBS, FCPS (Medicine), MACP (USA)",
      designation: "Senior Consultant, Department of Medicine",
      hospital: DEMO_CLINIC_NAME,
      bmdcRegNo: "BMDC-A-41285",
      chamberAddress: "Chamber 101, PPMS Clinic Sandbox Block",
      contactNumber: "+880 1711-234567",
      newPatientFee: 50,
      followupFee: 30,
      available: true,
      scheduleJson: {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Saturday"],
        startTime: "09:00 AM",
        endTime: "02:00 PM",
        chamber: "Chamber 101",
      },
    },
  });

  // 5e. Demo Patients
  // Primary Demo Patient: Nusrat Jahan
  const patient1User = await client.user.upsert({
    where: { email: "patient@ppms.local" },
    update: {
      name: "Nusrat Jahan",
      passwordHash,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      phone: "+880 1712-345678",
    },
    create: {
      name: "Nusrat Jahan",
      email: "patient@ppms.local",
      passwordHash,
      roleId: roleByName.PATIENT,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      phone: "+880 1712-345678",
    },
  });

  const patient1 = await client.patient.upsert({
    where: { userId: patient1User.id },
    update: {
      organizationId: demoOrg.id,
      gender: "Female",
      dateOfBirth: new Date("1996-05-14"),
      medicalHistory: "Mild seasonal asthma, History of Dyspepsia",
    },
    create: {
      userId: patient1User.id,
      organizationId: demoOrg.id,
      gender: "Female",
      dateOfBirth: new Date("1996-05-14"),
      medicalHistory: "Mild seasonal asthma, History of Dyspepsia",
    },
  });

  // Secondary Demo Patient: Kamal Hossain (Waiting in queue)
  const patient2User = await client.user.upsert({
    where: { email: "kamal.demo@ppms.local" },
    update: {
      name: "Kamal Hossain",
      passwordHash,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      phone: "+880 1819-112233",
    },
    create: {
      name: "Kamal Hossain",
      email: "kamal.demo@ppms.local",
      passwordHash,
      roleId: roleByName.PATIENT,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      phone: "+880 1819-112233",
    },
  });

  const patient2 = await client.patient.upsert({
    where: { userId: patient2User.id },
    update: {
      organizationId: demoOrg.id,
      gender: "Male",
      dateOfBirth: new Date("1985-09-21"),
      medicalHistory: "Hypertension on medication",
    },
    create: {
      userId: patient2User.id,
      organizationId: demoOrg.id,
      gender: "Male",
      dateOfBirth: new Date("1985-09-21"),
      medicalHistory: "Hypertension on medication",
    },
  });

  // Tertiary Demo Patient: Sadia Akhter (Completed consultation)
  const patient3User = await client.user.upsert({
    where: { email: "sadia.demo@ppms.local" },
    update: {
      name: "Sadia Akhter",
      passwordHash,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      phone: "+880 1913-778899",
    },
    create: {
      name: "Sadia Akhter",
      email: "sadia.demo@ppms.local",
      passwordHash,
      roleId: roleByName.PATIENT,
      organizationId: demoOrg.id,
      isDemo: true,
      emailVerified: now,
      isApproved: true,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      phone: "+880 1913-778899",
    },
  });

  const patient3 = await client.patient.upsert({
    where: { userId: patient3User.id },
    update: {
      organizationId: demoOrg.id,
      gender: "Female",
      dateOfBirth: new Date("1992-11-03"),
      medicalHistory: "Allergic rhinitis",
    },
    create: {
      userId: patient3User.id,
      organizationId: demoOrg.id,
      gender: "Female",
      dateOfBirth: new Date("1992-11-03"),
      medicalHistory: "Allergic rhinitis",
    },
  });

  if (!seedSampleData) {
    return demoOrg;
  }

  // 6. Seed Today's Active Consultation Queue for PPMS Clinic
  const todayAtNine = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30, 0);

  // Serial 1: Nusrat Jahan - Ready for Doctor Consultation
  await client.appointment.create({
    data: {
      doctorId: demoDoctor.id,
      patientId: patient1.id,
      organizationId: demoOrg.id,
      appointmentDate: todayAtNine,
      serialNumber: 1,
      status: AppointmentStatus.BOOKED,
      notes: "Chief Complaint: Severe headache and fever x 3 days. Triage vitals checked by staff.",
      paymentStatus: "PAID",
      fee: 50,
    },
  });

  // Serial 2: Kamal Hossain - In Waiting Room
  await client.appointment.create({
    data: {
      doctorId: demoDoctor.id,
      patientId: patient2.id,
      organizationId: demoOrg.id,
      appointmentDate: todayAtNine,
      serialNumber: 2,
      status: AppointmentStatus.BOOKED,
      notes: "Follow-up for Blood Pressure monitoring.",
      paymentStatus: "PAID",
      fee: 30,
    },
  });

  // Serial 3: Sadia Akhter - Completed earlier today with prescription
  const completedAppt = await client.appointment.create({
    data: {
      doctorId: demoDoctor.id,
      patientId: patient3.id,
      organizationId: demoOrg.id,
      appointmentDate: todayAtNine,
      serialNumber: 3,
      status: AppointmentStatus.COMPLETED,
      notes: "Consultation finished. Digital prescription issued.",
      paymentStatus: "PAID",
      fee: 50,
    },
  });

  // 7. Seed Sample Digital Prescription for Serial 3
  const sampleRx = await client.prescription.create({
    data: {
      doctorId: demoDoctor.id,
      patientId: patient3.id,
      organizationId: demoOrg.id,
      appointmentId: completedAppt.id,
      isPublicShareEnabled: true,
      shareToken: "rx-ppms-demo-baseline",
      notes: "Take complete rest and drink plenty of warm fluids. Follow up in 7 days if symptoms persist.",
      medicinesJson: [
        {
          name: "Napa Extra",
          type: "Tablet",
          dosage: "500mg + 65mg",
          dose: "1+0+1",
          timing: "After meal",
          duration: "5 days",
          instructions: "Take when fever or headache is elevated",
        },
        {
          name: "Maxpro",
          type: "Capsule",
          dosage: "20mg",
          dose: "1+0+1",
          timing: "30 mins before meal",
          duration: "14 days",
          instructions: "Take 30 minutes prior to breakfast and dinner",
        },
      ],
      testsJson: [
        {
          name: "CBC with ESR (Complete Blood Count)",
          instructions: "Clean blood sample. Fasting not required.",
        },
        {
          name: "Fasting Blood Sugar (FBS)",
          instructions: "8-10 hours overnight fasting required.",
        },
      ],
      vitalsJson: {
        bp: "120/80",
        pulse: "76",
        temp: "98.6",
        spo2: "99",
        weight: "62",
      },
      clinicalInfoJson: {
        complaints: ["Mild fever x 2 days", "Dry cough", "Throat discomfort"],
        diagnosis: ["Acute Upper Respiratory Infection", "Mild Gastritis"],
        advice: ["Drink warm water", "Avoid oily/chilled foods", "Adequate hydration & rest"],
      },
    },
  });

  // Seed Medicine Reminder
  await client.medicineReminder.create({
    data: {
      patientId: patient3.id,
      prescriptionId: sampleRx.id,
      organizationId: demoOrg.id,
      medicineName: "Maxpro 20mg",
      dosage: "20mg",
      frequency: "1+0+1",
      timeOfDay: "07:30 AM, 08:00 PM",
      notes: "30 mins before breakfast and dinner",
    },
  });

  // Seed Demo Announcement
  await client.announcement.create({
    data: {
      title: "Welcome to PPMS Clinic Demo Sandbox",
      content: "All demo data in PPMS Clinic resets to this baseline state every 6 hours. Feel free to prescribe, manage queues, and explore!",
      targetRole: "ALL",
      priority: "HIGH",
      authorId: adminUser.id,
      authorName: "System Administrator",
      organizationId: demoOrg.id,
    },
  });

  return demoOrg;
}

/**
 * Returns current demo status, countdown timer details, and automatically resets if 6 hours elapsed.
 */
export async function getDemoResetStatus() {
  const isDemo = isDemoModeActive();
  if (!isDemo) {
    return {
      isDemoMode: false,
      lastResetAt: null,
      nextResetAt: null,
      remainingSeconds: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedTime: "00h 00m 00s",
      clinicName: DEMO_CLINIC_NAME,
      clinicSlug: DEMO_CLINIC_SLUG,
    };
  }

  let demoOrg = await db.organization.findUnique({
    where: { slug: DEMO_CLINIC_SLUG },
  });

  // If PPMS Clinic doesn't exist yet, seed it immediately
  if (!demoOrg) {
    demoOrg = await seedOrResetDemoClinic(db);
  }

  const now = Date.now();
  const lastResetTime = demoOrg.lastDemoResetAt ? new Date(demoOrg.lastDemoResetAt).getTime() : now;
  const elapsedMs = now - lastResetTime;

  // Auto-reset if 6 hours have passed
  if (elapsedMs >= DEMO_RESET_INTERVAL_MS) {
    demoOrg = await seedOrResetDemoClinic(db);
  }

  const updatedLastResetTime = demoOrg.lastDemoResetAt ? new Date(demoOrg.lastDemoResetAt).getTime() : now;
  const nextResetTime = updatedLastResetTime + DEMO_RESET_INTERVAL_MS;
  const remainingSeconds = Math.max(0, Math.floor((nextResetTime - now) / 1000));

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;

  return {
    isDemoMode: true,
    lastResetAt: new Date(updatedLastResetTime).toISOString(),
    nextResetAt: new Date(nextResetTime).toISOString(),
    remainingSeconds,
    hours,
    minutes,
    seconds,
    formattedTime,
    clinicName: DEMO_CLINIC_NAME,
    clinicSlug: DEMO_CLINIC_SLUG,
  };
}

/**
 * Clears application data while retaining the demo facility, demo accounts, and
 * platform reference data. The route performs authentication and re-authentication
 * before calling this function; the mode check remains here as a second server-side
 * boundary so this operation cannot be enabled by a client request.
 */
export async function performSecureDatabaseReset(actorId: string) {
  if (!isDemoModeActive()) {
    throw new AppError("Database reset is only available when Demo Mode is enabled.", 403);
  }

  const actor = await db.user.findUnique({
    where: { id: actorId },
    include: { role: true },
  });
  if (!actor || actor.role.name !== RoleName.SUPER_ADMIN) {
    throw new AppError("Only a Super Admin can reset the demo database.", 403);
  }

  const conflictingAdmin = await db.user.findUnique({
    where: { email: SUPER_ADMIN_EMAIL },
    select: { id: true },
  });
  if (conflictingAdmin && conflictingAdmin.id !== actorId) {
    throw new AppError(
      "The requested Super Admin email is already assigned to another account.",
      409,
    );
  }

  const passwordHash = await bcrypt.hash(DEMO_SUPER_ADMIN_PASSWORD, 12);
  const resetAt = new Date();

  const result = await db.$transaction(async (tx) => {
    // Restore the protected demo facility and accounts inside the same transaction.
    // The cleanup below then removes the seeded transactional sample data as well.
    const demoOrg = await seedOrResetDemoClinic(tx, { seedSampleData: false });
    const seededSuperAdmin = await tx.user.findUnique({
      where: { email: SUPER_ADMIN_EMAIL },
      select: { id: true },
    });
    if (!seededSuperAdmin || seededSuperAdmin.id !== actorId) {
      throw new AppError(
        "Sign in with the canonical Super Admin account before resetting the demo database.",
        409,
      );
    }

    await tx.user.update({
      where: { id: actorId },
      data: {
        email: SUPER_ADMIN_EMAIL,
        name: "Super Admin",
        passwordHash,
        role: { connect: { name: RoleName.SUPER_ADMIN } },
        organization: { connect: { id: demoOrg.id } },
        isDemo: true,
        emailVerified: resetAt,
        isApproved: true,
        passwordResetToken: null,
        passwordResetTokenExpiresAt: null,
        emailVerificationToken: null,
        emailVerificationTokenExpiresAt: null,
      },
    });

    const protectedUsers = await tx.user.findMany({
      where: {
        OR: [
          { id: actorId },
          { isDemo: true, role: { name: { not: RoleName.PATIENT } } },
          { email: "patient@ppms.local" },
        ],
      },
      select: { id: true },
    });
    const protectedUserIds = protectedUsers.map((user) => user.id);

    // Preserve reference assets, but make templates owned by removed users safe to keep.
    await tx.template.updateMany({
      where: { createdById: { notIn: protectedUserIds } },
      data: { createdById: actorId },
    });

    // Remove clinical, communication, uploaded-file, and audit records first so all
    // foreign-key paths are cleared before users and organizations are removed.
    await tx.prescriptionAttachment.deleteMany({});
    await tx.prescriptionVersion.deleteMany({});
    await tx.medicineReminder.deleteMany({});
    await tx.testReport.deleteMany({});
    await tx.prescription.deleteMany({});
    await tx.appointment.deleteMany({});
    await tx.chatMessage.deleteMany({});
    await tx.chatConnection.deleteMany({});
    await tx.notification.deleteMany({});
    await tx.file.deleteMany({});
    await tx.activityLog.deleteMany({});
    await tx.announcement.deleteMany({});

    // Global catalog and communication assets remain useful after a demo reset;
    // detach them from clinics that are about to be removed.
    await tx.medicine.updateMany({ data: { organizationId: null } });
    await tx.diagnosticTest.updateMany({ data: { organizationId: null } });
    await tx.template.updateMany({ data: { organizationId: null } });
    await tx.emailTemplate.updateMany({ data: { organizationId: null } });

    const deletedDoctors = await tx.doctor.deleteMany({
      where: { userId: { notIn: protectedUserIds } },
    });
    const deletedPatients = await tx.patient.deleteMany({
      where: { userId: { notIn: protectedUserIds } },
    });
    const deletedUsers = await tx.user.deleteMany({
      where: { id: { notIn: protectedUserIds } },
    });

    // Keep every protected account usable inside the retained demo facility.
    await tx.user.updateMany({
      where: { id: { in: protectedUserIds } },
      data: { organizationId: demoOrg.id },
    });
    await tx.doctor.updateMany({
      where: { userId: { in: protectedUserIds } },
      data: { organizationId: demoOrg.id },
    });
    await tx.patient.updateMany({
      where: { userId: { in: protectedUserIds } },
      data: { organizationId: demoOrg.id },
    });

    const deletedOrganizations = await tx.organization.deleteMany({
      where: { id: { not: demoOrg.id } },
    });

    const resetDemoOrg = await tx.organization.update({
      where: { id: demoOrg.id },
      data: { isDemo: true, lastDemoResetAt: resetAt, status: "ACTIVE" },
    });

    // Retain one immutable security record for the destructive operation itself.
    await tx.activityLog.create({
      data: {
        organizationId: resetDemoOrg.id,
        userId: actorId,
        userName: "Super Admin",
        userRole: RoleName.SUPER_ADMIN,
        action: "DEMO_DATABASE_RESET",
        entityType: "Database",
        detailsJson: {
          preservedDemoFacility: DEMO_CLINIC_SLUG,
          retainedReferenceData: [
            "roles",
            "pricingPlans",
            "medicines",
            "diagnosticTests",
            "templates",
            "emailTemplates",
            "settings",
            "translations",
          ],
          deletedUsers: deletedUsers.count,
          deletedDoctors: deletedDoctors.count,
          deletedPatients: deletedPatients.count,
          deletedOrganizations: deletedOrganizations.count,
        } satisfies Prisma.InputJsonObject,
      },
    });

    return {
      deletedUsers: deletedUsers.count,
      deletedDoctors: deletedDoctors.count,
      deletedPatients: deletedPatients.count,
      deletedOrganizations: deletedOrganizations.count,
      retainedDemoUsers: protectedUserIds.length,
      resetAt: resetAt.toISOString(),
    };
  });

  return {
    success: true,
    ...result,
    superAdminEmail: SUPER_ADMIN_EMAIL,
    message: "Demo database cleared and the PPMS Clinic demo baseline was preserved.",
  };
}

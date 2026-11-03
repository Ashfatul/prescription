import { PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  SUPER_ADMIN_EMAIL,
  DEMO_SUPER_ADMIN_PASSWORD,
} from "../src/features/demo/demo-reset.service";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("==================================================");
  console.log("🧹 STARTING DATABASE CLEANUP: KEEP ONLY REQUIRED DATA");
  console.log("==================================================");

  // 1. Delete dependent transactional data
  console.log("Deleting chat messages and connections...");
  await prisma.chatMessage.deleteMany({});
  await prisma.chatConnection.deleteMany({});

  console.log("Deleting notifications & activity logs...");
  await prisma.notification.deleteMany({});
  await prisma.activityLog.deleteMany({});
  await prisma.announcement.deleteMany({});

  console.log("Deleting prescriptions, attachments, versions & reminders...");
  await prisma.prescriptionAttachment.deleteMany({});
  await prisma.prescriptionVersion.deleteMany({});
  await prisma.medicineReminder.deleteMany({});
  await prisma.testReport.deleteMany({});
  await prisma.prescription.deleteMany({});

  console.log("Deleting appointments & files...");
  await prisma.appointment.deleteMany({});
  await prisma.file.deleteMany({});

  console.log("Deleting patient & doctor profiles...");
  await prisma.patient.deleteMany({});
  await prisma.doctor.deleteMany({});

  console.log("Deleting clinic-specific medicines & tests (keeping global master formulary)...");
  await prisma.medicine.deleteMany({
    where: { organizationId: { not: null } },
  });
  await prisma.diagnosticTest.deleteMany({
    where: { organizationId: { not: null } },
  });

  console.log("Deleting non-super-admin users...");
  await prisma.user.deleteMany({
    where: {
      role: { name: { not: RoleName.SUPER_ADMIN } },
    },
  });

  console.log("Deleting all organizations (clinics)...");
  await prisma.organization.deleteMany({});

  // 2. Ensure Roles exist
  console.log("Verifying essential system roles...");
  const roleRecords = await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );
  const roleByName = Object.fromEntries(roleRecords.map((r) => [r.name, r.id]));

  // 3. Ensure SaaS Pricing Plans exist (essential for clinic registrations & subscription checks)
  console.log("Verifying SaaS Pricing Plans...");
  await prisma.pricingPlan.upsert({
    where: { name: "Starter Clinic" },
    update: {
      price: 49,
      billingCycle: "monthly",
      description: "Essential prescribing & patient management for solo practitioners.",
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
    create: {
      name: "Starter Clinic",
      price: 49,
      billingCycle: "monthly",
      description: "Essential prescribing & patient management for solo practitioners.",
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
  });

  await prisma.pricingPlan.upsert({
    where: { name: "Professional Polyclinic" },
    update: {
      price: 149,
      billingCycle: "monthly",
      description: "Complete clinical OS for multi-doctor chambers and medical centers.",
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
    create: {
      name: "Professional Polyclinic",
      price: 149,
      billingCycle: "monthly",
      description: "Complete clinical OS for multi-doctor chambers and medical centers.",
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
  });

  await prisma.pricingPlan.upsert({
    where: { name: "Hospital Enterprise" },
    update: {
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
    create: {
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
  });

  // 4. Ensure Master Super Admin User exists
  console.log("Setting up Super Admin Account...");
  const passwordHash = await bcrypt.hash(DEMO_SUPER_ADMIN_PASSWORD, 12);
  const superAdmin = await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      name: "Super Admin",
      organizationId: null,
      isDemo: false,
      emailVerified: new Date(),
    },
    create: {
      name: "Super Admin",
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      roleId: roleByName.SUPER_ADMIN,
      organizationId: null,
      isDemo: false,
      emailVerified: new Date(),
    },
  });

  // 5. Verify Master Global Formulary exists
  const globalMedsCount = await prisma.medicine.count({ where: { organizationId: null } });
  const globalTestsCount = await prisma.diagnosticTest.count({ where: { organizationId: null } });

  // 6. Print database summary
  const summary = {
    organizations: await prisma.organization.count(),
    users: await prisma.user.count(),
    superAdmins: await prisma.user.count({ where: { role: { name: RoleName.SUPER_ADMIN } } }),
    doctors: await prisma.doctor.count(),
    patients: await prisma.patient.count(),
    appointments: await prisma.appointment.count(),
    prescriptions: await prisma.prescription.count(),
    pricingPlans: await prisma.pricingPlan.count(),
    masterMedicines: globalMedsCount,
    masterDiagnosticTests: globalTestsCount,
  };

  console.log("\n✅ DATABASE CLEANUP COMPLETE!");
  console.log("==================================================");
  console.log(JSON.stringify(summary, null, 2));
  console.log("==================================================");
  console.log(`Master Login: ${superAdmin.email} / ${DEMO_SUPER_ADMIN_PASSWORD}`);
  console.log("Ready for custom clinic registration and testing!");
}

cleanDatabase()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


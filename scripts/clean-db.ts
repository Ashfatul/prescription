import { PrismaClient, RoleName } from "@prisma/client";

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log("==================================================");
  console.log("🧹 STARTING DATABASE CLEANUP: FRESH SYSTEM RESET");
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

  console.log("Deleting users and clinics...");
  await prisma.user.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log("Resetting system settings...");
  await prisma.systemSetting.deleteMany({});

  // 2. Ensure Roles exist
  console.log("Verifying essential system roles...");
  await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // 3. Print database summary
  const summary = {
    organizations: await prisma.organization.count(),
    users: await prisma.user.count(),
    superAdmins: await prisma.user.count({ where: { role: { name: RoleName.SUPER_ADMIN } } }),
    doctors: await prisma.doctor.count(),
    patients: await prisma.patient.count(),
    prescriptions: await prisma.prescription.count(),
    pricingPlans: await prisma.pricingPlan.count(),
    masterMedicines: await prisma.medicine.count({ where: { organizationId: null } }),
    masterDiagnosticTests: await prisma.diagnosticTest.count({ where: { organizationId: null } }),
    systemSettings: await prisma.systemSetting.count(),
  };

  console.log("\n✅ DATABASE CLEANUP COMPLETE!");
  console.log("==================================================");
  console.log(JSON.stringify(summary, null, 2));
  console.log("==================================================");
  console.log("System is now in a pristine, uninstalled state.");
  console.log("👉 Run the application and visit http://localhost:3000/setup to launch the onboarding flow!");
}

cleanDatabase()
  .catch((e) => {
    console.error("Cleanup failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

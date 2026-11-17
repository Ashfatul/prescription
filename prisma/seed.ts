import { PrismaClient, RoleName } from "@prisma/client";
import { ensureDefaultTemplates } from "../src/features/email-templates/email-template.service";

const prisma = new PrismaClient();

async function main() {
  console.log("==================================================");
  console.log("🌱 SEEDING FOUNDATIONAL SYSTEM DATA");
  console.log("==================================================");

  // 1. Seed Roles
  console.log("1. Ensuring system roles...");
  await Promise.all(
    Object.values(RoleName).map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // 2. Seed Standard SaaS Pricing Plans
  console.log("2. Ensuring SaaS pricing plans...");
  await prisma.pricingPlan.upsert({
    where: { name: "Starter Clinic" },
    update: {
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
    create: {
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
  });

  await prisma.pricingPlan.upsert({
    where: { name: "Professional Polyclinic" },
    update: {
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
    create: {
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

  // 3. Seed System Supported Languages
  console.log("3. Ensuring supported translation languages...");
  await prisma.translationLanguage.upsert({
    where: { code: "en" },
    update: { name: "English", nativeName: "English", isActive: true, isSystem: true },
    create: { code: "en", name: "English", nativeName: "English", isActive: true, isSystem: true },
  });
  await prisma.translationLanguage.upsert({
    where: { code: "bn" },
    update: { name: "Bengali", nativeName: "বাংলা", isActive: true, isSystem: true },
    create: { code: "bn", name: "Bengali", nativeName: "বাংলা", isActive: true, isSystem: true },
  });

  // 4. Ensure Default Email Templates
  console.log("4. Ensuring default system email templates...");
  await ensureDefaultTemplates();

  // 5. Seed Master Formulary (Medicines & Diagnostic Tests)
  const existingMedsCount = await prisma.medicine.count({ where: { organizationId: null } });
  if (existingMedsCount === 0) {
    console.log("5. Seeding master medicines catalog...");
    await prisma.medicine.createMany({
      data: [
        { name: "Napa Extra", type: "Tablet", dosage: "500mg + 65mg", instructions: "1 tablet after meal, 2-3 times daily as needed" },
        { name: "Ace Plus", type: "Tablet", dosage: "500mg + 65mg", instructions: "1 tablet 3 times daily after meals" },
        { name: "Torax", type: "Tablet", dosage: "10mg", instructions: "1 tablet twice daily after meals (max 5 days)" },
        { name: "Clofenac SR", type: "Tablet", dosage: "100mg", instructions: "1 tablet once daily after dinner with PPI" },
        { name: "Maxpro", type: "Capsule", dosage: "20mg", instructions: "1 capsule 30 minutes before breakfast & dinner" },
        { name: "Seclo", type: "Capsule", dosage: "20mg", instructions: "1 capsule 30 minutes before breakfast" },
        { name: "Pantonix", type: "Tablet", dosage: "20mg", instructions: "1 tablet twice daily 30 mins before meals" },
        { name: "Finix", type: "Tablet", dosage: "20mg", instructions: "1 tablet once daily in morning before food" },
        { name: "Entacyd Plus", type: "Suspension", dosage: "200ml", instructions: "2 teaspoons 1 hour after meals and at bedtime" },
        { name: "Azithrocin", type: "Tablet", dosage: "500mg", instructions: "1 tablet daily 1 hour before meal for 5 days" },
        { name: "Moxaclav", type: "Tablet", dosage: "625mg", instructions: "1 tablet twice daily after food for 7 days" },
        { name: "Cef-3", type: "Capsule", dosage: "200mg", instructions: "1 capsule twice daily after meals for 7 days" },
        { name: "Ciprocin", type: "Tablet", dosage: "500mg", instructions: "1 tablet every 12 hours after meals for 7 days" },
        { name: "Levoking", type: "Tablet", dosage: "500mg", instructions: "1 tablet once daily after meals for 7 days" },
        { name: "Monas", type: "Tablet", dosage: "10mg", instructions: "1 tablet at night daily" },
        { name: "Bilasten", type: "Tablet", dosage: "20mg", instructions: "1 tablet daily on empty stomach" },
        { name: "Fexo", type: "Tablet", dosage: "120mg", instructions: "1 tablet once daily in evening" },
        { name: "Tofen", type: "Syrup", dosage: "100ml", instructions: "2 teaspoons twice daily after meals" },
        { name: "Ventolin Evohaler", type: "Inhaler", dosage: "100mcg/puff", instructions: "2 puffs as needed for shortness of breath" },
        { name: "Seretide Evohaler", type: "Inhaler", dosage: "25/125mcg", instructions: "2 puffs twice daily followed by mouth rinse" },
        { name: "Osartil", type: "Tablet", dosage: "50mg", instructions: "1 tablet once daily in the morning" },
        { name: "Camlosart", type: "Tablet", dosage: "5/50mg", instructions: "1 tablet once daily in the morning" },
        { name: "Bislol", type: "Tablet", dosage: "2.5mg", instructions: "1 tablet once daily in the morning" },
        { name: "Rosu", type: "Tablet", dosage: "10mg", instructions: "1 tablet at night after dinner" },
        { name: "Clopilet", type: "Tablet", dosage: "75mg", instructions: "1 tablet once daily after meals" },
        { name: "Comet", type: "Tablet", dosage: "500mg", instructions: "1 tablet twice daily with main meals" },
        { name: "Glucolead", type: "Tablet", dosage: "2mg", instructions: "1 tablet once daily before breakfast" },
        { name: "Galvus Met", type: "Tablet", dosage: "50/500mg", instructions: "1 tablet twice daily with meals" },
        { name: "D-Rise", type: "Capsule", dosage: "20,000 IU", instructions: "1 capsule weekly for 8 weeks after lunch" },
        { name: "Calbo-D", type: "Tablet", dosage: "500mg + 200 IU", instructions: "1 tablet once daily after meals" },
        { name: "B-50 Forte", type: "Tablet", dosage: "High Potency B-Complex", instructions: "1 tablet twice daily after meals" },
      ],
    });
  }

  const existingTestsCount = await prisma.diagnosticTest.count({ where: { organizationId: null } });
  if (existingTestsCount === 0) {
    console.log("6. Seeding master diagnostic tests catalog...");
    await prisma.diagnosticTest.createMany({
      data: [
        { name: "CBC with ESR (Complete Blood Count)", instructions: "Fasting not required. Clean blood sample." },
        { name: "Chest X-Ray P/A View", instructions: "Bring previous X-ray plates if available. Metal objects removed." },
        { name: "Serum Creatinine", instructions: "Morning sample preferred. Avoid strenuous exercise 24h prior." },
        { name: "Fasting Blood Sugar (FBS)", instructions: "8-10 hours strict overnight fasting required before sample." },
        { name: "2-Hour Postprandial Blood Sugar (2HABF)", instructions: "Sample taken exactly 2 hours after beginning breakfast." },
        { name: "HbA1c (Glycated Hemoglobin)", instructions: "Measures 3-month sugar control. Fasting not required." },
        { name: "Serum Lipid Profile (Cholesterol, TG, HDL, LDL)", instructions: "10-12 hours overnight fasting mandatory. Water allowed." },
        { name: "Serum Electrolytes (Na+, K+, Cl-)", instructions: "Morning venous blood sample preferred." },
        { name: "Serum Uric Acid", instructions: "Fasting preferred. Avoid meat/alcohol night before." },
        { name: "Liver Function Tests (SGPT, SGOT, Alk Phos, Bilirubin)", instructions: "Morning fasting blood sample." },
        { name: "Thyroid Function Test (TSH, FT4)", instructions: "Morning sample before taking morning thyroid medication." },
        { name: "Urine Routine & Microscopic Examination (R/M/E)", instructions: "Clean catch mid-stream urine in sterile container." },
        { name: "Ultrasonography of Whole Abdomen (USG)", instructions: "6 hours overnight fasting and full urinary bladder required." },
        { name: "ECG (12-Lead Electrocardiogram)", instructions: "Rest comfortably in supine position 10 minutes before test." },
        { name: "Echocardiogram (2D & Color Doppler)", instructions: "Cardiac imaging. Prior appointment recommended." },
        { name: "Serum 25-OH Vitamin D", instructions: "Random venous blood sample. Fasting not required." },
      ],
    });
  }

  const superAdminCount = await prisma.user.count({ where: { role: { name: RoleName.SUPER_ADMIN } } });

  console.log("==================================================");
  console.log("✅ BASELINE FOUNDATION SEED COMPLETE!");
  console.log("==================================================");
  if (superAdminCount === 0) {
    console.log("ℹ️  No Super Admin detected. System is in fresh first-run state.");
    console.log("👉 Open your browser at http://localhost:3000/setup to launch the onboarding wizard.");
  } else {
    console.log(`ℹ️  Found ${superAdminCount} existing Super Admin user(s).`);
  }
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

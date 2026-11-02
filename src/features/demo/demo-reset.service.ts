import bcrypt from "bcryptjs";
import { AppointmentStatus, PrismaClient, RoleName } from "@prisma/client";
import { db } from "@/lib/db";

export const DEMO_CLINIC_SLUG = "ppms-clinic";
export const DEMO_CLINIC_NAME = "PPMS Clinic";
export const DEMO_RESET_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export const DEMO_ACCOUNT_EMAILS = [
  "admin@ppms.local",
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

/**
 * Seeds or resets the dedicated PPMS Clinic organization and its clean baseline demo accounts.
 */
export async function seedOrResetDemoClinic(client: PrismaClient | typeof db = db) {
  const passwordHash = await bcrypt.hash("Pass1234!", 10);

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
    where: { email: "admin@ppms.local" },
    update: {
      name: "Super Admin",
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
      name: "Super Admin",
      email: "admin@ppms.local",
      passwordHash,
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
 * Manually triggers an immediate reset of PPMS Clinic to clean baseline.
 */
export async function performManualDemoReset() {
  if (!isDemoModeActive()) {
    throw new Error("Demo reset is only available when Demo Mode is enabled.");
  }
  const org = await seedOrResetDemoClinic(db);
  return {
    success: true,
    resetAt: org.lastDemoResetAt ? org.lastDemoResetAt.toISOString() : new Date().toISOString(),
    message: "PPMS Clinic sandbox has been restored to default baseline.",
  };
}

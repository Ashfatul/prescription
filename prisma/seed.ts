import { AppointmentStatus, PrismaClient, RoleName } from "@prisma/client";
import bcrypt from "bcryptjs";
import { seedOrResetDemoClinic } from "../src/features/demo/demo-reset.service";

const prisma = new PrismaClient();

async function main() {
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
  const passwordHash = await bcrypt.hash("Pass1234!", 10);

  // 1. Seed SaaS Pricing Plans
  const starterPlan = await prisma.pricingPlan.upsert({
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

  const proPlan = await prisma.pricingPlan.upsert({
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

  // =========================================================================
  // 2. SEED DEDICATED DEMO FACILITY: PPMS CLINIC (Isolated Demo Sandbox)
  // =========================================================================
  console.log("Seeding PPMS Clinic (Dedicated Demo Sandbox)...");
  const demoOrg = await seedOrResetDemoClinic(prisma);
  console.log(`PPMS Clinic seeded successfully with ID: ${demoOrg.id}`);

  // =========================================================================
  // 3. SEED PRODUCTION CLINIC 1: METROPOLITAN SPECIALIZED HOSPITAL
  // =========================================================================
  console.log("Seeding Metropolitan Specialized Hospital (Production Clinic)...");
  const metroOrg = await prisma.organization.upsert({
    where: { slug: "metro-hospital" },
    update: {
      name: "Metropolitan Specialized Hospital",
      isDemo: false,
      planId: proPlan.id,
      contactEmail: "info@metropolitanhospital.com",
      contactPhone: "+880 2-8901234",
      address: "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
      status: "ACTIVE",
    },
    create: {
      name: "Metropolitan Specialized Hospital",
      slug: "metro-hospital",
      isDemo: false,
      planId: proPlan.id,
      contactEmail: "info@metropolitanhospital.com",
      contactPhone: "+880 2-8901234",
      address: "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
      status: "ACTIVE",
    },
  });

  // Metro Hospital Staff & Admin
  await prisma.user.upsert({
    where: { email: "admin.metro@metropolitanhospital.com" },
    update: {
      name: "Metro Medical Director",
      organizationId: metroOrg.id,
      isDemo: false,
    },
    create: {
      name: "Metro Medical Director",
      email: "admin.metro@metropolitanhospital.com",
      passwordHash,
      roleId: roleByName.ADMIN,
      organizationId: metroOrg.id,
      isDemo: false,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "staff.metro@metropolitanhospital.com" },
    update: {
      name: "Metro Reception Desk",
      organizationId: metroOrg.id,
      isDemo: false,
    },
    create: {
      name: "Metro Reception Desk",
      email: "staff.metro@metropolitanhospital.com",
      passwordHash,
      roleId: roleByName.STAFF,
      organizationId: metroOrg.id,
      isDemo: false,
      emailVerified: new Date(),
    },
  });

  // Metro Hospital Patients
  const metroPatient1User = await prisma.user.upsert({
    where: { email: "zubair.metro@gmail.com" },
    update: {
      name: "Zubair Ahmed",
      organizationId: metroOrg.id,
      isDemo: false,
    },
    create: {
      name: "Zubair Ahmed",
      email: "zubair.metro@gmail.com",
      passwordHash,
      roleId: roleByName.PATIENT,
      organizationId: metroOrg.id,
      isDemo: false,
    },
  });

  const metroPatient1 = await prisma.patient.upsert({
    where: { userId: metroPatient1User.id },
    update: {
      organizationId: metroOrg.id,
      gender: "Male",
      dateOfBirth: new Date("1988-04-12"),
      medicalHistory: "Type 2 Diabetes, Mild Dyslipidemia",
    },
    create: {
      userId: metroPatient1User.id,
      organizationId: metroOrg.id,
      gender: "Male",
      dateOfBirth: new Date("1988-04-12"),
      medicalHistory: "Type 2 Diabetes, Mild Dyslipidemia",
    },
  });

  // Metro Hospital Doctors
  const metroDoctors = [
    {
      name: "Dr. Sarah Jenkins",
      email: "sarah.jenkins@metrohospital.org",
      imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
      specialization: "Cardiology",
      degrees: "MBBS, MD (Cardiology), FACC (USA)",
      designation: "Associate Professor & Interventional Cardiologist",
      hospital: "Metropolitan Specialized Hospital",
      bmdcRegNo: "BMDC-A-32918",
      chamberAddress: "Cardio Suite 204, 2nd Floor, Metropolitan Hospital",
      contactNumber: "+880 1819-345678",
      available: true,
      schedule: {
        days: ["Monday", "Wednesday", "Friday"],
        startTime: "10:00 AM",
        endTime: "02:00 PM",
        chamber: "Cardio Suite 204",
      },
    },
    {
      name: "Dr. Tariq Al-Mansoor",
      email: "tariq.mansoor@metrohospital.org",
      imageUrl: "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&q=80",
      specialization: "Pediatrics & Child Health",
      degrees: "MBBS, DCH, FCPS (Pediatrics)",
      designation: "Consultant Pediatrician",
      hospital: "Metropolitan Specialized Hospital",
      bmdcRegNo: "BMDC-A-54012",
      chamberAddress: "Pediatric Wing 102, Ground Floor, Metropolitan Hospital",
      contactNumber: "+880 1912-456789",
      available: true,
      schedule: {
        days: ["Sunday", "Tuesday", "Thursday"],
        startTime: "04:00 PM",
        endTime: "08:00 PM",
        chamber: "Pediatric Wing 102",
      },
    },
    {
      name: "Dr. Ayesha Siddiqua",
      email: "ayesha.siddiqua@metrohospital.org",
      imageUrl: "https://images.unsplash.com/photo-1594824813637-2309e53b6ee9?auto=format&fit=crop&w=400&q=80",
      specialization: "Dermatology",
      degrees: "MBBS, DDV, FCPS (Dermatology)",
      designation: "Assistant Professor & Dermatologist",
      hospital: "Metropolitan Specialized Hospital",
      bmdcRegNo: "BMDC-A-62874",
      chamberAddress: "Skin Clinic 405, 4th Floor, Metropolitan Hospital",
      contactNumber: "+880 1613-567890",
      available: true,
      schedule: {
        days: ["Saturday", "Monday", "Wednesday"],
        startTime: "02:00 PM",
        endTime: "06:00 PM",
        chamber: "Skin Clinic 405",
      },
    },
  ];

  const now = new Date();
  const todayAtTen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);

  for (let i = 0; i < metroDoctors.length; i++) {
    const item = metroDoctors[i];
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        imageUrl: item.imageUrl,
        organizationId: metroOrg.id,
        isDemo: false,
      },
      create: {
        name: item.name,
        email: item.email,
        passwordHash,
        roleId: roleByName.DOCTOR,
        imageUrl: item.imageUrl,
        organizationId: metroOrg.id,
        isDemo: false,
      },
    });

    const doc = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        organizationId: metroOrg.id,
        specialization: item.specialization,
        degrees: item.degrees,
        designation: item.designation,
        hospital: item.hospital,
        bmdcRegNo: item.bmdcRegNo,
        chamberAddress: item.chamberAddress,
        contactNumber: item.contactNumber,
        newPatientFee: 60,
        followupFee: 35,
        scheduleJson: item.schedule,
        available: item.available,
      },
      create: {
        userId: user.id,
        organizationId: metroOrg.id,
        specialization: item.specialization,
        degrees: item.degrees,
        designation: item.designation,
        hospital: item.hospital,
        bmdcRegNo: item.bmdcRegNo,
        chamberAddress: item.chamberAddress,
        contactNumber: item.contactNumber,
        newPatientFee: 60,
        followupFee: 35,
        scheduleJson: item.schedule,
        available: item.available,
      },
    });

    if (item.available) {
      await prisma.appointment.upsert({
        where: {
          doctorId_appointmentDate_serialNumber: {
            doctorId: doc.id,
            appointmentDate: todayAtTen,
            serialNumber: i + 1,
          },
        },
        update: {
          organizationId: metroOrg.id,
        },
        create: {
          doctorId: doc.id,
          patientId: metroPatient1.id,
          organizationId: metroOrg.id,
          appointmentDate: todayAtTen,
          serialNumber: i + 1,
          status: AppointmentStatus.BOOKED,
          notes: "Routine specialist check-up",
          paymentStatus: "PAID",
          fee: 60,
        },
      });
    }
  }

  // =========================================================================
  // 4. SEED PRODUCTION CLINIC 2: CARE FAMILY POLYCLINIC
  // =========================================================================
  console.log("Seeding Care Family Polyclinic (Production Clinic)...");
  const careOrg = await prisma.organization.upsert({
    where: { slug: "care-polyclinic" },
    update: {
      name: "Care Family Polyclinic",
      isDemo: false,
      planId: starterPlan.id,
      contactEmail: "care@carepolyclinic.com",
      contactPhone: "+880 1819-998877",
      address: "Mirpur 10 Circle, Section 6, Dhaka-1216",
      status: "ACTIVE",
    },
    create: {
      name: "Care Family Polyclinic",
      slug: "care-polyclinic",
      isDemo: false,
      planId: starterPlan.id,
      contactEmail: "care@carepolyclinic.com",
      contactPhone: "+880 1819-998877",
      address: "Mirpur 10 Circle, Section 6, Dhaka-1216",
      status: "ACTIVE",
    },
  });

  // Care Clinic Staff & Admin
  await prisma.user.upsert({
    where: { email: "admin.care@carepolyclinic.com" },
    update: {
      name: "Care Clinic Administrator",
      organizationId: careOrg.id,
      isDemo: false,
    },
    create: {
      name: "Care Clinic Administrator",
      email: "admin.care@carepolyclinic.com",
      passwordHash,
      roleId: roleByName.ADMIN,
      organizationId: careOrg.id,
      isDemo: false,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "staff.care@carepolyclinic.com" },
    update: {
      name: "Care Clinic Triage Staff",
      organizationId: careOrg.id,
      isDemo: false,
    },
    create: {
      name: "Care Clinic Triage Staff",
      email: "staff.care@carepolyclinic.com",
      passwordHash,
      roleId: roleByName.STAFF,
      organizationId: careOrg.id,
      isDemo: false,
      emailVerified: new Date(),
    },
  });

  // Care Clinic Patients
  const carePatient1User = await prisma.user.upsert({
    where: { email: "tanvir.care@gmail.com" },
    update: {
      name: "Tanvir Hasan",
      organizationId: careOrg.id,
      isDemo: false,
    },
    create: {
      name: "Tanvir Hasan",
      email: "tanvir.care@gmail.com",
      passwordHash,
      roleId: roleByName.PATIENT,
      organizationId: careOrg.id,
      isDemo: false,
    },
  });

  const carePatient1 = await prisma.patient.upsert({
    where: { userId: carePatient1User.id },
    update: {
      organizationId: careOrg.id,
      gender: "Male",
      dateOfBirth: new Date("1991-08-19"),
      medicalHistory: "Post-op Knee Arthroscopy follow up",
    },
    create: {
      userId: carePatient1User.id,
      organizationId: careOrg.id,
      gender: "Male",
      dateOfBirth: new Date("1991-08-19"),
      medicalHistory: "Post-op Knee Arthroscopy follow up",
    },
  });

  // Care Clinic Doctors
  const careDoctors = [
    {
      name: "Dr. Marcus Vance",
      email: "marcus.vance@careclinic.org",
      imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
      specialization: "Orthopedics & Joint Trauma",
      degrees: "MBBS, MS (Orthopedics), AO Trauma Fellow",
      designation: "Senior Orthopedic & Joint Surgeon",
      hospital: "Care Family Polyclinic",
      bmdcRegNo: "BMDC-A-29401",
      chamberAddress: "Orthopedic Suite 512, 5th Floor, Care Polyclinic",
      contactNumber: "+880 1514-678901",
      available: true,
      schedule: {
        days: ["Sunday", "Monday", "Wednesday", "Thursday"],
        startTime: "11:00 AM",
        endTime: "03:00 PM",
        chamber: "Orthopedic Suite 512",
      },
    },
    {
      name: "Dr. Nusrat Parvin",
      email: "nusrat.parvin@careclinic.org",
      imageUrl: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80",
      specialization: "Gynecology & Obstetrics",
      degrees: "MBBS, DGO, FCPS (Obs & Gynae)",
      designation: "Consultant Obstetrician & Gynecologist",
      hospital: "Care Family Polyclinic",
      bmdcRegNo: "BMDC-A-48193",
      chamberAddress: "Women's Health Suite 208, 2nd Floor, Care Polyclinic",
      contactNumber: "+880 1715-789012",
      available: true,
      schedule: {
        days: ["Sunday", "Tuesday", "Wednesday", "Thursday"],
        startTime: "05:00 PM",
        endTime: "09:00 PM",
        chamber: "Women's Health Suite 208",
      },
    },
  ];

  for (let i = 0; i < careDoctors.length; i++) {
    const item = careDoctors[i];
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        imageUrl: item.imageUrl,
        organizationId: careOrg.id,
        isDemo: false,
      },
      create: {
        name: item.name,
        email: item.email,
        passwordHash,
        roleId: roleByName.DOCTOR,
        imageUrl: item.imageUrl,
        organizationId: careOrg.id,
        isDemo: false,
      },
    });

    const doc = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        organizationId: careOrg.id,
        specialization: item.specialization,
        degrees: item.degrees,
        designation: item.designation,
        hospital: item.hospital,
        bmdcRegNo: item.bmdcRegNo,
        chamberAddress: item.chamberAddress,
        contactNumber: item.contactNumber,
        newPatientFee: 50,
        followupFee: 30,
        scheduleJson: item.schedule,
        available: item.available,
      },
      create: {
        userId: user.id,
        organizationId: careOrg.id,
        specialization: item.specialization,
        degrees: item.degrees,
        designation: item.designation,
        hospital: item.hospital,
        bmdcRegNo: item.bmdcRegNo,
        chamberAddress: item.chamberAddress,
        contactNumber: item.contactNumber,
        newPatientFee: 50,
        followupFee: 30,
        scheduleJson: item.schedule,
        available: item.available,
      },
    });

    if (item.available) {
      await prisma.appointment.upsert({
        where: {
          doctorId_appointmentDate_serialNumber: {
            doctorId: doc.id,
            appointmentDate: todayAtTen,
            serialNumber: i + 1,
          },
        },
        update: {
          organizationId: careOrg.id,
        },
        create: {
          doctorId: doc.id,
          patientId: carePatient1.id,
          organizationId: careOrg.id,
          appointmentDate: todayAtTen,
          serialNumber: i + 1,
          status: AppointmentStatus.BOOKED,
          notes: "Chamber consultation appointment",
          paymentStatus: "PAID",
          fee: 50,
        },
      });
    }
  }

  // =========================================================================
  // 5. SEED GLOBAL FORMULARY CATALOG (Medicines & Tests)
  // =========================================================================
  console.log("Seeding Formulary Catalog (Medicines & Diagnostic Tests)...");
  await prisma.medicine.deleteMany({});
  await prisma.diagnosticTest.deleteMany({});

  await prisma.medicine.createMany({
    data: [
      {
        name: "Napa Extra",
        type: "Tablet",
        dosage: "500mg + 65mg",
        instructions: "1 tablet after meal, 2-3 times daily as needed",
      },
      {
        name: "Ace Plus",
        type: "Tablet",
        dosage: "500mg + 65mg",
        instructions: "1 tablet 3 times daily after meals",
      },
      {
        name: "Torax",
        type: "Tablet",
        dosage: "10mg",
        instructions: "1 tablet twice daily after meals (max 5 days)",
      },
      {
        name: "Clofenac SR",
        type: "Tablet",
        dosage: "100mg",
        instructions: "1 tablet once daily after dinner with PPI",
      },
      {
        name: "Maxpro",
        type: "Capsule",
        dosage: "20mg",
        instructions: "1 capsule 30 minutes before breakfast & dinner",
      },
      {
        name: "Seclo",
        type: "Capsule",
        dosage: "20mg",
        instructions: "1 capsule 30 minutes before breakfast",
      },
      {
        name: "Pantonix",
        type: "Tablet",
        dosage: "20mg",
        instructions: "1 tablet twice daily 30 mins before meals",
      },
      {
        name: "Finix",
        type: "Tablet",
        dosage: "20mg",
        instructions: "1 tablet once daily in morning before food",
      },
      {
        name: "Entacyd Plus",
        type: "Suspension",
        dosage: "200ml",
        instructions: "2 teaspoons 1 hour after meals and at bedtime",
      },
      {
        name: "Azithrocin",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet daily 1 hour before meal for 5 days",
      },
      {
        name: "Moxaclav",
        type: "Tablet",
        dosage: "625mg",
        instructions: "1 tablet twice daily after food for 7 days",
      },
      {
        name: "Cef-3",
        type: "Capsule",
        dosage: "200mg",
        instructions: "1 capsule twice daily after meals for 7 days",
      },
      {
        name: "Ciprocin",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet every 12 hours after meals for 7 days",
      },
      {
        name: "Levoking",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet once daily after meals for 7 days",
      },
      {
        name: "Monas",
        type: "Tablet",
        dosage: "10mg",
        instructions: "1 tablet at night daily",
      },
      {
        name: "Bilasten",
        type: "Tablet",
        dosage: "20mg",
        instructions: "1 tablet daily on empty stomach",
      },
      {
        name: "Fexo",
        type: "Tablet",
        dosage: "120mg",
        instructions: "1 tablet once daily in evening",
      },
      {
        name: "Tofen",
        type: "Syrup",
        dosage: "100ml",
        instructions: "2 teaspoons twice daily after meals",
      },
      {
        name: "Ventolin Evohaler",
        type: "Inhaler",
        dosage: "100mcg/puff",
        instructions: "2 puffs as needed for shortness of breath or wheezing",
      },
      {
        name: "Seretide Evohaler",
        type: "Inhaler",
        dosage: "25/125mcg",
        instructions: "2 puffs twice daily followed by mouth rinse with water",
      },
      {
        name: "Osartil",
        type: "Tablet",
        dosage: "50mg",
        instructions: "1 tablet once daily in the morning",
      },
      {
        name: "Camlosart",
        type: "Tablet",
        dosage: "5/50mg",
        instructions: "1 tablet once daily in the morning",
      },
      {
        name: "Bislol",
        type: "Tablet",
        dosage: "2.5mg",
        instructions: "1 tablet once daily in the morning",
      },
      {
        name: "Rosu",
        type: "Tablet",
        dosage: "10mg",
        instructions: "1 tablet at night after dinner",
      },
      {
        name: "Clopilet",
        type: "Tablet",
        dosage: "75mg",
        instructions: "1 tablet once daily after meals",
      },
      {
        name: "Comet",
        type: "Tablet",
        dosage: "500mg",
        instructions: "1 tablet twice daily with main meals",
      },
      {
        name: "Glucolead",
        type: "Tablet",
        dosage: "2mg",
        instructions: "1 tablet once daily before breakfast",
      },
      {
        name: "Galvus Met",
        type: "Tablet",
        dosage: "50/500mg",
        instructions: "1 tablet twice daily with meals",
      },
      {
        name: "D-Rise",
        type: "Capsule",
        dosage: "20,000 IU",
        instructions: "1 capsule weekly for 8 weeks after heavy lunch",
      },
      {
        name: "Calbo-D",
        type: "Tablet",
        dosage: "500mg + 200 IU",
        instructions: "1 tablet once daily after meals",
      },
      {
        name: "B-50 Forte",
        type: "Tablet",
        dosage: "High Potency B-Complex",
        instructions: "1 tablet twice daily after meals",
      },
    ],
  });

  await prisma.diagnosticTest.createMany({
    data: [
      {
        name: "CBC with ESR (Complete Blood Count)",
        instructions: "Fasting not required. Clean blood sample.",
      },
      {
        name: "Chest X-Ray P/A View",
        instructions: "Bring previous X-ray plates if available. Metal objects removed.",
      },
      {
        name: "Serum Creatinine",
        instructions: "Morning sample preferred. Avoid strenuous exercise 24h prior.",
      },
      {
        name: "Fasting Blood Sugar (FBS)",
        instructions: "8-10 hours strict overnight fasting required before sample.",
      },
      {
        name: "2-Hour Postprandial Blood Sugar (2HABF)",
        instructions: "Sample taken exactly 2 hours after beginning breakfast.",
      },
      {
        name: "HbA1c (Glycated Hemoglobin)",
        instructions: "Measures 3-month sugar control. Fasting not required.",
      },
      {
        name: "Serum Lipid Profile (Cholesterol, TG, HDL, LDL)",
        instructions: "10-12 hours overnight fasting mandatory. Water allowed.",
      },
      {
        name: "Serum Electrolytes (Na+, K+, Cl-)",
        instructions: "Morning venous blood sample preferred.",
      },
      {
        name: "Serum Uric Acid",
        instructions: "Fasting preferred. Avoid meat/alcohol night before.",
      },
      {
        name: "Liver Function Tests (SGPT, SGOT, Alk Phos, Bilirubin)",
        instructions: "Morning fasting blood sample.",
      },
      {
        name: "Thyroid Function Test (TSH, FT4)",
        instructions: "Morning sample before taking morning thyroid medication.",
      },
      {
        name: "Urine Routine & Microscopic Examination (R/M/E)",
        instructions: "Clean catch mid-stream urine in sterile container.",
      },
      {
        name: "Ultrasonography of Whole Abdomen (USG)",
        instructions: "6 hours overnight fasting and full urinary bladder required.",
      },
      {
        name: "ECG (12-Lead Electrocardiogram)",
        instructions: "Rest comfortably in supine position 10 minutes before test.",
      },
      {
        name: "Echocardiogram (2D & Color Doppler)",
        instructions: "Cardiac imaging. Prior appointment recommended.",
      },
      {
        name: "Serum 25-OH Vitamin D",
        instructions: "Random venous blood sample. Fasting not required.",
      },
    ],
  });

  // Seed default template for Metropolitan Hospital
  const adminUser = await prisma.user.findFirst({ where: { role: { name: RoleName.SUPER_ADMIN } } });
  if (adminUser) {
    await prisma.template.upsert({
      where: { id: "default-template" },
      update: {
        name: "Professional Hospital Template",
        isDefault: true,
        contentJson: {
          hospitalName: "Metropolitan Specialized Hospital",
          hospitalTagline: "Center of Medical Excellence & Compassionate Care",
          hospitalAddress: "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
          hospitalPhone: "+880 2-8901234 / Emergency: 10678",
          hospitalEmail: "info@metropolitanhospital.com",
          hospitalWebsite: "www.metropolitanhospital.com",
          themeColor: "#0f766e",
          showVitals: true,
          showClinicalNotes: true,
          disclaimer:
            "This is a legally valid computer-generated medical prescription. Please keep it safe for follow-up visits. For medical emergencies, call our 24/7 hotline 10678 or visit the nearest emergency room immediately.",
        },
      },
      create: {
        id: "default-template",
        name: "Professional Hospital Template",
        isDefault: true,
        createdById: adminUser.id,
        contentJson: {
          hospitalName: "Metropolitan Specialized Hospital",
          hospitalTagline: "Center of Medical Excellence & Compassionate Care",
          hospitalAddress: "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
          hospitalPhone: "+880 2-8901234 / Emergency: 10678",
          hospitalEmail: "info@metropolitanhospital.com",
          hospitalWebsite: "www.metropolitanhospital.com",
          themeColor: "#0f766e",
          showVitals: true,
          showClinicalNotes: true,
          disclaimer:
            "This is a legally valid computer-generated medical prescription. Please keep it safe for follow-up visits. For medical emergencies, call our 24/7 hotline 10678 or visit the nearest emergency room immediately.",
        },
      },
    });
  }

  console.log("Database seeded successfully with clean separation across PPMS Clinic (Demo), Metro Hospital, and Care Polyclinic.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

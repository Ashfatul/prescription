import { AppointmentStatus, PrismaClient, RoleName, TestReportStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

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

  // 2. Seed Default Organization
  const defaultOrg = await prisma.organization.upsert({
    where: { slug: "metro-hospital" },
    update: {
      name: "Metropolitan Specialized Hospital",
      planId: proPlan.id,
      contactEmail: "info@metropolitanhospital.com",
      contactPhone: "+880 2-8901234",
      address: "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
    },
    create: {
      name: "Metropolitan Specialized Hospital",
      slug: "metro-hospital",
      planId: proPlan.id,
      contactEmail: "info@metropolitanhospital.com",
      contactPhone: "+880 2-8901234",
      address: "Plot 12, Road 4, Sector 7, Uttara, Dhaka-1230",
    },
  });

  const secondaryOrg = await prisma.organization.upsert({
    where: { slug: "care-polyclinic" },
    update: {
      name: "Care Family Polyclinic",
      planId: starterPlan.id,
      contactEmail: "care@carepolyclinic.com",
      contactPhone: "+880 1819-998877",
      address: "Mirpur 10 Circle, Dhaka",
    },
    create: {
      name: "Care Family Polyclinic",
      slug: "care-polyclinic",
      planId: starterPlan.id,
      contactEmail: "care@carepolyclinic.com",
      contactPhone: "+880 1819-998877",
      address: "Mirpur 10 Circle, Dhaka",
    },
  });

  // 3. Seed Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@ppms.local" },
    update: {
      organizationId: defaultOrg.id,
      emailVerified: new Date(),
    },
    create: {
      name: "Super Admin",
      email: "admin@ppms.local",
      passwordHash,
      roleId: roleByName.SUPER_ADMIN,
      organizationId: defaultOrg.id,
      emailVerified: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "clinic.admin@ppms.local" },
    update: {
      organizationId: defaultOrg.id,
      emailVerified: new Date(),
    },
    create: {
      name: "Clinic Admin",
      email: "clinic.admin@ppms.local",
      passwordHash,
      roleId: roleByName.ADMIN,
      organizationId: defaultOrg.id,
      emailVerified: new Date(),
    },
  });

  const patientUser = await prisma.user.upsert({
    where: { email: "patient@ppms.local" },
    update: {
      organizationId: defaultOrg.id,
    },
    create: {
      name: "Nusrat Jahan",
      email: "patient@ppms.local",
      passwordHash,
      roleId: roleByName.PATIENT,
      organizationId: defaultOrg.id,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { email: "staff@ppms.local" },
    update: {
      organizationId: defaultOrg.id,
    },
    create: {
      name: "Front Desk Staff",
      email: "staff@ppms.local",
      passwordHash,
      roleId: roleByName.STAFF,
      organizationId: defaultOrg.id,
    },
  });

  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
      gender: "Female",
      medicalHistory: "Mild seasonal allergy, History of Dyspepsia",
    },
  });

  const doctorsData = [
    {
      name: "Dr. Fahim Rahman",
      email: "doctor@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80",
      specialization: "General Medicine",
      degrees: "MBBS, FCPS (Medicine), MACP (USA)",
      designation: "Senior Consultant, Department of Medicine",
      hospital: "Metropolitan Specialized Hospital",
      bmdcRegNo: "BMDC-A-41285",
      chamberAddress: "Room 301, 3rd Floor, Diagnostic & Consultation Block",
      contactNumber: "+880 1711-234567",
      available: true,
      schedule: {
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
        startTime: "09:00 AM",
        endTime: "01:00 PM",
        chamber: "Room 301",
      },
    },
    {
      name: "Dr. Sarah Jenkins",
      email: "sarah.jenkins@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
      specialization: "Cardiology",
      degrees: "MBBS, MD (Cardiology), FACC (USA)",
      designation: "Associate Professor & Interventional Cardiologist",
      hospital: "National Heart & Vascular Institute",
      bmdcRegNo: "BMDC-A-32918",
      chamberAddress: "Cardio Suite 204, 2nd Floor",
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
      email: "tariq.mansoor@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1622902046580-2b47f47f5471?auto=format&fit=crop&w=400&q=80",
      specialization: "Pediatrics & Child Health",
      degrees: "MBBS, DCH, FCPS (Pediatrics)",
      designation: "Consultant Pediatrician",
      hospital: "Green Valley Children & Mother Hospital",
      bmdcRegNo: "BMDC-A-54012",
      chamberAddress: "Pediatric Wing 102, Ground Floor",
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
      email: "ayesha.siddiqua@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1594824813637-2309e53b6ee9?auto=format&fit=crop&w=400&q=80",
      specialization: "Dermatology",
      degrees: "MBBS, DDV, FCPS (Dermatology)",
      designation: "Assistant Professor & Dermatologist",
      hospital: "Skin & Laser Center, Care Hospital",
      bmdcRegNo: "BMDC-A-62874",
      chamberAddress: "Skin Clinic 405, 4th Floor",
      contactNumber: "+880 1613-567890",
      available: true,
      schedule: {
        days: ["Saturday", "Monday", "Wednesday"],
        startTime: "02:00 PM",
        endTime: "06:00 PM",
        chamber: "Skin Clinic 405",
      },
    },
    {
      name: "Dr. Marcus Vance",
      email: "marcus.vance@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=400&q=80",
      specialization: "Orthopedics & Trauma",
      degrees: "MBBS, MS (Orthopedics), AO Trauma Fellow",
      designation: "Senior Orthopedic & Joint Surgeon",
      hospital: "Apex Orthopedic & Trauma Hospital",
      bmdcRegNo: "BMDC-A-29401",
      chamberAddress: "Orthopedic Center 512, 5th Floor",
      contactNumber: "+880 1514-678901",
      available: false,
      schedule: {
        days: ["Sunday", "Monday", "Wednesday", "Thursday"],
        startTime: "11:00 AM",
        endTime: "03:00 PM",
        chamber: "Orthopedic Center 512",
      },
    },
    {
      name: "Dr. Nusrat Parvin",
      email: "nusrat.parvin@ppms.local",
      imageUrl:
        "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?auto=format&fit=crop&w=400&q=80",
      specialization: "Gynecology & Obstetrics",
      degrees: "MBBS, DGO, FCPS (Obs & Gynae)",
      designation: "Consultant Obstetrician & Gynecologist",
      hospital: "City Women & Children Care Hospital",
      bmdcRegNo: "BMDC-A-48193",
      chamberAddress: "Women's Health 208, 2nd Floor",
      contactNumber: "+880 1715-789012",
      available: true,
      schedule: {
        days: ["Sunday", "Tuesday", "Wednesday", "Thursday"],
        startTime: "05:00 PM",
        endTime: "09:00 PM",
        chamber: "Women's Health 208",
      },
    },
  ];

  const now = new Date();
  const todayAtTen = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 0, 0);

  let primaryDoctorId = "";

  for (let i = 0; i < doctorsData.length; i++) {
    const item = doctorsData[i];

    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        imageUrl: item.imageUrl,
        organizationId: defaultOrg.id,
      },
      create: {
        name: item.name,
        email: item.email,
        passwordHash,
        roleId: roleByName.DOCTOR,
        imageUrl: item.imageUrl,
        organizationId: defaultOrg.id,
      },
    });

    const doc = await prisma.doctor.upsert({
      where: { userId: user.id },
      update: {
        specialization: item.specialization,
        degrees: item.degrees,
        designation: item.designation,
        hospital: item.hospital,
        bmdcRegNo: item.bmdcRegNo,
        chamberAddress: item.chamberAddress,
        contactNumber: item.contactNumber,
        scheduleJson: item.schedule,
        available: item.available,
      },
      create: {
        userId: user.id,
        specialization: item.specialization,
        degrees: item.degrees,
        designation: item.designation,
        hospital: item.hospital,
        bmdcRegNo: item.bmdcRegNo,
        chamberAddress: item.chamberAddress,
        contactNumber: item.contactNumber,
        scheduleJson: item.schedule,
        available: item.available,
      },
    });

    if (i === 0) primaryDoctorId = doc.id;

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
          organizationId: defaultOrg.id,
        },
        create: {
          doctorId: doc.id,
          patientId: patient.id,
          organizationId: defaultOrg.id,
          appointmentDate: todayAtTen,
          serialNumber: i + 1,
          status: AppointmentStatus.BOOKED,
          notes: "Consultation appointment",
        },
      });
    }
  }

  // Clear and seed comprehensive catalog
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
      createdById: admin.id,
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

  // 4. Seed a sample prescription with share token and medicine reminder
  const sampleRx = await prisma.prescription.create({
    data: {
      doctorId: primaryDoctorId,
      patientId: patient.id,
      organizationId: defaultOrg.id,
      isPublicShareEnabled: true,
      shareToken: "rx-metro-sample-82910",
      notes: "Take complete rest and drink plenty of warm fluids. Follow up after 7 days.",
      medicinesJson: [
        {
          name: "Napa Extra",
          type: "Tablet",
          dosage: "500mg + 65mg",
          dose: "1+0+1",
          timing: "After meal",
          duration: "5 days",
          instructions: "Take when fever or pain is prominent",
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
          instructions: "8-10 hours overnight fasting.",
        },
      ],
      vitalsJson: {
        bp: "120/80",
        pulse: "74",
        temp: "98.4",
        spo2: "99",
        weight: "68",
      },
      clinicalInfoJson: {
        complaints: ["Mild fever x 3 days", "Dry cough", "Throat irritation"],
        diagnosis: ["Acute Upper Respiratory Tract Infection", "Mild Gastritis"],
        advice: ["Drink warm water", "Avoid oily/cold foods", "Take adequate rest"],
      },
    },
  });

  // Seed sample test report uploaded by patient
  await prisma.testReport.create({
    data: {
      title: "CBC & Blood Sugar Profile",
      description: "Routine annual health checkup blood report",
      fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      fileType: "application/pdf",
      originalName: "CBC_FBS_Report_Oct2026.pdf",
      patientId: patient.id,
      doctorId: primaryDoctorId,
      prescriptionId: sampleRx.id,
      uploadedById: patientUser.id,
      status: TestReportStatus.REVIEWED,
      organizationId: defaultOrg.id,
      notes: "Hemoglobin 13.8 g/dL (Normal). Fasting blood sugar 98 mg/dL (Normal).",
    },
  });

  // Seed sample medicine reminder
  await prisma.medicineReminder.create({
    data: {
      patientId: patient.id,
      prescriptionId: sampleRx.id,
      organizationId: defaultOrg.id,
      medicineName: "Maxpro 20mg",
      dosage: "20mg",
      frequency: "1+0+1",
      timeOfDay: "07:30 AM, 08:00 PM",
      notes: "30 mins before breakfast and dinner",
    },
  });

  // Seed sample announcements
  await prisma.announcement.createMany({
    data: [
      {
        title: "Annual Infection Control Protocol Update",
        content: "All clinical and front-desk staff are reminded to follow updated sterilization guidelines and hygiene checks in OPD consulting chambers.",
        targetRole: "ALL",
        priority: "HIGH",
        authorId: admin.id,
        authorName: "Super Admin",
        organizationId: defaultOrg.id,
      },
      {
        title: "OPD Holiday Schedule - Upcoming Public Holiday",
        content: "OPD chambers will operate from 9:00 AM to 1:00 PM on the upcoming holiday. Emergency admissions remain operational 24/7.",
        targetRole: "PATIENT",
        priority: "NORMAL",
        authorId: admin.id,
        authorName: "Medical Administration",
        organizationId: defaultOrg.id,
      },
    ],
  });

  // Seed sample activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        action: "ORGANIZATION_INITIALIZED",
        entityType: "Organization",
        entityId: defaultOrg.id,
        userName: "System Setup",
        userRole: "SUPER_ADMIN",
        organizationId: defaultOrg.id,
        detailsJson: { name: defaultOrg.name, plan: "Professional Polyclinic" },
      },
      {
        action: "PRESCRIPTION_CREATED",
        entityType: "Prescription",
        entityId: sampleRx.id,
        userName: "Dr. Fahim Rahman",
        userRole: "DOCTOR",
        organizationId: defaultOrg.id,
        detailsJson: { patient: "Nusrat Jahan", medicinesCount: 2, testsCount: 2 },
      },
      {
        action: "TEST_REPORT_UPLOADED",
        entityType: "TestReport",
        userName: "Nusrat Jahan",
        userRole: "PATIENT",
        organizationId: defaultOrg.id,
        detailsJson: { title: "CBC & Blood Sugar Profile" },
      },
    ],
  });

  // Seed notification for patient
  await prisma.notification.create({
    data: {
      userId: patientUser.id,
      title: "New Digital Prescription Issued",
      message: "Dr. Fahim Rahman has issued a new digital prescription for your consultation. You can view, download, or share it.",
      type: "PRESCRIPTION_CREATED",
      link: `/prescriptions/${sampleRx.id}/print`,
    },
  });

  console.log("Seed completed successfully with multi-tenant SaaS organizations, pricing plans, prescription sharing, reports, and activity logs.");
  void staffUser;
  void secondaryOrg;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
